import type { Metadata } from 'next';
import UnderDev from '../../components/UnderDev';

export const metadata: Metadata = { title: 'Under development' };

const Team = () => {
  return <UnderDev />;
};

export default Team;
