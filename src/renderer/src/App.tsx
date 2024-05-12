import { fromEvent, of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';

import Versions from './components/Versions';
import { useEffect, useState } from 'react';

const subject$ = new BehaviorSubject<string>('');

const getContinents = (keys) =>
  ['something', 'applicaton', 'this', 'that', 'bobby', 'candy', 'asdf', 'cdef'].filter(
    (e) => e.indexOf(keys.toLowerCase()) > -1
  );

const fakeContinentsRequest = (keys) =>
  of(getContinents(keys)).pipe(
    tap((input) => console.log(`fakeContinentsRequest ${input} ${keys} ${new Date()}`))
  );

function App(): JSX.Element {
  const [value, setValue] = useState('');
  const ipcHandle = (args): void => window.electron.ipcRenderer.send('ping', args);

  const handleChange = (e): void => {
    setValue(e.target.value);
    subject$.next(e.target.value);
  };

  useEffect(() => {
    const subscription = subject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((keys) => {
          ipcHandle(keys);
          return of(keys);
        }),
        tap((input) => console.log('ipc', input, new Date()))
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <input id="launcher_input" placeholder="search" onChange={handleChange} type="text"></input>
      <Versions></Versions>
    </>
  );
}

export default App;
