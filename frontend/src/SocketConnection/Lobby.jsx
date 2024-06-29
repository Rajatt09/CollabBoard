import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateMeetinginfo, updateUserName } from "../../utils/counterSlice.js";
import { motion, AnimatePresence } from "framer-motion";
import animationData8 from "../assets/animatedCartoon8.json";
import { Player } from "@lottiefiles/react-lottie-player";

const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL, {
  withCredentials: true,
});
let myOffer;

const Lobby = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isAdmin, setIsAdmin] = useState(true);
  const [host, setHost] = useState("");
  const [errors, setErrors] = useState({
    name1error: "",
    nameerror: "",
    meetingerror: "",
  });
  const userinfo = useSelector((state) => state.userinfo);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleRoomJoined = ({ roomId, admin }) => {
    if (admin) {
      navigate(`/collabmeet/${roomId}`, { state: { myOffer } });
    } else {
      setIsAdmin(false);
    }
  };

  const handlePermission = ({
    roomId,
    allow,
    offer,
    from,
    email,
    myEmail,
    other,
  }) => {
    console.log("handlePermission called: ", roomId, "allow is : ", allow);
    console.log("offer is: ", offer, "from: ", from);
    myOffer = {
      offer: offer,
      from: from,
      email: email,
      myEmail: myEmail,
      other: other,
    };
    if (allow) {
      navigate(`/collabmeet/${roomId}`, { state: { myOffer } });
    } else {
      alert("request rejected");
      setIsAdmin(true);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    setEmail(userinfo.email);
    console.log("email is: ", email);
    dispatch(
      updateUserName({
        name: name,
      })
    );
    if (name == "") {
      setErrors((prevData) => ({
        ...prevData,
        name1error: "Please enter your name",
      }));
      return;
    }
    if (roomId == "") {
      setErrors((prevData) => ({
        ...prevData,
        meetingerror: "Please enter meeting ID",
      }));
      return;
    }
    let hostStatus = false;
    if (host == roomId) {
      hostStatus = true;
    }
    socket.emit("join-room", {
      roomId,
      name,
      email: userinfo.email,
      hostStatus,
    });
  };

  useEffect(() => {
    socket.on("me", ({ id }) => {
      console.log("id is: ", id);
    });
    socket.on("joined-room", handleRoomJoined);
    socket.on("permission-status", handlePermission);

    return () => {
      socket.off("joined-room", handleRoomJoined);
      socket.off("permission-status", handlePermission);
    };
  }, [socket, handleRoomJoined, handlePermission]);

  const createMeeting = (event) => {
    event.preventDefault();
    setEmail(userinfo.email);
    dispatch(
      updateUserName({
        name: name,
      })
    );
    if (name == "") {
      setErrors((prevData) => ({
        ...prevData,
        nameerror: "Please enter your name",
      }));
      return;
    }
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < 14; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    console.log("create meeting called: ", userinfo.email, " name is: ", name);

    setHost(result);
    console.log("result is: ", result);
    dispatch(updateMeetinginfo({ host: result }));

    socket.emit("join-room", {
      roomId: result,
      name: name,
      email: userinfo.email,
      hostStatus: true,
    });
  };

  const handleModalToggle = (e) => {
    e.preventDefault();
    setModalOpen(!isModalOpen);
  };

  const createParticles = () => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push(
        <Particle
          key={i}
          left={Math.random() * 100}
          delay={Math.random() * 10}
        />
      );
    }
    return particles;
  };

  return (
    <LobbyContainer>
      {createParticles()}
      <ResponsivePlayer autoplay loop src={animationData8} />
      <ResponsivePlayer1 autoplay loop src={animationData8} />
      {!isAdmin && (
        <PleaseWaitOverlay>
          <Spinner>
            <Ball />
            <Ball />
            <Ball />
          </Spinner>
          <LoaderText>Waiting for host permission</LoaderText>
        </PleaseWaitOverlay>
      )}
      <Card
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Join a Meeting</Title>
        <Form>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            <Text2 error={errors.name1error}>{errors.name1error}</Text2>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="meetingId">Meeting ID</Label>
            <Input
              id="meetingId"
              type="text"
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Meeting ID"
            />
            <Text2 error={errors.meetingerror}>{errors.meetingerror}</Text2>
          </FormGroup>
          <ButtonContainer>
            <JoinButton onClick={handleJoinRoom}>Join Meeting</JoinButton>
            <CreateButton onClick={handleModalToggle}>
              Create Meeting
            </CreateButton>
          </ButtonContainer>
        </Form>
      </Card>
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ModalContent
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {" "}
              <CloseButton onClick={handleModalToggle}>&times;</CloseButton>
              <Title>Create a New Meeting</Title>
              <ModalForm>
                <ModalFormGroup>
                  <Label htmlFor="modalName">Name</Label>
                  <Input
                    id="modalName"
                    type="text"
                    placeholder="Enter your name"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Text2 error={errors.nameerror}>{errors.nameerror}</Text2>
                </ModalFormGroup>
                <ModalButton onClick={createMeeting}>
                  Create and Join
                </ModalButton>
              </ModalForm>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </LobbyContainer>
  );
};

const ResponsivePlayer = styled(Player)`
  position: absolute;
  height: 500px;
  width: 500px;
  left: -50px;
  top: -55px;
  opacity: 0.4;
  transform: rotate(-0deg);
  @media (max-width: 768px) {
    transform: rotate(-0deg);
    top: -240px;
    left: 0px;
    height: 480px;
    width: 400px;
  }
`;
const ResponsivePlayer1 = styled(Player)`
  position: absolute;
  height: 500px;
  width: 500px;
  right: -40px;
  bottom: -80px;
  opacity: 0.7;
  transform: rotate(-0deg);
  @media (max-width: 768px) {
    transform: rotate(-0deg);
    right: 10px;
    bottom: -260px;
    height: 480px;
    width: 400px;
  }
`;

const particleAnimation = keyframes`
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
`;

const Particle = styled.div`
  position: absolute;
  bottom: -10px;
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: ${particleAnimation} 10s linear infinite;
  animation-delay: ${(props) => props.delay}s;
  left: ${(props) => props.left}%;
`;

const LobbyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(0deg, #7986cb 0%, #3f51b5 60%, #3f51b5 100%);
  font-family: "Arial", sans-serif;
  padding: 1rem;
  position: relative;
  z-index: 1001;
  overflow: hidden;
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

const Text2 = styled.p`
  color: red;
  padding-top: 5px;
  display: ${({ error }) => (error ? "block" : "none")};
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

const Card = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
  margin-top: 1rem;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  margin-top: 1rem;
  color: #3f51b5;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #3f51b5;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #c5cae9;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #2575fc;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const JoinButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  background: #3f51b5;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #5c6bc0;
  }
`;

const CreateButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #3f51b5;
  border-radius: 10px;
  background: white;
  color: #3f51b5;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;

  &:hover {
    background: #5c6bc0;
    color: white;
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding-left: 22px;
  padding-right: 22px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
  position: relative;
`;

const ModalTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #333;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const ModalButton = styled.button`
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  background: #3f51b5;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #5c6bc0;
  }
`;

const ModalCloseButton = styled.button`
  padding: 0.75rem;
  border: 2px solid #2575fc;
  border-radius: 10px;
  background: white;
  color: #2575fc;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;

  &:hover {
    background: #2575fc;
    color: white;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PleaseWaitOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 1.5rem;
  z-index: 100;
  animation: ${fadeIn} 0.3s ease;
`;

export default Lobby;

export { socket };
