import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className='prose w-full [&_:is(h2,h3,h4,h5,h6)]:scroll-mt-20'>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
