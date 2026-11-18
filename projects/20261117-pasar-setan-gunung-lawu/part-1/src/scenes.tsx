import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {AlphaCharacter} from '@shared/AlphaCharacter';
import {AlphaCharacter3D} from '@shared/AlphaCharacter3D';
import {
  AliveCharacterRig,
  findActiveWord,
  RoomBackdrop,
  SpatialCameraRig,
} from '@shared/StudioStage';
import {KineticEmphasisText} from './KineticMotionTypography';
import {getMouthOpenness} from './lipSyncData';
import type {SceneId} from './shots';
import wordTimestamps from './word_timestamps.json';

export const CHARACTER_MODE: '3d_webgl' | '2.5d_kokbisa' = '2.5d_kokbisa';

// B-ROLL 1: Gunung Lawu 2800m & Sabana Pos 5 (Pure Cinematic, No Box/Badge)
const MountainSabanaBroll: React.FC<{frame: number}> = ({frame}) => {
  const fogX1 = interpolate(frame, [0, 240], [0, -120]);
  const fogX2 = interpolate(frame, [0, 240], [-80, 40]);

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#020617'}}>
      {/* Sky & Atmospheric Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 20%, #1e1b4b 0%, #090d16 65%, #020617 100%)',
        }}
      />
      {/* Layered Mountain Silhouettes */}
      <svg
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      >
        <polygon points="0,1100 240,820 540,980 820,780 1080,1050 1080,1920 0,1920" fill="#0f172a" />
        <polygon points="0,1260 380,1020 720,1180 1080,1080 1080,1920 0,1920" fill="#090d16" />
        <polygon points="0,1480 320,1380 680,1460 1080,1350 1080,1920 0,1920" fill="#040711" />
        <path d="M120,1380 L125,1260 L140,1280 L145,1230 L160,1270 L170,1220 L160,1380 Z" fill="#02040a" />
        <path d="M880,1350 L890,1240 L910,1260 L920,1200 L935,1250 L945,1350 Z" fill="#02040a" />
      </svg>

      {/* Moving Mist / Fog Layers */}
      <div
        style={{
          position: 'absolute',
          bottom: 250,
          left: fogX1,
          width: 1400,
          height: 380,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(148, 163, 184, 0.3) 0%, transparent 75%)',
          filter: 'blur(35px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: fogX2,
          width: 1300,
          height: 320,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(203, 213, 225, 0.22) 0%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      {/* Kinetic Typography Accent for B-Roll */}
      <KineticEmphasisText
        text="GAMELAN"
        subtext="ALUNAN GAIB DI TENGAH HUTAN"
        styleMode="tracking-spread"
        startFrame={30}
        durationFrames={105}
        color="#F8FAFC"
        accentColor="#A855F7"
        fontSize={120}
        zIndex={10}
      />
      <KineticEmphasisText
        text="DENGERIN"
        subtext="BAIK-BAIK"
        styleMode="slam-punch"
        side="center"
        startFrame={145}
        durationFrames={85}
        color="#EF4444"
        accentColor="#DC2626"
        fontSize={130}
        zIndex={10}
      />
    </div>
  );
};

