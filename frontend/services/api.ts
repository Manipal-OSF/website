import { serverUrl } from '../constants';

export interface Image {
  name: string;
  alt: string;
  width: number;
  height: number;
  ext: string;
  url: string;
}

export interface BlogPost {
  id: number;
  title: string;
  uid: string;
  content: string;
  publishDate: string;
  authors: string[];
  coverImage: Image;
  categories: string[];
}

export const fetchData = async (): Promise<BlogPost[]> => {
  const res = await fetch(`${serverUrl}/api/blogs?populate=*`);
  const json = await res.json();
  const data = json.data;

  return data.map((item: any) => {
    const coverImageData = item.attributes.cover_image.data.attributes;
    const categories = item.attributes.categories.data.map(
      (item: any) => item.attributes.name
    );

    const coverImage: Image = {
      name: coverImageData.name,
      alt: coverImageData.alternativeText,
      width: coverImageData.width,
      height: coverImageData.height,
      ext: coverImageData.ext,
      url: coverImageData.url,
    };

    const blog: BlogPost = {
      id: item.id,
      title: item.attributes.title,
      uid: item.attributes.uid,
      content: item.attributes.content,
      publishDate: item.attributes.publish_date,
      authors: item.attributes.authors.split(','),
      coverImage: coverImage,
      categories: categories,
    };

    return blog;
  });
};
