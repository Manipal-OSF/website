import Image from 'next/image';
import Link from 'next/link';
import { FunctionComponent } from 'react';
import type { BlogPost } from '../services/api';
import CustomImage from './CustomImage';

interface BlogCardProps {
  data: BlogPost;
  index: number;
}

const BlogCard: FunctionComponent<BlogCardProps> = (props: BlogCardProps) => {
  return (
    <Link href={`/blog/${props.data.id}`}>
      <a>
        <div className='border-2 dark:border-gray-500 card flex max-h-[20rem] cursor-pointer hover:-translate-y-1 duration-300 rounded-2xl hover:rounded-none'>
          <CustomImage data={props.data.coverImage} />
          <div className='p-3 flex flex-col flex-grow-[1]'>
            <h2 className='text-2xl'>{props.data.title}</h2>
          </div>
          <div className='flex flex-row justify-between p-3'>
            <p>{props.data.authors}</p>
            <p>{props.data.publishDate.substring(0, 10)}</p>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default BlogCard;
