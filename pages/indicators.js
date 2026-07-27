import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function IndicatorsPage({ initialData }) {
  return <FXARO initialView="Indicators" initialData={initialData} />;
}
