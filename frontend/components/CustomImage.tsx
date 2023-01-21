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
        className='duration-300 hover:scale-110 max-h-[10rem] rounded-t-xl'
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
        className='duration-300 hover:scale-110 max-h-[10rem] rounded-t-xl'
        priority={true}
        blurDataURL='../public/placeholder.jpg'
        placeholder='blur'
      ></Image>
    );
  }
};

export default CustomImage;
