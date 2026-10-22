export type ForumView = 'top' | 'new' | 'ask' | 'show';
export type ForumTarget = 'post' | 'comment';
export interface ForumPost {
  id: string;
  title: string;
  kind: 'link' | 'text';
  category: 'general' | 'ask' | 'show';
  url: string | null;
  body: string | null;
  username: string | null;
  createdAt: string;
  ageMinutes: number;
  updatedAt: string;
  points: number;
  commentCount: number;
  voted: boolean;
  owned: boolean;
  deleted: boolean;
  hidden: boolean;
  locked: boolean;
}
export interface ForumComment {
  id: string;
  postId: string;
  postTitle: string;
  parentId: string | null;
  username: string | null;
  body: string;
  createdAt: string;
  ageMinutes: number;
  updatedAt: string;
  points: number;
  voted: boolean;
  owned: boolean;
  deleted: boolean;
  hidden: boolean;
  locked: boolean;
}
export interface ForumReport {
  id: string;
  targetId: string;
  target: ForumTarget;
  postId: string;
  title: string;
  body: string | null;
  reason: string;
  username: string | null;
  createdAt: string;
}
export interface ForumMember {
  username: string;
  createdAt: string;
  karma: number;
}
export interface ForumActionResult {
  error?: string;
  success?: string;
  location?: string;
}
