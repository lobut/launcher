import { TracerStrategy, SettingsType } from './TracerStrategy';

export class WindowsTracerStrategy implements TracerStrategy {
  async scan(): Promise<SettingsType[]> {
    return Promise.reject('Not implemented');
  }
}