// B-ROLL 2: Flashlight Cones Vanishing into Thick Fog (Clean Cinematic)
const VanishingLightsBroll: React.FC<{frame: number}> = ({frame}) => {
  const lightFade = interpolate(frame, [0, 160, 260], [1, 0.45, 0], {extrapolateRight: 'clamp'});
  const lightDistX = interpolate(frame, [0, 260], [0, 80]);
  const fogSweep = interpolate(frame, [0, 260], [-100, 50]);

  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#020409', overflow: 'hidden'}}>
      {/* Fog Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 60%, #0d1527 0%, #020409 85%)',
        }}
      />

      {/* Rocky Trail Path Perspective */}
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <polygon points="540,850 490,850 180,1920 900,1920 590,850" fill="#0a0f1d" />
        <line x1="540" y1="850" x2="540" y2="1920" stroke="#1e293b" strokeWidth="4" strokeDasharray="16 20" />
      </svg>

      {/* Distant Flashlight Dots Fading Out */}
      <div
        style={{
          position: 'absolute',
          top: 830,
          left: 510 + lightDistX,
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: '#FEF08A',
          boxShadow: '0 0 45px 25px rgba(254, 240, 138, 0.75), 0 0 90px 45px rgba(234, 179, 8, 0.4)',
          opacity: lightFade,
          transition: 'opacity 0.2s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 845,
          left: 550 + lightDistX,
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: '#FDE047',
          boxShadow: '0 0 35px 20px rgba(253, 224, 71, 0.7), 0 0 70px 35px rgba(202, 138, 4, 0.35)',
          opacity: lightFade,
        }}
      />

      {/* Rolling Fog Bank */}
      <div
        style={{
          position: 'absolute',
          top: 700,
          left: fogSweep,
          width: 1300,
          height: 480,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(148, 163, 184, 0.4) 0%, transparent 75%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Kinetic Typography */}
      <KineticEmphasisText
        text="PASAR SETAN"
        subtext="POS LIMA LAWU"
        styleMode="giant-backdrop"
        startFrame={25}
        durationFrames={105}
        color="#EF4444"
        accentColor="#7F1D1D"
        fontSize={135}
        zIndex={10}
      />
      <KineticEmphasisText
        text="H I L A N G"
        subtext="JEJAK SENTER TERPUTUS"
        styleMode="tracking-spread"
        startFrame={145}
        durationFrames={115}
        color="#FEF08A"
        accentColor="#CA8A04"
        fontSize={120}
        zIndex={10}
      />
    </div>
  );
};

// B-ROLL 3: POV Flashlight in Tall Savannah Reeds (Clean Cinematic)
const TallReedsPOVBroll: React.FC<{frame: number}> = ({frame}) => {
  const flicker = frame % 43 === 0 || frame % 87 === 0 ? 0.35 : 1.0;
  const sway = Math.sin(frame * 0.12) * 12;

  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#020307', overflow: 'hidden'}}>
      {/* Flashlight Spotlight Cone */}
      <div
        style={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 950,
          height: 950,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.4) 0%, rgba(234, 179, 8, 0.15) 45%, rgba(0,0,0,0.95) 75%)',
          filter: 'blur(30px)',
          opacity: flicker,
          pointerEvents: 'none',
        }}
      />

      {/* Tall Savannah Grass Reeds (Ilalang) */}
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <path d={`M-50,1920 Q${120 + sway},1300 220,950 Q${180 + sway},1200 40,1920 Z`} fill="#141E14" />
        <path d={`M40,1920 Q${200 + sway},1400 320,1050 Q${240 + sway},1350 140,1920 Z`} fill="#0B130B" />
        <path d={`M1130,1920 Q${960 - sway},1280 840,900 Q${900 - sway},1250 1040,1920 Z`} fill="#141E14" />
        <path d={`M1040,1920 Q${880 - sway},1380 760,1020 Q${820 - sway},1350 940,1920 Z`} fill="#0B130B" />
      </svg>

      {/* Kinetic Typography */}
      <KineticEmphasisText
        text="MEREDUP"
        subtext="SENTER LEMAH"
        styleMode="slam-punch"
        side="left"
        startFrame={20}
        durationFrames={95}
        color="#FDE047"
        accentColor="#EF4444"
        fontSize={110}
        zIndex={10}
      />
      <KineticEmphasisText
        text="ILALANG"
        subtext="TERPUTUS"
        styleMode="vertical-tilted"
        side="left"
        startFrame={130}
        durationFrames={160}
        color="#4ADE80"
        accentColor="#16A34A"
        fontSize={120}
        zIndex={10}
      />
    </div>
  );
};

