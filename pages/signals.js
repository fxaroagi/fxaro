import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function SignalsPage({ initialData }) {
  return <FXARO initialView="Signals" initialData={initialData} />;
}
