import React from "react";
import styled, { keyframes } from "styled-components";
import { useSelector } from "react-redux";
import { updateLoader } from "../../utils/counterSlice.js";

const InnerLoading = () => {
  const userinfo = useSelector((state) => state.userinfo);

  return (
    <div>
      <LoaderContainer innerloadershow={userinfo.loader.toString()}>
        <Spinner>
          <Ball />
          <Ball />
          <Ball />
        </Spinner>
        <LoaderText>Please wait for a while ...</LoaderText>
      </LoaderContainer>
    </div>
  );
};

const LoaderContainer = styled.div`
  position: fixed;
  width: 100vw;
  top: 0;
  z-index: 2001;
  display: ${({ innerloadershow }) =>
    innerloadershow === "true" ? "flex" : "none"};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  //   background: #f0f2f5;
  background: rgba(0, 0, 0, 0.5);
`;

const Spinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const bounce = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
`;

const Ball = styled.div`
  width: 20px;
  height: 20px;
  margin: 0 5px;
  background-color: white;
  border-radius: 50%;
  animation: ${bounce} 0.6s infinite alternate;
`;

const LoaderText = styled.h2`
  font-size: 1.5rem;
  color: white;
  text-align: center;
`;

export default InnerLoading;
