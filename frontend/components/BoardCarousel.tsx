import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, forwardRef, Dispatch, SetStateAction, useEffect, Children, ReactNode, FC, useRef, createRef, useLayoutEffect } from 'react';
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

function usePrevious(value: any) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

const calculateBoundingBoxes = (children: any) => {
  const boundingBoxes: any = {};

  Children.forEach(children, child => {
    const domNode = child.ref.current;
    const nodeBoundingBox = domNode.getBoundingClientRect();

    boundingBoxes[child.key] = nodeBoundingBox;
  });

  return boundingBoxes;
};

const AnimateChildren = ({children}: {children: any}) => {
  const [boundingBox, setBoundingBox]: any = useState({});
  const [prevBoundingBox, setPrevBoundingBox]: any = useState({});
  const prevChildren = usePrevious(children);

  useLayoutEffect(() => {
    const newBoundingBox = calculateBoundingBoxes(children);
    setBoundingBox(newBoundingBox);
  }, [children]);

  useLayoutEffect(() => {
    const prevBoundingBox = calculateBoundingBoxes(prevChildren);
    setPrevBoundingBox(prevBoundingBox);
  }, [prevChildren]);

  useLayoutEffect(() => {
    const hasPrevBoundingBox = Object.keys(prevBoundingBox).length;

    if (hasPrevBoundingBox) {
      Children.forEach(children, child => {
        // TODO: Add support for more than 5 members
        const domNode = child.ref.current;
        const firstBox = prevBoundingBox[child.key];
        const lastBox = boundingBox[child.key];
        const changeInX = firstBox.left - lastBox.left;
        const changeInY = firstBox.bottom - lastBox.bottom;

        if (changeInX) {
          requestAnimationFrame(() => {
            domNode.style.transform = `translateY(${changeInY}px) translateX(${changeInX}px)`;
            domNode.style.transition = "transform 0s";

            requestAnimationFrame(() => {
              domNode.style.transform = "";
              domNode.style.transition = "transform 500ms";
            });
          });
        }
      });
    }
  }, [boundingBox, prevBoundingBox, children]);

  return children;
}

const BoardCarousel = () => {
  const [board, setBoard] = useState(boardData);

  return (
    <div className='grid grid-cols-5 gap-10'>
      {/* FIXME: https://github.com/joshwcomeau/react-flip-move/issues/273 */}
      {/* <FlipMove className='grid grid-cols-5 gap-10'> */}
      <AnimateChildren>
      {board.slice(0, 5).map((value, index) => {
        if (index === 2) {
          return (
            <MiddleBoardCarouselItem
              key={value.key}
              index={index}
              value={value}
              board={board}
              setBoard={setBoard}
              ref={createRef()}
            />
          );
        }
        return (
          <BoardCarouselItem key={value.key} index={index} value={value} ref={createRef()} />
        );
      })}
      </AnimateChildren>
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

          <div ref={ref} key={props.value.key} className={`avatar ${getPlacement(props.index)}`}>
            <div
              className={`
                   mask mask-squircle ${getStyle(props.index)}`}
            >
              <img alt='e' src={props.value.url} />
              <div>

              </div>
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
