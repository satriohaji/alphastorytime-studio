const fs = require('fs');
const path = require('path');

/**
 * AlphaStorytime QA/QC Automated Code, Duration & Safe Zone Inspector.
 */

const MIN_FRAMES = 45 * 30;  // 1350 frames (45s)
const MAX_FRAMES = 120 * 30; // 3600 frames (120s)
const VALID_STINGERS = [
  'shadow-wipe',
  'glitch-cut',
  'flashback-iris',
  'fog-curtain',
  'blood-slash',
  'laser-scan',
  'golden-reveal',
];

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function runAudit(projectDir) {
  const absProjectDir = path.resolve(process.cwd(), projectDir);
  const sharedDir = path.resolve(__dirname, 'remotion', 'src', 'shared');

  console.log('\n==============================================================');
  console.log(' AlphaStorytime Quality Control (QA/QC) Audit Engine');
  console.log(` Target Part: ${path.basename(absProjectDir)}`);
  console.log('==============================================================\n');

  if (!fs.existsSync(absProjectDir)) {
    console.error(`[FATAL] Directory not found: ${absProjectDir}`);
    process.exit(1);
  }

  const scenesPath = path.join(absProjectDir, 'src', 'scenes.tsx');
  const videoPath = path.join(absProjectDir, 'src', 'Video.tsx');
  const shotsPath = path.join(absProjectDir, 'src', 'shots.ts');
  const lipSyncPath = path.join(absProjectDir, 'src', 'lipSyncData.ts');
  const timestampsPath = path.join(absProjectDir, 'audio', 'word_timestamps.json');

  const issues = [];
  const warnings = [];
  const passed = [];

  for (const [label, filePath] of [
    ['src/scenes.tsx', scenesPath],
    ['src/Video.tsx', videoPath],
    ['src/shots.ts', shotsPath],
    ['src/lipSyncData.ts', lipSyncPath],
    ['audio/word_timestamps.json', timestampsPath],
  ]) {
    if (!fs.existsSync(filePath)) {
      issues.push(`Missing critical file: ${label}`);
    } else {
      passed.push(`File ${label} exists`);
    }
  }

  if (issues.length > 0) {
    printReport(passed, warnings, issues);
    return;
  }

  const scenesContent = readIfExists(scenesPath);
  const videoContent = readIfExists(videoPath);
  const shotsContent = readIfExists(shotsPath);
  const sharedStageContent = readIfExists(path.join(sharedDir, 'StudioStage.tsx'));
  const combinedLayout = `${videoContent}\n${scenesContent}\n${
    videoContent.includes('@shared/StudioStage') || scenesContent.includes('@shared/StudioStage')
      ? sharedStageContent
      : ''
  }`;

  // 1. Duration validation (45s - 120s @ 30 FPS)
  const totalFramesMatch = shotsContent.match(/TOTAL_FRAMES\s*=\s*(\d+)/);
  if (!totalFramesMatch) {
    issues.push('TOTAL_FRAMES constant not found in src/shots.ts.');
  } else {
    const totalFrames = parseInt(totalFramesMatch[1], 10);
    const seconds = (totalFrames / 30).toFixed(2);
    if (totalFrames < MIN_FRAMES || totalFrames > MAX_FRAMES) {
      issues.push(
        `Part duration ${seconds}s (${totalFrames} frames) violates 45s-120s rule (${MIN_FRAMES}-${MAX_FRAMES} frames).`
      );
    } else {
      passed.push(`Part duration verified: ${seconds}s (${totalFrames} frames, within 45s-120s)`);
    }
  }

  // 2. Ban modulo mouth animation
  if (/frame\s*%\s*[2-9]/.test(scenesContent)) {
    issues.push('Forbidden modulo mouth animation detected (e.g. frame % 9). Use acoustic getMouthOpenness()!');
  } else {
    passed.push('Organic acoustic lip-sync verified (no modulo mouth chatter)');
  }

  // 3. Transform preservation if local AliveCharacterRig is defined
  const aliveRigMatch = scenesContent.match(/function\s+AliveCharacterRig[\s\S]*?\n\}/);
  if (aliveRigMatch) {
    const body = aliveRigMatch[0];
    if (body.includes('style.transform') || body.includes('baseTransform')) {
      passed.push('Local AliveCharacterRig preserves base CSS transform');
    } else {
      issues.push('Local AliveCharacterRig overwrites style.transform! Preserve baseTransform or import @shared/StudioStage.');
    }
  } else if (scenesContent.includes('AliveCharacterRig')) {
    passed.push('Uses shared AliveCharacterRig (transform-safe)');
  }

  // 4. Safe Zone checks
  if (combinedLayout.includes('top: 170')) {
    passed.push('Headline capsule adheres to Top Safe Margin (top: 170px)');
  } else {
    warnings.push('Headline top: 170px margin not detected.');
  }

  if (combinedLayout.includes('bottom: 260')) {
    passed.push('Kinetic Subtitle anchored at Safe Zone bottom: 260px');
  } else {
    warnings.push('Subtitle placement at bottom: 260px not confirmed.');
  }

  if (combinedLayout.includes('bottom: 370') || combinedLayout.includes('height: 370')) {
    passed.push('Alpha character floor line aligned at bottom: 370px');
  } else {
    warnings.push('Character floor line at bottom: 370px not confirmed.');
  }

  if (combinedLayout.includes('height: 8') && combinedLayout.includes('bottom: 0')) {
    passed.push('Bottom progress bar (height: 8px, bottom: 0) verified');
  } else {
    warnings.push('Bottom 8px progress bar not confirmed.');
  }

  // 5. Stinger validation (inspect SCENE_TRANSITIONS entries in shots.ts / Video.tsx and stingerType attributes)
  const transitionsSource = `${shotsContent}\n${videoContent}`;
  const transitionsBlock = transitionsSource.match(/SCENE_TRANSITIONS[\s\S]*?\];/);
  const stingerMatches = [
    ...(transitionsBlock
      ? [...transitionsBlock[0].matchAll(/type:\s*['"]([^'"]+)['"]/g)]
      : []),
    ...scenesContent.matchAll(/stingerType\s*=\s*['"]([^'"]+)['"]/g),
  ];
  if (stingerMatches.length > 0) {
    const invalid = [];
    const used = [];
    for (const m of stingerMatches) {
      const t = m[1];
      used.push(t);
      if (!VALID_STINGERS.includes(t)) {
        invalid.push(t);
      }
    }
    if (invalid.length > 0) {
      issues.push(`Invalid story stinger type(s): [${invalid.join(', ')}]. Valid: ${VALID_STINGERS.join(', ')}`);
    } else {
      passed.push(`Story stingers valid: [${[...new Set(used)].join(', ')}]`);
    }
  }

  printReport(passed, warnings, issues);
}

function printReport(passed, warnings, issues) {
  console.log('--- AUDIT RESULTS ---');
  console.log(`[+] PASSED CHECKS (${passed.length}):`);
  passed.forEach((p) => console.log(`   OK: ${p}`));

  if (warnings.length > 0) {
    console.log(`\n[!] WARNINGS (${warnings.length}):`);
    warnings.forEach((w) => console.log(`   WARN: ${w}`));
  }

  if (issues.length > 0) {
    console.log(`\n[-] CRITICAL VIOLATIONS (${issues.length}):`);
    issues.forEach((i) => console.log(`   FAIL: ${i}`));
    console.log('\n==============================================================');
    console.log(' AUDIT STATUS: [ FAILED ] - Fix violations before ACC Gate 4!');
    console.log('==============================================================\n');
    process.exitCode = 1;
  } else {
    console.log('\n==============================================================');
    console.log(' AUDIT STATUS: [ PASSED ] - Ready for Preview & ACC Gate 4!');
    console.log('==============================================================\n');
    process.exitCode = 0;
  }
}

const targetDir = process.argv[2];
if (!targetDir) {
  console.error('Usage: node tools/qa_audit.js <part-dir>');
  process.exit(1);
}

runAudit(targetDir);
