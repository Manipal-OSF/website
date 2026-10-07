import Image from 'next/image';
import type { ImageData } from '../services/api';
import placeholder from '../public/placeholder.png';

export interface CustomImageProps {
  data: ImageData | string;
}

const className = 'h-auto max-h-40 w-full object-cover';

const CustomImage = ({ data }: CustomImageProps) => {
  if (typeof data === 'string') {
    return (
      <Image
        src={placeholder}
        alt=''
        placeholder='blur'
        className={className}
      />
    );
  }

  return (
    <Image
      src={data.url}
      alt={data.alt}
      width={data.width}
      height={data.height}
      sizes='(min-width: 640px) 16rem, 100vw'
      className={className}
    />
  );
};

export default CustomImage;