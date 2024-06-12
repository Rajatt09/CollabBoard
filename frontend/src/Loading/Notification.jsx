import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { updateNotification } from "../../utils/counterSlice.js";

const Notification = ({ type, message, onClose }) => {
  const userinfo = useSelector((state) => state.userinfo);

  const dispatch = useDispatch();
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(updateNotification({ show: false, type: "", message: "" }));
    }, 5000);

    return () => clearTimeout(timer);
  }, [userinfo.notification.show]);

  return (
    <>
      {userinfo.notification.show && (
        <NotificationContainer
          initial={{ opacity: 1, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.5 }}
          type={userinfo.notification.type}
        >
          <Message>{userinfo.notification.message}</Message>
        </NotificationContainer>
      )}
    </>
  );
};

const fadeInOut = keyframes`
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
`;

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 90px;
  width: fit-content;
  right: 30px;

  background-color: ${({ type }) =>
    type === "success" ? "#52CC99" : "#ff4081"};
  color: white;
  padding: 1rem 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1999;
  animation: ${fadeInOut} 5s forwards;
`;

const Message = styled.p`
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid white;

  font-size: 1.25rem;
  text-align: center;
`;

export default Notification;
