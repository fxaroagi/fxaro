import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function BondsPage({ initialData }) {
  return <FXARO initialView="Markets" marketCategory="Bonds" initialData={initialData} />;
}
