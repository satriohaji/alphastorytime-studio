const path = require('path');
const fs = require('fs');
const {spawn, spawnSync} = require('child_process');

const TOOLS_DIR = __dirname;
const REPO_ROOT = path.resolve(TOOLS_DIR, '..');
const REMOTION_DIR = path.join(TOOLS_DIR, 'remotion');
const SHARED_SFX_DIR = path.join(REPO_ROOT, 'Resources', 'audio', 'sfx');

const REMOTION_BIN = path.join(
  REMOTION_DIR,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'remotion.cmd' : 'remotion'
);

function printUsage() {
  console.log(`
==============================================================
 AlphaStorytime Central Video Engine Runner (Linux & Windows)
==============================================================
Usage:
  node tools/runner.js render [part-dir] [options]
  node tools/runner.js still  [part-dir] [options]
  node tools/runner.js studio [part-dir] [options]
  node tools/runner.js audit  [part-dir]
  node tools/runner.js status
  node tools/runner.js stop

Commands:
  render   Render vertical video (1080x1920 @ 30 FPS, H.264)
           [Default: Runs detached in background to prevent Telegram timeouts]
  still    Render preview PNG still frame (Fast, runs synchronously)
  studio   Launch interactive Remotion Studio web server
  audit    Run automated QA/QC check (duration 45-120s, safe zone, layout)
  status   Check if rendering or agy background process is running
  stop     Stop active background render process

Options:
  --sync               Run render synchronously in foreground
  --comp <id>          Composition ID (default: AlphaStory)
  --out <path>         Custom output path
  --frame <number>     Frame to render for still (default: 60)
  --crf <number>       H.264 CRF quality (default: 18)
  --concurrency <n>    Worker threads (default: 3 on Linux VPS, auto elsewhere)
==============================================================
`);
}

function findLatestPart(projectsDir) {
  if (!fs.existsSync(projectsDir)) return null;
  const parts = [];
  const projects = fs.readdirSync(projectsDir, {withFileTypes: true});
  for (const proj of projects) {
    if (proj.isDirectory()) {
      const projDir = path.join(projectsDir, proj.name);
      try {
        const subdirs = fs.readdirSync(projDir, {withFileTypes: true});
        for (const sub of subdirs) {
          if (sub.isDirectory() && /^part-\d+/i.test(sub.name)) {
            const partPath = path.join(projDir, sub.name);
            parts.push({
              path: partPath,
              mtime: fs.statSync(partPath).mtimeMs,
            });
          }
        }
      } catch (e) {
        // ignore unreadable dirs
      }
    }
  }
  parts.sort((a, b) => b.mtime - a.mtime);
  return parts.length > 0 ? parts[0].path : null;
}

function findLatestVideo(projectsDir) {
  if (!fs.existsSync(projectsDir)) return null;
  let latestFile = null;
  let latestMtime = 0;

  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, {withFileTypes: true});
      for (const ent of entries) {
        const fullPath = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          walk(fullPath);
        } else if (ent.isFile() && ent.name.endsWith('.mp4')) {
          const mtime = fs.statSync(fullPath).mtimeMs;
          if (mtime > latestMtime) {
            latestMtime = mtime;
            latestFile = fullPath;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  walk(projectsDir);
  return latestFile;
}

function parseArgs(args) {
  const result = {
    command: args[0],
    projectDir: null,
    comp: 'AlphaStory',
    frame: 60,
    out: null,
    crf: 18,
    concurrency: process.platform === 'linux' ? '3' : null,
    sync: false,
    extra: [],
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--sync') {
      result.sync = true;
    } else if (arg === '--comp' && i + 1 < args.length) {
      result.comp = args[++i];
    } else if (arg.startsWith('--comp=')) {
      result.comp = arg.slice(7);
    } else if (arg === '--out' && i + 1 < args.length) {
      result.out = args[++i];
    } else if (arg.startsWith('--out=')) {
      result.out = arg.slice(6);
    } else if (arg === '--frame' && i + 1 < args.length) {
      result.frame = parseInt(args[++i], 10);
    } else if (arg.startsWith('--frame=')) {
      result.frame = parseInt(arg.slice(8), 10);
    } else if (arg === '--crf' && i + 1 < args.length) {
      result.crf = parseInt(args[++i], 10);
    } else if (arg.startsWith('--crf=')) {
      result.crf = parseInt(arg.slice(6), 10);
    } else if (arg === '--concurrency' && i + 1 < args.length) {
      result.concurrency = args[++i];
    } else if (arg.startsWith('--concurrency=')) {
      result.concurrency = arg.slice(14);
    } else if (!result.projectDir && !arg.startsWith('--')) {
      result.projectDir = arg;
    } else {
      result.extra.push(arg);
    }
  }

  // Auto-resolve projectDir if omitted for commands that need it
  if (!result.projectDir && ['render', 'still', 'studio', 'audit'].includes(result.command)) {
    result.projectDir = findLatestPart(path.join(REPO_ROOT, 'projects'));
  }

  return result;
}

