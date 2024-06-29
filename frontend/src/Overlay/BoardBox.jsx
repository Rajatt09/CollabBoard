import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const BoardBox = ({ setshowBox }) => {
  const [anim, setAnimation] = useState({
    initial: 0,
    final: 1,
  });

  return (
    <ModalOverlay
      initial={{ opacity: anim.initial }}
      animate={{ opacity: anim.final }}
      transition={{ duration: 0.4, delay: 0 }}
    >
      <CloseButton
        onClick={() => {
          setAnimation({ initial: 1, final: 0 });
          setTimeout(() => setshowBox(false), 1000);
        }}
      >
        &times;
      </CloseButton>
      <ModalContentWrapper>
        <Link
          to="/user/blackboard"
          style={{ textDecoration: "none" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {" "}
          <Title>Black Board</Title>
          <HoverBox
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {}}
          >
            <ModalContent1></ModalContent1>
          </HoverBox>
        </Link>
        <Link
          to="/user/whiteboard"
          style={{ textDecoration: "none" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {" "}
          <Title>White Board</Title>
          <HoverBox
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {}}
          >
            <ModalContent></ModalContent>
          </HoverBox>
        </Link>
      </ModalContentWrapper>
    </ModalOverlay>
  );
};

const ModalOverlay = styled(motion.div)`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.95);
  z-index: 2000;
`;

const ModalContentWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  margin: 0px 30px;
  height: 100vh;
  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0px;
  right: 10px;
  background: none;
  border: none;
  color: #e3f2fd;
  font-weight: bold;
  font-size: 2rem;
  cursor: pointer;
`;

const HoverBox = styled(motion.div)`
  border: 5px solid #e3f2fd;
  width: 370px;
  padding: 5px;
  border-radius: 30px;
  cursor: pointer;
  margin: 0px 20px;

  &:hover {
    // opacity: 0.9;
    // background-color: rgba(255, 255, 255, 0.7);
  }
`;

const ModalContent1 = styled(motion.div)`
  background-color: #31343a;
  padding: 2rem;
  min-height: 190px;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  width: 100%;
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  padding: 2rem;
  min-height: 190px;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  width: 100%;
`;

const Title = styled.h2`
position ; relative;

  text-align: center;
  margin: -40px 0px 40px 0px;
  color: #e3f2fd;
  font-size: 2rem;
`;

export default BoardBox;
