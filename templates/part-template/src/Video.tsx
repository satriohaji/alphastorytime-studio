import React from 'react';
import {AbsoluteFill, Audio, Sequence} from 'remotion';
import {staticFile} from 'remotion';
import {SceneRenderer} from './scenes';
import {
  BGM_FILE,
  BGM_VOLUME,
  SCENE_TRANSITIONS,
  SFX_TIMELINE,
  SHOTS,
  TOTAL_FRAMES,
  VOICEOVER,
} from './shots';
import {SceneTransitionWrapper, StingerOverlay} from '@shared/StoryTransitions';
import {KineticWordSubtitle, ProgressBar} from '@shared/StudioStage';
import wordTimestamps from './word_timestamps.json';

const SEGMENT_WORD_FIXES: Record<string, string> = {};

export const AlphaStory: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#05050A'}}>
      <Audio src={staticFile(VOICEOVER)} volume={1.0} />
      {BGM_FILE && <Audio src={staticFile(BGM_FILE)} volume={BGM_VOLUME} loop />}

      {SFX_TIMELINE.map((sfx) => (
        <Sequence key={sfx.id} from={sfx.frame} durationInFrames={sfx.duration ?? 45}>
          <Audio src={staticFile(sfx.file)} volume={sfx.volume} />
        </Sequence>
      ))}

      {SHOTS.map((shot, index) => {
        const duration = shot.to - shot.from;
        return (
          <Sequence key={shot.id} from={shot.from} durationInFrames={duration}>
            <SceneTransitionWrapper
              duration={duration}
              isFirst={index === 0}
              isLast={index === SHOTS.length - 1}
              enterStyle={shot.enterStyle ?? 'zoom-punch'}
            >
              <SceneRenderer
                id={shot.scene}
                duration={duration}
                globalOffset={shot.from}
              />
            </SceneTransitionWrapper>
          </Sequence>
        );
      })}

      {SCENE_TRANSITIONS.map((tr, i) => (
        <Sequence key={`stinger-${i}`} from={tr.cutFrame - 12} durationInFrames={24}>
          <StingerOverlay type={tr.type} />
        </Sequence>
      ))}

      <KineticWordSubtitle
        segments={wordTimestamps.segments}
        wordFixes={SEGMENT_WORD_FIXES}
      />
      <ProgressBar totalFrames={TOTAL_FRAMES} color="#DC2626" />
    </AbsoluteFill>
  );
};
