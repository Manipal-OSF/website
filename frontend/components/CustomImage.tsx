import { FunctionComponent } from 'react';
import type { ImageData } from '../services/api';
import Image from 'next/image';

export interface CustomImageProps {
  data: ImageData | string;
}

const CustomImage: FunctionComponent<CustomImageProps> = (
  props: CustomImageProps
) => {
  if (typeof props.data === 'string') {
    // Placeholder
    return (
      <Image
        src={'/../public/placeholder.png'}
        alt='image'
        layout='responsive'
        height={600}
        width={1200}
        className='max-h-[10rem] rounded-t-xl duration-300 hover:scale-110'
      ></Image>
    );
  } else {
    return (
      <Image
        src={props.data.url}
        alt={props.data.alt}
        height={props.data.height}
        width={props.data.width}
        layout='responsive'
        className='max-h-[10rem] rounded-t-xl duration-300 hover:scale-110'
        priority={true}
        blurDataURL='../public/placeholder.jpg'
        placeholder='blur'
      ></Image>
    );
  }
};

export default CustomImage;