// B-ROLL 4: Pasar Setan Supernatural Market Silhouettes (Clean Cinematic)
const PasarSetanBroll: React.FC<{frame: number}> = ({frame}) => {
  const lanternSway = Math.sin(frame * 0.08) * 8;
  const mistFloat = interpolate(frame, [0, 215], [-50, 50]);

  return (
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#09030E', overflow: 'hidden'}}>
      {/* Eerie Purple/Red Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 65%, #3B0764 0%, #1A0526 50%, #07010C 100%)',
        }}
      />

      {/* Supernatural Stalls and Silhouettes */}
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <polygon points="40,1180 380,1080 340,1450 60,1500" fill="#170A24" />
        <line x1="80" y1="1200" x2="80" y2="1650" stroke="#2E1065" strokeWidth="8" />
        <polygon points="1040,1150 700,1060 740,1420 1020,1470" fill="#170A24" />
        <line x1="980" y1="1180" x2="980" y2="1650" stroke="#2E1065" strokeWidth="8" />
        <ellipse cx="440" cy="1380" rx="45" ry="90" fill="#0C0414" opacity="0.9" />
        <ellipse cx="620" cy="1360" rx="55" ry="105" fill="#0C0414" opacity="0.9" />
      </svg>

      {/* Red Glowing Lanterns */}
      <div
        style={{
          position: 'absolute',
          top: 1040,
          left: 280,
          width: 38,
          height: 48,
          borderRadius: '50% 50% 45% 45%',
          backgroundColor: '#EF4444',
          boxShadow: '0 0 50px 25px rgba(239, 68, 68, 0.75)',
          transform: `rotate(${lanternSway}deg)`,
          transformOrigin: 'top center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 1020,
          left: 760,
          width: 36,
          height: 46,
          borderRadius: '50% 50% 45% 45%',
          backgroundColor: '#DC2626',
          boxShadow: '0 0 45px 22px rgba(220, 38, 38, 0.7)',
          transform: `rotate(${-lanternSway}deg)`,
          transformOrigin: 'top center',
        }}
      />

      {/* Swirling Mist */}
      <div
        style={{
          position: 'absolute',
          bottom: 280,
          left: mistFloat,
          width: 1200,
          height: 350,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.25) 0%, transparent 75%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      {/* Kinetic Typography */}
      <KineticEmphasisText
        text="LANGKAH KAKI"
        subtext="DERAP GAIB"
        styleMode="slam-punch"
        side="left"
        startFrame={20}
        durationFrames={80}
        color="#F8FAFC"
        accentColor="#9333EA"
        fontSize={100}
        zIndex={10}
      />
      <KineticEmphasisText
        text="TAWAR MENAWAR"
        styleMode="giant-backdrop"
        startFrame={85}
        durationFrames={65}
        color="#F43F5E"
        accentColor="#BE123C"
        fontSize={115}
        zIndex={10}
      />
      <KineticEmphasisText
        text="BAU DUPA"
        subtext="AROMA MENYENGAT"
        styleMode="tracking-spread"
        startFrame={145}
        durationFrames={65}
        color="#EF4444"
        accentColor="#7F1D1D"
        fontSize={125}
        zIndex={10}
      />
    </div>
  );
};

// HYBRID EKG HEARTBEAT COMPONENT (Clean Wave, No Rounded Card Box)
const CleanEKGLine: React.FC<{frame: number}> = ({frame}) => {
  const bpm = Math.min(148, Math.round(92 + frame * 0.22));

  return (
    <div
      style={{
        position: 'absolute',
        top: 220,
        left: 0,
        right: 0,
        zIndex: 6,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          fontSize: 32,
          color: '#EF4444',
          letterSpacing: 2,
          textShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
          marginBottom: 10,
        }}
      >
        <span>❤️</span>
        <span>{bpm} BPM</span>
      </div>
      {/* Animated EKG Waveform */}
      <svg viewBox="0 0 1080 80" style={{width: '100%', height: 60, overflow: 'visible'}}>
        <path
          d="M0,40 L200,40 L230,10 L250,70 L270,40 L500,40 L530,10 L550,70 L570,40 L780,40 L810,10 L830,70 L850,40 L1080,40"
          fill="none"
          stroke="#EF4444"
          strokeWidth="4"
          strokeLinecap="round"
          style={{filter: 'drop-shadow(0 0 8px #EF4444)'}}
        />
      </svg>
    </div>
  );
};

// JUMPSCARE HORROR CLIMAX COMPONENT (Massive Kinetic Shiver Typography)
const HorrorJumpscareScene: React.FC<{frame: number}> = ({frame}) => {
  const isWhisperStrike = frame >= 228;
  const shake = isWhisperStrike ? Math.sin(frame * 1.8) * 16 : 0;
  const redGlitch = isWhisperStrike && frame % 4 < 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: redGlitch ? '#7F1D1D' : '#030105',
        transform: `translate(${shake}px, ${shake * 0.5}px)`,
        overflow: 'hidden',
      }}
    >
      {/* Horror Vignette & Rim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isWhisperStrike
            ? 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.5) 0%, rgba(0,0,0,0.98) 85%)'
            : 'radial-gradient(circle at 50% 50%, rgba(69, 10, 10, 0.4) 0%, rgba(0,0,0,0.98) 85%)',
        }}
      />

      {/* Shadow Figure Looming Behind Neck */}
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <ellipse cx="540" cy="1150" rx="140" ry="120" fill="#080C14" />
        <path d="M380,1200 Q540,1140 700,1200 L760,1650 L320,1650 Z" fill="#050810" />
        <ellipse cx="540" cy="920" rx="120" ry="140" fill="#1C0606" opacity="0.95" />
        <circle cx="505" cy="920" r={isWhisperStrike ? 14 : 9} fill="#FF0033" />
        <circle cx="575" cy="920" r={isWhisperStrike ? 14 : 9} fill="#FF0033" />
        <path d="M420,920 Q390,1150 430,1380 L480,1380 Q450,1150 460,920 Z" fill="#0A0202" />
        <path d="M660,920 Q690,1150 650,1380 L600,1380 Q630,1150 620,920 Z" fill="#0A0202" />
      </svg>

      {/* Cold Breath Mist on Neck */}
      <div
        style={{
          position: 'absolute',
          top: 1020,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 320,
          height: 140,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(241, 245, 249, 0.45) 0%, transparent 75%)',
          filter: 'blur(24px)',
          opacity: 0.85,
        }}
      />

      {/* Pre-whisper text */}
      <KineticEmphasisText
        text="NAPAS DINGIN"
        subtext="DI TENGKUK LEHER"
        styleMode="tracking-spread"
        startFrame={20}
        durationFrames={105}
        color="#94A3B8"
        accentColor="#475569"
        fontSize={100}
        zIndex={10}
      />
      <KineticEmphasisText
        text="BISIKAN"
        styleMode="giant-backdrop"
        startFrame={130}
        durationFrames={90}
        color="#EF4444"
        accentColor="#991B1B"
        fontSize={140}
        zIndex={10}
      />

      {/* THE PEAK JUMPSCARE KINETIC TYPOGRAPHY */}
      {isWhisperStrike && (
        <KineticEmphasisText
          text={'"MAS... MAU BELI APA?"'}
          styleMode="horror-shiver"
          startFrame={228}
          durationFrames={120}
          color="#FFFFFF"
          accentColor="#EF4444"
          fontSize={68}
          zIndex={40}
        />
      )}
    </div>
  );
};

