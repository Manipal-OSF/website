import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const IndividualBlogPage: NextPage = () => {
  const {
    query: { uid },
  } = useRouter();
  console.log(uid);
  return <div></div>;
};

export default IndividualBlogPage;
