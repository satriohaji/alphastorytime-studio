import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {AlphaCharacter} from '@shared/AlphaCharacter';
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

// B-ROLL 1: Raka Frozen in Mist & Cold Whispering Breath
const MountainMistRecapBroll: React.FC<{frame: number}> = ({frame}) => {
  const fogDrift = interpolate(frame, [0, 270], [-50, 100]);
  const breathPulse = Math.sin(frame * 0.1) * 0.15 + 0.85;

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#020510'}}>
      {/* Dark Eerie Sky Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 25%, #1e113a 0%, #070914 65%, #010206 100%)',
        }}
      />

      {/* Menacing Mountain Ridge Silhouette */}
      <svg
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      >
        <polygon points="0,1180 320,950 680,1080 1080,920 1080,1920 0,1920" fill="#0c1222" />
        <polygon points="0,1320 420,1150 780,1260 1080,1180 1080,1920 0,1920" fill="#060913" />
        {/* Silhouette of Hiker Raka Standing Frozen */}
        <circle cx="540" cy="1160" r="32" fill="#020409" />
        <rect x="522" y="1192" width="36" height="85" rx="8" fill="#020409" />
        <rect x="508" y="1205" width="16" height="60" rx="6" fill="#020409" />
        {/* Backpack Silhouette */}
        <rect x="552" y="1200" width="28" height="65" rx="10" fill="#020409" />
        {/* Dim Flashlight Beam pointing to the ground */}
        <polygon
          points="514,1260 410,1460 490,1460"
          fill="rgba(254, 240, 138, 0.12)"
          filter="blur(8px)"
        />
      </svg>

      {/* Billowing Cold Fog Layers */}
      <div
        style={{
          position: 'absolute',
          bottom: 300,
          left: fogDrift - 100,
          width: 1400,
          height: 420,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(148, 163, 184, 0.35) 0%, transparent 75%)',
          filter: 'blur(40px)',
          opacity: breathPulse,
          pointerEvents: 'none',
        }}
      />

      {/* Whisper Dialog Overlay in Center */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 820,
          padding: '24px 32px',
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: 24,
          border: '2px solid rgba(239, 68, 68, 0.6)',
          boxShadow: '0 0 50px rgba(220, 38, 38, 0.35)',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 6,
            color: '#EF4444',
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          BISIKAN DARI KABUT
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: 2,
            color: '#F8FAFC',
            fontStyle: 'italic',
            textShadow: '0 0 25px rgba(239, 68, 68, 0.8)',
          }}
        >
          &ldquo;Mas... mau beli apa?&rdquo;
        </div>
      </div>

      {/* Kinetic Typography Accent */}
      <KineticEmphasisText
        text="REFLEKS"
        subtext="INGIN LARI SEKENCANGNYA"
        styleMode="slam-punch"
        startFrame={140}
        durationFrames={110}
        color="#EF4444"
        accentColor="#B91C1C"
        fontSize={110}
        zIndex={10}
      />
    </div>
  );
};

// B-ROLL 2: Basecamp Candi Cetho Flashback & Senior Climber Warning
const BasecampFlashbackBroll: React.FC<{frame: number}> = ({frame}) => {
  const flicker = (Math.floor(frame / 35) * 35 === frame) ? 0.4 : 1.0;

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#090805'}}>
      {/* Sepia Dark Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 40%, #291809 0%, #0d0a06 65%, #030201 100%)',
        }}
      />

      {/* Candi Cetho Stone Gate Outline */}
      <svg
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      >
        {/* Stone Gates Left & Right */}
        <polygon points="120,600 280,600 240,1500 80,1500" fill="#140f09" />
        <polygon points="100,700 260,700 250,780 90,780" fill="#1e160e" />
        <polygon points="960,600 800,600 840,1500 1000,1500" fill="#140f09" />
        <polygon points="980,700 820,700 830,780 990,780" fill="#1e160e" />
        {/* Lantern Glow */}
        <circle cx="280" cy="850" r="18" fill="#F59E0B" opacity={flicker} />
        <circle cx="800" cy="850" r="18" fill="#F59E0B" opacity={flicker} />
      </svg>

      {/* Warning Card from Senior Climber */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 860,
          padding: '36px 32px',
          background: 'rgba(18, 12, 7, 0.92)',
          borderRadius: 24,
          border: '2px solid rgba(245, 158, 11, 0.7)',
          boxShadow: '0 0 60px rgba(245, 158, 11, 0.25)',
          textAlign: 'center',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 4,
            color: '#F59E0B',
            marginBottom: 12,
            textTransform: 'uppercase',
          }}
        >
          PESAN SENIOR BASECAMP
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            lineHeight: 1.3,
            color: '#FEF3C7',
          }}
        >
          JANGAN PERNAH SOMBONG,
          <br />
          <span style={{color: '#EF4444'}}>JANGAN LARI PANIK!</span>
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 22,
            fontWeight: 600,
            color: '#D1D5DB',
            letterSpacing: 1,
          }}
        >
          Atau tersesat selamanya di dimensi lain.
        </div>
      </div>

      <KineticEmphasisText
        text="PANTANGAN"
        subtext="PASAR SETAN LAWU"
        styleMode="vertical-tilted"
        side="right"
        startFrame={60}
        durationFrames={120}
        color="#F59E0B"
        accentColor="#DC2626"
        fontSize={105}
        zIndex={10}
      />
    </div>
  );
};

