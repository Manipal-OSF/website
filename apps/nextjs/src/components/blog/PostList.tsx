import type { ComponentProps } from 'react';
import BlogCard from './BlogCard';

type PostListProps = { posts: ComponentProps<typeof BlogCard>['post'][] };

const PostList = ({ posts }: PostListProps) => (
  <ul className='flex flex-col gap-4'>
    {posts.map((post) => (
      <li key={post.id}>
        <BlogCard post={post} />
      </li>
    ))}
  </ul>
);

export default PostList;
