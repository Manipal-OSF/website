import hljs from 'highlight.js';
import { Fragment, useEffect } from 'react';
import { Text } from 'slate';

interface RichTextProps {
  md: string;
}

interface Node {
  children: any[];
  type?: string;
  bold?: boolean;
  code?: boolean;
  italic?: boolean;
  url?: string;
}

const serialize = (children: any) =>
  children.map((node: Node, i: number) => {
    if (Text.isText(node)) {
      let text = (
        <span
          dangerouslySetInnerHTML={{
            __html: node.text,
          }}
        />
      );

      if (node.bold) {
        text = (
          <span className='font-bold' key={i}>
            {text}
          </span>
        );
      }

      if (node.code) {
        text = (
          <code className='block whitespace-pre bg-transparent leading-[0.5rem]'>
            {text}
          </code>
        );
      }

      if (node.italic) {
        text = <em key={i}>{text}</em>;
      }

      return <Fragment key={i}>{text}</Fragment>;
    }

    if (!node) {
      return null;
    }

    switch (node.type) {
      case 'h1':
        return (
          <Fragment key={i}>
            <h1 className='text-[3rem] leading-tight' key={i}>
              {serialize(node.children)}
            </h1>
            <hr className='opacity-30' />
          </Fragment>
        );
      case 'h2':
        return (
          <h2 className='text-[2.6rem] leading-tight' key={i}>
            {serialize(node.children)}
          </h2>
        );
      case 'h3':
        return (
          <h3 className='text-[2.3rem] leading-tight' key={i}>
            {serialize(node.children)}
          </h3>
        );
      case 'h4':
        return (
          <h4 className='text-[2rem] leading-tight' key={i}>
            {serialize(node.children)}
          </h4>
        );
      case 'h5':
        return (
          <h5 className='text-[1.6rem] leading-tight' key={i}>
            {serialize(node.children)}
          </h5>
        );
      case 'h6':
        return (
          <h6 className='text-[1.3rem] leading-tight' key={i}>
            {serialize(node.children)}
          </h6>
        );
      case 'quote':
        return <blockquote key={i}>{serialize(node.children)}</blockquote>;
      case 'ul':
        return (
          <ul className='pl-3' key={i}>
            {serialize(node.children)}
          </ul>
        );
      case 'ol':
        return <ol key={i}>{serialize(node.children)}</ol>;
      case 'li':
        return (
          <li className='list-disc pl-1' key={i}>
            {serialize(node.children)}
          </li>
        );
      case 'link':
        return (
          <a
            className='link-hover link'
            href={node?.url ?? 'https://www.manipalosf.org'}
            key={i}
          >
            {serialize(node.children)}
          </a>
        );

      default:
        return (
          <p className='text-[1.2rem] leading-tight' key={i}>
            {serialize(node.children)}
          </p>
        );
    }
  });

const RichTextRenderer = (props: RichTextProps) => {
  useEffect(() => {
    document
      .querySelectorAll('code')
      .forEach((e) => hljs.highlightBlock(e as HTMLElement));
  });

  return <>{serialize(JSON.parse(JSON.stringify(props.md)))}</>;
};

export default RichTextRenderer;
