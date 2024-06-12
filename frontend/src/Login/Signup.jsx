import React, { useState, useRef } from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  updateUserinfo,
  updateLoader,
  updateNotification,
} from "../../utils/counterSlice.js";
import GoogleSignIn, { GoogleLogIn } from "../GoogleSignIn/GoogleSignIn.jsx";
import otpSent from "../assets/otpSent.json";
import { Player } from "@lottiefiles/react-lottie-player";

const SignUp = ({ closeModal }) => {
  const [data, setData] = useState({
    email: "",
    phnumber: "",
    password: "",
  });
  const [otpData, setOtpData] = useState({
    otp: "",
    inputOtp: new Array(5).fill(""),
    otpError: "",
    show: false,
  });
  const [errors, setErrors] = useState({
    emailerror: "",
    passworderror: "",
  });
  const [emailError, setEmailerror] = useState("");
  const [anim, setAnimation] = useState({
    initial: 0,
    final: 1,
  });

  const [title, setTitle] = useState("signup");

  const dispatch = useDispatch();
  const inputRefs = useRef([]);

  const url = useParams();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  const createOtp = () => {
    const otp = Math.floor(10000 + Math.random() * 90000);
    setOtpData((prevData) => ({
      ...prevData,
      otp: otp,
    }));
  };

  const handleOtpInput = (e, index) => {
    const { value } = e.target;
    if (/^\d$/.test(value)) {
      const newInputOtp = [...otpData.inputOtp];
      newInputOtp[index] = value;
      setOtpData((prevData) => ({
        ...prevData,
        inputOtp: newInputOtp,
      }));
      if (index < 4) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtp = async (e) => {
    const inputOtpString = otpData.inputOtp.join("");
    setOtpData((prevData) => ({
      ...prevData,
      otpError: "",
    }));
    if (otpData.otp.toString() !== inputOtpString) {
      setOtpData((prevData) => ({
        ...prevData,
        otpError: "The OTP doesn't match. ",
      }));
      return;
    }
    dispatch(
      updateLoader({
        loader: true,
      })
    );
    try {
      const result = await axios.post(`/users/register`, data);

      if (!result) {
        alert("something went wrong in result");
        return;
      }
      setTitle("login");
      setOtpData((prevData) => ({
        ...prevData,
        show: false,
      }));
      dispatch(
        updateNotification({
          show: true,
          type: "success",
          message: "Your account has been created.",
        })
      );
    } catch (error) {
      dispatch(
        updateNotification({
          show: true,
          type: "fail",
          message: "Error! Unable to complete the request.",
        })
      );
    } finally {
      dispatch(
        updateLoader({
          loader: false,
        })
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({
      emailerror: "",
      passworderror: "",
    });
    setEmailerror("");

    if (
      data.email === "" ||
      !(emailRegex.test(data.email) || phoneRegex.test(data.email))
    ) {
      setErrors((prevData) => ({
        ...prevData,
        emailerror: "Email/Phone no. is not valid.",
      }));
      return;
    }
    if (data.password === "") {
      setErrors((prevData) => ({
        ...prevData,
        passworderror: "Password field is empty.",
      }));
      return;
    }

    let updatedData;

    if (phoneRegex.test(data.email)) {
      updatedData = {
        ...data,
        phnumber: data.email,
        email: "",
      };
    } else {
      updatedData = {
        ...data,
      };
    }

    setData(updatedData);

    dispatch(
      updateLoader({
        loader: true,
      })
    );

    if (title === "signup") {
      try {
        const otp = Math.floor(10000 + Math.random() * 90000);

        const mailResult = await axios.post("/users/sendMail", {
          ...updatedData,
          otp: otp,
        });

        if (mailResult.status !== 200) {
          dispatch(
            updateNotification({
              show: true,
              type: "fail",
              message: "Error ! Not able to send mail.",
            })
          );
          return;
        }
        setOtpData((prevData) => ({
          ...prevData,
          otp: otp,
          show: true,
        }));

        return;
      } catch (error) {
        const errorMessage = error.response.data.message;

        setErrors((prevData) => ({
          ...prevData,
          emailerror: errorMessage,
        }));
      } finally {
        dispatch(
          updateLoader({
            loader: false,
          })
        );
      }
    } else if (title === "login") {
      try {
        const result = await axios.post(`/users/login`, updatedData);

        if (!result) {
          return;
        }

        dispatch(
          updateUserinfo({
            email: result.data.data.user.email,
            phone: result.data.data.user.phnumber,
            joined: result.data.data.user.createdAt,
            show: true,
          })
        );
        closeModal();
        dispatch(
          updateNotification({
            show: true,
            type: "success",
            message: "Login is successfull.",
          })
        );
      } catch (error) {
        dispatch(
          updateNotification({
            show: true,
            type: "fail",
            message: "Something went wrong.",
          })
        );
      } finally {
        dispatch(
          updateLoader({
            loader: false,
          })
        );
      }
    }
  };

  return (
    <ModalOverlay
      initial={{ opacity: anim.initial }}
      animate={{ opacity: anim.final }}
      transition={{ duration: 0.4, delay: 0 }}
    >
      <ModalContentWrapper otpdatashow={otpData.show}>
        <ModalContent
          key={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <CloseButton
            onClick={() => {
              setAnimation({ initial: 1, final: 0 });
              setTimeout(() => closeModal(), 1000);
            }}
          >
            &times;
          </CloseButton>

          {!otpData.show && (
            <div>
              <Title>
                {title === "signup" ? "Create an Account" : "Login"}
              </Title>

              <div>
                {" "}
                {title === "signup" ? (
                  <GoogleSignIn
                    setEmailerror={setEmailerror}
                    emailError={emailError}
                    closeModal={closeModal}
                  />
                ) : (
                  <GoogleLogIn closeModal={closeModal} />
                )}
              </div>

              <HorizontalLine>
                <Line />
                <OrText>OR</OrText>
                <Line />
              </HorizontalLine>

              <Form onSubmit={handleSubmit}>
                <Input
                  name="email"
                  error={errors.emailerror}
                  onChange={handleChange}
                  placeholder="Email or Phone number"
                />
                <Text2 error={errors.emailerror}>{errors.emailerror}</Text2>
                <Input
                  name="password"
                  onChange={handleChange}
                  error={errors.passworderror}
                  placeholder="Password"
                />
                <Text2 error={errors.passworderror}>
                  {errors.passworderror}
                </Text2>
                <Button>{title === "signup" ? "Sign Up" : "Log In"}</Button>
              </Form>
              <Text error="">
                {title === "signup"
                  ? "Already have an account?"
                  : "New to CollabBoard?"}{" "}
                <Href
                  onClick={() => {
                    title === "signup" ? setTitle("login") : setTitle("signup");
                    setErrors({
                      emailerror: "",
                      passworderror: "",
                    });
                    setEmailerror("");
                  }}
                >
                  {title === "signup" ? "Log in" : "Sign up"}
                </Href>
              </Text>
            </div>
          )}

          {otpData.show && (
            <OtpContainer
              initial={{ x: "100vw" }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 50 }}
            >
              <OtpTitle>Enter OTP</OtpTitle>
              <ResponsiveOTPplayer autoplay loop src={otpSent} />
              <SuccessMessage>OTP Sent.</SuccessMessage>
              {/* <OtpTitle>Enter OTP</OtpTitle> */}
              <OtpInputWrapper>
                {otpData.inputOtp.map((_, index) => (
                  <OtpInput
                    key={index}
                    type="text"
                    maxLength="1"
                    onChange={(e) => handleOtpInput(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                  />
                ))}
              </OtpInputWrapper>
              <OtpError>{otpData.otpError}</OtpError>
              <OtpButton onClick={handleOtp}>Verify OTP</OtpButton>
            </OtpContainer>
          )}
        </ModalContent>
      </ModalContentWrapper>
    </ModalOverlay>
  );
};

const HorizontalLine = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 1rem 0;
`;

const Line = styled.hr`
  flex: 1;
  border: 0;
  border-top: 2.5px solid #ccc;
`;

const OrText = styled.span`
  margin: 0 1rem;
  color: #777;
  // font-weight: bold;
`;

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
  z-index: 1000;
`;

const ModalContentWrapper = styled.div`
  display: flex;
  justify-content: ${({ otpdatashow }) =>
    otpdatashow ? "flex-start" : "center"};
  align-items: center;
  // width: 80%;
  max-width: 500px;
  transition: justify-content 0.4s ease;
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
  margin-bottom: 2rem;
  margin-top: 1rem;
  color: #3f51b5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 1rem;
  margin-bottom: ${({ error }) => (error ? "0rem" : "1.5rem")};
  border: none;
  border-radius: 10px;
  outline: none;
  background-color: #c5cae9;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #303f9f;
  }
`;

const Text = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #777;
`;

const Text2 = styled.p`
  color: red;
  text-align: center;
  display: ${({ error }) => (error ? "block" : "none")};
`;

const Href = styled.span`
  color: #3f51b5;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;

  &:hover {
    color: #303f9f;
  }
`;

const OtpContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const OtpTitle = styled.h3`
  color: #3f51b5;
  margin-bottom: 1rem;
`;

const OtpInputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const OtpInput = styled.input`
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
  text-align: center;
  border: 2px solid #3f51b5;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #303f9f;
  }
`;

const OtpError = styled.p`
  color: red;
  margin-top: 1rem;
  margin-bottom: 0;
`;

const OtpButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #303f9f;
  }
`;

const ResponsiveOTPplayer = styled(Player)`
  height: 150px;
  width: 150px;
  position: relative;
  top: -20px;
  @media (max-width: 768px) {
    height: 120px;
    width: 120px;
  }
`;

const SuccessMessage = styled.h4`
  position: relative;
  color: #52cc99;
  top: -20px;
`;

export default SignUp;
