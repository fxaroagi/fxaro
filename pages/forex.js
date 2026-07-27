import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function ForexPage({ initialData }) {
  return <FXARO initialView="Markets" marketCategory="Forex" initialData={initialData} />;
}
