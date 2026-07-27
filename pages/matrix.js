import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function MatrixPage({ initialData }) {
  return <FXARO initialView="Matrix" initialData={initialData} />;
}
