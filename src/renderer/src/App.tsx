import { fromEvent, of, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';

import Fuse from 'fuse.js';
import data from './assets/data.json';
import Versions from './components/Versions';
import { useEffect, useState, useRef } from 'react';

const subject$ = new BehaviorSubject<string>('');
const fuseOptions = {
  isCaseSensitive: false,
  threshold: 0.3,
  shouldSort: true,
  includeScore: true,
  keys: ['name', 'comment']
};

function App(): JSX.Element {
  const [value, setValue] = useState('');
  const [list, setList] = useState('');
  const inputRef = useRef(null);
  const ipcHandle = (args): void => window.electron.ipcRenderer.send('ping', args);

  const handleChange = (e): void => {
    setValue(e.target.value);
    subject$.next(e.target.value);
  };

  const handleKeyDown = (e): void => {
    console.log(e.key);
    if (e.key === 'ArrowDown') {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    let fuse = new Fuse(data, fuseOptions);

    window.electron.ipcRenderer.on('load-complete', (event, args) => {
      fuse = new Fuse(args, fuseOptions);
    });
    console.log('load-complete', new Date());

    const subscription = subject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((keys) => {
          const results = fuse?.search(keys);
          return of(results);
        }),
        tap((input) => setList(input) && input),
        tap((input) => console.log('ipc', input, new Date()))
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <input
        id="launcher_input"
        placeholder="search"
        onKeyDown={(e) => handleKeyDown(e)}
        onChange={handleChange}
        type="text"
      ></input>
      <Versions inputRef={inputRef} list={list}></Versions>
    </>
  );
}

export default App;
