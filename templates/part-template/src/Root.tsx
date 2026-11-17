import React from 'react';
import {Composition} from 'remotion';
import {AlphaStory} from './Video';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './shots';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="AlphaStory"
      component={AlphaStory}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
