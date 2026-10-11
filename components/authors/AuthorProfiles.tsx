import type { PostAuthor } from '@/types/blog';
import AuthorCard from './AuthorCard';

const AuthorProfiles = ({ authors }: { authors: PostAuthor[] }) => {
  const profiles = authors.filter((author) => author.isRegistered);
  if (profiles.length === 0) return null;
  return (
    <section className='flex flex-col gap-4'>
      <h2 className='text-foreground text-lg font-medium'>
        {profiles.length === 1 ? 'About the author' : 'About the authors'}
      </h2>
      {profiles.map((author) => (
        <AuthorCard key={author.id} author={author} />
      ))}
    </section>
  );
};

export default AuthorProfiles;
