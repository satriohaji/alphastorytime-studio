import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {AlphaCharacter} from '@shared/AlphaCharacter';
import {AlphaCharacter3D} from '@shared/AlphaCharacter3D';
import {
  AliveCharacterRig,
  findActiveWord,
  HeadlineCapsule,
  RoomBackdrop,
  SpatialCameraRig,
  STORY_FONT,
} from '@shared/StudioStage';
import {getMouthOpenness} from './lipSyncData';
import type {SceneId} from './shots';
import wordTimestamps from './word_timestamps.json';

export const CHARACTER_MODE: '3d_webgl' | '2.5d_kokbisa' = '2.5d_kokbisa';

// HUD Telemetry Plate (Lemo-Opuscar Dark-Doc style)
function DarkDocTelemetry({
  leftTag,
  rightTag,
  accent = '#38BDF8',
}: {
  leftTag: string;
  rightTag: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 50,
        right: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: 'rgba(5, 8, 16, 0.75)',
        border: `1px solid ${accent}`,
        borderRadius: 12,
        backdropFilter: 'blur(8px)',
        zIndex: 25,
        fontFamily: 'monospace',
        fontSize: 16,
        letterSpacing: 1.5,
        color: '#E2E8F0',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: accent,
            boxShadow: `0 0 10px ${accent}`,
          }}
        />
        <span>{leftTag}</span>
      </div>
      <span style={{color: accent, fontWeight: 700}}>{rightTag}</span>
    </div>
  );
}

