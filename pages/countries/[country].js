import FXARO from '../../components/FXARO';

export async function getServerSideProps({ params }) {
  return { props: { country: params.country } };
}

export default function CountryPage({ country }) {
  return <FXARO initialView="Country" country={country} />;
}
