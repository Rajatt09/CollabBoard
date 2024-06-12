// src/components/LandingPage.js

import React from "react";
import styled from "styled-components";
import { Player } from "@lottiefiles/react-lottie-player";
import Button from "react-bootstrap/esm/Button";
import animationData from "../assets/animatedCartoon.json"; // Replace this with the actual path to your Lottie JSON file

const LandingPage = () => {
  return (
    <Container>
      <Content>
        <Description>
          <h1>Welcome to Our Interactive Whiteboard Platform</h1>
          <p>
            Collaborate seamlessly with video calls, chat, and a shared
            whiteboard. Perfect for meetings, brainstorming sessions, and more.
          </p>
          <Button
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#ff7f50",
              border: "none",
            }}
          >
            Get Started
          </Button>
        </Description>
        <AnimationWrapper>
          <Player
            autoplay
            loop
            src={animationData}
            style={{ height: "300px", width: "300px" }}
          />
        </AnimationWrapper>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to right, #6a11cb, #2575fc);
  font-family: "Arial", sans-serif;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  flex-wrap: wrap;
`;

const Description = styled.div`
  flex: 1;
  padding-right: 2rem;
  min-width: 250px;

  h1 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: #555;
    margin-bottom: 2rem;
  }
`;

const CallToActionButton = styled.button`
  background-color: #ff7f50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff6347;
  }
`;

const AnimationWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 250px;
`;

export default LandingPage;