// Visual Story Plate (Capsule under headline)
function StoryVisualPlate({
  title,
  detail,
  accent = '#EF4444',
  top = 370,
}: {
  title: string;
  detail: string;
  accent?: string;
  top?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 80,
        right: 80,
        backgroundColor: 'rgba(9, 13, 22, 0.92)',
        border: `2px solid ${accent}`,
        borderRadius: 24,
        padding: '22px 28px',
        boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${accent}22`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontFamily: STORY_FONT,
          fontSize: 28,
          fontWeight: 900,
          color: '#FFFFFF',
          marginBottom: 6,
          letterSpacing: 1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: STORY_FONT,
          fontSize: 22,
          fontWeight: 600,
          color: '#CBD5E1',
          lineHeight: 1.4,
        }}
      >
        {detail}
      </div>
    </div>
  );
}

// B-ROLL 1: Gunung Lawu 2800m & Sabana Pos 5
const MountainSabanaBroll: React.FC<{frame: number}> = ({frame}) => {
  const fogX1 = interpolate(frame, [0, 240], [0, -120]);
  const fogX2 = interpolate(frame, [0, 240], [-80, 40]);

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#020617'}}>
      {/* Sky & Stars */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 20%, #1e1b4b 0%, #090d16 65%, #020617 100%)',
        }}
      />
      {/* Mountain Silhouettes */}
      <svg
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      >
        {/* Far Peak */}
        <polygon points="0,1100 240,820 540,980 820,780 1080,1050 1080,1920 0,1920" fill="#0f172a" />
        {/* Mid Ridge */}
        <polygon points="0,1260 380,1020 720,1180 1080,1080 1080,1920 0,1920" fill="#090d16" />
        {/* Foreground Crags & Sabana */}
        <polygon points="0,1480 320,1380 680,1460 1080,1350 1080,1920 0,1920" fill="#040711" />
        {/* Cantigi Silhouette Trees */}
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
          background: 'radial-gradient(ellipse at 50% 50%, rgba(148, 163, 184, 0.28) 0%, transparent 75%)',
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

      {/* Trail Signpost (Pos 5 Lawu) */}
      <div
        style={{
          position: 'absolute',
          bottom: 380,
          left: 100,
          backgroundColor: '#1E293B',
          border: '3px solid #64748B',
          borderRadius: 16,
          padding: '24px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.85), inset 0 2px 4px rgba(255,255,255,0.1)',
        }}
      >
        <div style={{fontFamily: STORY_FONT, fontSize: 32, fontWeight: 900, color: '#F8FAFC', letterSpacing: 2}}>
          SABANA POS 5 • LAWU
        </div>
        <div style={{fontFamily: 'monospace', fontSize: 20, color: '#38BDF8', marginTop: 6, fontWeight: 700}}>
          ELEVASI 2.800 MDPL // JALUR CANDI CETHO
        </div>
      </div>

      <DarkDocTelemetry leftTag="MT. LAWU • SEKTOR UTARA" rightTag="ELEV: 2800M // SUHU: 3°C" accent="#38BDF8" />
    </div>
  );
};

// B-ROLL 2: Flashlight Cones Vanishing into Thick Fog
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

      <DarkDocTelemetry leftTag="RADAR SENTER TEMAN" rightTag="JARAK: HILANG DI KABUT" accent="#F59E0B" />
      <StoryVisualPlate
        title="Jejak Senter Terputus"
        detail="Langkah Raka tertinggal • Titik cahaya rombongan di depan perlahan ditelan kabut malam"
        accent="#F59E0B"
        top={260}
      />
    </div>
  );
};

// B-ROLL 3: POV Flashlight in Tall Savannah Reeds
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
        {/* Left tall blades */}
        <path d={`M-50,1920 Q${120 + sway},1300 220,950 Q${180 + sway},1200 40,1920 Z`} fill="#141E14" />
        <path d={`M40,1920 Q${200 + sway},1400 320,1050 Q${240 + sway},1350 140,1920 Z`} fill="#0B130B" />
        {/* Right tall blades */}
        <path d={`M1130,1920 Q${960 - sway},1280 840,900 Q${900 - sway},1250 1040,1920 Z`} fill="#141E14" />
        <path d={`M1040,1920 Q${880 - sway},1380 760,1020 Q${820 - sway},1350 940,1920 Z`} fill="#0B130B" />
      </svg>

      <DarkDocTelemetry leftTag="POV SENTER RAKA (12% DAYA)" rightTag="JALUR SETAPAK: TERPUTUS" accent="#EF4444" />
      <StoryVisualPlate
        title="Tersesat di Ilalang Dada"
        detail="Senter mulai meredup • Jalur pendakian lenyap berganti semak liar setinggi dada"
        accent="#EF4444"
        top={260}
      />
    </div>
  );
};

// B-ROLL 4: Pasar Setan Supernatural Market Silhouettes
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
        {/* Left stall roof */}
        <polygon points="40,1180 380,1080 340,1450 60,1500" fill="#170A24" />
        <line x1="80" y1="1200" x2="80" y2="1650" stroke="#2E1065" strokeWidth="8" />
        {/* Right stall roof */}
        <polygon points="1040,1150 700,1060 740,1420 1020,1470" fill="#170A24" />
        <line x1="980" y1="1180" x2="980" y2="1650" stroke="#2E1065" strokeWidth="8" />

        {/* Ethereal Shadow Figures */}
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

      <DarkDocTelemetry leftTag="ANOMALI PASAR SETAN" rightTag="AROMA DUPA & GAMELAN" accent="#A855F7" />
      <StoryVisualPlate
        title="Pasar Gaib di Tengah Kabut"
        detail="Lapak warung remang berjejer • Derap langkah kaki dan suara tawar-menawar terdengar jelas"
        accent="#A855F7"
        top={260}
      />
    </div>
  );
};

// HYBRID PLATE: EKG Panic Heartbeat Monitor
const EKGHeartbeatPlate: React.FC<{frame: number}> = ({frame}) => {
  const bpm = Math.min(148, Math.round(92 + frame * 0.22));

  return (
    <div
      style={{
        position: 'absolute',
        top: 280,
        left: 70,
        right: 70,
        backgroundColor: 'rgba(8, 11, 20, 0.95)',
        border: '2px solid #EF4444',
        borderRadius: 24,
        padding: '20px 24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 35px rgba(239,68,68,0.25)',
        zIndex: 18,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
        <div style={{fontFamily: STORY_FONT, fontSize: 26, fontWeight: 900, color: '#FFFFFF'}}>
          Raka Membeku Ketakutan
        </div>
        <div style={{fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: '#EF4444'}}>
          {bpm} BPM
        </div>
      </div>
      {/* Animated EKG Waveform */}
      <svg viewBox="0 0 940 80" style={{width: '100%', height: 60, overflow: 'visible'}}>
        <path
          d="M0,40 L180,40 L210,10 L230,70 L250,40 L420,40 L450,10 L470,70 L490,40 L680,40 L710,10 L730,70 L750,40 L940,40"
          fill="none"
          stroke="#EF4444"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          fontFamily: STORY_FONT,
          fontSize: 20,
          fontWeight: 600,
          color: '#CBD5E1',
          lineHeight: 1.4,
          marginTop: 8,
        }}
      >
        Keringat dingin mengucur deras di tengah suhu hampir nol derajat
      </div>
    </div>
  );
};

// JUMPSCARE HORROR CLIMAX COMPONENT
const HorrorJumpscareScene: React.FC<{frame: number}> = ({frame}) => {
  const isWhisperStrike = frame >= 228; // Tepat pada kata "Mas... mau beli apa?"
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
        {/* Hiker Neck Silhouette */}
        <ellipse cx="540" cy="1150" rx="140" ry="120" fill="#080C14" />
        <path d="M380,1200 Q540,1140 700,1200 L760,1650 L320,1650 Z" fill="#050810" />

        {/* Terrifying Apparition Looming Directly Behind Neck */}
        <ellipse cx="540" cy="920" rx="120" ry="140" fill="#1C0606" opacity="0.95" />
        {/* Piercing Glowing Hollow Red Eyes */}
        <circle cx="505" cy="920" r={isWhisperStrike ? 14 : 9} fill="#FF0033" />
        <circle cx="575" cy="920" r={isWhisperStrike ? 14 : 9} fill="#FF0033" />
        {/* Long Ghost Hair Hanging Down */}
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

      {/* Massive Kinetic Horror Text */}
      {isWhisperStrike && (
        <div
          style={{
            position: 'absolute',
            top: 280,
            left: 40,
            right: 40,
            textAlign: 'center',
            fontFamily: STORY_FONT,
            fontSize: 64,
            fontWeight: 900,
            color: '#FFFFFF',
            textShadow: '0 0 30px #EF4444, 0 0 60px #DC2626',
            letterSpacing: 3,
            zIndex: 35,
          }}
        >
          "MAS... MAU BELI APA?"
        </div>
      )}

      <DarkDocTelemetry leftTag="PERINGATAN: KONTAK GAIB" rightTag="SUARA BISIKAN TENGKUK" accent="#EF4444" />
    </div>
  );
};

// MASTER SCENE RENDERER WITH 10 CINEMATIC SHOTS
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
        <HeadlineCapsule
          badge="KISAH NYATA • GUNUNG LAWU"
          badgeColor="#EF4444"
          borderColor="#DC2626"
          title="PASAR SETAN 2800 MDPL"
        />
        <StoryVisualPlate
          title="Misteri Sabana Pos 5"
          detail="Ketinggian 2800m • Kabut tebal turun mendadak & riuh pasar gaib"
          accent="#EF4444"
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
        <StoryVisualPlate
          title="Gunung Lawu 2.800 MDPL"
          detail="Hutan sunyi membisu • Kabut tebal menyapu sabana dan alunan gamelan gaib terdengar"
          accent="#38BDF8"
          top={250}
        />
      </SpatialCameraRig>
    );
  }

  // 2A. Hybrid PIP: Candi Cetho path, Alpha left gesturing
  if (id === 's2a') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.06} durationFrames={duration}>
        <RoomBackdrop preset="mystery-cold" effect="fog-drift" />
        <HeadlineCapsule
          badge="JALUR CANDI CETHO"
          badgeColor="#38BDF8"
          borderColor="#0284C7"
          title="PENDAKIAN MENJELANG GELAP"
        />
        <StoryVisualPlate
          title="Raka Mendaki Jalur Cetho"
          detail="Menjelang petang, kabut pekat mendadak menutup sabana Pos Lima Lawu"
          accent="#06B6D4"
          top={370}
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
        <HeadlineCapsule
          badge="SUNYI TOTAL • LAWU"
          badgeColor="#A855F7"
          borderColor="#7E22CE"
          title="ANGIN BERHENTI MENDADAK"
        />
        <StoryVisualPlate
          title="Keheningan Mencekam"
          detail="Angin gunung yang kencang mendadak sirna • Suasana berubah hening tak bernyawa"
          accent="#A855F7"
          top={370}
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
        <HeadlineCapsule
          badge="TEROR DINGIN • 0°C"
          badgeColor="#EF4444"
          borderColor="#DC2626"
          title="JANTUNG DEG-DEGAN PARAH"
        />
        <EKGHeartbeatPlate frame={localFrame} />
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
      <HeadlineCapsule
        badge="BERSAMBUNG KE PART 2"
        badgeColor="#EF4444"
        borderColor="#DC2626"
        title="SIAPA DI BELAKANG RAKA?"
      />
      <StoryVisualPlate
        title="Lanjut ke Part 2!"
        detail="Siapa yang menyapa Raka di tengah kabut itu? Tulis tebakanmu di komentar & tonton Part 2!"
        accent="#EF4444"
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
