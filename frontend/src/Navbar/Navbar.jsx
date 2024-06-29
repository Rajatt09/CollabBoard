import React, { useState } from "react";
import styled from "styled-components";
import { FiUser, FiX, FiLogOut } from "react-icons/fi";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserinfo,
  updateLoader,
  updateNotification,
} from "../../utils/counterSlice.js";
import axios from "axios";

const NavBar = ({ openModal }) => {
  const userinfo = useSelector((state) => state.userinfo);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [anim, setAnimation] = useState({
    initial: 0,
    final: 1,
    duration: 0.5,
  });

  const handleProfileClick = () => {
    setShowModal(!showModal);
  };

  const handleProfileClickClose = () => {
    setAnimation({ initial: 1, final: 0, duration: 0.5 });
    setTimeout(() => {
      setAnimation({ initial: 0, final: 1, duration: 0.5 });
      setShowModal(!showModal);
    }, [650]);
  };

  async function logout() {
    updateLoader({
      loader: true,
    });
    try {
      const res = await axios.post(`/users/logout`, {});

      dispatch(
        updateUserinfo({
          email: "",
          phone: "",
          joined: "",
          show: false,
        })
      );

      dispatch(
        updateNotification({
          show: true,
          type: "success",
          message: "You have logged out.",
        })
      );

      setShowModal(!showModal);

      // window.location.href = "/";
    } catch (error) {
      console.log("error occured while logout: ", error);
      window.location.href = "/";
    } finally {
      dispatch(
        updateLoader({
          loader: false,
        })
      );
    }
  }

  return (
    <>
      <NavContainer>
        <Brand href="#home">Collaber</Brand>
        <NavLinks>
          {!userinfo.show ? (
            <SignInButton onClick={openModal}>Sign Up</SignInButton>
          ) : (
            <ProfileIconWrapper onClick={handleProfileClick}>
              <FiUser />
            </ProfileIconWrapper>
          )}
        </NavLinks>
      </NavContainer>

      {showModal && (
        <ModalBackdrop>
          <ModalContent
            initial={{ opacity: anim.initial, y: "-100vh" }}
            animate={{ opacity: anim.final, y: "0" }}
            exit={{ opacity: anim.initial, y: "-100vh" }}
            transition={{ duration: anim.duration }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={handleProfileClickClose}>
              <FiX />
            </CloseButton>
            <ModalHeader>
              <h2>User Profile</h2>
            </ModalHeader>
            <ModalBody>
              <Avatar>
                <FiUser size={64} />
              </Avatar>
              <UserInfo>
                {userinfo.email != "" ? (
                  <p>
                    <strong>Email:</strong> {userinfo.email}
                  </p>
                ) : (
                  ""
                )}
                {userinfo.phone != "" ? (
                  <p>
                    <strong>Phone:</strong> {userinfo.phone}
                  </p>
                ) : (
                  ""
                )}

                <p>
                  <strong>Joined:</strong> {userinfo.joined}
                </p>
              </UserInfo>
            </ModalBody>
            <ModalFooter>
              <LogoutButton onClick={logout}>
                {" "}
                <FiLogOut size={24} /> Logout
              </LogoutButton>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}
    </>
  );
};

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  background: #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Brand = styled.a`
  font-size: 1.5rem;
  color: #3f51b5;
  text-decoration: none;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
`;

const SignInButton = styled.button`
  padding: 11px 32px;
  font-size: 1rem;
  background-color: #3f51b5;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #303f9f;
  }
`;

const ProfileIconWrapper = styled.div`
  background: #e3f2fd;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: #bbdefb;
  }

  svg {
    color: #3f51b5;
    font-size: 1.5rem;
  }
`;

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const CloseButton = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  color: #3f51b5;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #303f9f;
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    color: #3f51b5;
  }
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

const Avatar = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  svg {
    color: #3f51b5;
  }
`;

const UserInfo = styled.div`
  margin-bottom: 1.5rem;
  p {
    margin: 0.5rem 0;
    color: #555;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0.75rem 1.5rem;
  background-color: #ff4081;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e91e63;
  }
`;

export default NavBar;
