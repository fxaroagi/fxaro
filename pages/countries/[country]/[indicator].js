import FXARO from '../../../components/FXARO';

export async function getServerSideProps({ params }) {
  return { props: { country: params.country, indicator: params.indicator } };
}

export default function CountryIndicatorPage({ country, indicator }) {
  return <FXARO initialView="Country" country={country} indicator={indicator} />;
}
