import "../../styles/globals.css";
import "../../styles/RotatingText.css";
import "../../styles/Carousel.css";
import "../../styles/candle.css";
import "../../styles/Carousel8.module.css";
import "../../styles/gradientEffect.css";
import "../../styles/matrix.css";
import "../../styles/RotatingText.css";
import "../../styles/shimmerbutton.css";
import "../../styles/wallpaper.css";
import "../../styles/sg.css";
import "../../styles/fireButton.css";
import "../../styles/sparkle.css";
import "../../styles/stars.css";
import "../../styles/stars2.css";
import "../../styles/safaristars.css";
import "../../styles/coin.css";
import "firebaseui/dist/firebaseui.css";
import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@/utilities/thirdweb";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Header2 from "../components/Header2";

const theme = extendTheme({
  breakpoints: {
    sm: "30em",
    md: "38em",
    lg: "62em",
    xl: "80em",
  },
  styles: {
    global: {
      "html, body": {
        backgroundColor: "#1b1724",
        color: "white",
        fontFamily: "'Miltonian Tattoo', sans-serif",
        fontSize: "xxl-large",
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isIndexPage = router.pathname === "/";
  const isNumerologyPage = router.pathname === "/numerology";

  let HeaderComponent = null;

  if (!isIndexPage) {
    HeaderComponent = isNumerologyPage ? Header2 : Header;
  }

  return (
    <>
      <ThirdwebProvider>
        <ChakraProvider theme={theme}>
          <Head>
            <title>𝓞𝖚𝖗 𝕷𝖆𝖉𝖞 𝔬𝔣 𝕻𝖊𝖗𝖕𝖊𝖙𝖚𝖆𝖑 𝕻𝖗𝖔𝖋𝖎𝖙,</title>
            <meta name="description" content="A token to believe in." />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <div className="app-container">
            <div
              style={{
                width: "100%",

                margin: "0",
              }}
            >
              {HeaderComponent && <HeaderComponent />}
              <Component {...pageProps} />
            </div>
          </div>
        </ChakraProvider>
      </ThirdwebProvider>
    </>
  );
}

export default MyApp;
