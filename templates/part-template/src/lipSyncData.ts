export const TOTAL_LIPSYNC_FRAMES = 1800;

export type LipSyncSpeaker = 'alpha';

export const MOUTH_OPEN_BY_SPEAKER: Record<string, number[]> = {
  alpha: [],
};

export const ALPHA_MOUTH: number[] = MOUTH_OPEN_BY_SPEAKER['alpha'];

export function getMouthOpenness(speaker: string, globalFrame: number): number {
  const frame = Math.max(0, Math.min(TOTAL_LIPSYNC_FRAMES - 1, Math.floor(globalFrame)));
  const track = MOUTH_OPEN_BY_SPEAKER[speaker.toLowerCase()];
  return track ? (track[frame] ?? 0) : 0;
}
