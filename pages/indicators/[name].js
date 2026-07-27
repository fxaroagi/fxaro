import FXARO from '../../components/FXARO';

export async function getServerSideProps({ params }) {
  return { props: { indicator: params.name } };
}

export default function IndicatorPage({ indicator }) {
  return <FXARO initialView="Indicator" indicator={indicator} />;
}
