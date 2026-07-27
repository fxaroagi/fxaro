import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function CommoditiesPage({ initialData }) {
  return <FXARO initialView="Markets" marketCategory="Commodities" initialData={initialData} />;
}
