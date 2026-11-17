import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  flow,
  FlowKey,
  frameToMs,
  preserveVolumeX,
  seeded,
  wave,
} from './motion';

export const STORY_FONT = "'Poppins', 'Inter', 'Space Grotesk', system-ui, sans-serif";

export type RoomPreset =
  | 'horror-dark'
  | 'mystery-cold'
  | 'true-story-warm'
  | 'comedy-vibrant'
  | 'void-spotlight';

export type StoryEffectMode =
  | 'none'
  | 'vignette-pulse'
  | 'sepia-flashback'
  | 'horror-glitch'
  | 'fog-drift'
  | 'rain-streaks';

export type WordSegment = {
  id: number;
  start_frame: number;
  end_frame: number;
  words: Array<{
    word: string;
    start_frame: number;
    end_frame: number;
  }>;
};

const ROOM_THEMES: Record<
  RoomPreset,
  {
    wallTop: string;
    wallBottom: string;
    glow: string;
    accent: string;
    floorBorder: string;
    floorGradient: string;
  }
> = {
  'horror-dark': {
    wallTop: '#050509',
    wallBottom: '#1A070A',
    glow: 'rgba(220, 38, 38, 0.24)',
    accent: '#EF4444',
    floorBorder: '#DC2626',
    floorGradient: 'linear-gradient(180deg, #181014 0%, #070507 100%)',
  },
  'mystery-cold': {
    wallTop: '#060D1A',
    wallBottom: '#0F172A',
    glow: 'rgba(56, 189, 248, 0.22)',
    accent: '#38BDF8',
    floorBorder: '#0284C7',
    floorGradient: 'linear-gradient(180deg, #1E293B 0%, #090E1A 100%)',
  },
  'true-story-warm': {
    wallTop: '#16110D',
    wallBottom: '#291D16',
    glow: 'rgba(245, 158, 11, 0.22)',
    accent: '#F59E0B',
    floorBorder: '#D97706',
    floorGradient: 'linear-gradient(180deg, #271E18 0%, #100C0A 100%)',
  },
  'comedy-vibrant': {
    wallTop: '#110D28',
    wallBottom: '#1E1B4B',
    glow: 'rgba(250, 204, 21, 0.24)',
    accent: '#FACC15',
    floorBorder: '#FACC15',
    floorGradient: 'linear-gradient(180deg, #231F42 0%, #0E0C1D 100%)',
  },
  'void-spotlight': {
    wallTop: '#020408',
    wallBottom: '#090D16',
    glow: 'rgba(248, 250, 252, 0.16)',
    accent: '#E2E8F0',
    floorBorder: '#64748B',
    floorGradient: 'linear-gradient(180deg, #111827 0%, #030712 100%)',
  },
};

const noise2D = (seed: string, x: number, y: number): number => {
  const offset = (seed.charCodeAt(0) || 0) * 0.31;
  return (
    Math.sin(x * 1.7 + offset) * 0.6 +
    Math.sin(x * 3.4 + y * 2.1) * 0.28 +
    Math.cos(x * 0.85 + offset * 1.5) * 0.12
  );
};

