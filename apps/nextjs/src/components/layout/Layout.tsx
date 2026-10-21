import { ViewTransition, type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}

const Layout = ({ children, header, footer }: LayoutProps) => (
  <div className='bg-background text-foreground flex min-h-screen flex-col gap-y-6 font-sans'>
    {header}
    {}
    <ViewTransition default='page-fade'>
      <div className='flex grow flex-col'>
        <main className='mx-auto flex w-full max-w-5xl grow flex-col gap-y-6 overflow-clip px-4 has-[[data-wide]]:max-w-7xl'>
          {children}
        </main>
      </div>
    </ViewTransition>
    {footer}
  </div>
);

export default Layout;