// B-ROLL 3: Macro Close-up of 500 Coin & Dry Mountain Leaf
const CoinAndLeafMacroBroll: React.FC<{frame: number}> = ({frame}) => {
  const coinShine = interpolate(frame, [0, 200], [0, 360]);
  const leafFloat = Math.sin(frame * 0.08) * 8;

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#05070a'}}>
      {/* Ground & Spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, #151d2a 0%, #06090e 70%, #020305 100%)',
        }}
      />

      {/* Sabana Rocky Soil Texture */}
      <svg
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      >
        {/* Ground Pebbles */}
        <ellipse cx="420" cy="1150" rx="90" ry="45" fill="#111827" />
        <ellipse cx="650" cy="1180" rx="120" ry="55" fill="#0e1522" />
        <ellipse cx="320" cy="1220" rx="70" ry="35" fill="#0b101b" />
        <ellipse cx="780" cy="1120" rx="85" ry="40" fill="#131c2c" />

        {/* 500 Rupiah Aluminum Coin */}
        <g transform={`translate(440, 920) rotate(${coinShine * 0.15})`}>
          <circle cx="0" cy="0" r="140" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="8" />
          <circle cx="0" cy="0" r="122" fill="#64748B" />
          <circle cx="0" cy="0" r="105" fill="#475569" stroke="#CBD5E1" strokeWidth="3" />
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="78"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            500
          </text>
          <text
            x="0"
            y="70"
            textAnchor="middle"
            fill="#CBD5E1"
            fontSize="26"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            RUPIAH
          </text>
        </g>

        {/* Dry Mountain Leaf */}
        <g transform={`translate(680, ${950 + leafFloat}) rotate(-25)`}>
          <path
            d="M0,0 C60,-90 160,-110 220,-30 C200,60 120,110 0,0 Z"
            fill="#92400E"
            stroke="#B45309"
            strokeWidth="4"
          />
          <path d="M10,-5 L190,-35" stroke="#78350F" strokeWidth="3" />
        </g>
      </svg>

      {/* Floating Fog Layer */}
      <div
        style={{
          position: 'absolute',
          bottom: 450,
          left: 0,
          right: 0,
          height: 300,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(148, 163, 184, 0.25) 0%, transparent 80%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      <KineticEmphasisText
        text="TRANSAKSI"
        subtext="KOIN & DAUN KERING"
        styleMode="slam-punch"
        startFrame={80}
        durationFrames={130}
        color="#F8FAFC"
        accentColor="#F59E0B"
        fontSize={115}
        zIndex={10}
      />
    </div>
  );
};

// B-ROLL 4: Sudden Silence & Howling Mountain Wind
const SilenceWindBroll: React.FC<{frame: number}> = ({frame}) => {
  const windDrift = interpolate(frame, [0, 300], [-100, 200]);

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#020307'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, #0d1527 0%, #03060c 60%, #000103 100%)',
        }}
      />

      {/* Horizontal Wind Stream Lines */}
      <svg
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      >
        <path
          d={`M${-200 + windDrift},820 Q${200 + windDrift},800 ${800 + windDrift},840 T${1400 + windDrift},810`}
          fill="none"
          stroke="rgba(148, 163, 184, 0.35)"
          strokeWidth="3"
        />
        <path
          d={`M${-150 + windDrift * 1.3},960 Q${350 + windDrift * 1.3},930 ${950 + windDrift * 1.3},980`}
          fill="none"
          stroke="rgba(203, 213, 225, 0.25)"
          strokeWidth="4"
        />
        <path
          d={`M${-300 + windDrift * 0.8},1100 Q${100 + windDrift * 0.8},1070 ${700 + windDrift * 0.8},1120`}
          fill="none"
          stroke="rgba(148, 163, 184, 0.3)"
          strokeWidth="2"
        />
      </svg>

      {/* Cold Shiver Typography */}
      <KineticEmphasisText
        text="HENING"
        subtext="PASAR GAIB LENYAP"
        styleMode="tracking-spread"
        startFrame={40}
        durationFrames={120}
        color="#93C5FD"
        accentColor="#3B82F6"
        fontSize={130}
        zIndex={10}
      />
    </div>
  );
};

