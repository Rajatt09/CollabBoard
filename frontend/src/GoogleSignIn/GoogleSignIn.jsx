import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import {
  updateUserinfo,
  updateLoader,
  updateNotification,
} from "../../utils/counterSlice.js";
import { useState } from "react";
import axios from "axios";
import styled from "styled-components";

const GoogleSignIn = ({ closeModal, emailError, setEmailerror }) => {
  const dispatch = useDispatch();
  const handleLoginSuccess = async (response) => {
    const decodedInfo = jwtDecode(response.credential);

    setEmailerror("");
    dispatch(
      updateLoader({
        loader: true,
      })
    );

    try {
      const result = await axios.post("/users/googleAuth", {
        email: decodedInfo.email,
      });
      dispatch(
        updateUserinfo({
          email: result.data.data.user.email,
          phone: result.data.data.user.phnumber,
          joined: result.data.data.user.createdAt,
          show: true,
        })
      );
      dispatch(
        updateNotification({
          show: true,
          type: "success",
          message: "Account created successfully!",
        })
      );
      closeModal();
    } catch (error) {
      const errorMessage = error.response.data.message;
      setEmailerror(errorMessage);
    } finally {
      dispatch(
        updateLoader({
          loader: false,
        })
      );
    }
  };

  const handleLoginFailure = (error) => {
    console.error("SignUp Failure:", error);
  };

  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: handleLoginFailure,
  });

  return (
    <>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginFailure}
        width="265px"
        text="signup_with"
        logo_alignment="center"
      />
      <Text2 error={emailError}>{emailError}</Text2>
    </>
  );
};

const GoogleLogIn = ({ closeModal }) => {
  const dispatch = useDispatch();
  const handleLoginSuccess = async (response) => {
    const decodedInfo = jwtDecode(response.credential);
    dispatch(
      updateLoader({
        loader: true,
      })
    );

    try {
      const result = await axios.post("/users/googleAuth-Login", {
        email: decodedInfo.email,
      });
      dispatch(
        updateUserinfo({
          email: result.data.data.user.email,
          phone: result.data.data.user.phnumber,
          joined: result.data.data.user.createdAt,
          show: true,
        })
      );
      dispatch(
        updateNotification({
          show: true,
          type: "success",
          message: "You have successfully logged in.",
        })
      );
      closeModal();
    } catch (error) {
      const errorMessage = error.response.data.message;
      setEmailerror(errorMessage);
      console.log("google sign in error :", error);
    } finally {
      dispatch(
        updateLoader({
          loader: false,
        })
      );
    }
  };

  const handleLoginFailure = (error) => {
    console.error("Login Failure:", error);
  };

  return (
    <GoogleLogin
      onSuccess={handleLoginSuccess}
      onError={handleLoginFailure}
      width="265px"
      text="continue_with"
      logo_alignment="center"
      useOneTap
    />
  );
};

const Text2 = styled.p`
  color: red;
  padding-top: 10px;
  text-align: center;
  display: ${({ error }) => (error ? "block" : "none")};
`;

export { GoogleLogIn };

export default GoogleSignIn;
