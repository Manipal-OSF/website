// Structured data for search engines; `<` is escaped so content cannot close the tag.
const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    type='application/ld+json'
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        ...data,
      }).replace(/</g, '\\u003c'),
    }}
  />
);

export default JsonLd;
