import GithubSlugger from 'github-slugger';
import type { Heading } from 'mdast';
import { toString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { PostHeading } from '@/types/blog';

const WORDS_PER_MINUTE = 200;
const TOC_DEPTHS = new Set([2, 3, 4]);

// Parsed with the same remark plugins as MarkdownRenderer so text and heading
// slugs match what is rendered.
const parser = unified().use(remarkParse).use(remarkGfm);

export function analyzeMarkdown(markdown: string): {
  readingTime: string;
  headings: PostHeading[];
} {
  const tree = parser.runSync(parser.parse(markdown));

  const words = toString(tree, { includeImageAlt: false })
    .split(/\s+/)
    .filter(Boolean).length;

  // rehype-slug slugs every heading in order, so all of them advance the
  // slugger even when only some are listed.
  const slugger = new GithubSlugger();
  const headings: PostHeading[] = [];
  visit(tree, 'heading', (node: Heading) => {
    const text = toString(node);
    const slug = slugger.slug(text);
    if (TOC_DEPTHS.has(node.depth)) {
      headings.push({ depth: node.depth as PostHeading['depth'], text, slug });
    }
  });

  return {
    readingTime: `${Math.max(
      1,
      Math.round(words / WORDS_PER_MINUTE)
    )} min read`,
    headings,
  };
}