function resolveEntryPoint(projectDir) {
  if (!projectDir) {
    console.error(`[ERROR] No project directory specified or found in projects/`);
    process.exit(1);
  }

  const absProjectDir = path.resolve(process.cwd(), projectDir);
  const candidates = [
    path.join(absProjectDir, 'src', 'index.ts'),
    path.join(absProjectDir, 'src', 'index.tsx'),
    path.join(absProjectDir, 'src', 'index.js'),
    path.join(absProjectDir, 'index.ts'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return {absProjectDir, entryPoint: candidate};
    }
  }

  console.error(`[ERROR] Cannot find entry point in: ${absProjectDir}`);
  console.error('Expected: src/index.ts or src/index.tsx');
  process.exit(1);
}

function prepareProjectPublicDir(absProjectDir) {
  const projectPublicDir = path.join(absProjectDir, 'public');
  fs.mkdirSync(projectPublicDir, {recursive: true});

  if (fs.existsSync(SHARED_SFX_DIR)) {
    const targetSfxDir = path.join(projectPublicDir, 'sfx');
    fs.mkdirSync(targetSfxDir, {recursive: true});
    for (const file of fs.readdirSync(SHARED_SFX_DIR)) {
      const srcFile = path.join(SHARED_SFX_DIR, file);
      const dstFile = path.join(targetSfxDir, file);
      if (fs.statSync(srcFile).isFile() && !fs.existsSync(dstFile)) {
        fs.copyFileSync(srcFile, dstFile);
      }
    }
  }

  return projectPublicDir;
}

