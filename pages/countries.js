import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function CountriesPage({ initialData }) {
  return <FXARO initialView="Countries" initialData={initialData} />;
}
