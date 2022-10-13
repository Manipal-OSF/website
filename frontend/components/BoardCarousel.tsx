import Image from 'next/image';
import { useState } from 'react';
import boardData from '../public/boardData.json';

const getStyle = (index: number): string => {
  if (index === 2) {
    return 'w-48';
  } else if (index === 1 || index === 3) {
    return 'w-36 absolute top-16';
  } else {
    return 'w-28 absolute top-32';
  }
};

const BoardCarousel = () => {
  const [board, setBoard] = useState(boardData);

  return (
    <div className='grid grid-cols-5 gap-16'>
      {board.slice(0, 5).map((value, index) => {
        console.log(JSON.stringify(value));

        return (
          <>
            <div key={index} className='avatar place-content-center'>
              <div
                className={`${
                  index == 2 ? '' : 'grayscale hover:grayscale-0 bg-white/30'
                } mask mask-squircle ${getStyle(index)}`}
              >
                <img alt='e' src={value.url} />
              </div>
            </div>
          </>
        );
      })}
      {/* <div className=''></div>
          <div className=''>
          <div className='avatar'>
            <div className="w-48 mask mask-squircle">
              <Image alt='e' src="https://placeimg.com/192/192/people" layout='fill' />
            </div>
          </div>
        </div> */}
    </div>
  );
};

export default BoardCarousel;
