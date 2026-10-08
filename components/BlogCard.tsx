import Link from 'next/link';
import type { BlogPost } from '../types/blog';
import CustomImage from './CustomImage';

interface BlogCardProps {
  data: BlogPost;
}

const BlogCard = ({ data }: BlogCardProps) => {
  return (
    <Link
      href={`/blog/${data.id}`}
      className='hover:bg-muted/50 flex flex-col gap-4 rounded-xl border p-4 transition-colors sm:flex-row'
    >
      <div className='w-full shrink-0 overflow-hidden rounded-md sm:w-64'>
        <CustomImage data={data.coverImage} alt={data.title} />
      </div>
      <div className='flex flex-col gap-1'>
        <h2 className='text-foreground text-lg font-medium'>{data.title}</h2>
        <div className='text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs'>
          <span>{data.authors.join(', ')}</span>
          <span className='bg-border h-3 w-px' />
          <span>{data.publishDate.substring(0, 10)}</span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
