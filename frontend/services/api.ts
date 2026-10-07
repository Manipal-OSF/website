import { serverUrl } from '../constants';

export interface ImageData {
  title: string;
  alt: string;
  width: number;
  height: number;
  mimeType: string;
  url: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  publishDate: string;
  authors: string[];
  coverImage: ImageData | string;
  category: string;
  tags: Tag[];
  estimatedTime: number;
}

export interface UidPayload {
  params: {
    uid: string;
  };
}

const getJson = async (path: string): Promise<any | null> => {
  try {
    const res = await fetch(`${serverUrl}${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const toPost = (item: any): BlogPost => {
  const imageData = item.coverImage;
  const coverImage: ImageData | string =
    imageData && imageData.title !== undefined
      ? {
          title: imageData.title,
          alt: imageData.alt,
          width: imageData.width,
          height: imageData.height,
          mimeType: imageData.mimeType,
          url: imageData.url,
        }
      : imageData;

  return {
    id: item.id,
    title: item.title,
    content: item.content,
    publishDate: item.publishedDate,
    authors: item.authors?.name,
    coverImage,
    category: item.category,
    tags: (item.tags ?? []).map((t: any): Tag => ({ id: t.id, name: t.name })),
    estimatedTime: item.estimatedTime,
  };
};

export const getUidList = async (): Promise<UidPayload[]> => {
  const json = await getJson('/api/posts?populate=*');
  const docs: any[] = json?.docs ?? [];
  return docs.map((e) => ({ params: { uid: String(e.id) } }));
};

export const fetchOne = async (uid: string): Promise<BlogPost | null> => {
  const data = await getJson(`/api/posts/${uid}?populate=*`);
  if (!data) return null;
  try {
    return toPost(data);
  } catch {
    return null;
  }
};

export const fetchData = async (): Promise<BlogPost[]> => {
  const json = await getJson('/api/posts?populate=*');
  const docs: any[] = json?.docs ?? [];
  return docs
    .filter((item) => item.status === 'published')
    .map((item) => {
      try {
        return toPost(item);
      } catch {
        return null;
      }
    })
    .filter((p): p is BlogPost => p !== null);
};