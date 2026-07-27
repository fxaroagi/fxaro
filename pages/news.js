import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function NewsPage({ initialData }) {
  return <FXARO initialView="News" initialData={initialData} />;
}
