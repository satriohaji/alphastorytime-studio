import path from 'path';
import {Config} from '@remotion/cli/config';

type GlRenderer =
  | 'swangle'
  | 'angle'
  | 'egl'
  | 'swiftshader'
  | 'vulkan'
  | 'angle-egl';

const defaultRenderer: GlRenderer =
  process.platform === 'win32' ? 'angle' : 'swangle';
const renderer =
  (process.env.REMOTION_GL_RENDERER as GlRenderer | undefined) ??
  defaultRenderer;

Config.setVideoImageFormat('jpeg');
Config.setStillImageFormat('png');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer(renderer);

Config.overrideWebpackConfig((currentConfiguration) => {
  const nodeModulesDir = path.resolve(__dirname, 'node_modules');
  const sharedDir = path.resolve(__dirname, 'src', 'shared');

  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      alias: {
        ...(currentConfiguration.resolve?.alias ?? {}),
        '@shared': sharedDir,
        three: path.join(nodeModulesDir, 'three'),
      },
      modules: [
        nodeModulesDir,
        ...(currentConfiguration.resolve?.modules ?? []),
      ],
    },
  };
});
