import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />{" "}
        <link
          href="https://fonts.googleapis.com/css2?family=Bowlby+One+SC&family=Caesar+Dressing&family=Miltonian+Tattoo&family=New+Rocker&family=Oleo+Script:wght@400;700&family=UnifrakturCook:wght@700&family=UnifrakturMaguntia&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
