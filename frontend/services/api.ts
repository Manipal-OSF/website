import { serverUrl } from '../constants';

type PostStatus = 'published' | 'draft';

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

export const getUidList = async (): Promise<UidPayload[]> => {
  const res = await fetch(`${serverUrl}/api/posts?populate=*`);
  const json = (await res.json())['docs'];

  const uids = json.map((e: any) => {
    return { params: { uid: e.id } };
  });

  return uids;
};

export const fetchOne = async (uid: string): Promise<BlogPost> => {
  const res = await fetch(`${serverUrl}/api/posts/${uid}?populate=*`);
  const data = await res.json();

  const imageData = data.coverImage;

  const category = data.category;
  const tags = data.tags.map((item: any) => {
    const tag: Tag = {
      id: item.id,
      name: item.name,
    };
    return tag;
  });

  let coverImage: ImageData | string;
  try {
    if (imageData.title === undefined) {
      throw TypeError('No image present');
    }

    coverImage = {
      title: imageData.title,
      alt: imageData.alt,
      width: imageData.width,
      height: imageData.height,
      mimeType: imageData.mimeType,
      url: imageData.url,
    };
  } catch (error: any) {
    coverImage = imageData;
  }

  const post: BlogPost = {
    id: data.id,
    title: data.title,
    content: data.content,
    publishDate: data.publishedDate,
    authors: data.authors.name,
    coverImage: coverImage,
    category: category,
    tags: tags,
    estimatedTime: data.estimatedTime,
  };

  return post;
};

export const fetchData = async (): Promise<BlogPost[]> => {
  const res = await fetch(`${serverUrl}/api/posts?populate=*`);

  const json = await res.json();
  const data = json.docs;

  return data
    .filter((item: any) => item.status == 'published')
    .map((item: any) => {
      const imageData = item.coverImage;
      const category = item.category;
      const tags = item.tags.map((item: any) => {
        const tag: Tag = {
          id: item.id,
          name: item.name,
        };
        return tag;
      });

      let coverImage: ImageData | string;
      try {
        if (imageData.title === undefined) {
          throw TypeError('No image present');
        }

        coverImage = {
          title: imageData.title,
          alt: imageData.alt,
          width: imageData.width,
          height: imageData.height,
          mimeType: imageData.mimeType,
          url: imageData.url,
        };
      } catch (error: any) {
        coverImage = imageData;
      }

      const post: BlogPost = {
        id: item.id,
        title: item.title,
        content: item.content,
        publishDate: item.publishedDate,
        authors: item.authors.name,
        coverImage: coverImage,
        category: category,
        tags: tags,
        estimatedTime: item.estimatedTime,
      };

      return post;
    });
};
