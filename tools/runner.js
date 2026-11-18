const path = require('path');
const fs = require('fs');
const {spawnSync} = require('child_process');

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
  node tools/runner.js render <part-dir> [options]
  node tools/runner.js still  <part-dir> [options]
  node tools/runner.js studio <part-dir> [options]
  node tools/runner.js audit  <part-dir>

Commands:
  render   Render vertical video (1080x1920 @ 30 FPS, H.264)
  still    Render preview PNG still frame
  studio   Launch interactive Remotion Studio web server
  audit    Run automated QA/QC check (duration 45-120s, safe zone, layout)

Options:
  --comp <id>          Composition ID (default: AlphaStory)
  --out <path>         Custom output path
  --frame <number>     Frame to render for still (default: 60)
  --crf <number>       H.264 CRF quality (default: 18)
  --concurrency <n>    Worker threads (default: 2 on Linux VPS, auto elsewhere)
==============================================================
`);
}

function parseArgs(args) {
  const result = {
    command: args[0],
    projectDir: args[1],
    comp: 'AlphaStory',
    frame: 60,
    out: null,
    crf: 18,
    concurrency: process.platform === 'linux' ? '2' : null,
    extra: [],
  };

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--comp' && i + 1 < args.length) {
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
    } else {
      result.extra.push(arg);
    }
  }

  return result;
}

function resolveEntryPoint(projectDir) {
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

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    printUsage();
    process.exit(1);
  }

  const parsed = parseArgs(args);

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

  let remotionArgs = [];

  if (parsed.command === 'render') {
    const outDir = path.join(absProjectDir, 'render');
    fs.mkdirSync(outDir, {recursive: true});
    const outFile = parsed.out
      ? path.resolve(process.cwd(), parsed.out)
      : path.join(outDir, `${slugName}.mp4`);

    remotionArgs = [
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
    console.log(`[AlphaStorytime Engine] Rendering Video: ${slugName}`);
    console.log(`  Entry:      ${entryPoint}`);
    console.log(`  Public Dir: ${publicDir}`);
    console.log(`  Output:     ${outFile}`);
  } else if (parsed.command === 'still') {
    const outDir = path.join(absProjectDir, 'previews');
    fs.mkdirSync(outDir, {recursive: true});
    const outFile = parsed.out
      ? path.resolve(process.cwd(), parsed.out)
      : path.join(outDir, `frame_${String(parsed.frame).padStart(4, '0')}.png`);

    remotionArgs = [
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
  } else if (parsed.command === 'studio') {
    remotionArgs = [
      'studio',
      entryPoint,
      `--public-dir=${publicDir}`,
      ...parsed.extra,
    ];
    console.log(`[AlphaStorytime Engine] Opening Remotion Studio: ${slugName}`);
    console.log(`  Entry:      ${entryPoint}`);
  } else {
    console.error(`[ERROR] Unknown command: ${parsed.command}`);
    printUsage();
    process.exit(1);
  }

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

  if ((child.status === 0 || child.status === null) && (parsed.command === 'still' || parsed.command === 'render')) {
    const outFile = parsed.command === 'render'
      ? (parsed.out ? path.resolve(process.cwd(), parsed.out) : path.join(absProjectDir, 'render', `${slugName}.mp4`))
      : (parsed.out ? path.resolve(process.cwd(), parsed.out) : path.join(absProjectDir, 'previews', `frame_${String(parsed.frame).padStart(4, '0')}.png`));
    if (fs.existsSync(outFile)) {
      console.log(`\n[OUTPUT_MEDIA]`);
      console.log(`MEDIA:${outFile}`);
    }
  }

  process.exit(child.status ?? 0);
}

main();
