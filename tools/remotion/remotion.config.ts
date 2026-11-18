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
  const remotionDir =
    process.env.REMOTION_DIR ||
    (__dirname.includes('node_modules')
      ? __dirname.slice(0, __dirname.indexOf('node_modules'))
      : __dirname);
  const sharedDir =
    process.env.REMOTION_SHARED_DIR || path.resolve(remotionDir, 'src', 'shared');
  const nodeModulesDir =
    process.env.REMOTION_NODE_MODULES ||
    path.resolve(remotionDir, 'node_modules');

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
