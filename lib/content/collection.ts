import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

export interface MarkdownFile {
  // Filename without the .md extension.
  name: string;
  filename: string;
  data: Record<string, unknown>;
  content: string;
}

const contentRoot = path.join(process.cwd(), 'content');

// Reads every Markdown file in content/<directory>, sorted by filename.
export async function readMarkdownFiles(
  directory: string
): Promise<MarkdownFile[]> {
  const absolute = path.join(contentRoot, directory);
  const filenames = (await readdir(absolute))
    .filter((filename) => filename.endsWith('.md'))
    .sort();
  return Promise.all(
    filenames.map(async (filename) => {
      const { data, content } = matter(
        await readFile(path.join(absolute, filename), 'utf8')
      );
      return { name: filename.slice(0, -3), filename, data, content };
    })
  );
}

// Validates frontmatter, naming the offending file in the error.
export function parseFrontmatter<Schema extends z.ZodType>(
  schema: Schema,
  file: MarkdownFile,
  kind: string
): z.output<Schema> {
  const result = schema.safeParse(file.data);
  if (!result.success) {
    throw new Error(
      `Invalid ${kind} ${file.filename}:\n${z.prettifyError(result.error)}`
    );
  }
  return result.data;
}