// B-ROLL 5: Macro Morphed Pitch-Black Stone with Eerie Smoke
const BlackStoneMacroBroll: React.FC<{frame: number}> = ({frame}) => {
  const smokeRise = interpolate(frame, [0, 240], [0, -120]);
  const glowPulse = Math.sin(frame * 0.15) * 0.2 + 0.8;

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#040206'}}>
      {/* Red-Violet Dark Void */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 55%, #1f0b24 0%, #080209 65%, #010002 100%)',
        }}
      />

      <svg
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      >
        {/* Pitch-Black Obsidian Pebble */}
        <ellipse
          cx="540"
          cy="980"
          rx="170"
          ry="120"
          fill="#09050b"
          stroke="#3B0764"
          strokeWidth="6"
        />
        <ellipse
          cx="510"
          cy="950"
          rx="110"
          ry="70"
          fill="#130a17"
          opacity={glowPulse}
        />
        {/* Dark Cracks with Faint Crimson Glow */}
        <path
          d="M480,940 L530,970 L570,950 L610,990"
          stroke="#EF4444"
          strokeWidth="3"
          fill="none"
          opacity={glowPulse}
        />
      </svg>

      {/* Whispering Smoke Wisps Rising */}
      <div
        style={{
          position: 'absolute',
          top: 860 + smokeRise,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 320,
          height: 180,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
          filter: 'blur(25px)',
          pointerEvents: 'none',
        }}
      />

      <KineticEmphasisText
        text="BATU HITAM"
        subtext="BUKAN LAGI KOIN!"
        styleMode="slam-punch"
        startFrame={50}
        durationFrames={120}
        color="#F8FAFC"
        accentColor="#DC2626"
        fontSize={120}
        zIndex={10}
      />
    </div>
  );
};

