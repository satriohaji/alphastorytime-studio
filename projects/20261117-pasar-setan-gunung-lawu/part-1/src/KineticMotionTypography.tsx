import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type KineticStyle =
  | 'vertical-tilted'
  | 'giant-backdrop'
  | 'slam-punch'
  | 'tracking-spread'
  | 'horror-shiver';

export const KineticEmphasisText: React.FC<{
  text: string;
  subtext?: string;
  styleMode: KineticStyle;
  startFrame: number;
  durationFrames: number;
  side?: 'left' | 'right' | 'center';
  color?: string;
  accentColor?: string;
  fontSize?: number;
  zIndex?: number;
}> = ({
  text,
  subtext,
  styleMode,
  startFrame,
  durationFrames,
  side = 'center',
  color = '#FFFFFF',
  accentColor = '#EF4444',
  fontSize = 90,
  zIndex = 8,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  if (frame < startFrame || frame > startFrame + durationFrames) {
    return null;
  }

  const localF = frame - startFrame;
  const enterSpring = spring({
    frame: localF,
    fps,
    config: {damping: 12, stiffness: 180, mass: 0.8},
  });

  const exitStart = Math.max(0, durationFrames - 10);
  const exitOpacity =
    localF > exitStart
      ? interpolate(localF, [exitStart, durationFrames], [1, 0], {
          extrapolateRight: 'clamp',
        })
      : 1;

  // 1. VERTICAL TILTED (Inspired by uploaded video "ONE thing at A TIME")
  if (styleMode === 'vertical-tilted') {
    const scale = interpolate(enterSpring, [0, 1], [0.7, 1]);
    const slideX =
      side === 'left'
        ? interpolate(enterSpring, [0, 1], [-140, 0])
        : interpolate(enterSpring, [0, 1], [140, 0]);

    return (
      <div
        style={{
          position: 'absolute',
          top: '24%',
          [side === 'left' ? 'left' : 'right']: 45,
          transform: `translateX(${slideX}px) scale(${scale})`,
          opacity: exitOpacity,
          zIndex,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: side === 'left' ? 'flex-start' : 'flex-end',
        }}
      >
        {subtext && (
          <div
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: 22,
              fontWeight: 900,
              color: accentColor,
              marginBottom: 12,
              letterSpacing: 3,
              textTransform: 'uppercase',
              textShadow: '0 4px 15px rgba(0,0,0,0.9)',
            }}
          >
            {subtext}
          </div>
        )}
        <div
          style={{
            fontFamily: "'Impact', 'Arial Black', 'Bebas Neue', 'Space Grotesk', sans-serif",
            fontSize: fontSize || 110,
            lineHeight: 0.9,
            color,
            textTransform: 'uppercase',
            letterSpacing: 6,
            writingMode: 'vertical-rl',
            transform: `rotate(${side === 'left' ? 180 : 0}deg) perspective(500px) rotateY(${
              side === 'left' ? 14 : -14
            }deg)`,
            textShadow: `0 12px 40px rgba(0,0,0,0.95), 0 0 25px ${accentColor}66`,
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  // 2. GIANT BACKDROP (Massive bold word behind Alpha, like "FEW" / "EVERYONE TALKS AI")
  if (styleMode === 'giant-backdrop') {
    const scale = interpolate(enterSpring, [0, 1], [1.18, 1]);
    const track = interpolate(localF, [0, durationFrames], [6, 22]);

    return (
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: 0,
          right: 0,
          textAlign: 'center',
          transform: `scale(${scale})`,
          opacity: interpolate(enterSpring, [0, 1], [0, 0.78]) * exitOpacity,
          zIndex,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: "'Impact', 'Arial Black', 'Space Grotesk', sans-serif",
            fontSize: fontSize || 140,
            fontWeight: 900,
            color,
            textTransform: 'uppercase',
            letterSpacing: track,
            textShadow: `0 0 50px ${accentColor}66, 0 10px 35px rgba(0,0,0,0.9)`,
            lineHeight: 1.0,
          }}
        >
          {text}
        </div>
        {subtext && (
          <div
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: 30,
              fontWeight: 800,
              color: accentColor,
              marginTop: 14,
              letterSpacing: 8,
              textTransform: 'uppercase',
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    );
  }

  // 3. SLAM PUNCH (High energy impact on beat, tilted angle)
  if (styleMode === 'slam-punch') {
    const scale = interpolate(enterSpring, [0, 1], [2.2, 1]);
    const rot = interpolate(
      enterSpring,
      [0, 1],
      [side === 'left' ? -10 : 10, side === 'left' ? -5 : 5]
    );

    return (
      <div
        style={{
          position: 'absolute',
          top: '22%',
          [side === 'left' ? 'left' : side === 'right' ? 'right' : 'left']:
            side === 'center' ? '50%' : 70,
          transform: `${
            side === 'center' ? 'translateX(-50%)' : ''
          } scale(${scale}) rotate(${rot}deg)`,
          opacity: exitOpacity,
          zIndex,
          pointerEvents: 'none',
          textAlign: side === 'center' ? 'center' : 'left',
        }}
      >
        <div
          style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: fontSize || 105,
            lineHeight: 0.92,
            color,
            textTransform: 'uppercase',
            textShadow: `0 0 40px ${accentColor}, 0 12px 35px #000`,
            letterSpacing: 3,
          }}
        >
          {text}
        </div>
        {subtext && (
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 30,
              fontWeight: 900,
              color: accentColor,
              marginTop: 10,
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    );
  }

  // 4. TRACKING SPREAD (Letters spread apart, eerie mystery)
  if (styleMode === 'tracking-spread') {
    const track = interpolate(localF, [0, durationFrames], [10, 42]);
    const opacity = interpolate(
      localF,
      [0, 18, durationFrames - 12, durationFrames],
      [0, 0.88, 0.88, 0]
    );

    return (
      <div
        style={{
          position: 'absolute',
          top: '22%',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: opacity * exitOpacity,
          zIndex,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', 'Space Grotesk', serif",
            fontSize: fontSize || 115,
            fontWeight: 800,
            color,
            letterSpacing: track,
            textTransform: 'uppercase',
            textShadow: `0 0 45px ${accentColor}88, 0 10px 30px rgba(0,0,0,0.95)`,
          }}
        >
          {text}
        </div>
        {subtext && (
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 26,
              fontWeight: 700,
              color: accentColor,
              marginTop: 18,
              letterSpacing: 10,
              textTransform: 'uppercase',
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    );
  }

  // 5. HORROR SHIVER (Vibrating horror climax)
  const shiverX = Math.sin(localF * 1.6) * 7;
  const shiverY = Math.cos(localF * 1.9) * 5;

  return (
    <div
      style={{
        position: 'absolute',
        top: '24%',
        left: 40,
        right: 40,
        textAlign: 'center',
        transform: `translate(${shiverX}px, ${shiverY}px)`,
        opacity: exitOpacity,
        zIndex: 35,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          fontSize: fontSize || 80,
          fontWeight: 900,
          color,
          letterSpacing: 5,
          textTransform: 'uppercase',
          textShadow: `0 0 35px ${accentColor}, 0 0 70px ${accentColor}bb, 4px 0 0 #00ffff, -4px 0 0 #ff0055`,
        }}
      >
        {text}
      </div>
    </div>
  );
};
