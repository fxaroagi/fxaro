import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function MarketsPage({ initialData }) {
  return <FXARO initialView="Markets" initialData={initialData} />;
}
