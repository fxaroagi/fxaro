import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>FXARO – AI Trading Signals for NASDAQ, Gold, Crypto & Forex</title>
        <meta name="description" content="AI-powered trading signals and analysis for NASDAQ stocks, Gold, Cryptocurrency, Forex, and Commodities. Get real-time market insights powered by Claude AI." />
        <meta name="keywords" content="trading signals, AI trading, stock signals, crypto signals, forex signals, market analysis" />
        <link rel="canonical" href="https://fxaro.com/" />
        <meta property="og:title" content="FXARO – AI Trading Signals" />
        <meta property="og:description" content="Professional trading intelligence powered by Claude AI" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fxaro.com/" />
        <meta property="og:image" content="https://fxaro.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FXARO – AI Trading Signals" />
        <meta name="twitter:description" content="Professional trading intelligence powered by Claude AI" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="FXARO" />
        <meta name="theme-color" content="#070b14" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
