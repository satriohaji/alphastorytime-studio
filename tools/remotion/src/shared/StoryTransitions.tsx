import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type EnterStyle =
  | 'whip-left'
  | 'whip-up'
  | 'zoom-punch'
  | 'depth-dolly'
  | 'fade-dark'
  | 'glitch-snap';

export type StoryStingerType =
  | 'shadow-wipe'
  | 'glitch-cut'
  | 'flashback-iris'
  | 'fog-curtain'
  | 'blood-slash'
  | 'laser-scan'
  | 'golden-reveal';

export const SceneTransitionWrapper: React.FC<{
  children: React.ReactNode;
  duration: number;
  isFirst?: boolean;
  isLast?: boolean;
  enterStyle?: EnterStyle;
}> = ({
  children,
  duration,
  isFirst = false,
  isLast = false,
  enterStyle = 'zoom-punch',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enterProg = isFirst
    ? 1
    : spring({
        frame,
        fps,
        config: {damping: 14, stiffness: 165, mass: 0.75},
      });

  const exitFrames = 10;
  const exitStart = Math.max(0, duration - exitFrames);
  const exitProg =
    !isLast && frame >= exitStart
      ? interpolate(frame, [exitStart, duration], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  let tx = 0;
  let ty = 0;
  let scale = 1;
  let rotate = 0;
  let blur = 0;
  let opacity = 1;

  if (!isFirst && frame < 20) {
    if (enterStyle === 'whip-left') {
      tx = interpolate(enterProg, [0, 1], [1080, 0]);
      rotate = interpolate(enterProg, [0, 1], [5, 0]);
      blur = interpolate(enterProg, [0, 1], [14, 0]);
    } else if (enterStyle === 'whip-up') {
      ty = interpolate(enterProg, [0, 1], [1920, 0]);
      scale = interpolate(enterProg, [0, 1], [1.12, 1]);
      blur = interpolate(enterProg, [0, 1], [12, 0]);
    } else if (enterStyle === 'zoom-punch') {
      scale = interpolate(enterProg, [0, 1], [0.76, 1]);
      rotate = interpolate(enterProg, [0, 1], [-3, 0]);
      blur = interpolate(enterProg, [0, 1], [8, 0]);
    } else if (enterStyle === 'depth-dolly') {
      tx = interpolate(enterProg, [0, 1], [220, 0]);
      scale = interpolate(enterProg, [0, 1], [1.2, 1]);
      blur = interpolate(enterProg, [0, 1], [6, 0]);
    } else if (enterStyle === 'fade-dark') {
      opacity = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
      scale = interpolate(enterProg, [0, 1], [1.05, 1]);
    } else if (enterStyle === 'glitch-snap') {
      tx = frame < 5 ? (frame % 2 === 0 ? 24 : -24) : 0;
      scale = frame < 4 ? 1.06 : 1;
    }
  }

  if (exitProg > 0) {
    scale = interpolate(exitProg, [0, 1], [1, 1.2]);
    blur = interpolate(exitProg, [0, 1], [0, 12]);
  }

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale}) rotate(${rotate}deg)`,
        filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
        transformOrigin: 'center center',
        willChange: 'transform, filter, opacity',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const StingerOverlay: React.FC<{type: StoryStingerType}> = ({type}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = interpolate(frame, [0, 12, 24], [0, 1, 2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cover = frame <= 12 ? progress : 2 - progress;

  if (type === 'shadow-wipe') {
    const slideX = interpolate(frame, [0, 10, 14, 24], [-1400, 0, 0, 1400]);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', zIndex: 85, overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute',
            inset: -200,
            background: 'linear-gradient(135deg, #09090B 0%, #450A0A 60%, #09090B 100%)',
            borderLeft: '20px solid #DC2626',
            borderRight: '20px solid #EF4444',
            transform: `translateX(${slideX}px) rotate(-10deg)`,
            boxShadow: '0 0 90px rgba(0,0,0,0.95)',
          }}
        />
      </AbsoluteFill>
    );
  }

  if (type === 'glitch-cut') {
    const bandA = Math.sin(frame * 4.1) * 65;
    const bandB = Math.cos(frame * 3.3) * 80;
    return (
      <AbsoluteFill style={{pointerEvents: 'none', zIndex: 85, opacity: cover}}>
        <div style={{position: 'absolute', inset: 0, backgroundColor: '#05050A', opacity: 0.9}} />
        <div style={{position: 'absolute', top: 380, left: 0, right: 0, height: 140, backgroundColor: '#EF4444', opacity: 0.65, transform: `translateX(${bandA}px)`}} />
        <div style={{position: 'absolute', top: 860, left: 0, right: 0, height: 110, backgroundColor: '#38BDF8', opacity: 0.55, transform: `translateX(${bandB}px)`}} />
        <div style={{position: 'absolute', top: 1280, left: 0, right: 0, height: 90, backgroundColor: '#FAFAFA', opacity: 0.4, transform: `translateX(${-bandA}px)`}} />
      </AbsoluteFill>
    );
  }

  if (type === 'flashback-iris') {
    const radius = interpolate(frame, [0, 11, 13, 24], [1200, 0, 0, 1200]);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', zIndex: 85}}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920">
          <defs>
            <mask id="storyIrisMask">
              <rect width="1080" height="1920" fill="white" />
              <circle cx="540" cy="960" r={Math.max(0, radius)} fill="black" />
            </mask>
          </defs>
          <rect width="1080" height="1920" fill="#0F172A" mask="url(#storyIrisMask)" />
          <circle cx="540" cy="960" r={Math.max(0, radius)} fill="none" stroke="#F59E0B" strokeWidth="22" />
        </svg>
      </AbsoluteFill>
    );
  }

  if (type === 'fog-curtain') {
    const shutter = spring({
      frame: frame <= 12 ? frame : 24 - frame,
      fps,
      config: {damping: 15, stiffness: 200},
    });
    const topY = interpolate(shutter, [0, 1], [-1000, 0]);
    const botY = interpolate(shutter, [0, 1], [1000, 0]);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', zIndex: 85, overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 980, backgroundColor: '#090D16', borderBottom: '12px solid #38BDF8', transform: `translateY(${topY}px)`}} />
        <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 980, backgroundColor: '#090D16', borderTop: '12px solid #38BDF8', transform: `translateY(${botY}px)`}} />
      </AbsoluteFill>
    );
  }

  if (type === 'blood-slash') {
    const slashProg = interpolate(frame, [0, 12, 24], [-100, 100, 220]);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', zIndex: 85}}>
        <div style={{position: 'absolute', inset: 0, backgroundColor: '#180507', opacity: cover * 0.92}} />
        <div
          style={{
            position: 'absolute',
            top: `${slashProg}%`,
            left: -200,
            right: -200,
            height: 44,
            background: 'linear-gradient(90deg, transparent, #DC2626, #FCA5A5, #DC2626, transparent)',
            boxShadow: '0 0 60px 18px #EF4444',
            transform: 'rotate(-24deg)',
          }}
        />
      </AbsoluteFill>
    );
  }

  if (type === 'laser-scan') {
    const scanY = interpolate(frame, [0, 24], [-200, 2120]);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', zIndex: 85}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#0284C7',
            opacity: cover * 0.78,
            clipPath: `polygon(0 ${Math.max(0, scanY - 700)}px, 1080 ${Math.max(0, scanY - 550)}px, 1080 ${scanY}px, 0 ${scanY + 150}px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: scanY,
            left: -100,
            right: -100,
            height: 24,
            background: 'linear-gradient(90deg, #38BDF8, #FFFFFF, #FACC15, #FFFFFF, #38BDF8)',
            boxShadow: '0 0 50px 18px #38BDF8',
            transform: 'rotate(-5deg)',
          }}
        />
      </AbsoluteFill>
    );
  }

  if (type === 'golden-reveal') {
    const burstScale = interpolate(frame, [0, 12, 24], [0, 18, 0]);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', zIndex: 85, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="300" height="300" viewBox="0 0 200 200" style={{transform: `scale(${burstScale}) rotate(${frame * 10}deg)`}}>
          <polygon
            points="100,0 125,65 195,70 140,115 160,185 100,145 40,185 60,115 5,70 75,65"
            fill="#FACC15"
            stroke="#DC2626"
            strokeWidth="6"
          />
        </svg>
      </AbsoluteFill>
    );
  }

  return null;
};
