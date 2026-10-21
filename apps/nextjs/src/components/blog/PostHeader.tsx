import type { BlogPost, PostAuthor } from '@/types/blog';
import PostMeta from './PostMeta';
import Tags from './Tags';

interface PostHeaderProps {
  post: Pick<
    BlogPost,
    'title' | 'description' | 'publishDate' | 'readingTime' | 'tags'
  >;
  authors: PostAuthor[];
}

const PostHeader = ({ post, authors }: PostHeaderProps) => (
  <header className='flex flex-col items-center gap-4 text-center'>
    <h1 className='text-foreground text-3xl leading-tight font-medium sm:text-4xl'>
      {post.title}
    </h1>
    {post.description && (
      <p className='text-muted-foreground'>{post.description}</p>
    )}
    <PostMeta
      authors={authors}
      publishDate={post.publishDate}
      readingTime={post.readingTime}
      linkAuthors
      className='justify-center text-sm'
    />
    <Tags tags={post.tags} className='justify-center' />
  </header>
);

export default PostHeader;
