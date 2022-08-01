import type { NextPage } from 'next';
import Head from 'next/head';
import BlogCard from '../components/BlogCard';
import { serverUrl } from '../constants';

interface Image {
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

export async function getServerSideProps(
  context: any
): Promise<{ props: { data: BlogPost[] } }> {
  const res = await fetch(`${serverUrl}/api/blogs?populate=*`);
  const json = await res.json();
  const data = json.data;

  return {
    props: {
      data: data.map((item: any) => {
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
      }),
    },
  };
}

const Blog: NextPage<{ data: BlogPost[] }> = (props) => {
  const posts = props.data;
  return (
    <>
      <Head>
        <title>Manipal OSF | Blog</title>
      </Head>
      <div className='flex flex-col flex-grow-[1] gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 dark:text-white'>
        <h1 className='text-5xl text-center'>Featured</h1>
        <div className='grid grid-cols-3 gap-5'>
          {posts.map((item: BlogPost, index) => (
            <BlogCard data={item} index={index} key={index} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
