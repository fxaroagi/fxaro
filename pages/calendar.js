import FXARO from '../components/FXARO';
import { getFxaroServerSideProps } from '../lib/fxaroInitialData';

export const getServerSideProps = getFxaroServerSideProps;

export default function CalendarPage({ initialData }) {
  return <FXARO initialView="Calendar" initialData={initialData} />;
}
