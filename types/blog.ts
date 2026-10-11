export interface Author {
  id: string;
  name: string;
  pronouns: string | null;
  avatar: string | null;
  bio: string | null;
  links: AuthorLink[];
}

export interface AuthorLink {
  label: string;
  href: string;
}

// Post authors may reference a file in content/authors/ by ID, or be a plain name w/o pfp, will migrate to proper account based systems
export type PostAuthor =
  | (Author & { isRegistered: true })
  | { id: null; name: string; avatar: null; isRegistered: false };

export interface PostHeading {
  depth: 2 | 3 | 4;
  text: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  description: string | null;
  authors: string[];
  publishDate: string;
  tags: string[];
  coverImage: string | null;
  readingTime: string;
  headings: PostHeading[];
  content: string;
}
