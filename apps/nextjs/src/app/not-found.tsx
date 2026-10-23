import Link from 'next/link';

export default function NotFound() {
  return (
    <section className='py-10'>
      <h1 className='mb-3 text-xl'>Page not found</h1>
      <Link href='/' className='text-primary underline'>
        Return to the forum
      </Link>
    </section>
  );
}
