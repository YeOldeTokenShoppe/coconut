"use client";
import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Skeleton } from "@chakra-ui/react";
import Image from "next/image";

const scrollUrl = "/html/scroll.html";

function Thesis({ setThesisLoaded }) {
  useEffect(() => {
    // Simulate async data or image loading
    const loadThesisContent = async () => {
      // Example: simulate loading (replace with real logic)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setThesisLoaded(true); // Notify parent that loading is complete
    };

    loadThesisContent();
  }, [setThesisLoaded]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [iframeHeight, setIframeHeight] = useState("40vh");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  useEffect(() => {
    if (windowWidth < 400) {
      setIframeHeight("50vh");
    } else {
      setIframeHeight("40vh");
    }
  }, [windowWidth]);

  return (
    <>
      <Box py={{ base: 0, md: 8 }}>
        <Flex
          direction={["column-reverse", "column-reverse", "row-reverse"]}
          align="center"
        >
          <Box
            mt={5}
            flex={["1 0 100%", "1 0 100%", "1 0 50%"]}
            minH={{ base: "300px", md: "auto" }}
          >
            <iframe
              src={scrollUrl}
              style={{
                width: "400px",
                height: windowWidth < 400 ? "48vh" : "42vh",
                border: "none",
              }}
              allowFullScreen
              title="Scroll"
            />
          </Box>
          <Box
            flex={["1 0 100%", "1 0 100%", "1 0 50%"]}
            textAlign={["center", "center", "left"]}
            justifyContent="center"
            display="flex"
            flexDirection="column"
            alignItems="center"
            pl={[0, 0, 5, 12]}
          >
            <h1 style={{ fontSize: "3em" }}>Thesis</h1>
            <Text fontSize="lg" mb={5} ml={8}>
              A treatise in which we discuss ethics, economics, metaphysics and
              the future of the{" "}
              <span style={{ fontFamily: "Oleo Script" }}>{" RL80 "}</span>{" "}
              token.
            </Text>
            <Skeleton isLoaded={imageLoaded}>
              <Image
                src="/crier.png"
                alt="crier"
                height="250"
                width="250"
                onLoad={() => setImageLoaded(true)}
              />
            </Skeleton>
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export default Thesis;
