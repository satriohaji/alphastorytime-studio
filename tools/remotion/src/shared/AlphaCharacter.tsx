import React from 'react';
import {useCurrentFrame} from 'remotion';
import {
  computeBlinkLid,
  computePupilGaze,
  frameToMs,
  preserveVolumeX,
  wave,
} from './motion';

export type Expression = 'happy' | 'thinking' | 'shock' | 'squint' | 'smug' | 'tense';
export type BodyPose =
  | 'wave'
  | 'gesture_right'
  | 'gesture_left'
  | 'shrug'
  | 'point'
  | 'think'
  | 'idle';
export type MouthShape = 'closed' | 'open_a' | 'open_o' | 'wide_e' | 'narrow_u';

export interface AlphaCharacterProps {
  scale?: number;
  expression: Expression;
  bodyPose: BodyPose;
  /** Acoustic RMS lip-sync openness [0..1] from lipSyncData.ts */
  mouthOpen?: number;
  /** Optional explicit vowel shape when mouthOpen >= 0.08 */
  mouthShape?: MouthShape;
  /** Optional active word used to derive vowel viseme alongside mouthOpen */
  activeWord?: string;
  isTalking?: boolean;
  /** Optional custom frame/time override; defaults to Remotion useCurrentFrame() */
  timeSec?: number;
  /** Optional rim-light tint matching the current room mood */
  rimColor?: string;
  /** Hoodie color style: default is signature 3D indigo/blue (#5B5FE8) or classic red (#DC2626) */
  hoodieColor?: string;
}

export function getMouthShapeForWord(word: string, isTalking: boolean): MouthShape {
  if (!isTalking || !word) return 'closed';
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 'closed';
  if (cleaned.includes('o')) return 'open_o';
  if (cleaned.includes('u')) return 'narrow_u';
  if (cleaned.includes('a')) return 'open_a';
  if (cleaned.includes('e') || cleaned.includes('i')) return 'wide_e';
  return 'open_a';
}

/**
 * AlphaCharacter - 2.5D "Kok Bisa" Mascot Rig with Rossark Motion Engine
 * Signature Visual Identity:
 * - Folded ribbed dark beanie with dome
 * - 4 stylized hair tufts spilling over forehead
 * - Cute chibi round head with volumetric 2.5D shading
 * - Dual-catchlight anime eyes with Rossark blink & gaze
 * - Kangaroo pocket hoodie with drawstrings & metal aglets
 */