// MASTER SCENE RENDERER WITH 10 CINEMATIC SHOTS & DYNAMIC TYPOGRAPHY
export const SceneRenderer: React.FC<{
  id: SceneId;
  duration: number;
  globalOffset: number;
}> = ({id, duration, globalOffset}) => {
  const localFrame = useCurrentFrame();
  const globalFrame = globalOffset + localFrame;
  const mouthOpen = getMouthOpenness('alpha', globalFrame);
  const activeWord = findActiveWord(wordTimestamps.segments, globalFrame);

  // 1A. Narrator Hook (Alpha center, medium shot, tense)
  if (id === 's1a') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.05} durationFrames={duration}>
        <RoomBackdrop preset="horror-dark" effect="vignette-pulse" />

        {/* Dynamic Kinetic Emphasis Typography behind Alpha (zIndex: 8) */}
        <KineticEmphasisText
          text="2.800 M"
          subtext="ELEVASI EKSTREM"
          styleMode="vertical-tilted"
          side="right"
          startFrame={95}
          durationFrames={75}
          color="#FFFFFF"
          accentColor="#F59E0B"
          fontSize={115}
          zIndex={8}
        />
        <KineticEmphasisText
          text="KABUT"
          subtext="PEKAT MEMBUMBUNG"
          styleMode="giant-backdrop"
          startFrame={170}
          durationFrames={105}
          color="#E2E8F0"
          accentColor="#38BDF8"
          fontSize={150}
          zIndex={8}
        />

        {/* Alpha Character Rig in Foreground (zIndex: 15) */}
        <AliveCharacterRig
          mouthOpen={mouthOpen}
          enterFrom="bottom"
          style={{
            position: 'absolute',
            bottom: 370,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 15,
          }}
        >
          <AlphaCharacter
            scale={1.75}
            expression="tense"
            bodyPose="gesture_left"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#EF4444"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  // 1B. Full Illustration B-Roll: Gunung Lawu 2800m & Sabana Pos 5
  if (id === 's1b') {
    return (
      <SpatialCameraRig zoomFrom={1.02} zoomTo={1.07} durationFrames={duration}>
        <MountainSabanaBroll frame={localFrame} />
      </SpatialCameraRig>
    );
  }

  // 2A. Hybrid PIP: Candi Cetho path, Alpha left gesturing
  if (id === 's2a') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.06} durationFrames={duration}>
        <RoomBackdrop preset="mystery-cold" effect="fog-drift" />

        {/* Kinetic Emphasis Typography behind Alpha */}
        <KineticEmphasisText
          text="CANDI CETHO"
          subtext="JALUR PENDAKIAN"
          styleMode="vertical-tilted"
          side="right"
          startFrame={55}
          durationFrames={85}
          color="#38BDF8"
          accentColor="#0284C7"
          fontSize={110}
          zIndex={8}
        />
        <KineticEmphasisText
          text="SABANA"
          subtext="POS LIMA LAWU"
          styleMode="giant-backdrop"
          startFrame={140}
          durationFrames={105}
          color="#CBD5E1"
          accentColor="#06B6D4"
          fontSize={140}
          zIndex={8}
        />

        <AliveCharacterRig
          mouthOpen={mouthOpen}
          enterFrom="bottom"
          style={{
            position: 'absolute',
            bottom: 350,
            left: '32%',
            transform: 'translateX(-50%)',
            zIndex: 15,
          }}
        >
          <AlphaCharacter
            scale={1.5}
            expression="tense"
            bodyPose="gesture_right"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#06B6D4"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  // 2B. Full Illustration B-Roll: Flashlight Dots Vanishing into Fog
  if (id === 's2b') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.08} durationFrames={duration}>
        <VanishingLightsBroll frame={localFrame} />
      </SpatialCameraRig>
    );
  }

  // 3A. Full Illustration B-Roll: POV Flashlight in Tall Savannah Reeds
  if (id === 's3a') {
    return (
      <SpatialCameraRig zoomFrom={1.02} zoomTo={1.09} durationFrames={duration}>
        <TallReedsPOVBroll frame={localFrame} />
      </SpatialCameraRig>
    );
  }

  // 3B. Narrator Thinker: Alpha close-up thinking pose, sudden eerie silence
  if (id === 's3b') {
    return (
      <SpatialCameraRig zoomFrom={1.05} zoomTo={1.12} durationFrames={duration}>
        <RoomBackdrop preset="mystery-cold" effect="vignette-pulse" />

        {/* Kinetic Emphasis Typography behind Alpha */}
        <KineticEmphasisText
          text="BERHENTI"
          subtext="ANGIN GUNUNG SIRNA"
          styleMode="giant-backdrop"
          startFrame={45}
          durationFrames={95}
          color="#E2E8F0"
          accentColor="#A855F7"
          fontSize={135}
          zIndex={8}
        />
        <KineticEmphasisText
          text="S U N Y I"
          subtext="SENYAP TOTAL"
          styleMode="tracking-spread"
          startFrame={145}
          durationFrames={105}
          color="#C084FC"
          accentColor="#7E22CE"
          fontSize={120}
          zIndex={8}
        />

        <AliveCharacterRig
          mouthOpen={mouthOpen}
          enterFrom="bottom"
          style={{
            position: 'absolute',
            bottom: 370,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 15,
          }}
        >
          <AlphaCharacter
            scale={1.85}
            expression="tense"
            bodyPose="think"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#A855F7"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  // 4A. Full Illustration B-Roll: Pasar Setan Stalls & Glowing Red Lanterns
  if (id === 's4a') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.08} durationFrames={duration}>
        <PasarSetanBroll frame={localFrame} />
      </SpatialCameraRig>
    );
  }

  // 4B. Hybrid Tension: Heartbeat EKG Radar Spike & Alpha Reacting
  if (id === 's4b') {
    return (
      <SpatialCameraRig zoomFrom={1.02} zoomTo={1.07} durationFrames={duration}>
        <RoomBackdrop preset="horror-dark" effect="horror-glitch" />
        <CleanEKGLine frame={localFrame} />

        {/* Kinetic Emphasis Typography behind Alpha */}
        <KineticEmphasisText
          text="M E M B E K U"
          styleMode="vertical-tilted"
          side="left"
          startFrame={15}
          durationFrames={80}
          color="#38BDF8"
          accentColor="#0284C7"
          fontSize={110}
          zIndex={8}
        />
        <KineticEmphasisText
          text="DEG-DEGAN"
          subtext="JANTUNG BERDETAK KENCANG"
          styleMode="slam-punch"
          side="right"
          startFrame={80}
          durationFrames={95}
          color="#EF4444"
          accentColor="#B91C1C"
          fontSize={100}
          zIndex={8}
        />
        <KineticEmphasisText
          text="0° CELSIUS"
          subtext="DINGIN EKSTREM"
          styleMode="giant-backdrop"
          startFrame={175}
          durationFrames={80}
          color="#F1F5F9"
          accentColor="#38BDF8"
          fontSize={130}
          zIndex={8}
        />

        <AliveCharacterRig
          mouthOpen={mouthOpen}
          enterFrom="bottom"
          style={{
            position: 'absolute',
            bottom: 360,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 15,
          }}
        >
          <AlphaCharacter
            scale={1.65}
            expression="tense"
            bodyPose="idle"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#EF4444"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  // 5A. JUMPSCARE HORROR CLIMAX: Cold Breath, Red Glitch, Shadow Looms, Alpha Shock!
  if (id === 's5a') {
    return (
      <SpatialCameraRig
        zoomFrom={1.05}
        zoomTo={1.15}
        shakeFrame={localFrame >= 228 ? 1 : 9999}
        shakeIntensity={localFrame >= 228 ? 20 : 0}
        durationFrames={duration}
      >
        <HorrorJumpscareScene frame={localFrame} />
        <AliveCharacterRig
          mouthOpen={mouthOpen}
          enterFrom="bottom"
          style={{
            position: 'absolute',
            bottom: 330,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
          }}
        >
          <AlphaCharacter
            scale={1.75}
            expression="shock"
            bodyPose="shock"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#FF0000"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  // 5B. Narrator Cliffhanger Outro: Alpha Teaser Part 2
  return (
    <SpatialCameraRig zoomFrom={1.0} zoomTo={1.05} durationFrames={duration}>
      <RoomBackdrop preset="horror-dark" effect="vignette-pulse" />

      {/* Kinetic Typography */}
      <KineticEmphasisText
        text="SIAPA DIA?"
        subtext="SOSOK DI BALIK KABUT"
        styleMode="giant-backdrop"
        startFrame={10}
        durationFrames={75}
        color="#CBD5E1"
        accentColor="#EF4444"
        fontSize={135}
        zIndex={8}
      />
      <KineticEmphasisText
        text="PART 02"
        subtext="LANJUT SEKARANG"
        styleMode="vertical-tilted"
        side="right"
        startFrame={75}
        durationFrames={65}
        color="#EF4444"
        accentColor="#DC2626"
        fontSize={120}
        zIndex={8}
      />

      <AliveCharacterRig
        mouthOpen={mouthOpen}
        enterFrom="bottom"
        style={{
          position: 'absolute',
          bottom: 370,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 15,
        }}
      >
        <AlphaCharacter
          scale={1.75}
          expression="tense"
          bodyPose="gesture_right"
          mouthOpen={mouthOpen}
          activeWord={activeWord}
          rimColor="#EF4444"
        />
      </AliveCharacterRig>
    </SpatialCameraRig>
  );
};
