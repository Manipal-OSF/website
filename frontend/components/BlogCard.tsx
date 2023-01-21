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
        <div className='card flex max-h-[20rem] cursor-pointer rounded-2xl border-2 duration-300 hover:-translate-y-1 hover:rounded-none dark:border-gray-500'>
          <CustomImage data={props.data.coverImage} />
          <div className='flex flex-grow-[1] flex-col p-3'>
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
