const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = process.argv[2] || 'projects/20261117-pasar-setan-gunung-lawu/part-1';
const absTarget = path.resolve(process.cwd(), targetDir);
const templateSrc = path.resolve(process.cwd(), 'templates', 'part-template', 'src');

console.log(`Setting up Remotion code for: ${targetDir}`);

fs.mkdirSync(path.join(absTarget, 'src'), { recursive: true });
fs.mkdirSync(path.join(absTarget, 'public', 'audio'), { recursive: true });

// 1. Copy audio to public/audio/vo.mp3
const audioSrc = path.join(absTarget, 'audio', 'vo_alpha.mp3');
const audioDst = path.join(absTarget, 'public', 'audio', 'vo.mp3');
if (fs.existsSync(audioSrc)) {
  fs.copyFileSync(audioSrc, audioDst);
  console.log(`[+] Copied master audio: ${audioDst}`);
}

// 2. Copy word_timestamps.json to src/word_timestamps.json
const wtSrc = path.join(absTarget, 'audio', 'word_timestamps.json');
const wtDst = path.join(absTarget, 'src', 'word_timestamps.json');
if (fs.existsSync(wtSrc)) {
  fs.copyFileSync(wtSrc, wtDst);
  console.log(`[+] Copied timestamps: ${wtDst}`);
}

// 3. Copy Root.tsx, Video.tsx, index.ts
for (const file of ['Root.tsx', 'Video.tsx', 'index.ts']) {
  const src = path.join(templateSrc, file);
  const dst = path.join(absTarget, 'src', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`[+] Scaffolded: ${file}`);
  }
}

// 4. Generate shots.ts tailored for 86.16s (2585 frames @ 30 FPS)
const shotsContent = `import type {EnterStyle, StoryStingerType} from '@shared/StoryTransitions';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
// Durasi aktual: 86.16s (2585 frames @ 30 FPS)
export const TOTAL_FRAMES = 2585;

export const VOICEOVER = 'audio/vo.mp3';
export const BGM_FILE: string | null = null;
export const BGM_VOLUME = 0.08;

export type SceneId = 's1' | 's2' | 's3';

export interface Shot {
  id: string;
  scene: SceneId;
  from: number;
  to: number;
  enterStyle?: EnterStyle;
}

export interface SfxCue {
  id: string;
  frame: number;
  duration?: number;
  file: string;
  volume: number;
  description: string;
}

export const SHOTS: Shot[] = [
  {id: 'shot-1', scene: 's1', from: 0, to: 525, enterStyle: 'zoom-punch'},
  {id: 'shot-2', scene: 's2', from: 525, to: 1074, enterStyle: 'whip-left'},
  {id: 'shot-3', scene: 's3', from: 1074, to: 1725, enterStyle: 'depth-dolly'},
  {id: 'shot-4', scene: 's1', from: 1725, to: 2585, enterStyle: 'whip-right'},
];

export const SCENE_TRANSITIONS: Array<{
  cutFrame: number;
  type: StoryStingerType;
}> = [
  {cutFrame: 525, type: 'shadow-wipe'},
  {cutFrame: 1074, type: 'fog-curtain'},
  {cutFrame: 1725, type: 'glitch-cut'},
];

export const SFX_TIMELINE: SfxCue[] = [];
`;
fs.writeFileSync(path.join(absTarget, 'src', 'shots.ts'), shotsContent, 'utf8');
console.log(`[+] Generated: src/shots.ts (4 shots, 2585 frames)`);

