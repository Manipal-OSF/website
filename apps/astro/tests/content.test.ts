import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  postSchema,
  authorSchema,
  assertUniquePostIds,
} from '../src/lib/content/frontmatter';
import { analyzeMarkdown } from '../src/lib/content/markdown';
const post = {
  id: 'historical-id',
  title: 'Example',
  authors: ['someone'],
  publishDate: '2026-10-08',
  status: 'published',
};
test('preserves historical numeric IDs, optional metadata, and explicit draft status', () => {
  assert.equal(postSchema.parse({ ...post, id: 123 }).id, '123');
  assert.deepEqual(postSchema.parse(post).tags, []);
  assert.equal(postSchema.parse({ ...post, status: 'draft' }).status, 'draft');
  assert.equal(authorSchema.parse({ name: 'Someone' }).name, 'Someone');
});
test('rejects invalid dates, duplicate authors, unsafe or missing images, and duplicate IDs', () => {
  for (const changes of [
    { publishDate: '2026-02-30' },
    { authors: ['a', 'a'] },
    { authors: [] },
    { coverImage: '//external.example/image.png' },
    { coverImage: '/missing-image.png' },
  ]) {
    assert.equal(postSchema.safeParse({ ...post, ...changes }).success, false);
  }
  assert.equal(
    authorSchema.safeParse({ name: 'Someone', website: 'http://example.com' })
      .success,
    false,
  );
  assert.throws(
    () => assertUniquePostIds([{ id: 'same' }, { id: 'same' }]),
    /Duplicate blog post id: same/,
  );
  assert.doesNotThrow(() => assertUniquePostIds([{ id: '1' }, { id: '2' }]));
});
test('heading anchors account for repeated and unlisted headings', () => {
  const result = analyzeMarkdown(
    '# Repeated\n\n## Repeated\n\n### Repeated\n\n##### Other\n\n## Other',
  );
  assert.deepEqual(
    result.headings.map((heading) => heading.slug),
    ['repeated-1', 'repeated-2', 'other-1'],
  );
  assert.equal(result.readingTime, '1 min read');
});
