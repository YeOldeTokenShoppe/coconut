import "../../styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import Header from "../components/Header";
import { ThirdwebProvider } from "@/utilities/thirdweb";
import { ChakraProvider } from "@chakra-ui/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <ThirdwebProvider>
        <ChakraProvider>
          <Header />
          <Component {...pageProps} />
        </ChakraProvider>
      </ThirdwebProvider>
    </ClerkProvider>
  );
}

export default MyApp;
