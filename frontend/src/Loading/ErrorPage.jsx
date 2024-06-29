import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../assets/ErrorAnimation.json";
import styled from "styled-components";

const ErrorPage = () => {
  return (
    <ErrorDiv>
      <ResponsivePlayer autoplay loop src={animationData} />
    </ErrorDiv>
  );
};

const ErrorDiv = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  position: fixed;
  z-index: 4000;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
`;

const ResponsivePlayer = styled(Player)`
  width: 900px;

  @media (max-width: 768px) {
    width: 100vw;
  }
`;

export default ErrorPage;
