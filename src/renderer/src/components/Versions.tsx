import { useState } from 'react';
import Icon from '../assets/application.png';

function Versions({ list, inputRef }): JSX.Element {
  const [versions] = useState(window.electron.process.versions);

  if (!list || !Array.isArray(list) || list.length === 0) {
    return <></>;
  }

  const cutList = list.slice(0, 10);
  const launch = (index): void => {
    console.log('launch ', cutList[index]);
  };
  const handleKeyDown = (e, index): void => {
    if (e.code === 'ArrowUp') {
      cutList[index - 1] && document.querySelector(`#launcher-item-${index - 1}`).focus();
    }
    if (e.code === 'ArrowDown') {
      cutList[index + 1] && document.querySelector(`#launcher-item-${index + 1}`).focus();
    }
    if (e.code === 'Enter') {
      launch(index);
    }
    e.preventDefault();
  };
  return (
    <ul className="versions">
      {cutList.map(({ item }, index) => (
        <li className="electron-version" key={item.name}>
          <button
            className="btn-launcher"
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={index === 0 ? inputRef : null}
            onClick={() => launch(index)}
            id={`launcher-item-${index}`}
          >
            <img
              style={{ height: '30px', width: '30px' }}
              src={item?.icon ? `media://${item.icon}` : Icon}
              // src={`media://${item.icon}`}
              alt={item.icon}
            />
            {item.name}: {item.comment}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default Versions;
