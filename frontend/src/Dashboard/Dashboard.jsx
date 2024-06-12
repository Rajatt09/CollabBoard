import React, { useState } from "react";
import styled from "styled-components";
import { FiHome, FiInfo, FiSettings, FiLogOut } from "react-icons/fi";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../assets/animatedCartoon2.json";
import animationData2 from "../assets/animatedCartoon6.json";
import animationData0 from "../assets/animatedCartoon7.json";

const Dashboard = () => {
  const [activeIcon, setActiveIcon] = useState(null);

  const handleIconClick = (icon) => {
    setActiveIcon(icon);
  };

  return (
    <div>
      <Container>
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
              active={activeIcon === "about"}
              onClick={() => handleIconClick("about")}
            >
              <FiInfo />
              <span>About</span>
            </NavItem>
            <NavItem
              active={activeIcon === "settings"}
              onClick={() => handleIconClick("settings")}
            >
              <FiSettings />
              <span>Settings</span>
            </NavItem>
            <NavItem
              active={activeIcon === "logout"}
              onClick={() => handleIconClick("logout")}
            >
              <FiLogOut />
              <span>Logout</span>
            </NavItem>
          </NavMenu>
        </Sidebar>
        <Content>
          <Description>
            <h1>Welcome to CollabBoard</h1>
            <p>
              Collaborate in real-time with interactive whiteboard, video calls,
              and chat features. Perfect for team meetings, brainstorming
              sessions, and online learning.
            </p>
            <ButtonContainer>
              <ActionButton>Create Session</ActionButton>
              <ActionButton>Start Working</ActionButton>
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
          onClick={() => handleIconClick("about")}
        >
          <FiInfo />
          <span>About</span>
        </BottomNavItem>
        <BottomNavItem
          active={activeIcon === "settings"}
          onClick={() => handleIconClick("settings")}
        >
          <FiSettings />
          <span>Settings</span>
        </BottomNavItem>
        <BottomNavItem
          active={activeIcon === "logout"}
          onClick={() => handleIconClick("logout")}
        >
          <FiLogOut />
          <span>Logout</span>
        </BottomNavItem>
      </BottomNav>
    </div>
  );
};

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

  // &::after {
  //   content: "";
  //   position: absolute;
  //   bottom: 0;
  //   left: 0;
  //   right: 0;
  //   height: 2px;
  //   background: white;
  //   opacity: 0;
  //   transition: opacity 0.3s;
  // }

  // &:hover::after {
  //   opacity: 1;
  // }

  span {
    font-size: 0.75rem;
    margin-top: 3px;
    @media (min-width: 768px) {
      display: none;
    }
  }
`;

export default Dashboard;
