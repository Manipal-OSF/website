import { siteName } from '@/lib/site';

export default function HomePage() {
  return (
    <div className='text-foreground m-auto grid gap-5 place-self-center text-center'>
      <h2 className='text-left italic duration-300 hover:-translate-y-1'>
        Experience
      </h2>
      <h1 className='text-5xl sm:text-7xl'>{siteName}</h1>
    </div>
  );
}
