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

export const AlphaCharacter: React.FC<AlphaCharacterProps> = ({
  scale = 1.65,
  expression,
  bodyPose,
  mouthOpen,
  mouthShape,
  activeWord,
  isTalking,
  timeSec,
  rimColor,
}) => {
  const frame = useCurrentFrame();
  const tMs = timeSec !== undefined ? timeSec * 1000 : frameToMs(frame, 30);
  const t = tMs / 1000;

  const acousticOpen = mouthOpen !== undefined ? Math.max(0, Math.min(1, mouthOpen)) : undefined;
  const speaking =
    acousticOpen !== undefined ? acousticOpen >= 0.08 : Boolean(isTalking);

  const resolvedShape: MouthShape = !speaking
    ? 'closed'
    : mouthShape && mouthShape !== 'closed'
      ? mouthShape
      : activeWord
        ? getMouthShapeForWord(activeWord, true)
        : acousticOpen !== undefined && acousticOpen < 0.28
          ? 'narrow_u'
          : 'open_a';

  // Calm breathing with volume preservation & natural head motion
  const breathScaleY = 1 + wave(tMs, 2600) * 0.016 + (speaking ? (acousticOpen ?? 0.35) * 0.014 : 0);
  const breathScaleX = preserveVolumeX(breathScaleY);
  const breathY = wave(tMs, 2600) * 3.5;
  const headTilt =
    expression === 'thinking'
      ? -5
      : expression === 'smug'
        ? 4
        : expression === 'tense'
          ? -2.5
          : wave(tMs, 3400) * 1.8;

  // Asymmetric clip-safe blink + smooth pupil gaze from rossark-motion-skill
  const blink = computeBlinkLid(tMs, 3400, 0, 3);
  const eyeScaleY = Math.max(0.06, 1 - blink);
  const gaze = computePupilGaze(tMs, 0, 0, 2.8, 0.15);

  const getLeftArmTransform = () => {
    switch (bodyPose) {
      case 'wave':
        return `rotate(${-125 + Math.sin(t * 10) * 15} 135 285)`;
      case 'shrug':
        return 'rotate(-55 135 285)';
      case 'gesture_left':
        return `rotate(${-70 + Math.sin(t * 5) * 8} 135 285)`;
      default:
        return 'rotate(12 135 285)';
    }
  };

  const getRightArmTransform = () => {
    switch (bodyPose) {
      case 'gesture_right':
        return `rotate(${68 + Math.sin(t * 5) * 8} 265 285)`;
      case 'point':
        return 'rotate(85 265 285)';
      case 'shrug':
        return 'rotate(55 265 285)';
      case 'think':
        return 'rotate(115 265 285)';
      default:
        return 'rotate(-12 265 285)';
    }
  };

  const renderEyes = () => {
    if (blink > 0.85) {
      return (
        <>
          <path d="M 155 178 Q 170 184 185 178" stroke="#18181B" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 215 178 Q 230 184 245 178" stroke="#18181B" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      );
    }

    switch (expression) {
      case 'shock':
        return (
          <>
            <g transform={`translate(170, 176) scale(1, ${eyeScaleY}) translate(-170, -176)`}>
              <ellipse cx="170" cy="176" rx="15" ry="18" fill="#FFFFFF" stroke="#18181B" strokeWidth="4" />
              <circle cx={170 + gaze.x * 0.5} cy={176 + gaze.y * 0.5} r="6" fill="#EF4444" />
              <circle cx={168 + gaze.x * 0.5} cy={173 + gaze.y * 0.5} r="2.5" fill="#FFFFFF" />
            </g>
            <g transform={`translate(230, 176) scale(1, ${eyeScaleY}) translate(-230, -176)`}>
              <ellipse cx="230" cy="176" rx="15" ry="18" fill="#FFFFFF" stroke="#18181B" strokeWidth="4" />
              <circle cx={230 + gaze.x * 0.5} cy={176 + gaze.y * 0.5} r="6" fill="#EF4444" />
              <circle cx={228 + gaze.x * 0.5} cy={173 + gaze.y * 0.5} r="2.5" fill="#FFFFFF" />
            </g>
            <path d="M 152 146 Q 170 135 188 148" stroke="#18181B" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 212 148 Q 230 135 248 146" stroke="#18181B" strokeWidth="5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'thinking':
        return (
          <>
            <g transform={`translate(170, 176) scale(1, ${eyeScaleY}) translate(-170, -176)`}>
              <ellipse cx="170" cy="176" rx="11" ry="12" fill="#18181B" />
              <circle cx={173 + gaze.x * 0.6} cy={171 + gaze.y * 0.6} r="4" fill="#FFFFFF" />
            </g>
            <g transform={`translate(230, 176) scale(1, ${eyeScaleY}) translate(-230, -176)`}>
              <ellipse cx="230" cy="176" rx="11" ry="12" fill="#18181B" />
              <circle cx={233 + gaze.x * 0.6} cy={171 + gaze.y * 0.6} r="4" fill="#FFFFFF" />
            </g>
            <path d="M 154 158 Q 170 162 186 156" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M 214 150 Q 230 142 246 150" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'squint':
        return (
          <>
            <path d="M 154 176 L 186 176" stroke="#18181B" strokeWidth="7" strokeLinecap="round" />
            <path d="M 214 176 L 246 176" stroke="#18181B" strokeWidth="7" strokeLinecap="round" />
            <path d="M 154 162 L 186 167" stroke="#18181B" strokeWidth="5" strokeLinecap="round" />
            <path d="M 246 162 L 214 167" stroke="#18181B" strokeWidth="5" strokeLinecap="round" />
          </>
        );
      case 'tense':
        return (
          <>
            <g transform={`translate(170, 176) scale(1, ${eyeScaleY}) translate(-170, -176)`}>
              <ellipse cx="170" cy="176" rx="12" ry="11" fill="#FFFFFF" stroke="#18181B" strokeWidth="3.5" />
              <circle cx={170 + gaze.x * 0.6} cy={176 + gaze.y * 0.6} r="6.5" fill="#18181B" />
              <circle cx={168 + gaze.x * 0.6} cy={173 + gaze.y * 0.6} r="2.2" fill="#FFFFFF" />
            </g>
            <g transform={`translate(230, 176) scale(1, ${eyeScaleY}) translate(-230, -176)`}>
              <ellipse cx="230" cy="176" rx="12" ry="11" fill="#FFFFFF" stroke="#18181B" strokeWidth="3.5" />
              <circle cx={230 + gaze.x * 0.6} cy={176 + gaze.y * 0.6} r="6.5" fill="#18181B" />
              <circle cx={228 + gaze.x * 0.6} cy={173 + gaze.y * 0.6} r="2.2" fill="#FFFFFF" />
            </g>
            <path d="M 153 156 L 186 163" stroke="#18181B" strokeWidth="5" strokeLinecap="round" />
            <path d="M 247 156 L 214 163" stroke="#18181B" strokeWidth="5" strokeLinecap="round" />
          </>
        );
      case 'smug':
        return (
          <>
            <g transform={`translate(170, 178) scale(1, ${eyeScaleY}) translate(-170, -178)`}>
              <ellipse cx="170" cy="178" rx="11" ry="9" fill="#18181B" />
              <circle cx={167 + gaze.x * 0.4} cy={175 + gaze.y * 0.4} r="3.5" fill="#FFFFFF" />
            </g>
            <g transform={`translate(230, 178) scale(1, ${eyeScaleY}) translate(-230, -178)`}>
              <ellipse cx="230" cy="178" rx="11" ry="9" fill="#18181B" />
              <circle cx={227 + gaze.x * 0.4} cy={175 + gaze.y * 0.4} r="3.5" fill="#FFFFFF" />
            </g>
            <path d="M 153 160 Q 170 156 187 162" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M 213 158 Q 230 148 247 154" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'happy':
      default:
        return (
          <>
            <g transform={`translate(170, 176) scale(1, ${eyeScaleY}) translate(-170, -176)`}>
              <ellipse cx="170" cy="176" rx="11" ry="13" fill="#18181B" />
              <circle cx={166 + gaze.x * 0.5} cy={171 + gaze.y * 0.5} r="4" fill="#FFFFFF" />
            </g>
            <g transform={`translate(230, 176) scale(1, ${eyeScaleY}) translate(-230, -176)`}>
              <ellipse cx="230" cy="176" rx="11" ry="13" fill="#18181B" />
              <circle cx={226 + gaze.x * 0.5} cy={171 + gaze.y * 0.5} r="4" fill="#FFFFFF" />
            </g>
            <path d="M 154 156 Q 170 148 186 156" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M 214 156 Q 230 148 246 156" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </>
        );
    }
  };

  const renderMouth = () => {
    if (!speaking || resolvedShape === 'closed') {
      if (expression === 'shock') {
        return (
          <ellipse cx="200" cy="218" rx="8" ry="10" fill="#7F1D1D" stroke="#18181B" strokeWidth="4" />
        );
      }
      if (expression === 'smug') {
        return (
          <path d="M 185 216 Q 202 222 218 210" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        );
      }
      if (expression === 'thinking' || expression === 'squint' || expression === 'tense') {
        return (
          <path d="M 188 217 Q 200 214 212 218" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        );
      }
      return (
        <path d="M 184 213 Q 200 225 216 213" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      );
    }

    const mouthScaleY = acousticOpen !== undefined ? 0.55 + acousticOpen * 0.65 : 1;

    switch (resolvedShape) {
      case 'open_o':
        return (
          <g transform={`translate(200, 218) scale(1, ${mouthScaleY}) translate(-200, -218)`}>
            <ellipse cx="200" cy="218" rx="11" ry="14" fill="#7F1D1D" stroke="#18181B" strokeWidth="4" />
          </g>
        );
      case 'narrow_u':
        return (
          <g transform={`translate(200, 218) scale(1, ${mouthScaleY}) translate(-200, -218)`}>
            <ellipse cx="200" cy="218" rx="8" ry="9" fill="#7F1D1D" stroke="#18181B" strokeWidth="4" />
          </g>
        );
      case 'wide_e':
        return (
          <g transform={`translate(200, 216) scale(1, ${mouthScaleY}) translate(-200, -216)`}>
            <path d="M 180 212 Q 200 210 220 212 Q 216 226 200 226 Q 184 226 180 212 Z" fill="#7F1D1D" stroke="#18181B" strokeWidth="4" />
            <path d="M 184 214 L 216 214" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      case 'open_a':
      default:
        return (
          <g transform={`translate(200, 216) scale(1, ${mouthScaleY}) translate(-200, -216)`}>
            <path d="M 182 210 Q 200 206 218 210 Q 222 234 200 234 Q 178 234 182 210 Z" fill="#7F1D1D" stroke="#18181B" strokeWidth="4" />
            <path d="M 186 211 L 214 211" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="200" cy="227" rx="10" ry="5" fill="#EF4444" />
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
        filter: rimColor ? `drop-shadow(0 0 22px ${rimColor})` : undefined,
      }}
    >
      <svg viewBox="0 0 400 480" width="100%" height="100%" style={{overflow: 'visible'}}>
        <g transform={`translate(200, 430) scale(${breathScaleX}, ${breathScaleY}) translate(-200, -430) translate(0, ${breathY})`}>
          {/* Left Arm */}
          <g transform={getLeftArmTransform()}>
            <rect x="105" y="270" width="34" height="105" rx="17" fill="#B91C1C" stroke="#18181B" strokeWidth="5" />
            <circle cx="122" cy="380" r="16" fill="#FDE68A" stroke="#18181B" strokeWidth="5" />
          </g>

          {/* Right Arm */}
          <g transform={getRightArmTransform()}>
            <rect x="261" y="270" width="34" height="105" rx="17" fill="#B91C1C" stroke="#18181B" strokeWidth="5" />
            <circle cx="278" cy="380" r="16" fill="#FDE68A" stroke="#18181B" strokeWidth="5" />
          </g>

          {/* Torso / Hoodie */}
          <path
            d="M 125 265 Q 200 245 275 265 L 295 430 Q 200 445 105 430 Z"
            fill="#DC2626"
            stroke="#18181B"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path d="M 185 265 L 185 335 M 215 265 L 215 335" stroke="#FAFAFA" strokeWidth="5" strokeLinecap="round" />
          <text x="200" y="375" textAnchor="middle" fill="#FAFAFA" fontFamily="sans-serif" fontWeight="900" fontSize="34" opacity="0.9">
            A
          </text>

          {/* Neck */}
          <rect x="182" y="235" width="36" height="36" rx="10" fill="#FDE68A" stroke="#18181B" strokeWidth="5" />

          {/* Head */}
          <g transform={`rotate(${headTilt} 200 180)`}>
            <path d="M 118 165 Q 110 85 200 82 Q 290 85 282 165 Z" fill="#18181B" />
            <circle cx="122" cy="182" r="14" fill="#FDE68A" stroke="#18181B" strokeWidth="5" />
            <circle cx="278" cy="182" r="14" fill="#FDE68A" stroke="#18181B" strokeWidth="5" />
            <rect x="128" y="105" width="144" height="140" rx="64" fill="#FEF3C7" stroke="#18181B" strokeWidth="6" />
            <path
              d="M 124 148 Q 130 92 200 90 Q 270 92 276 148 Q 252 122 232 138 Q 205 112 182 136 Q 152 118 124 148 Z"
              fill="#18181B"
              stroke="#18181B"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="M 192 98 Q 212 105 224 128" stroke="#EF4444" strokeWidth="6" fill="none" strokeLinecap="round" />
            {renderEyes()}
            {expression === 'shock' || expression === 'tense' ? (
              <path d="M 136 125 L 142 145 M 145 128 L 150 142" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx="148" cy="196" rx="10" ry="5" fill="#F87171" opacity="0.45" />
                <ellipse cx="252" cy="196" rx="10" ry="5" fill="#F87171" opacity="0.45" />
              </>
            )}
            {renderMouth()}
          </g>
        </g>
      </svg>
    </div>
  );
};
