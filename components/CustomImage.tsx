import Image from 'next/image';
import placeholder from '../public/placeholder.png';

export interface CustomImageProps {
  data: string | null;
  alt?: string;
}

const className = 'h-auto max-h-40 w-full object-cover';

const CustomImage = ({ data, alt = '' }: CustomImageProps) => {
  if (!data) {
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
      src={data}
      alt={alt}
      width={640}
      height={360}
      sizes='(min-width: 640px) 16rem, 100vw'
      className={className}
    />
  );
};

export default CustomImage;
