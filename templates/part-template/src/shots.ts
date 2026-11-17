import type {EnterStyle, StoryStingerType} from '@shared/StoryTransitions';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
// Wajib 45s (1350 frames) s/d 120s (3600 frames)
export const TOTAL_FRAMES = 1800; // Contoh 60 detik

export const VOICEOVER = 'audio/vo.mp3';
export const BGM_FILE: string | null = null; // Isi misal 'audio/bgm.mp3' jika memakai BGM
export const BGM_VOLUME = 0.09;

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
  {id: 'shot-1', scene: 's1', from: 0, to: 450, enterStyle: 'zoom-punch'},
  {id: 'shot-2', scene: 's2', from: 450, to: 1350, enterStyle: 'whip-left'},
  {id: 'shot-3', scene: 's3', from: 1350, to: 1800, enterStyle: 'depth-dolly'},
];

export const SCENE_TRANSITIONS: Array<{
  cutFrame: number;
  type: StoryStingerType;
}> = [
  {cutFrame: 450, type: 'shadow-wipe'},
  {cutFrame: 1350, type: 'flashback-iris'},
];

export const SFX_TIMELINE: SfxCue[] = [
  {
    id: 'sfx-open',
    frame: 4,
    duration: 45,
    file: 'sfx/whoosh-fast.mp3',
    volume: 0.45,
    description: 'Intro whoosh saat Alpha membuka cerita',
  },
  {
    id: 'sfx-cut-1',
    frame: 444,
    duration: 45,
    file: 'sfx/impact-cine.mp3',
    volume: 0.55,
    description: 'Transisi masuk ke adegan utama',
  },
];
