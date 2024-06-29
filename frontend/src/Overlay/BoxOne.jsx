import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const BoxOne = ({ setModal, showModal, saveAsPDF }) => {
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
      <ModalContentWrapper>
        <ModalContent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <CloseButton
            onClick={() => {
              setAnimation({ initial: 1, final: 0 });

              setTimeout(
                () =>
                  setModal({
                    show: false,
                    message: "",
                  }),
                1000
              );
            }}
          >
            &times;
          </CloseButton>

          <Title>{showModal.message}</Title>

          <ButtonWrapper>
            <ConfirmButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setAnimation({ initial: 1, final: 0 });
                if (showModal.message == "Are you want to save as PDF?") {
                  saveAsPDF();
                }
                setTimeout(
                  () =>
                    setModal({
                      show: false,
                      message:
                        showModal.message == "Are you want to save as PDF?"
                          ? ""
                          : "exit",
                    }),
                  1000
                );
              }}
            >
              Confirm
            </ConfirmButton>
          </ButtonWrapper>
        </ModalContent>
      </ModalContentWrapper>
    </ModalOverlay>
  );
};

const ModalOverlay = styled(motion.div)`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
`;

const ModalContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(motion.div)`
  background-color: #fff;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  width: 100%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0px;
  right: 10px;
  background: none;
  border: none;
  color: #3f51b5;
  font-weight: bold;
  font-size: 2rem;
  cursor: pointer;
`;

const Title = styled.h2`
  text-align: center;
  margin: 1.5rem 0rem;
  color: #3f51b5;
  font-size: 1.4rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const ConfirmButton = styled(motion.button)`
  padding: 0.7rem 2rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #303f9f;
  }
`;

export default BoxOne;
