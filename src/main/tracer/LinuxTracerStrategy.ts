import * as fs from 'fs';
import * as path from 'path';
import { map, of, interval, delay, from, filter, Observable, concat } from 'rxjs';
import { concatMap } from 'rxjs';
import { bufferCount, take, tap, finalize } from 'rxjs';

import { SettingsType, TracerStrategy, notEmpty } from './TracerStrategy';

const iconPaths = [
  '/usr/share/icons/Numix-Circle/48/apps/',
  '/usr/share/icons/Mint-X/apps/96/',
  '/usr/share/pixmaps/'
];

export class LinuxTracerStrategy implements TracerStrategy {
  async scan(): Promise<SettingsType[]> {
    const apps = fs.readdirSync('/usr/share/applications');

    const observable = from(apps).pipe(
      concatMap((arr) => this._process(arr)),
      filter((data) => typeof data !== 'undefined'),
      finalize(() => console.log('done'))
    );

    const promise = new Promise<SettingsType[]>((resolve, reject) => {
      const results: SettingsType[] = [];

      observable.subscribe({
        next: (data) => {
          if (data) results.push(data);
        },
        complete: () => {
          require('fs').writeFileSync(
            path.join(__dirname, 'data.json'),
            JSON.stringify(results, null, 2)
          );
          resolve(results);
        },
        error: (err) => reject(err)
      });
    });

    return promise;
    // from(apps)
    //   .pipe(
    //     bufferCount(10),
    //     tap((data) => console.log(data)),
    //     delay(5000),
    //     tap(() => console.log('tap')),
    //     finalize(() => console.log('done'))
    //   )
    //   .subscribe();
  }

  async _process(file): Promise<SettingsType | undefined> {
    const settings = {
      '[Desktop Entry]': {
        file
      }
    };
    const applicationPath = `/usr/share/applications/${file}`;
    try {
      const stat = fs.statSync(applicationPath);
      if (!stat.isFile()) {
        console.warn(`${file} is not a file`);
        return Promise.resolve(undefined);
      }

      const data = fs.readFileSync(applicationPath, 'utf-8');
      let header = '';
      data.split(/\r?\n/).forEach((line) => {
        if (!line) return;
        if (line.startsWith('[')) {
          header = line;
          settings[header] = {};
        } else {
          const key = line.split('=')[0]?.trim();
          const value = line.split('=')[1]?.trim();

          if (key && value) settings[header][key] = value;
        }
      });
    } catch (err) {
      console.error(`file: ${file}`, err);
      throw err;
    }

    const desktopSettings = settings['[Desktop Entry]'];

    if (!desktopSettings) return Promise.resolve(undefined);

    let iconPath = desktopSettings['Icon'];

    if (!!iconPath && !iconPath.startsWith('/')) {
      iconPath = iconPaths.find((p) => fs.existsSync(path.join(p, `${iconPath}.svg`))) ?? undefined;
      if (iconPath) {
        iconPath = path.join(iconPath, `${desktopSettings['Icon']}.svg`);
      }
    }

    const fixedSettings: SettingsType = {
      exec: desktopSettings['Exec'],
      name: desktopSettings['Name'],
      icon: iconPath,
      categories: desktopSettings['Categories'],
      comment: desktopSettings['Comment'],
      type: desktopSettings['Type']
    };

    return Promise.resolve(fixedSettings);
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function start() {
  const strategy = new LinuxTracerStrategy();
  return await strategy.scan();
  // return await strategy._process('steam.desktop');
}

start()
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
