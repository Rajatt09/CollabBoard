import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../assets/LoaderAnimation.json";
import styled from "styled-components";

const MainLoader = () => {
  return (
    <Loader>
      <ResponsivePlayer autoplay loop src={animationData} />
    </Loader>
  );
};

const Loader = styled.div`
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
  height: 150px;
  width: 150px;

  transform: rotate(-30deg);
  @media (max-width: 768px) {
    transform: rotate(-20deg);

    height: 100px;
    width: 100px;
  }
`;

export default MainLoader;