export const SpatialCameraRig: React.FC<{
  children: React.ReactNode;
  zoomFrom?: number;
  zoomTo?: number;
  panXFrom?: number;
  panXTo?: number;
  panYFrom?: number;
  panYTo?: number;
  shakeFrame?: number;
  shakeIntensity?: number;
  durationFrames?: number;
}> = ({
  children,
  zoomFrom = 1.0,
  zoomTo = 1.045,
  panXFrom = 0,
  panXTo = 0,
  panYFrom = 0,
  panYTo = 0,
  shakeFrame = -999,
  shakeIntensity = 12,
  durationFrames = 300,
}) => {
  const frame = useCurrentFrame();
  const tMs = frameToMs(frame, 30);
  const durMs = Math.max(400, frameToMs(durationFrames, 30));

  const driftX = noise2D('camX', frame * 0.012, 0) * 5.5;
  const driftY = noise2D('camY', 0, frame * 0.012) * 5.0;
  const driftRot = noise2D('camRot', frame * 0.009, 10) * 0.3;

  const distFromShake = frame - shakeFrame;
  const isShaking = distFromShake >= 0 && distFromShake < 22;
  const decay = isShaking ? Math.exp(-distFromShake * 0.2) : 0;
  const shakeX = isShaking ? Math.sin(frame * 2.4) * shakeIntensity * decay : 0;
  const shakeY = isShaking ? Math.cos(frame * 3.0) * shakeIntensity * decay : 0;

  const scale = flow(tMs, [
    [0, zoomFrom],
    [durMs * 0.55, zoomFrom + (zoomTo - zoomFrom) * 0.65],
    [durMs, zoomTo],
  ]);

  const px = flow(tMs, [
    [0, panXFrom],
    [durMs * 0.5, (panXFrom + panXTo) * 0.52],
    [durMs, panXTo],
  ]);
  const py = flow(tMs, [
    [0, panYFrom],
    [durMs * 0.5, (panYFrom + panYTo) * 0.52],
    [durMs, panYTo],
  ]);

  return (
    <AbsoluteFill
      style={{
        transform: `translate3d(${px + driftX + shakeX}px, ${py + driftY + shakeY}px, 0) scale(${scale}) rotate(${driftRot}deg)`,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const RoomBackdrop: React.FC<{
  preset: RoomPreset;
  effect?: StoryEffectMode;
  showShelf?: boolean;
}> = ({preset, effect = 'none', showShelf = true}) => {
  const frame = useCurrentFrame();
  const theme = ROOM_THEMES[preset];
  const pulse = 0.85 + Math.sin(frame * 0.08) * 0.15;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* Room Wall Gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${theme.wallTop} 0%, ${theme.wallBottom} 100%)`,
        }}
      />

      {/* Ambient Room Spotlight Behind Alpha */}
      <div
        style={{
          position: 'absolute',
          top: 220,
          left: '50%',
          width: 960,
          height: 960,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 68%)`,
          opacity: pulse,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Studio Room Wall Paneling & Desk Shelf Silhouettes */}
      {showShelf && (
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{position: 'absolute', inset: 0, opacity: 0.24, pointerEvents: 'none'}}
        >
          {/* Wall Window / Frame */}
          <rect x="85" y="340" width="260" height="360" rx="18" fill="none" stroke={theme.accent} strokeWidth="4" />
          <line x1="215" y1="340" x2="215" y2="700" stroke={theme.accent} strokeWidth="3" />
          <line x1="85" y1="520" x2="345" y2="520" stroke={theme.accent} strokeWidth="3" />
          {/* Studio Bookshelf on Right */}
          <rect x="740" y="420" width="250" height="14" rx="7" fill={theme.accent} />
          <rect x="765" y="340" width="32" height="80" rx="5" fill={theme.accent} />
          <rect x="806" y="356" width="26" height="64" rx="4" fill={theme.accent} />
          <circle cx="910" cy="390" r="28" fill="none" stroke={theme.accent} strokeWidth="5" />
        </svg>
      )}

      {/* Atmospheric Particles */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
      >
        {Array.from({length: 14}).map((_, i) => {
          const x = seeded(i, 1) * 1080;
          const speed = 0.6 + seeded(i, 2) * 1.1;
          const baseY = seeded(i, 3) * 1600;
          const y = ((baseY - frame * speed) % 1600 + 1600) % 1600;
          const r = 2 + seeded(i, 4) * 3.5;
          return (
            <circle
              key={i}
              cx={x + Math.sin(frame * 0.03 + i) * 14}
              cy={y}
              r={r}
              fill={theme.accent}
              opacity={0.18 + seeded(i, 5) * 0.25}
            />
          );
        })}
      </svg>

      {/* Optional Narrative Story Effect Layer */}
      {effect === 'sepia-flashback' && (
        <AbsoluteFill
          style={{
            backgroundColor: 'rgba(180, 120, 40, 0.16)',
            boxShadow: 'inset 0 0 240px rgba(0, 0, 0, 0.85)',
            pointerEvents: 'none',
          }}
        />
      )}
      {effect === 'vignette-pulse' && (
        <AbsoluteFill
          style={{
            boxShadow: `inset 0 0 ${180 + Math.sin(frame * 0.18) * 60}px rgba(0, 0, 0, 0.92)`,
            pointerEvents: 'none',
          }}
        />
      )}
      {effect === 'fog-drift' && (
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, transparent 45%, rgba(148, 163, 184, 0.16) 75%, rgba(15, 23, 42, 0.65) 100%)',
            transform: `translateX(${Math.sin(frame * 0.03) * 35}px)`,
            pointerEvents: 'none',
          }}
        />
      )}
      {effect === 'rain-streaks' && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35}}>
          {Array.from({length: 22}).map((_, i) => {
            const rx = seeded(i, 11) * 1080;
            const ry = ((seeded(i, 12) * 1920 + frame * 36) % 1920);
            return (
              <line key={i} x1={rx} y1={ry} x2={rx - 14} y2={ry + 65} stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
            );
          })}
        </svg>
      )}
      {effect === 'horror-glitch' && frame % 17 < 2 && (
        <AbsoluteFill style={{backgroundColor: 'rgba(239, 68, 68, 0.14)', pointerEvents: 'none'}} />
      )}

      {/* Proportional Floor Platform (bottom: 370px Safe Zone) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 370,
          background: theme.floorGradient,
          borderTop: `8px solid ${theme.floorBorder}`,
          boxShadow: 'inset 0 18px 34px rgba(255,255,255,0.05)',
          zIndex: 4,
        }}
      />
    </AbsoluteFill>
  );
};

export const HeadlineCapsule: React.FC<{
  badge?: string;
  badgeColor?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  borderColor?: string;
}> = ({
  badge,
  badgeColor = '#EF4444',
  title,
  subtitle,
  borderColor = '#DC2626',
}) => (
  <div
    style={{
      position: 'absolute',
      top: 170,
      left: 70,
      right: 70,
      maxWidth: 860,
      margin: '0 auto',
      backgroundColor: 'rgba(15, 23, 42, 0.94)',
      borderRadius: 24,
      padding: '14px 24px',
      textAlign: 'center',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
      border: `3px solid ${borderColor}`,
      zIndex: 20,
    }}
  >
    {badge && (
      <div
        style={{
          display: 'inline-block',
          fontSize: 18,
          fontWeight: 900,
          color: badgeColor,
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontFamily: STORY_FONT,
          marginBottom: 4,
        }}
      >
        {badge}
      </div>
    )}
    <div
      style={{
        fontSize: 33,
        fontWeight: 900,
        color: '#FFFFFF',
        fontFamily: STORY_FONT,
        lineHeight: 1.24,
      }}
    >
      {title}
    </div>
    {subtitle && (
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#FEF08A',
          marginTop: 4,
          fontFamily: STORY_FONT,
        }}
      >
        {subtitle}
      </div>
    )}
  </div>
);

export const AliveCharacterRig: React.FC<{
  children: React.ReactNode;
  mouthOpen: number;
  enterDelay?: number;
  enterFrom?: 'left' | 'right' | 'bottom';
  style?: React.CSSProperties;
}> = ({children, mouthOpen, enterDelay = 0, enterFrom = 'bottom', style}) => {
  const baseTransform = style?.transform ? `${style.transform} ` : '';
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tMs = frameToMs(frame, 30);

  const entrance = spring({
    frame: Math.max(0, frame - enterDelay),
    fps,
    config: {damping: 14, stiffness: 150, mass: 0.75},
  });

  const stretchY = 1 + mouthOpen * 0.04;
  const squashX = preserveVolumeX(stretchY);
  const talkTilt = wave(tMs, 760) * (mouthOpen * 2.4);

  const offsetX =
    enterFrom === 'left'
      ? interpolate(entrance, [0, 1], [-180, 0])
      : enterFrom === 'right'
        ? interpolate(entrance, [0, 1], [180, 0])
        : 0;
  const offsetY = enterFrom === 'bottom' ? interpolate(entrance, [0, 1], [65, 0]) : 0;
  const enterScale = 0.92 + 0.08 * entrance;
  const enterOpacity = interpolate(entrance, [0, 0.45], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        ...style,
        opacity: enterOpacity,
        transform: `${baseTransform}translate3d(${offsetX}px, ${offsetY}px, 0) scale(${squashX * enterScale}, ${stretchY * enterScale}) rotate(${talkTilt}deg)`,
        transformOrigin: 'bottom center',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
};

export const KineticWordSubtitle: React.FC<{
  segments: WordSegment[];
  wordFixes?: Record<string, string>;
  highlightColor?: string;
}> = ({segments, wordFixes = {}, highlightColor = '#FACC15'}) => {
  const globalFrame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const activeSegment = segments.find(
    (seg) => globalFrame >= seg.start_frame - 4 && globalFrame <= seg.end_frame + 8
  );

  if (!activeSegment) return null;

  const visibleTokens = activeSegment.words
    .map((w, idx) => {
      const key = `${activeSegment.id}:${idx}`;
      const display = key in wordFixes ? wordFixes[key] : w.word.trim();
      return {w, idx, display};
    })
    .filter((item) => Boolean(item.display));

  let displayTokens = visibleTokens;
  if (visibleTokens.length > 9) {
    const mid = Math.ceil(visibleTokens.length / 2);
    let activeIdx = visibleTokens.findIndex(
      (item) => globalFrame >= item.w.start_frame && globalFrame <= item.w.end_frame + 3
    );
    if (activeIdx === -1) {
      activeIdx = visibleTokens.reduce(
        (acc, item, i) => (globalFrame >= item.w.start_frame ? i : acc),
        0
      );
    }
    displayTokens = activeIdx >= mid ? visibleTokens.slice(mid) : visibleTokens.slice(0, mid);
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 260,
        left: 70,
        right: 70,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 90,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(9, 13, 22, 0.94)',
          backdropFilter: 'blur(12px)',
          color: '#FFFFFF',
          padding: '14px 28px',
          borderRadius: 22,
          fontFamily: STORY_FONT,
          fontSize: 34,
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.35,
          maxWidth: 860,
          boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px 12px',
        }}
      >
        {displayTokens.map(({w, idx, display}) => {
          const isCurrent = globalFrame >= w.start_frame && globalFrame <= w.end_frame + 3;
          const isPast = globalFrame > w.end_frame + 3;
          const wordPop = isCurrent
            ? spring({
                frame: globalFrame - w.start_frame,
                fps,
                config: {damping: 10, stiffness: 220},
              })
            : 0;
          const scale = 1 + wordPop * 0.16;

          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                margin: '0 4px',
                transform: `scale(${scale}) translateY(${wordPop * -4}px)`,
                color: isCurrent ? highlightColor : isPast ? '#F8FAFC' : '#94A3B8',
                textShadow: isCurrent ? '0 4px 16px rgba(250, 204, 21, 0.55)' : 'none',
              }}
            >
              {display}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const ProgressBar: React.FC<{
  totalFrames: number;
  color?: string;
}> = ({totalFrames, color = '#DC2626'}) => {
  const frame = useCurrentFrame();
  const widthPercent = Math.min(100, Math.max(0, (frame / Math.max(1, totalFrames)) * 100));

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${widthPercent}%`,
          backgroundColor: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
    </div>
  );
};

export function findActiveWord(segments: WordSegment[], globalFrame: number): string {
  for (const seg of segments) {
    if (globalFrame >= seg.start_frame - 2 && globalFrame <= seg.end_frame + 4) {
      const hit = seg.words.find(
        (w) => globalFrame >= w.start_frame && globalFrame <= w.end_frame + 2
      );
      if (hit) return hit.word;
    }
  }
  return '';
}

export type {FlowKey};
