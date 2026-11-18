import React from 'react';
import {useCurrentFrame} from 'remotion';
import {AlphaCharacter} from '@shared/AlphaCharacter';
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

function StoryVisualPlate({
  title,
  detail,
  accent = '#EF4444',
}: {
  title: string;
  detail: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 370,
        left: 110,
        right: 110,
        backgroundColor: 'rgba(9, 13, 22, 0.86)',
        border: `2px solid ${accent}`,
        borderRadius: 24,
        padding: '24px 28px',
        boxShadow: '0 22px 50px rgba(0,0,0,0.65)',
        zIndex: 12,
      }}
    >
      <div
        style={{
          fontFamily: STORY_FONT,
          fontSize: 28,
          fontWeight: 900,
          color: '#FFFFFF',
          marginBottom: 8,
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

export const SceneRenderer: React.FC<{
  id: SceneId;
  duration: number;
  globalOffset: number;
}> = ({id, duration, globalOffset}) => {
  const frame = useCurrentFrame();
  const globalFrame = globalOffset + frame;
  const mouthOpen = getMouthOpenness('alpha', globalFrame);
  const activeWord = findActiveWord(wordTimestamps.segments, globalFrame);

  if (id === 's1') {
    return (
      <SpatialCameraRig zoomFrom={1.0} zoomTo={1.05} durationFrames={duration}>
        <RoomBackdrop preset="horror-dark" effect="vignette-pulse" />
        <HeadlineCapsule
          badge="ALPHA STORYTIME • PART 1"
          title="JUDUL CERITA MENARIK DI SINI"
          subtitle="Kisah Nyata / Horor / Hiburan"
        />
        <AliveCharacterRig
          mouthOpen={mouthOpen}
          enterFrom="bottom"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 370,
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
            rimColor="rgba(239, 68, 68, 0.45)"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  if (id === 's2') {
    return (
      <SpatialCameraRig
        zoomFrom={1.02}
        zoomTo={1.07}
        shakeFrame={120}
        shakeIntensity={10}
        durationFrames={duration}
      >
        <RoomBackdrop preset="mystery-cold" effect="fog-drift" />
        <HeadlineCapsule
          badge="ADEGAN UTAMA"
          badgeColor="#38BDF8"
          borderColor="#0284C7"
          title="PERISTIWA MENCEKAM"
        />
        <StoryVisualPlate
          title="Ilustrasi / Bukti Kejadian"
          detail="Ganti blok ini dengan ilustrasi SVG cerita, siluet tokoh, atau timeline kejadian."
          accent="#38BDF8"
        />
        <AliveCharacterRig
          mouthOpen={mouthOpen}
          enterFrom="bottom"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 370,
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
            rimColor="rgba(56, 189, 248, 0.4)"
          />
        </AliveCharacterRig>
      </SpatialCameraRig>
    );
  }

  return (
    <SpatialCameraRig zoomFrom={1.0} zoomTo={1.06} durationFrames={duration}>
      <RoomBackdrop preset="horror-dark" effect="horror-glitch" />
      <HeadlineCapsule
        badge="BERSAMBUNG KE PART 2"
        title="APA YANG TERJADI SELANJUTNYA?"
      />
      <AliveCharacterRig
        mouthOpen={mouthOpen}
        enterFrom="bottom"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 370,
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
          rimColor="rgba(239, 68, 68, 0.5)"
        />
      </AliveCharacterRig>
    </SpatialCameraRig>
  );
};
