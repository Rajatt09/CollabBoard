import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  FiHome,
  FiInfo,
  FiSettings,
  FiLogOut,
  FiFile,
  FiFolder,
} from "react-icons/fi";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../assets/animatedCartoon2.json";
import animationData0 from "../assets/animatedCartoon7.json";
import { Link, useNavigate } from "react-router-dom";
import BoardBox from "../Overlay/BoardBox";
import { useSelector, useDispatch } from "react-redux";
import { updateLoader, updateNotification } from "../../utils/counterSlice";
import ApiCall from "../../utils/ApiCall";

const Dashboard = ({ openModal }) => {
  const [activeIcon, setActiveIcon] = useState("home");
  const [showBox, setshowBox] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const userinfo = useSelector((state) => state.userinfo);
  const [data, setData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleIconClick = (icon) => {
    setActiveIcon(icon);
  };

  const openPasswordModal = () => {
    setError("");
    setShowPasswordModal(true);
    setIsClosing(false);
  };

  const closePasswordModal = () => {
    setIsClosing(true);
    handleIconClick("home");
    setTimeout(() => {
      setShowPasswordModal(false);
    }, 300); // Duration of fadeOut animation
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError("");

    if (data.newPassword !== data.confirmPassword) {
      setError("Both fields not matched.");
      return;
    }
    if (data.newPassword == "") {
      setError("Password not valid.");
      return;
    }

    dispatch(
      updateLoader({
        loader: true,
      })
    );

    try {
      const response = await ApiCall(
        "/users/changePassword",
        "POST",
        { newPassword: data.newPassword },
        dispatch
      );
      console.log("hello don", response);

      dispatch(
        updateNotification({
          show: true,
          type: "success",
          message: `Password changed successfully.`,
        })
      );
    } catch (error) {
      dispatch(
        updateNotification({
          show: true,
          type: "failure",
          message: `Error changing password.`,
        })
      );
    } finally {
      dispatch(
        updateLoader({
          loader: false,
        })
      );
      setShowPasswordModal(false);
      closePasswordModal();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div>
      <Container>
        {showBox ? <BoardBox setshowBox={setshowBox} /> : ""}
        {showPasswordModal && (
          <PasswordModalOverlay isclosing={isClosing}>
            <PasswordModal>
              <CloseButton onClick={closePasswordModal}>&times;</CloseButton>
              <h2 style={{ textAlign: "center", color: "#3f51b5" }}>
                Change Password
              </h2>
              <form onSubmit={handlePasswordChange}>
                <InputWrapper>
                  <label>New Password</label>
                  <input
                    type="text"
                    name="newPassword"
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper>
                  <label>Confirm New Password</label>
                  <input
                    type="text"
                    name="confirmPassword"
                    onChange={handleChange}
                  />
                </InputWrapper>
                <Text2 error={error}>{error}</Text2>
                <SubmitButton type="submit">Change Password</SubmitButton>
              </form>
            </PasswordModal>
          </PasswordModalOverlay>
        )}
        <Sidebar>
          <NavMenu>
            <NavItem
              active={activeIcon === "home"}
              onClick={() => handleIconClick("home")}
            >
              <FiHome />
              <span>Home</span>
            </NavItem>
            <NavItem
              to="/collabstore"
              active={activeIcon === "files"}
              onClick={() => {
                if (userinfo.email == "" || !userinfo.email) {
                  openModal();
                } else {
                  navigate("/collabstore");
                  handleIconClick("files");
                }
              }}
            >
              <FiFolder />

              <span>Files</span>
            </NavItem>
            <NavItem
              active={activeIcon === "about"}
              onClick={() => {
                handleIconClick("about");
                navigate("/about-collabBoard");
              }}
            >
              <FiInfo />
              <span>About</span>
            </NavItem>
            <NavItem
              active={activeIcon === "settings"}
              onClick={() => {
                if (userinfo.email == "" || !userinfo.email) {
                  openModal();
                } else {
                  handleIconClick("settings");
                  openPasswordModal();
                }
              }}
            >
              <FiSettings />
              <span>Settings</span>
            </NavItem>
            {/* <NavItem
              active={activeIcon === "logout"}
              onClick={() => handleIconClick("logout")}
            >
              <FiLogOut />
              <span>Logout</span>
            </NavItem> */}
          </NavMenu>
        </Sidebar>
        <Content>
          <Description>
            <h1>Welcome to Collaber</h1>
            <p>
              Collaborate in real-time with video calls, and chat features,
              whiteboard. Perfect for team meetings, brainstorming sessions, and
              online learning.
            </p>
            <ButtonContainer>
              <ActionButton
                onClick={() => {
                  if (userinfo.email == "") {
                    openModal();
                  } else {
                    navigate("/collabmeet/lobby");
                  }
                }}
              >
                Create Session
              </ActionButton>
              <LinkBox onClick={() => setshowBox(true)}>Start Working</LinkBox>
            </ButtonContainer>
          </Description>
          <ResponsivePlayer0 autoplay loop src={animationData0} />
          {/* <ResponsivePlayer1 autoplay loop src={animationData2} /> */}
          <ResponsivePlayer2 autoplay loop src={animationData} />
        </Content>
      </Container>
      <BottomNav>
        <BottomNavItem
          active={activeIcon === "home"}
          onClick={() => handleIconClick("home")}
        >
          <FiHome />
          <span>Home</span>
        </BottomNavItem>

        <BottomNavItem
          active={activeIcon === "about"}
          onClick={() => {
            handleIconClick("about");
            navigate("/about-collabBoard");
          }}
        >
          <FiInfo />
          <span>About</span>
        </BottomNavItem>
        <BottomNavItem
          active={activeIcon === "files"}
          onClick={() => {
            if (userinfo.email == "" || !userinfo.email) {
              openModal();
            } else {
              navigate("/collabstore");
              handleIconClick("files");
            }
          }}
        >
          <FiFolder />
          <span>Files</span>
        </BottomNavItem>
        <BottomNavItem
          active={activeIcon === "settings"}
          onClick={() => {
            if (userinfo.email == "" || !userinfo.email) {
              openModal();
            } else {
              handleIconClick("settings");
              openPasswordModal();
            }
          }}
        >
          <FiSettings />
          <span>Settings</span>
        </BottomNavItem>
        {/* <BottomNavItem
          active={activeIcon === "logout"}
          onClick={() => handleIconClick("logout")}
        >
          <FiLogOut />
          <span>Logout</span>
        </BottomNavItem> */}
      </BottomNav>
    </div>
  );
};

const Text2 = styled.p`
  color: red;
  text-align: center;
  display: ${({ error }) => (error ? "block" : "none")};
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #f0f2f5;
  padding-top: 58px;
  @media (max-width: 768px) {
    flex-direction: column;
    padding-top: 0;
  }
`;

const Sidebar = styled.div`
  background: #3f51b5;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
  margin: 2rem 0rem;
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavMenu = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  background: ${({ active }) => (active ? "#303f9f" : "none")};
  margin: 0rem 1rem;
  border-radius: 15px;

  &:hover {
    background: ${({ active }) => (active ? "#303f9f" : "#3f51b5")};
    transform: ${({ active }) => (active ? "none" : "translateX(5px)")};
  }

  span {
    margin-left: 1rem;
  }
`;

const Content = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 2rem;
  @media (max-width: 768px) {
    margin: 5.1rem 1rem 4.5rem 1rem;
    padding: 1rem;
  }
`;

const Description = styled.div`
  max-width: 600px;
  text-align: center;
  position: relative;
  z-index: 200;

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

const ResponsivePlayer0 = styled(Player)`
  position: absolute;
  height: 500px;
  width: 500px;
  left: -50px;
  top: -120px;
  transform: rotate(-30deg);
  @media (max-width: 768px) {
    transform: rotate(-20deg);
    top: -85px;
    left: -10px;
    height: 320px;
    width: 320px;
  }
`;

const ResponsivePlayer1 = styled(Player)`
  position: absolute;
  height: 500px;
  width: 500px;
  left: -80px;
  top: -80px;
  transform: rotate(-200deg);
  @media (max-width: 768px) {
    left: -50px;
    height: 300px;
    width: 300px;
  }
`;
const ResponsivePlayer2 = styled(Player)`
  position: absolute;
  height: 500px;
  width: 500px;
  right: -50px;
  bottom: -150px;
  transform: rotate(-20deg);
  @media (max-width: 768px) {
    right: 0px;
    bottom: -140px;
    transform: rotate(0deg);
    height: 400px;
    width: 400px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  background-color: #3f51b5;
  color: white;
  padding: 0.75rem 1.5rem;

  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #303f9f;
  }

  @media (max-width: 768px) {
    margin: 0rem 2rem;
  }
`;
const LinkBox = styled(Link)`
  background-color: #3f51b5;
  color: white;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #303f9f;
  }

  @media (max-width: 768px) {
    margin: 0rem 2rem;
  }
`;

const BottomNav = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #3f51b5;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 55px;
  @media (min-width: 768px) {
    display: none;
  }
`;

const BottomNavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 10px;
  position: relative;

  span {
    font-size: 0.75rem;
    margin-top: 3px;
    @media (min-width: 768px) {
      display: none;
    }
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;
const PasswordModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${({ isclosing }) => (isclosing ? fadeOut : fadeIn)} 0.3s
    ease-in-out;
  z-index: 1000;
`;

const PasswordModal = styled.div`
  background: white;
  position: relative;
  padding: 2rem;
  margin: 0px 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  animation: ${({ isclosing }) => (isclosing ? fadeOut : fadeIn)} 0.3s
    ease-in-out;

  h2 {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const CloseButton = styled.span`
  position: absolute;
  top: 0px;
  right: 12px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  color: #3f51b5;
`;

const InputWrapper = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
  }
`;

const SubmitButton = styled.button`
  background-color: #3f51b5;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background-color: #303f9f;
  }
`;

export default Dashboard;
