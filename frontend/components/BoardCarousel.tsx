import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, forwardRef, Dispatch, SetStateAction } from 'react';
import FlipMove from 'react-flip-move';
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

interface BoardDataJson {
  name: string;
  key: number;
  url: string;
  links: {
    site: string;
    url: string;
  }[];
}

interface Props {
  index: number;
  value: BoardDataJson;
}

interface MiddleProps extends Props {
  board: BoardDataJson[];
  setBoard: Dispatch<SetStateAction<BoardDataJson[]>>;
}

const rotateRight = (
  board: BoardDataJson[],
  setBoard: Dispatch<SetStateAction<BoardDataJson[]>>
) => {
  let temp = [...board];
  let last = temp.pop();
  temp.unshift(last!);
  console.log(board);

  setBoard(temp);
};

const rotateLeft = (
  board: BoardDataJson[],
  setBoard: Dispatch<SetStateAction<BoardDataJson[]>>
) => {
  let temp = [...board];
  let first = temp.shift();
  temp.push(first!);
  console.log(board);

  setBoard(temp);
};


const BoardCarousel = () => {
  const [board, setBoard] = useState(boardData);

  return (
    <div className='grid grid-cols-5 gap-10'>
      {/* FIXME: https://github.com/joshwcomeau/react-flip-move/issues/273 */}
      {/* <FlipMove className='grid grid-cols-5 gap-10'> */}
      {board.slice(0, 5).map((value, index) => {
        // console.log(JSON.stringify(value));
        if (index === 2) {
          return (
            <MiddleBoardCarouselItem
              key={value.key}
              index={index}
              value={value}
              board={board}
              setBoard={setBoard}
            />
          );
        }
        return (
          <BoardCarouselItem key={value.key} index={index} value={value} />
        );
      })}
      {/* </FlipMove> */}
    </div>
  );
};

const MiddleBoardCarouselItem = forwardRef<HTMLDivElement, MiddleProps>(
  (props, ref) => {
    return (
      <div
        // ref={ref}
        className='flex flex-col items-center justify-center gap-5 duration-150'
      >
        <div className='flex flex-row items-center justify-center'>
          <button
            aria-label='Left'
            onClick={() => rotateRight(props.board, props.setBoard)}
            className='pr-5'
          >
            <FontAwesomeIcon size='lg' icon={faArrowLeft}></FontAwesomeIcon>
          </button>

          <div ref={ref} className={`avatar ${getPlacement(props.index)}`}>
            <div
              className={`
                   mask mask-squircle ${getStyle(props.index)}`}
            >
              <img alt='e' src={props.value.url} />
            </div>
          </div>

          <button
            aria-label='Right'
            onClick={() => rotateLeft(props.board, props.setBoard)}
            className='pl-5'
          >
            <FontAwesomeIcon size='lg' icon={faArrowRight}></FontAwesomeIcon>
          </button>
        </div>
        <p className='text-xl'>{props.value.name}</p>
      </div>
    );
  }
);

const BoardCarouselItem = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return (
    <div ref={ref} className={`avatar ${getPlacement(props.index)}`}>
      <div
        className={`grayscale hover:grayscale-0 mask mask-squircle ${getStyle(
          props.index
        )}`}
      >
        <img alt='e' src={props.value.url} />
      </div>
    </div>
  );
});

export default BoardCarousel;
