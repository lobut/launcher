import { TracerStrategy, SettingsType } from './TracerStrategy';

export class MacTracerStrategy implements TracerStrategy {
  async scan(): Promise<SettingsType[]> {
    return Promise.reject('Not implemented');
  }
}
