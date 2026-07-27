import { cached, fetchJson, numberOrNull } from '../../lib/market-sources';

const TTL = 24 * 60 * 60 * 1000;

const COUNTRIES = [
  ['US', 'United States'],
  ['GB', 'United Kingdom'],
  ['EUU', 'European Union'],
  ['XC', 'Euro Area'],
  ['DE', 'Germany'],
  ['JP', 'Japan'],
  ['CN', 'China'],
  ['IN', 'India'],
  ['FR', 'France'],
  ['RU', 'Russia'],
  ['IT', 'Italy'],
  ['CA', 'Canada'],
  ['BR', 'Brazil'],
  ['ES', 'Spain'],
];

const INDICATORS = {
  gdp: 'NY.GDP.MKTP.CD',
  gdpGrowth: 'NY.GDP.MKTP.KD.ZG',
  interestRate: 'FR.INR.RINR',
  inflation: 'FP.CPI.TOTL.ZG',
  unemployment: 'SL.UEM.TOTL.ZS',
  govBudget: 'GC.BAL.CASH.GD.ZS',
  debtGdp: 'GC.DOD.TOTL.GD.ZS',
  population: 'SP.POP.TOTL',
};

function latestValue(payload) {
  const rows = payload?.[1] || [];
  const hit = rows.find((row) => row.value != null);
  return numberOrNull(hit?.value);
}

async function countryIndicator(country, indicator) {
  const data = await fetchJson(`https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=8`);
  return latestValue(data);
}

async function loadIndicators() {
  const countries = await Promise.all(COUNTRIES.map(async ([code, country]) => {
    const entries = await Promise.all(Object.entries(INDICATORS).map(async ([key, indicator]) => {
      try {
        return [key, await countryIndicator(code, indicator)];
      } catch {
        return [key, null];
      }
    }));
    return { code, country, ...Object.fromEntries(entries) };
  }));

  return { updatedAt: new Date().toISOString(), source: 'World Bank API', countries };
}

export default async function handler(_req, res) {
  try {
    const payload = await cached('economic-indicators', TTL, loadIndicators);
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
    res.status(200).json(payload);
  } catch (error) {
    res.status(502).json({ updatedAt: new Date().toISOString(), countries: [], error: error.message });
  }
}
