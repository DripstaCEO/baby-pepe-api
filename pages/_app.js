import Layout from "../components/Layout";
import Head from "next/head";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>BabyPepe</title>
        <meta property="og:title" content="BabyPepe" key="og_title" />
        <meta name="twitter:title" content="BabyPepe" key="twitter_title" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="BabyPepe" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://babypepe.com/" />
        <meta property="og:description" content="BabyPepe" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://babypepe.com/" />
        <meta property="twitter:description" content="BabyPepe" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
        <link rel="manifest" href="/images/site.webmanifest" />
        <link rel="mask-icon" href="/images/safari-pinned-tab.svg" color="#da532c" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#da532c" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/>
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet" /> 
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
