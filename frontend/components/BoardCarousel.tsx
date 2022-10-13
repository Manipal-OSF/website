import {
  faArrowLeft,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import boardData from '../public/boardData.json';

const getStyle = (index: number): string => {
  if (index === 2) {
    return 'w-48';
  } else if (index === 1 || index === 3) {
    return 'w-36 absolute top-28';
  } else {
    return 'w-28 absolute top-56';
  }
};

const getPlacement = (index: number): string => {
  if (index == 0 || index == 1) {
    return 'place-content-start';
  } else if (index == 3 || index == 4) {
    return 'place-content-end';
  } else {
    return 'place-content-center';
  }
};

const BoardCarousel = () => {
  const [board, setBoard] = useState(boardData);

  const rotateRight = () => {
    let temp = [...board];
    let last = temp.pop();
    temp.unshift(last!);
    console.log(board);

    setBoard(temp);
  };

  const rotateLeft = () => {
    let temp = [...board];
    let first = temp.shift();
    temp.push(first!);
    console.log(board);

    setBoard(temp);
  };

  return (
    <div className=' duration-75 grid grid-cols-5 gap-10'>
        {board.slice(0, 5).map((value, index) => {
          // console.log(JSON.stringify(value));

          if (index === 2) {
            return (
              <>
                <div className='flex flex-col items-center justify-center gap-5 duration-150'>
                  <div className='flex flex-row items-center justify-center'>
                    <button
                      aria-label='Left'
                      onClick={rotateLeft}
                      className='pr-5'
                    >
                      <FontAwesomeIcon
                        size='lg'
                        icon={faArrowLeft}
                      ></FontAwesomeIcon>
                    </button>
                    <div
                      key={value.key}
                      className={`avatar ${getPlacement(index)}`}
                    >
                      <div
                        className={`${
                          index == 2
                            ? ''
                            : 'grayscale hover:grayscale-0 bg-white/30'
                        } mask mask-squircle ${getStyle(index)}`}
                      >
                        <img alt='e' src={value.url} />
                      </div>
                    </div>
                    <button
                      aria-label='Right'
                      onClick={rotateRight}
                      className='pl-5'
                    >
                      <FontAwesomeIcon
                        size='lg'
                        icon={faArrowRight}
                      ></FontAwesomeIcon>
                    </button>
                  </div>
                  <p className='text-xl'>{value.name}</p>
                </div>
              </>
            );
          } else {
            return (
              <>
                <div
                  key={value.key}
                  className={`avatar ${getPlacement(index)}`}
                >
                  <div
                    className={`${
                      index == 2
                        ? ''
                        : 'grayscale hover:grayscale-0 bg-white/30'
                    } mask mask-squircle ${getStyle(index)}`}
                  >
                    <img alt='e' src={value.url} />
                  </div>
                </div>
              </>
            );
          }
        })}
    </div>
  );
};

export default BoardCarousel;
