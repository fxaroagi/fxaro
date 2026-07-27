import FXARO from '../../components/FXARO';

const CATEGORY_MAP = {
  commodities: 'Commodities',
  indexes: 'Indexes',
  stocks: 'Stocks',
  forex: 'Forex',
  crypto: 'Crypto',
  bonds: 'Bonds',
};

export async function getServerSideProps({ params }) {
  return { props: { category: CATEGORY_MAP[params.category] || 'Commodities' } };
}

export default function MarketCategoryPage({ category }) {
  return <FXARO initialView="Markets" marketCategory={category} />;
}