function resolveProjectSlugName(absProjectDir) {
  const baseName = path.basename(absProjectDir);
  const parentName = path.basename(path.dirname(absProjectDir));
  if (/^part-\d+/i.test(baseName) && parentName !== 'projects') {
    return `${parentName}_${baseName}`;
  }
  return baseName;
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function handleStatus() {
  const logsDir = path.join(REPO_ROOT, 'logs');
  const renderPidFile = path.join(logsDir, 'render.pid');
  const agyPidFile = path.join(logsDir, 'agy.pid');

  // Check render process
  if (fs.existsSync(renderPidFile)) {
    const pid = parseInt(fs.readFileSync(renderPidFile, 'utf8').trim(), 10);
    if (isProcessAlive(pid)) {
      const logFiles = fs.readdirSync(logsDir)
        .filter(f => f.startsWith('render_') && f.endsWith('.log'))
        .map(f => ({ name: f, time: fs.statSync(path.join(logsDir, f)).mtimeMs }))
        .sort((a, b) => b.time - a.time);

      let lastProgress = '(Sedang memulai worker render...)';
      if (logFiles.length > 0) {
        const content = fs.readFileSync(path.join(logsDir, logFiles[0].name), 'utf8');
        const lines = content.split('\n').filter(Boolean);
        // Extract meaningful progress lines
        const progLines = lines.filter(l => /rendered|encoded|frame|rendering/i.test(l));
        if (progLines.length > 0) {
          lastProgress = progLines.slice(-3).join('\n');
        } else if (lines.length > 0) {
          lastProgress = lines.slice(-3).join('\n');
        }
      }

      console.log(`[RUNNING] Render video sedang berjalan di background (PID: ${pid}).`);
      console.log(`Progres saat ini:\n${lastProgress}`);
      console.log(`\nVideo final MP4 akan otomatis dikirim ke Telegram ketika selesai.`);
      process.exit(0);
    } else {
      fs.unlinkSync(renderPidFile);
    }
  }

  // Check agy process
  if (fs.existsSync(agyPidFile)) {
    const pid = parseInt(fs.readFileSync(agyPidFile, 'utf8').trim(), 10);
    if (isProcessAlive(pid)) {
      console.log(`[RUNNING] Proses Antigravity (AGY) sedang aktif di background (PID: ${pid}).`);
      process.exit(0);
    } else {
      fs.unlinkSync(agyPidFile);
    }
  }

  // Idle status
  console.log(`[IDLE] Tidak ada proses rendering yang sedang berjalan.`);
  const latestVideo = findLatestVideo(path.join(REPO_ROOT, 'projects'));
  if (latestVideo) {
    const stat = fs.statSync(latestVideo);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    console.log(`Video terbaru: ${latestVideo} (${sizeMb} MB)`);
    console.log(`MEDIA:${latestVideo}`);
  }
  process.exit(0);
}

function handleStop() {
  const logsDir = path.join(REPO_ROOT, 'logs');
  const renderPidFile = path.join(logsDir, 'render.pid');
  let stopped = false;

  if (fs.existsSync(renderPidFile)) {
    const pid = parseInt(fs.readFileSync(renderPidFile, 'utf8').trim(), 10);
    if (isProcessAlive(pid)) {
      try {
        process.kill(pid, 'SIGTERM');
        console.log(`[SUCCESS] Proses render background (PID: ${pid}) berhasil dihentikan.`);
        stopped = true;
      } catch (e) {
        console.log(`[ERROR] Gagal menghentikan PID ${pid}: ${e.message}`);
      }
    }
    try { fs.unlinkSync(renderPidFile); } catch (e) {}
  }

  if (!stopped) {
    console.log(`[INFO] Tidak ada proses render background yang sedang aktif.`);
  }
  process.exit(0);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const parsed = parseArgs(args);

  if (parsed.command === 'status') {
    handleStatus();
    return;
  }

  if (parsed.command === 'stop') {
    handleStop();
    return;
  }

  if (parsed.command === 'audit') {
    const qaAuditScript = path.join(TOOLS_DIR, 'qa_audit.js');
    const child = spawnSync(process.execPath, [qaAuditScript, parsed.projectDir], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    process.exit(child.status ?? 0);
  }

  if (!fs.existsSync(REMOTION_BIN)) {
    console.error(`[ERROR] Remotion CLI binary not found at: ${REMOTION_BIN}`);
    console.error('Run "npm ci" inside tools/remotion/ first.');
    process.exit(1);
  }

  const {absProjectDir, entryPoint} = resolveEntryPoint(parsed.projectDir);
  const publicDir = prepareProjectPublicDir(absProjectDir);
  const slugName = resolveProjectSlugName(absProjectDir);

  const logsDir = path.join(REPO_ROOT, 'logs');
  fs.mkdirSync(logsDir, {recursive: true});

  if (parsed.command === 'render') {
    const outDir = path.join(absProjectDir, 'render');
    fs.mkdirSync(outDir, {recursive: true});
    const outFile = parsed.out
      ? path.resolve(process.cwd(), parsed.out)
      : path.join(outDir, `${slugName}.mp4`);

    // MODE 1: ASYNCHRONOUS DETACHED BACKGROUND (Default untuk menghindari timeout Telegram 180s)
    if (!parsed.sync) {
      const renderPidFile = path.join(logsDir, 'render.pid');

      // Check if already running
      if (fs.existsSync(renderPidFile)) {
        const existingPid = parseInt(fs.readFileSync(renderPidFile, 'utf8').trim(), 10);
        if (isProcessAlive(existingPid)) {
          console.log(`[ALREADY RUNNING] Render video sedang aktif di background (PID: ${existingPid}).`);
          console.log(`Ketik "node tools/runner.js status" untuk melihat progres render.`);
          process.exit(0);
        } else {
          try { fs.unlinkSync(renderPidFile); } catch (e) {}
        }
      }

      const logFileName = `render_${slugName}_${Date.now()}.log`;
      const logFilePath = path.join(logsDir, logFileName);
      const outFd = fs.openSync(logFilePath, 'a');

      const childArgs = [
        __filename,
        'render',
        parsed.projectDir,
        '--sync',
        ...(parsed.comp ? ['--comp', parsed.comp] : []),
        ...(parsed.out ? ['--out', parsed.out] : []),
        ...(parsed.crf ? ['--crf', String(parsed.crf)] : []),
        ...(parsed.concurrency ? ['--concurrency', String(parsed.concurrency)] : []),
        ...parsed.extra,
      ];

      const child = spawn(process.execPath, childArgs, {
        detached: true,
        stdio: ['ignore', outFd, outFd],
        cwd: process.cwd(),
        env: process.env,
      });

      fs.writeFileSync(renderPidFile, String(child.pid));
      child.unref();

      console.log(`[AlphaStorytime Engine] Rendering Video di BACKGROUND (Anti-Timeout Mode)`);
      console.log(`  Project: ${slugName}`);
      console.log(`  PID:     ${child.pid}`);
      console.log(`  Log:     ${logFilePath}`);
      console.log(`  Output:  ${outFile}`);
      console.log(`\n[SUCCESS] Proses render berhasil dimulai di background VPS!`);
      console.log(`Proses berjalan mandiri dan tidak akan terkena batas timeout 180 detik.`);
      console.log(`File video MP4 akan otomatis dikirimkan ke Telegram Anda begitu selesai (~8-10 menit).`);
      console.log(`Ketik "node tools/runner.js status" untuk melihat progres render terkini.`);
      process.exit(0);
    }

    // MODE 2: SYNCHRONOUS WORKER (--sync dipanggil oleh background process atau testing manual)
    const renderPidFile = path.join(logsDir, 'render.pid');
    fs.writeFileSync(renderPidFile, String(process.pid));

    const remotionArgs = [
      'render',
      entryPoint,
      parsed.comp,
      outFile,
      `--public-dir=${publicDir}`,
      '--codec=h264',
      `--crf=${parsed.crf}`,
      ...(parsed.concurrency ? [`--concurrency=${parsed.concurrency}`] : []),
      ...parsed.extra,
    ];

    console.log(`[AlphaStorytime Engine] Rendering Video (Sync Worker): ${slugName}`);
    console.log(`  Entry:       ${entryPoint}`);
    console.log(`  Public Dir:  ${publicDir}`);
    console.log(`  Output:      ${outFile}`);
    console.log(`  Concurrency: ${parsed.concurrency || 'auto'}`);

    const child = spawnSync(REMOTION_BIN, remotionArgs, {
      stdio: 'inherit',
      cwd: REMOTION_DIR,
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        REMOTION_DIR: REMOTION_DIR,
        REMOTION_SHARED_DIR: path.join(REMOTION_DIR, 'src', 'shared'),
        REMOTION_NODE_MODULES: path.join(REMOTION_DIR, 'node_modules'),
      },
    });

    try { fs.unlinkSync(renderPidFile); } catch (e) {}

    if ((child.status === 0 || child.status === null) && fs.existsSync(outFile)) {
      const stat = fs.statSync(outFile);
      const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
      console.log(`\n[SUCCESS] Render selesai! File video: ${outFile} (${sizeMb} MB)`);
      console.log(`[OUTPUT_MEDIA]`);
      console.log(`MEDIA:${outFile}`);

      // Auto-send video to Telegram if on Linux VPS
      const sendTelegramScript = path.join(TOOLS_DIR, 'send_telegram.sh');
      if (process.platform !== 'win32' && fs.existsSync(sendTelegramScript)) {
        console.log(`[AlphaStorytime Engine] Mengirim video ke Telegram User...`);
        const caption = `🎬 ${slugName} - Render Selesai!\nFormat: 1080x1920 @ 30 FPS\nUkuran: ${sizeMb} MB`;
        spawnSync('bash', [sendTelegramScript, outFile, caption], {
          stdio: 'inherit',
          cwd: REPO_ROOT,
        });
      }
    }

    process.exit(child.status ?? 0);
  }

  if (parsed.command === 'still') {
    const outDir = path.join(absProjectDir, 'previews');
    fs.mkdirSync(outDir, {recursive: true});
    const outFile = parsed.out
      ? path.resolve(process.cwd(), parsed.out)
      : path.join(outDir, `frame_${String(parsed.frame).padStart(4, '0')}.png`);

    const remotionArgs = [
      'still',
      entryPoint,
      parsed.comp,
      outFile,
      `--public-dir=${publicDir}`,
      `--frame=${parsed.frame}`,
      ...parsed.extra,
    ];
    console.log(`[AlphaStorytime Engine] Rendering Still: ${slugName} @ Frame ${parsed.frame}`);
    console.log(`  Entry:      ${entryPoint}`);
    console.log(`  Output:     ${outFile}`);

    const child = spawnSync(REMOTION_BIN, remotionArgs, {
      stdio: 'inherit',
      cwd: REMOTION_DIR,
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        REMOTION_DIR: REMOTION_DIR,
        REMOTION_SHARED_DIR: path.join(REMOTION_DIR, 'src', 'shared'),
        REMOTION_NODE_MODULES: path.join(REMOTION_DIR, 'node_modules'),
      },
    });

    if ((child.status === 0 || child.status === null) && fs.existsSync(outFile)) {
      console.log(`\n[OUTPUT_MEDIA]`);
      console.log(`MEDIA:${outFile}`);
    }

    process.exit(child.status ?? 0);
  }

  if (parsed.command === 'studio') {
    const remotionArgs = [
      'studio',
      entryPoint,
      `--public-dir=${publicDir}`,
      ...parsed.extra,
    ];
    console.log(`[AlphaStorytime Engine] Opening Remotion Studio: ${slugName}`);
    console.log(`  Entry:      ${entryPoint}`);

    const child = spawnSync(REMOTION_BIN, remotionArgs, {
      stdio: 'inherit',
      cwd: REMOTION_DIR,
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        REMOTION_DIR: REMOTION_DIR,
        REMOTION_SHARED_DIR: path.join(REMOTION_DIR, 'src', 'shared'),
        REMOTION_NODE_MODULES: path.join(REMOTION_DIR, 'node_modules'),
      },
    });
    process.exit(child.status ?? 0);
  }

  console.error(`[ERROR] Unknown command: ${parsed.command}`);
  printUsage();
  process.exit(1);
}

main();
