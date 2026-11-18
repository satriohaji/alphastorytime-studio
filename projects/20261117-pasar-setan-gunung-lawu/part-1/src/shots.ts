import type {EnterStyle, StoryStingerType} from '@shared/StoryTransitions';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
// Durasi aktual: 86.16s (2585 frames @ 30 FPS)
export const TOTAL_FRAMES = 2585;

export const VOICEOVER = 'audio/vo.mp3';
export const BGM_FILE: string | null = null;
export const BGM_VOLUME = 0.08;

export type SceneId =
  | 's1a'
  | 's1b'
  | 's2a'
  | 's2b'
  | 's3a'
  | 's3b'
  | 's4a'
  | 's4b'
  | 's5a'
  | 's5b';

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
  // Seg 1-2 (0 - 285): Narrator Hook - Alpha in center
  {id: 'shot-1a', scene: 's1a', from: 0, to: 285, enterStyle: 'zoom-punch'},
  // Seg 3-4 (285 - 525): Full Illustration B-Roll - Gunung Lawu 2800m Sabana Pos 5
  {id: 'shot-1b', scene: 's1b', from: 285, to: 525, enterStyle: 'fade-dark'},
  // Seg 5-6 (525 - 780): Hybrid PIP - Candi Cetho path, Alpha left gesturing
  {id: 'shot-2a', scene: 's2a', from: 525, to: 780, enterStyle: 'whip-left'},
  // Seg 7-8 (780 - 1050): Full Illustration B-Roll - Friends' flashlights vanishing into dark fog
  {id: 'shot-2b', scene: 's2b', from: 780, to: 1050, enterStyle: 'depth-dolly'},
  // Seg 9-10 (1050 - 1360): Full Illustration B-Roll - POV flashlight in tall savannah reeds
  {id: 'shot-3a', scene: 's3a', from: 1050, to: 1360, enterStyle: 'whip-left'},
  // Seg 11 (1360 - 1615): Narrator Thinker - Alpha thinking pose: mountain wind suddenly stops dead
  {id: 'shot-3b', scene: 's3b', from: 1360, to: 1615, enterStyle: 'zoom-punch'},
  // Seg 12 (1615 - 1830): Full Illustration B-Roll - Pasar Setan ghostly stalls & red lanterns
  {id: 'shot-4a', scene: 's4a', from: 1615, to: 1830, enterStyle: 'depth-dolly'},
  // Seg 13 (1830 - 2090): Hybrid Tension - Raka frozen, heart rate EKG monitor spike, cold sweat
  {id: 'shot-4b', scene: 's4b', from: 1830, to: 2090, enterStyle: 'whip-right'},
  // Seg 14-15 (2090 - 2440): JUMPSCARE CLIMAX - Cold breath on neck, red glitch, shadow figure, Alpha shock!
  {id: 'shot-5a', scene: 's5a', from: 2090, to: 2440, enterStyle: 'glitch-snap'},
  // Seg 16 (2440 - 2585): Narrator Cliffhanger Outro - Alpha teaser Part 2
  {id: 'shot-5b', scene: 's5b', from: 2440, to: 2585, enterStyle: 'fade-dark'},
];

export const SCENE_TRANSITIONS: Array<{
  cutFrame: number;
  type: StoryStingerType;
}> = [
  {cutFrame: 285, type: 'fog-curtain'},
  {cutFrame: 525, type: 'shadow-wipe'},
  {cutFrame: 780, type: 'fog-curtain'},
  {cutFrame: 1050, type: 'shadow-wipe'},
  {cutFrame: 1360, type: 'shadow-wipe'},
  {cutFrame: 1615, type: 'fog-curtain'},
  {cutFrame: 1830, type: 'shadow-wipe'},
  {cutFrame: 2090, type: 'glitch-cut'},
  {cutFrame: 2440, type: 'shadow-wipe'},
];

export const SFX_TIMELINE: SfxCue[] = [];