// MASTER SCENE RENDERER FOR PART 2
export const SceneRenderer: React.FC<{
  id: SceneId;
  duration: number;
  globalOffset: number;
}> = ({id, duration, globalOffset}) => {
  const localFrame = useCurrentFrame();
  const globalFrame = globalOffset + localFrame;
  const mouthOpen = getMouthOpenness('alpha', globalFrame);
  const activeWord = findActiveWord(wordTimestamps.segments, globalFrame);

  // 1A. Narrator Recap Hook (Alpha center, tense)
  if (id === 's1a') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.05} durationFrames={duration}>
        <RoomBackdrop preset="horror-dark" effect="vignette-pulse" />

        {/* Top Safe Margin Capsule at top: 220 (Below TikTok/Reels For You / Following tabs) */}
        <div
          style={{
            position: 'absolute',
            top: 220,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(239, 68, 68, 0.2)',
            border: '2px solid #EF4444',
            borderRadius: 30,
            padding: '10px 28px',
            color: '#FEF2F2',
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: 'uppercase',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
          }}
        >
          PART 2 • RESOLUSI PASAR SETAN
        </div>

        <KineticEmphasisText
          text="GUNUNG LAWU"
          subtext="SABANA POS LIMA"
          styleMode="vertical-tilted"
          side="right"
          startFrame={75}
          durationFrames={95}
          color="#FFFFFF"
          accentColor="#EF4444"
          fontSize={105}
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
            bodyPose="think"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#EF4444"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  // 1B. Full B-Roll: Raka Frozen in Fog & Whispering Dialog
  if (id === 's1b') {
    return (
      <SpatialCameraRig zoomFrom={1.02} zoomTo={1.08} durationFrames={duration}>
        <MountainMistRecapBroll frame={localFrame} />
      </SpatialCameraRig>
    );
  }

  // 2A. Hybrid PIP: Impulse to Run vs Senior Basecamp Warning
  if (id === 's2a') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.06} durationFrames={duration}>
        <RoomBackdrop preset="mystery-cold" effect="fog-drift" />

        <KineticEmphasisText
          text="JANGAN LARI"
          subtext="PESAN SENIOR BASECAMP"
          styleMode="giant-backdrop"
          startFrame={40}
          durationFrames={120}
          color="#38BDF8"
          accentColor="#0284C7"
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
            bodyPose="gesture_left"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#38BDF8"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  // 2B. Flashback B-Roll: Basecamp Candi Cetho & Senior Climber Warning
  if (id === 's2b') {
    return (
      <SpatialCameraRig zoomFrom={1.01} zoomTo={1.06} durationFrames={duration}>
        <BasecampFlashbackBroll frame={localFrame} />
      </SpatialCameraRig>
    );
  }

  // 3A. Macro B-Roll: 500 Coin & Dry Leaf
  if (id === 's3a') {
    return (
      <SpatialCameraRig zoomFrom={1.02} zoomTo={1.09} durationFrames={duration}>
        <CoinAndLeafMacroBroll frame={localFrame} />
      </SpatialCameraRig>
    );
  }

  // 3B. Hybrid PIP: Throwing Coin into Mist, Alpha Shock
  if (id === 's3b') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.07} durationFrames={duration}>
        <RoomBackdrop preset="horror-dark" effect="vignette-pulse" />

        <KineticEmphasisText
          text="PERMISI..."
          subtext="SAYA BELI INI, MBAH"
          styleMode="slam-punch"
          startFrame={120}
          durationFrames={130}
          color="#FDE047"
          accentColor="#EAB308"
          fontSize={110}
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
            expression="shock"
            bodyPose="gesture_right"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#EAB308"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  // 4A. Full B-Roll: Sudden Silence & Wind Gusts
  if (id === 's4a') {
    return (
      <SpatialCameraRig zoomFrom={1.01} zoomTo={1.07} durationFrames={duration}>
        <SilenceWindBroll frame={localFrame} />
      </SpatialCameraRig>
    );
  }

  // 4B. Hybrid Relief: Friends' Flashlights Piercing Mist
  if (id === 's4b') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.05} durationFrames={duration}>
        <RoomBackdrop preset="mystery-cold" effect="spotlight" />

        <KineticEmphasisText
          text="SELAMAT"
          subtext="TEMAN DATANG MENOLONG"
          styleMode="vertical-tilted"
          side="left"
          startFrame={60}
          durationFrames={120}
          color="#4ADE80"
          accentColor="#16A34A"
          fontSize={115}
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
            expression="happy"
            bodyPose="wave"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#4ADE80"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  // 5A. Macro B-Roll: Morphed Black Stone
  if (id === 's5a') {
    return (
      <SpatialCameraRig zoomFrom={1.02} zoomTo={1.08} durationFrames={duration}>
        <BlackStoneMacroBroll frame={localFrame} />
      </SpatialCameraRig>
    );
  }

  // 5B. Narrator Outro Spotlight: Alpha CTA Question
  if (id === 's5b') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.06} durationFrames={duration}>
        <RoomBackdrop preset="void-spotlight" effect="spotlight" />

        {/* Top Safe Margin Capsule at top: 220 (Below TikTok/Reels For You / Following tabs) */}
        <div
          style={{
            position: 'absolute',
            top: 220,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(168, 85, 247, 0.25)',
            border: '2px solid #A855F7',
            borderRadius: 30,
            padding: '10px 28px',
            color: '#FAF5FF',
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: 'uppercase',
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)',
          }}
        >
          DISKUSI CERITA
        </div>

        <KineticEmphasisText
          text="SIAPA SOSOKNYA?"
          subtext="TULIS DI KOMENTAR"
          styleMode="slam-punch"
          startFrame={40}
          durationFrames={130}
          color="#FAF5FF"
          accentColor="#A855F7"
          fontSize={110}
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
            expression="thinking"
            bodyPose="gesture_left"
            mouthOpen={mouthOpen}
            activeWord={activeWord}
            rimColor="#A855F7"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  return null;
};