export const AlphaCharacter: React.FC<AlphaCharacterProps> = ({
  scale = 1.75,
  expression = 'happy',
  bodyPose = 'idle',
  mouthOpen = 0,
  mouthShape,
  activeWord,
  isTalking,
  timeSec,
  rimColor,
  hoodieColor = '#5B5FE8',
}) => {
  const frame = useCurrentFrame();
  const tMs = timeSec !== undefined ? timeSec * 1000 : frameToMs(frame, 30);
  const t = tMs / 1000;

  const acousticOpen = mouthOpen !== undefined ? Math.max(0, Math.min(1, mouthOpen)) : 0;
  const speaking = acousticOpen >= 0.08 || Boolean(isTalking);

  const isShock = expression === 'shock' || expression === 'tense';

  const resolvedShape: MouthShape = !speaking
    ? 'closed'
    : mouthShape && mouthShape !== 'closed'
      ? mouthShape
      : activeWord
        ? getMouthShapeForWord(activeWord, true)
        : acousticOpen < 0.28
          ? 'narrow_u'
          : 'open_a';

  // Calm breathing with volume preservation & natural head motion (Rossark)
  const breathScaleY = 1 + wave(tMs, 2600) * 0.016 + (speaking ? acousticOpen * 0.014 : 0);
  const breathScaleX = preserveVolumeX(breathScaleY);
  const breathY = wave(tMs, 2600) * 3.5;
  const headTilt =
    expression === 'thinking'
      ? -4.5
      : expression === 'smug'
        ? 3.8
        : expression === 'tense' || expression === 'shock'
          ? -2.0 + Math.sin(t * 12) * 0.8
          : wave(tMs, 3400) * 1.8;

  // Asymmetric clip-safe blink + smooth pupil gaze (Rossark Motion)
  const blink = computeBlinkLid(tMs, 3400, 0, 3);
  const eyeScaleY = Math.max(0.06, 1 - blink);
  const gaze = computePupilGaze(tMs, 0, 0, 2.8, 0.15);

  // Secondary string swing
  const stringSwingLeft = Math.sin(t * 3.5) * 5.0;
  const stringSwingRight = Math.cos(t * 3.2) * 5.0;

  const renderArmsAndHands = () => {
    if (isShock) {
      // SHOCK / HORROR POSE: Both hands cupping cheeks (matching 3D model)
      const tremble = Math.sin(t * 18) * 2;
      return (
        <g id="shock-arms">
          {/* Left Sleeve raised to cheek */}
          <path
            d={`M 115 285 Q ${76 + tremble} 228 130 196`}
            fill="none"
            stroke="url(#hoodieMain)"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <path
            d={`M 115 285 Q ${76 + tremble} 228 130 196`}
            fill="none"
            stroke="#18181C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Left Sleeve Cuff */}
          <rect
            x="116"
            y="188"
            width="28"
            height="14"
            rx="6"
            transform={`rotate(-25 130 196)`}
            fill="url(#hoodiePocket)"
            stroke="#18181C"
            strokeWidth="3.5"
          />
          {/* Left Hand cupping cheek */}
          <g transform={`translate(${138 + tremble * 0.4}, 198) rotate(15)`}>
            <ellipse cx="0" cy="0" rx="16" ry="14" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />
            <circle cx="10" cy="-4" r="5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
            <circle cx="9" cy="6" r="4.5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
          </g>

          {/* Right Sleeve raised to cheek */}
          <path
            d={`M 285 285 Q ${324 - tremble} 228 270 196`}
            fill="none"
            stroke="url(#hoodieMain)"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <path
            d={`M 285 285 Q ${324 - tremble} 228 270 196`}
            fill="none"
            stroke="#18181C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Right Sleeve Cuff */}
          <rect
            x="256"
            y="188"
            width="28"
            height="14"
            rx="6"
            transform={`rotate(25 270 196)`}
            fill="url(#hoodiePocket)"
            stroke="#18181C"
            strokeWidth="3.5"
          />
          {/* Right Hand cupping cheek */}
          <g transform={`translate(${262 - tremble * 0.4}, 198) rotate(-15)`}>
            <ellipse cx="0" cy="0" rx="16" ry="14" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />
            <circle cx="-10" cy="-4" r="5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
            <circle cx="-9" cy="6" r="4.5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
          </g>
        </g>
      );
    }

    if (bodyPose === 'gesture_left') {
      const sway = Math.sin(t * 5) * 6;
      return (
        <g id="gesture-left-arms">
          {/* Left Arm Gesturing Outward */}
          <path
            d={`M 115 278 Q 65 305 ${50 + sway} ${265 - sway}`}
            fill="none"
            stroke="url(#hoodieMain)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          <path
            d={`M 115 278 Q 65 305 ${50 + sway} ${265 - sway}`}
            fill="none"
            stroke="#18181C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Left Cuff */}
          <rect
            x={38 + sway}
            y={255 - sway}
            width="26"
            height="14"
            rx="6"
            transform={`rotate(20 ${50 + sway} ${265 - sway})`}
            fill="url(#hoodiePocket)"
            stroke="#18181C"
            strokeWidth="3"
          />
          {/* Left Open Hand */}
          <g transform={`translate(${45 + sway}, ${255 - sway}) rotate(25)`}>
            <ellipse cx="0" cy="0" rx="15" ry="13" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />
            <circle cx="8" cy="-8" r="5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
            <circle cx="-8" cy="-6" r="4.5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
          </g>

          {/* Right Arm Idle along Torso */}
          <path
            d="M 282 278 Q 305 340 292 395"
            fill="none"
            stroke="url(#hoodieMain)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          <path
            d="M 282 278 Q 305 340 292 395"
            fill="none"
            stroke="#18181C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="278" y="385" width="28" height="14" rx="6" fill="url(#hoodiePocket)" stroke="#18181C" strokeWidth="3" />
          <circle cx="292" cy="408" r="16" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />
        </g>
      );
    }

    if (bodyPose === 'gesture_right') {
      const sway = Math.sin(t * 5) * 6;
      return (
        <g id="gesture-right-arms">
          {/* Left Arm Idle along Torso */}
          <path
            d="M 118 278 Q 95 340 108 395"
            fill="none"
            stroke="url(#hoodieMain)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          <path
            d="M 118 278 Q 95 340 108 395"
            fill="none"
            stroke="#18181C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="94" y="385" width="28" height="14" rx="6" fill="url(#hoodiePocket)" stroke="#18181C" strokeWidth="3" />
          <circle cx="108" cy="408" r="16" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />

          {/* Right Arm Gesturing Outward */}
          <path
            d={`M 285 278 Q 335 305 ${350 - sway} ${265 - sway}`}
            fill="none"
            stroke="url(#hoodieMain)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          <path
            d={`M 285 278 Q 335 305 ${350 - sway} ${265 - sway}`}
            fill="none"
            stroke="#18181C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Right Cuff */}
          <rect
            x={336 - sway}
            y={255 - sway}
            width="26"
            height="14"
            rx="6"
            transform={`rotate(-20 ${350 - sway} ${265 - sway})`}
            fill="url(#hoodiePocket)"
            stroke="#18181C"
            strokeWidth="3"
          />
          {/* Right Open Hand */}
          <g transform={`translate(${355 - sway}, ${255 - sway}) rotate(-25)`}>
            <ellipse cx="0" cy="0" rx="15" ry="13" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />
            <circle cx="-8" cy="-8" r="5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
            <circle cx="8" cy="-6" r="4.5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
          </g>
        </g>
      );
    }

    if (bodyPose === 'wave') {
      const waveAngle = Math.sin(t * 10) * 18;
      return (
        <g id="wave-arms">
          {/* Left Arm Idle */}
          <path
            d="M 118 278 Q 95 340 108 395"
            fill="none"
            stroke="url(#hoodieMain)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          <path
            d="M 118 278 Q 95 340 108 395"
            fill="none"
            stroke="#18181C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="94" y="385" width="28" height="14" rx="6" fill="url(#hoodiePocket)" stroke="#18181C" strokeWidth="3" />
          <circle cx="108" cy="408" r="16" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />

          {/* Right Arm Waving High */}
          <path
            d="M 285 278 Q 320 220 310 160"
            fill="none"
            stroke="url(#hoodieMain)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          <path
            d="M 285 278 Q 320 220 310 160"
            fill="none"
            stroke="#18181C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="296" y="152" width="28" height="14" rx="6" fill="url(#hoodiePocket)" stroke="#18181C" strokeWidth="3" />
          <g transform={`translate(310, 145) rotate(${waveAngle})`}>
            <circle cx="0" cy="0" r="17" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />
            <circle cx="-8" cy="-8" r="5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
            <circle cx="0" cy="-11" r="5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
            <circle cx="8" cy="-8" r="5" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="3" />
          </g>
        </g>
      );
    }

    // Default: Natural Idle with hands clearly visible resting alongside torso
    return (
      <g id="idle-arms">
        {/* Left Arm */}
        <path
          d="M 118 278 Q 88 340 98 400"
          fill="none"
          stroke="url(#hoodieMain)"
          strokeWidth="36"
          strokeLinecap="round"
        />
        <path
          d="M 118 278 Q 88 340 98 400"
          fill="none"
          stroke="#18181C"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect x="84" y="390" width="28" height="14" rx="6" fill="url(#hoodiePocket)" stroke="#18181C" strokeWidth="3" />
        <circle cx="98" cy="414" r="16" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />

        {/* Right Arm */}
        <path
          d="M 282 278 Q 312 340 302 400"
          fill="none"
          stroke="url(#hoodieMain)"
          strokeWidth="36"
          strokeLinecap="round"
        />
        <path
          d="M 282 278 Q 312 340 302 400"
          fill="none"
          stroke="#18181C"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect x="288" y="390" width="28" height="14" rx="6" fill="url(#hoodiePocket)" stroke="#18181C" strokeWidth="3" />
        <circle cx="302" cy="414" r="16" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4" />
      </g>
    );
  };

  const renderEyes = () => {
    if (blink > 0.82) {
      return (
        <g stroke="#18181C" strokeWidth="5" fill="none" strokeLinecap="round">
          <path d="M 152 182 Q 170 188 188 182" />
          <path d="M 212 182 Q 230 188 248 182" />
        </g>
      );
    }

    if (isShock) {
      // Terrified horror pinprick eyes (matching Alpha 3D shock mode)
      return (
        <>
          {/* Left Eye */}
          <g transform={`translate(170, 180) scale(1, ${eyeScaleY}) translate(-170, -180)`}>
            <ellipse cx="170" cy="180" rx="16" ry="19" fill="#FFFFFF" stroke="#18181C" strokeWidth="4" />
            <circle cx={170 + gaze.x * 0.4} cy={180 + gaze.y * 0.4} r="5.5" fill="#2563EB" />
            <circle cx={170 + gaze.x * 0.4} cy={180 + gaze.y * 0.4} r="2.4" fill="#0A0E1A" />
            <circle cx={168 + gaze.x * 0.4} cy={177 + gaze.y * 0.4} r="1.8" fill="#FFFFFF" />
          </g>
          {/* Right Eye */}
          <g transform={`translate(230, 180) scale(1, ${eyeScaleY}) translate(-230, -180)`}>
            <ellipse cx="230" cy="180" rx="16" ry="19" fill="#FFFFFF" stroke="#18181C" strokeWidth="4" />
            <circle cx={230 + gaze.x * 0.4} cy={180 + gaze.y * 0.4} r="5.5" fill="#2563EB" />
            <circle cx={230 + gaze.x * 0.4} cy={180 + gaze.y * 0.4} r="2.4" fill="#0A0E1A" />
            <circle cx={228 + gaze.x * 0.4} cy={177 + gaze.y * 0.4} r="1.8" fill="#FFFFFF" />
          </g>
          {/* Terrified high brows */}
          <path d="M 150 148 Q 168 136 188 152" stroke="#18181C" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          <path d="M 212 152 Q 232 136 250 148" stroke="#18181C" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          {/* Sweat drop lines */}
          <path d="M 134 130 L 138 146 M 142 132 L 146 144" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    }

    // Default: Big Sparkling Kok Bisa Anime Eyes with Dual Glossy Catchlights
    return (
      <>
        {/* Left Eye */}
        <g transform={`translate(170, 180) scale(1, ${eyeScaleY}) translate(-170, -180)`}>
          <ellipse cx="170" cy="180" rx="15" ry="17" fill="#FFFFFF" stroke="#18181C" strokeWidth="3.5" />
          {/* Iris */}
          <ellipse cx={170 + gaze.x * 0.5} cy={180 + gaze.y * 0.5} rx="11" ry="13" fill="url(#irisGrad)" />
          {/* Pupil */}
          <circle cx={170 + gaze.x * 0.5} cy={180 + gaze.y * 0.5} r="6" fill="#0A0E1A" />
          {/* Dual Catchlights */}
          <circle cx={166 + gaze.x * 0.5} cy={174 + gaze.y * 0.5} r="4.2" fill="#FFFFFF" />
          <circle cx={173 + gaze.x * 0.5} cy={185 + gaze.y * 0.5} r="2.0" fill="#FFFFFF" />
        </g>
        {/* Right Eye */}
        <g transform={`translate(230, 180) scale(1, ${eyeScaleY}) translate(-230, -180)`}>
          <ellipse cx="230" cy="180" rx="15" ry="17" fill="#FFFFFF" stroke="#18181C" strokeWidth="3.5" />
          {/* Iris */}
          <ellipse cx={230 + gaze.x * 0.5} cy={180 + gaze.y * 0.5} rx="11" ry="13" fill="url(#irisGrad)" />
          {/* Pupil */}
          <circle cx={230 + gaze.x * 0.5} cy={180 + gaze.y * 0.5} r="6" fill="#0A0E1A" />
          {/* Dual Catchlights */}
          <circle cx={226 + gaze.x * 0.5} cy={174 + gaze.y * 0.5} r="4.2" fill="#FFFFFF" />
          <circle cx={233 + gaze.x * 0.5} cy={185 + gaze.y * 0.5} r="2.0" fill="#FFFFFF" />
        </g>
        {/* Eyebrows */}
        <path d="M 152 156 Q 169 148 186 156" stroke="#18181C" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 214 156 Q 231 148 248 156" stroke="#18181C" strokeWidth="5" fill="none" strokeLinecap="round" />
      </>
    );
  };

  const renderMouth = () => {
    if (!speaking || resolvedShape === 'closed') {
      if (isShock) {
        return (
          <ellipse cx="200" cy="225" rx="9" ry="14" fill="#3B070C" stroke="#18181C" strokeWidth="4" />
        );
      }
      if (expression === 'smug') {
        return (
          <path d="M 185 222 Q 202 228 218 216" stroke="#18181C" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        );
      }
      if (expression === 'thinking') {
        return (
          <path d="M 188 223 Q 200 220 212 224" stroke="#18181C" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        );
      }
      // Cute happy smile
      return (
        <path d="M 184 218 Q 200 230 216 218" stroke="#18181C" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      );
    }

    const mouthScaleY = 0.55 + acousticOpen * 0.75;

    switch (resolvedShape) {
      case 'open_o':
        return (
          <g transform={`translate(200, 224) scale(1, ${mouthScaleY}) translate(-200, -224)`}>
            <ellipse cx="200" cy="224" rx="12" ry="15" fill="#3B070C" stroke="#18181C" strokeWidth="4" />
            <circle cx="200" cy="232" r="6" fill="#F43F5E" />
          </g>
        );
      case 'narrow_u':
        return (
          <g transform={`translate(200, 224) scale(1, ${mouthScaleY}) translate(-200, -224)`}>
            <ellipse cx="200" cy="224" rx="8" ry="10" fill="#3B070C" stroke="#18181C" strokeWidth="4" />
          </g>
        );
      case 'wide_e':
        return (
          <g transform={`translate(200, 222) scale(1, ${mouthScaleY}) translate(-200, -222)`}>
            <path d="M 180 216 Q 200 214 220 216 Q 216 230 200 230 Q 184 230 180 216 Z" fill="#3B070C" stroke="#18181C" strokeWidth="4" />
            <path d="M 184 218 L 216 218" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      case 'open_a':
      default:
        return (
          <g transform={`translate(200, 222) scale(1, ${mouthScaleY}) translate(-200, -222)`}>
            <path d="M 182 214 Q 200 210 218 214 Q 222 238 200 238 Q 178 238 182 214 Z" fill="#3B070C" stroke="#18181C" strokeWidth="4" />
            <path d="M 186 215 L 214 215" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="200" cy="231" rx="10" ry="5.5" fill="#F43F5E" />
          </g>
        );
    }
  };

  return (
    <div
      style={{
        width: 400 * scale,
        height: 480 * scale,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: rimColor ? `drop-shadow(0 0 24px ${rimColor})` : undefined,
      }}
    >
      <svg viewBox="0 0 400 480" width="100%" height="100%" style={{overflow: 'visible'}}>
        <defs>
          {/* Volumetric 2.5D Shading Gradients */}
          <radialGradient id="skinGrad" cx="45%" cy="38%" r="65%">
            <stop offset="0%" stopColor={isShock ? '#FFF0E8' : '#FFE2D1'} />
            <stop offset="70%" stopColor={isShock ? '#FED7AA' : '#FFD2A5'} />
            <stop offset="100%" stopColor={isShock ? '#E2D5CC' : '#E8B688'} />
          </radialGradient>

          <linearGradient id="beanieDome" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3A3A44" />
            <stop offset="50%" stopColor="#25252C" />
            <stop offset="100%" stopColor="#141418" />
          </linearGradient>

          <linearGradient id="beanieBrim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#454552" />
            <stop offset="40%" stopColor="#2B2B34" />
            <stop offset="100%" stopColor="#1A1A20" />
          </linearGradient>

          <linearGradient id="hoodieMain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hoodieColor === '#DC2626' ? '#EF4444' : '#6366F1'} />
            <stop offset="45%" stopColor={hoodieColor} />
            <stop offset="100%" stopColor={hoodieColor === '#DC2626' ? '#991B1B' : '#3730A3'} />
          </linearGradient>

          <linearGradient id="hoodiePocket" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hoodieColor === '#DC2626' ? '#B91C1C' : '#4F46E5'} />
            <stop offset="100%" stopColor={hoodieColor === '#DC2626' ? '#7F1D1D' : '#312E81'} />
          </linearGradient>

          <linearGradient id="metalAglet" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="40%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          <radialGradient id="irisGrad" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="40%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </radialGradient>
        </defs>

        <g transform={`translate(200, 440) scale(${breathScaleX}, ${breathScaleY}) translate(-200, -440) translate(0, ${breathY})`}>
          {/* Puffy Hood behind neck */}
          <path
            d="M 132 255 Q 200 236 268 255 Q 284 278 268 290 Q 200 278 132 290 Q 116 278 132 255 Z"
            fill="url(#hoodiePocket)"
            stroke="#18181C"
            strokeWidth="5"
          />

          {/* Torso / Hoodie Body */}
          <path
            d="M 125 268 Q 200 248 275 268 L 298 438 Q 200 452 102 438 Z"
            fill="url(#hoodieMain)"
            stroke="#18181C"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Kangaroo Pocket */}
          <path
            d="M 142 355 L 258 355 L 268 424 Q 200 435 132 424 Z"
            fill="url(#hoodiePocket)"
            stroke="#18181C"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Pocket side entry slits */}
          <path d="M 144 362 L 150 414" stroke="#18181C" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 256 362 L 250 414" stroke="#18181C" strokeWidth="3.5" strokeLinecap="round" />

          {/* Drawstring Cords & Metallic Aglets */}
          <g transform={`rotate(${stringSwingLeft} 175 272)`}>
            <path d="M 175 270 Q 170 305 174 340" stroke="#F8FAFC" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <rect x="171" y="340" width="6" height="15" rx="3" fill="url(#metalAglet)" stroke="#18181C" strokeWidth="1.5" />
          </g>
          <g transform={`rotate(${stringSwingRight} 225 272)`}>
            <path d="M 225 270 Q 230 305 226 340" stroke="#F8FAFC" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <rect x="223" y="340" width="6" height="15" rx="3" fill="url(#metalAglet)" stroke="#18181C" strokeWidth="1.5" />
          </g>

          {/* Neck */}
          <rect x="182" y="238" width="36" height="34" rx="10" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="5" />

          {/* Head & Face Group */}
          <g transform={`rotate(${headTilt} 200 185)`}>
            {/* Ears */}
            <ellipse cx="118" cy="186" rx="14" ry="18" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4.5" />
            <ellipse cx="282" cy="186" rx="14" ry="18" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="4.5" />

            {/* Base Spherical Head */}
            <rect x="122" y="108" width="156" height="146" rx="68" fill="url(#skinGrad)" stroke="#18181C" strokeWidth="6" />

            {/* Blush Cheeks */}
            {!isShock && (
              <>
                <circle cx="148" cy="204" r="12" fill="#F472B6" opacity="0.45" />
                <circle cx="252" cy="204" r="12" fill="#F472B6" opacity="0.45" />
              </>
            )}

            {/* Beanie Dome (covers top & back) */}
            <path
              d="M 116 156 Q 108 72 200 68 Q 292 72 284 156 Z"
              fill="url(#beanieDome)"
              stroke="#141418"
              strokeWidth="5"
            />

            {/* Ribbed Beanie Brim (thick band hugging forehead line) */}
            <rect
              x="112"
              y="142"
              width="176"
              height="30"
              rx="15"
              fill="url(#beanieBrim)"
              stroke="#111116"
              strokeWidth="4.5"
            />
            {/* Subtle ribbing textures */}
            <path
              d="M 145 146 L 145 168 M 172 144 L 172 170 M 200 144 L 200 170 M 228 144 L 228 170 M 255 146 L 255 168"
              stroke="#111116"
              strokeWidth="2.5"
              opacity="0.5"
            />

            {/* 4 Stylized Hair Bangs Tufting Under the Brim */}
            {/* Lock 1 (far left) */}
            <path
              d="M 134 165 Q 140 185 148 180 Q 146 166 142 165 Z"
              fill="#18181C"
              stroke="#18181C"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Lock 2 (mid left) */}
            <path
              d="M 160 168 Q 174 195 186 182 Q 178 168 172 166 Z"
              fill="#18181C"
              stroke="#18181C"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Lock 3 (mid right) */}
            <path
              d="M 188 167 Q 202 196 216 184 Q 208 168 200 166 Z"
              fill="#18181C"
              stroke="#18181C"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Lock 4 (far right) */}
            <path
              d="M 230 166 Q 242 186 250 178 Q 246 166 238 165 Z"
              fill="#18181C"
              stroke="#18181C"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Eyes */}
            {renderEyes()}

            {/* Mouth */}
            {renderMouth()}
          </g>

          {/* Expressive Arms & Hands in front */}
          {renderArmsAndHands()}
        </g>
      </svg>
    </div>
  );
};
