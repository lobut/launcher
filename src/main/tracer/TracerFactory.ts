import { TracerStrategy } from './TracerStrategy';
import { WindowsTracerStrategy } from './WindowsTracerStrategy';
import { MacTracerStrategy } from './MacTracerStrategy';
import { LinuxTracerStrategy } from './LinuxTracerStrategy';

const osStratMap = {
  win31: WindowsTracerStrategy,
  darwin: MacTracerStrategy,
  linux: LinuxTracerStrategy
};

export function TracerStrategyFactory(): TracerStrategy {
  const strategy = osStratMap[process.platform];

  if (!strategy) {
    throw new Error('Unsupported platform');
  }

  return new strategy();
}
