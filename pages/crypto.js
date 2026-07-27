import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function CryptoPage({ initialData }) {
  return <FXARO initialView="Markets" marketCategory="Crypto" initialData={initialData} />;
}