// 5. Generate scenes.tsx tailored for Pasar Setan Gunung Lawu
const scenesContent = `import React from 'react';
import {useCurrentFrame} from 'remotion';
import {AlphaCharacter} from '@shared/AlphaCharacter';
import {
  AliveCharacterRig,
  findActiveWord,
  HeadlineCapsule,
  RoomBackdrop,
  SpatialCameraRig,
  STORY_FONT,
} from '@shared/StudioStage';
import {getMouthOpenness} from './lipSyncData';
import type {SceneId} from './shots';
import wordTimestamps from './word_timestamps.json';

function StoryVisualPlate({
  title,
  detail,
  accent = '#EF4444',
}: {
  title: string;
  detail: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 370,
        left: 110,
        right: 110,
        backgroundColor: 'rgba(9, 13, 22, 0.88)',
        border: \`2px solid \${accent}\`,
        borderRadius: 24,
        padding: '24px 28px',
        boxShadow: '0 22px 50px rgba(0,0,0,0.65)',
        zIndex: 12,
      }}
    >
      <div
        style={{
          fontFamily: STORY_FONT,
          fontSize: 28,
          fontWeight: 900,
          color: '#FFFFFF',
          marginBottom: 8,
          letterSpacing: 1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: STORY_FONT,
          fontSize: 22,
          fontWeight: 600,
          color: '#CBD5E1',
          lineHeight: 1.4,
        }}
      >
        {detail}
      </div>
    </div>
  );
}

export const SceneRenderer: React.FC<{
  id: SceneId;
  duration: number;
  globalOffset: number;
}> = ({id, duration, globalOffset}) => {
  const localFrame = useCurrentFrame();
  const globalFrame = globalOffset + localFrame;
  const mouthOpen = getMouthOpenness('alpha', globalFrame);
  const activeWord = findActiveWord(wordTimestamps.segments, globalFrame);

  if (id === 's1') {
    return (
      <SpatialCameraRig
        duration={duration}
        cameraStyle="subtle-drift"
        intensity={0.4}
      >
        <RoomBackdrop
          preset="horror-dark"
          storyMood="horror"
          roomEffects={['floating-dust', 'vignette']}
        />
        <HeadlineCapsule
          tag="KISAH NYATA • GUNUNG LAWU"
          title="PASAR SETAN 2800 MDPL"
          accent="#EF4444"
        />
        <StoryVisualPlate
          title="Misteri Sabana Pos 5"
          detail="Ketinggian 2800m • Kabut tebal turun mendadak & riuh pasar gaib"
          accent="#EF4444"
        />
        <AliveCharacterRig
          duration={duration}
          motionStyle="talking"
          swaySpeed={1.0}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 240,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <AlphaCharacter
              mouthOpen={mouthOpen}
              currentWord={activeWord}
              gaze="center"
              size={540}
              bodyColor="#1E293B"
            />
          </div>
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  if (id === 's2') {
    return (
      <SpatialCameraRig
        duration={duration}
        cameraStyle="focus-push"
        intensity={0.5}
      >
        <RoomBackdrop
          preset="mystery-cold"
          storyMood="mystery"
          roomEffects={['cold-window-rain', 'vignette']}
        />
        <HeadlineCapsule
          tag="JALUR CANDI CETHO"
          title="JEJAK SENTER TERPUTUS"
          accent="#06B6D4"
        />
        <StoryVisualPlate
          title="Raka Tersesat di Sabana"
          detail="Cahaya senter meredup • Jalur setapak berganti ilalang asing"
          accent="#06B6D4"
        />
        <AliveCharacterRig
          duration={duration}
          motionStyle="intense"
          swaySpeed={1.2}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 240,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <AlphaCharacter
              mouthOpen={mouthOpen}
              currentWord={activeWord}
              gaze="left"
              size={540}
              bodyColor="#0F172A"
            />
          </div>
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  return (
    <SpatialCameraRig
      duration={duration}
      cameraStyle="sway-wide"
      intensity={0.6}
    >
      <RoomBackdrop
        preset="horror-dark"
        storyMood="horror"
        roomEffects={['flicker-tv', 'vignette']}
      />
      <HeadlineCapsule
        tag="BISIKAN GAIB • POS 5"
        title="MAU BELI APA, MAS?"
        accent="#A855F7"
      />
      <StoryVisualPlate
        title="Alunan Gamelan Gaib"
        detail="Riuh tawar-menawar terdengar jelas di tengah kabut pekat"
        accent="#A855F7"
      />
      <AliveCharacterRig
        duration={duration}
        motionStyle="suspense"
        swaySpeed={0.8}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 240,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <AlphaCharacter
            mouthOpen={mouthOpen}
            currentWord={activeWord}
            gaze="right"
            size={540}
            bodyColor="#1E1B4B"
          />
        </div>
      </AliveCharacterRig>
    </SpatialCameraRig>
  );
};
`;
fs.writeFileSync(path.join(absTarget, 'src', 'scenes.tsx'), scenesContent, 'utf8');
console.log(`[+] Generated: src/scenes.tsx (2-layer studio scenes)`);

console.log('\\n[SUCCESS] All Remotion files created for part-1!');
