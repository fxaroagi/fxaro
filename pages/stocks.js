import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function StocksPage({ initialData }) {
  return <FXARO initialView="Markets" marketCategory="Stocks" initialData={initialData} />;
}
