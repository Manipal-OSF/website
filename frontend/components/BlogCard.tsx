import Image from 'next/image';
import Link from 'next/link';
import { FunctionComponent } from 'react';
import { serverUrl } from '../constants';
import { BlogPost } from '../pages/blog';

interface BlogCardProps {
  data: BlogPost;
  index: number;
}

const BlogCard: FunctionComponent<BlogCardProps> = (props: BlogCardProps) => {
  return (
    <Link href={`/blog/${props.data.uid}`}>
      <a>
        <div className='border-2 dark:border-gray-500 card flex min-h-[20rem] cursor-pointer hover:-translate-y-1 duration-300'>
          <Image
            src={`${serverUrl}${props.data.coverImage.url}`}
            alt={props.data.coverImage.alt}
            height={props.data.coverImage.height}
            width={props.data.coverImage.width}
            layout='responsive'
            className='hover:scale-110 duration-300'
          ></Image>
          <div className='p-3 flex flex-col flex-grow-[1]'>
            <h2 className='text-2xl'>{props.data.title}</h2>
            <p className='text-lg'>{props.data.content}</p>
          </div>
          <div className='flex flex-row p-3 justify-between'>
            <p>{props.data.authors}</p>
            <p>{props.data.publishDate}</p>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default BlogCard;
