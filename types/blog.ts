export interface BlogPost {
  id: string;
  title: string;
  authors: string[];
  publishDate: string;
  coverImage: string | null;
  content: string;
}
