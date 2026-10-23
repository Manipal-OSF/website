import ForumForm from '@/components/forum/ForumForm';
import { PostFields } from '@/components/forum/ForumControls';
import { ForumUnavailable } from '@/components/forum/ForumDisplay';
import { getForumContext } from '@/lib/forum';

export default async function SubmitPage() {
  const { store, viewer } = await getForumContext();
  if (!store) return <ForumUnavailable />;
  if (!viewer)
    return (
      <p className='text-sm'>Sign in to submit a link, question, or project.</p>
    );
  return (
    <div className='max-w-2xl'>
      <h1 className='mb-5 text-base font-semibold'>Submit to OSF Forum</h1>
      <ForumForm action='post' label='Submit'>
        <PostFields />
      </ForumForm>
    </div>
  );
}
