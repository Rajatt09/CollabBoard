import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { socket } from "./Lobby";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { updateNotification, updateLoader } from "../../utils/counterSlice";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
  FaVideo,
  FaMicrophone,
  FaCommentDots,
  FaHandPaper,
  FaDesktop,
  FaPhoneSlash,
  FaDownload,
  FaStopCircle,
  FaCircle,
  FaVideoSlash,
  FaMicrophoneSlash,
} from "react-icons/fa";
import { MdCallEnd, MdStopScreenShare } from "react-icons/md";
import ApiCall from "../../utils/ApiCall";

const createPeerConnection = () => {
  return new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ],
      },
    ],
  });
};

const MyRoom = () => {
  const location = useLocation();
  const host = useSelector((state) => state.userinfo);
  const { roomId } = useParams();
  const { myOffer } = location.state || {};
  const [waitingPeople, setWaitingPeople] = useState([]);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [showVideoSlider, setShowVideoSlider] = useState(false);
  const [hoster, setHoster] = useState("");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoSharing, setIsVideoSharing] = useState(true);
  const [isAudioSharing, setIsAudioSharing] = useState(true);
  const [handColor, setHandColor] = useState(false);
  const [handRaised, setHandRaised] = useState({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmMessageOpen, setIsConfirmMessageOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [myMessage, setMyMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const dispatch = useDispatch();

  const peers = useRef({});

  const [acceptedUsers, setAcceptedUsers] = useState(new Map());

  const myVideoRef = useRef(null);
  const remoteVideoRefs = useRef([]);

  const cleanupMediaStreams = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const startRecording = () => {
    if (myStream) {
      mediaRecorderRef.current = new MediaRecorder(myStream, {
        mimeType: "video/webm;codecs=vp9",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      dispatch(
        updateNotification({
          show: true,
          type: "success",
          message: `Recording started`,
        })
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      dispatch(
        updateNotification({
          show: true,
          type: "success",
          message: `Recording stopped.`,
        })
      );
    }
  };

  const saveRecording = async () => {
    dispatch(
      updateLoader({
        loader: true,
      })
    );
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });

      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      try {
        const response = await ApiCall(
          `/users/addItem`,
          "POST",
          formData,
          dispatch
        );

        if (response) {
          console.log("Recording is added successfully", response);
          dispatch(
            updateNotification({
              show: true,
              type: "success",
              message: `Recording saved successfully.`,
            })
          );
        }
      } catch (error) {
        console.error("Error while adding recording: ", error);
        dispatch(
          updateNotification({
            show: true,
            type: "error",
            message: `Failed to save recording.`,
          })
        );
      } finally {
        dispatch(
          updateLoader({
            loader: false,
          })
        );
      }

      setRecordedChunks([]);
    }
  };

  const sendStream = (peer, stream) => {
    const tracks = stream.getTracks();

    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
  };
  const getUserMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setMyStream(stream);
      for (const peer of Object.values(peers.current)) {
        sendStream(peer, stream);
      }

      myVideoRef.current.srcObject = stream;
    } catch (error) {
      console.log(
        "error in your get user media okay: ",
        error.name,
        "message is : ",
        error.message
      );
    }
  };

  const getScreenShareStream = async () => {
    if (isScreenSharing) {
      // Stop screen sharing and switch back to the webcam video
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      const videoTrack = stream.getVideoTracks()[0];
      const sender = myStream.getVideoTracks()[0];
      myStream.removeTrack(sender);
      myStream.addTrack(videoTrack);

      // Update peers with the webcam video stream
      for (const peer of Object.values(peers.current)) {
        const sender = peer
          .getSenders()
          .find((s) => s.track.kind === videoTrack.kind);
        sender.replaceTrack(videoTrack);
      }

      myVideoRef.current.srcObject = myStream;
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = myStream.getVideoTracks()[0];
        myStream.removeTrack(sender);
        myStream.addTrack(videoTrack);

        // Update peers with the screen share stream
        for (const peer of Object.values(peers.current)) {
          const sender = peer
            .getSenders()
            .find((s) => s.track.kind === videoTrack.kind);
          sender.replaceTrack(videoTrack);
        }

        myVideoRef.current.srcObject = myStream;
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Failed to get screen share stream:", error);
      }
    }
  };

  const notifyPeersAboutStreamUpdate = () => {
    try {
      const updatedStream = myStream.clone();

      peerConnections.forEach((peer) => {
        if (peer.peerConnection.signalingState !== "closed") {
          const videoSender = peer.videoSender;
          if (videoSender) {
            videoSender.replaceTrack(updatedStream.getVideoTracks()[0]);
          }

          const audioSender = peer.audioSender;
          if (audioSender) {
            audioSender.replaceTrack(updatedStream.getAudioTracks()[0]);
          }
        }
      });
    } catch (error) {
      console.error("Failed to notify peers about stream update:", error);
    }
  };

  const toggleWebcamVideo = async () => {
    try {
      if (isVideoSharing) {
        const videoTracks = myStream.getVideoTracks();
        videoTracks.forEach((track) => (track.enabled = false));

        setIsVideoSharing(false);
      } else {
        const videoTracks = myStream.getVideoTracks();
        videoTracks.forEach((track) => (track.enabled = true));

        setIsVideoSharing(true);
      }

      notifyPeersAboutStreamUpdate();
    } catch (error) {
      console.error("Failed to toggle webcam video:", error);
    }
  };

  const toggleMicrophoneAudio = async () => {
    try {
      if (isAudioSharing) {
        const audioTracks = myStream.getAudioTracks();
        audioTracks.forEach((track) => (track.enabled = false));

        setIsAudioSharing(false);
      } else {
        const audioTracks = myStream.getAudioTracks();
        audioTracks.forEach((track) => (track.enabled = true));

        setIsAudioSharing(true);
      }

      notifyPeersAboutStreamUpdate();
    } catch (error) {
      console.error("Failed to toggle microphone audio:", error);
    }
  };

  const handleTrackEvent = (event, email) => {
    const stream = event.streams[0];
    const streamId = stream.id;

    setRemoteStream((prevStreams) => ({
      ...prevStreams,
      [email]: stream,
    }));
  };
  const handleNewUserJoined = async ({ emailToData }) => {
    console.log(` new user joined`);
    setAcceptedUsers(new Map(Object.entries(emailToData)));
  };

  const handleIncommingCall = async ({ from, offer, email, myEmail }) => {
    console.log(
      `incomming call from ${from} with email ${email} offer: `,
      offer
    );
    console.log("incomming call with myEmail: ", myEmail);

    const peer = createPeerConnection();
    peers.current[email] = peer;

    peer.addEventListener("track", (event) => handleTrackEvent(event, email));
    peer.addEventListener("negotiationneeded", () =>
      handleNegotiation(email, myEmail)
    );

    if (myStream) {
      sendStream(peer, myStream);
    }

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      console.log(
        "Remote description set, signaling state:",
        peer.signalingState
      );
      if (peer.signalingState === "have-remote-offer") {
        console.log("create answe called");
        const ans = await peer.createAnswer();
        await peer.setLocalDescription(new RTCSessionDescription(ans));
        socket.emit("call-accepted", {
          from,
          ans,
          email: myEmail,
          mail: email,
        });
      }
    } catch (error) {
      console.error("Failed to handle incoming call:", error);
    }

    // const ans = await createAnswer(offer);

    // socket.emit("call-accepted", { from, ans });
  };

  const handleUserDisconnected = async ({ email, emailToData }) => {
    const peer = peers.current[email];
    if (peer) {
      peer.close();
      delete peers.current[email];
    }

    setRemoteStream((prevStreams) => {
      const updatedStreams = { ...prevStreams };
      delete updatedStreams[email];
      return updatedStreams;
    });
    setAcceptedUsers(new Map(Object.entries(emailToData)));

    setWaitingPeople((prevData) =>
      prevData.filter((person) => person.userEmail !== email)
    );
  };

  const handleCallAccepted = async ({ ans, email }) => {
    console.log("call got accepted", ans);

    const peer = peers.current[email];

    await peer.setRemoteDescription(new RTCSessionDescription(ans));
  };

  const handleAllowPermission = async ({
    userName,
    userEmail,
    userId,
    roomId,
  }) => {
    setWaitingPeople((prevData) => [
      ...prevData,
      {
        userId,
        userName,
        userEmail,
        roomId,
      },
    ]);
    console.log("waiting people is: ", waitingPeople);
  };

  const handleIncommingHandRaise = async ({ email, hand }) => {
    setHandRaised((prevData) => {
      const newHandRaised = { ...prevData, [email]: hand };
      console.log("Updated hand raised object is:", newHandRaised);
      return newHandRaised;
    });
  };

  const handleMessages = async ({ email, message }) => {
    setMessages((prevData) => {
      const newMessageBlock = [
        ...prevData,
        {
          email: email,
          message: message,
        },
      ];
      console.log("new message block object is:", newMessageBlock);
      return newMessageBlock;
    });
  };

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("allow-permission", handleAllowPermission);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("hand-raise", handleIncommingHandRaise);
    socket.on("messages", handleMessages);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("allow-permission", handleAllowPermission);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("hand-raise", handleIncommingHandRaise);
      socket.off("messages", handleMessages);
    };
  }, [
    socket,
    handleNewUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleUserDisconnected,
    handleIncommingHandRaise,
    handleMessages,
  ]);

  const handleNegotiation = async (email, myEmail) => {
    console.log("handle nego called with remote id: ");
    const peer = peers.current[email];
    const localOffer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(localOffer));
    socket.emit("call-user", {
      email: email,
      mail: myEmail,
      offer: localOffer,
      from: host.name,
    });
  };

  useEffect(() => {
    console.log("use effect is called", myOffer);
    if (roomId != host.meeting.id && myOffer) {
      console.log("myOffer other section is: ", myOffer.other);
      handleIncommingCall(myOffer);
      setHoster(myOffer.from);
      setAcceptedUsers(new Map(Object.entries(myOffer.other)));
    }
  }, [myOffer]);

  useEffect(() => {
    getUserMediaStream();

    return () => {
      cleanupMediaStreams();
    };
  }, []);

  const handleUserRequest = async (id, roomId, name, email, status) => {
    if (status == "accept") {
      const peer = createPeerConnection();
      peers.current[email] = peer;

      const offer = await peer.createOffer();
      await peer.setLocalDescription(new RTCSessionDescription(offer));

      socket.emit("permission-status", {
        id,
        roomId,
        name,
        email,
        allow: true,
        offer,
        from: host.name,
      });
    } else {
      socket.emit("permission-status", {
        id,
        roomId,
        name,
        email,
        allow: false,
        offer: {},
        from: host.name,
      });
    }
    const userIndex = waitingPeople.findIndex(
      (person) => person.userId === id && person.roomId === roomId
    );
    if (userIndex !== -1) {
      setWaitingPeople((prevData) =>
        prevData.filter((_, index) => index !== userIndex)
      );
    }
  };

  useEffect(() => {
    Object.keys(remoteStream).forEach((email) => {
      if (remoteVideoRefs.current[email]) {
        remoteVideoRefs.current[email].srcObject = remoteStream[email];
      }
    });

    console.log("now the remote Stream is: ", remoteStream);
  }, [remoteStream]);

  const handRaise = async () => {
    if (!handColor) {
      socket.emit("hand-raise", { email: host.email, hand: true });
    } else {
      socket.emit("hand-raise", { email: host.email, hand: false });
    }
    setHandColor((prevData) => !prevData);
  };

  const sendMessage = async () => {
    console.log("my message is: ", myMessage);
    socket.emit("messages", { email: host.email, message: myMessage });

    setMyMessage("");
  };

  const leaveMeeting = () => {
    cleanupMediaStreams();
    window.location.href("/");
  };

  return (
    <RoomContainer>
      <Header>
        <h3>{roomId === host.meeting.id ? "Host" : "Attendee"}</h3>
        <h4>Meeting ID: {roomId}</h4>
        <LeaveButton onClick={() => setIsConfirmModalOpen(true)}>
          Leave
        </LeaveButton>
      </Header>
      <Mobilebr />
      <Mainh4>
        Meeting ID <br />
        {roomId}
      </Mainh4>
      {/* <div
        style={{
          position: "absolute",
          top: "100px",
          right: "20px",
          backgroundColor: "green",
          padding: "20px",
        }}
        onClick={() => {
          if (!isRecording) {
            startRecording();
          } else {
            stopRecording();
            saveRecording();
          }
        }}
      >
        {isRecording ? "Record" : "Stop"}
      </div> */}
      <Main>
        <VideoDiv host={roomId === host.meeting.id}>
          {/* <VideoSection>
            <h2>My Video</h2>
            <Video ref={myVideoRef} autoPlay muted />
          </VideoSection> */}
          {roomId === host.meeting.id ? (
            <HostVideoSection>
              <h2>
                You {`( `}Host{` )`}
              </h2>
              {handColor ? (
                <div
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: "10px",
                    fontSize: "25px",
                    color: "white",
                  }}
                >
                  {" "}
                  <FaHandPaper />
                </div>
              ) : null}

              <HostVideo ref={myVideoRef} autoPlay muted />
            </HostVideoSection>
          ) : (
            // <ParticipantVideoSection>
            //   <h3>You</h3>
            //   <ParticipantVideo ref={myVideoRef} autoPlay muted />
            // </ParticipantVideoSection>
            ""
          )}
          {roomId != host.meeting.id
            ? Object.keys(remoteStream).map((email) => (
                <HostVideoSection key={email}>
                  <h2>
                    {hoster} &nbsp;{`( `}Host{` )`}
                  </h2>
                  {handRaised[email] ? (
                    <div
                      style={{
                        position: "absolute",
                        top: "50px",
                        right: "10px",
                        fontSize: "25px",
                        color: "white",
                      }}
                    >
                      {" "}
                      <FaHandPaper />
                    </div>
                  ) : null}
                  <HostVideo
                    ref={(el) => (remoteVideoRefs.current[email] = el)}
                    autoPlay
                  />
                </HostVideoSection>
              ))
            : null}
          {roomId != host.meeting.id ? (
            <HostVideoSection>
              <h2>
                You {`( `}Participant{` )`}
              </h2>
              {handColor ? (
                <div
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: "10px",
                    fontSize: "25px",
                    color: "white",
                  }}
                >
                  {" "}
                  <FaHandPaper />
                </div>
              ) : null}
              <HostVideo ref={myVideoRef} autoPlay muted />
            </HostVideoSection>
          ) : null}
        </VideoDiv>

        <AttendeeDiv showSidebar={showSidebar}>
          <SidebarToggle
            onClick={() => setShowSidebar(!showSidebar)}
            showSidebar={showSidebar}
          >
            {showSidebar ? <FaChevronRight /> : <FaChevronLeft />}
          </SidebarToggle>
          <SidebarContent>
            {roomId === host.meeting.id ? (
              <WaitingList>
                <Sideh2>Connection Request ({waitingPeople.length})</Sideh2>{" "}
                <hr style={{ color: "#3f51b5" }} />
                <br />
                {waitingPeople.map((user, index) => (
                  <UserRequest key={index}>
                    <li>
                      {" "}
                      {user.userName} &nbsp;&nbsp; <Mobilebr />
                      {`( `}
                      {user.userEmail} {` )`}
                    </li>
                    <div>
                      {" "}
                      <ActionButton
                        onClick={() =>
                          handleUserRequest(
                            user.userId,
                            user.roomId,
                            user.userName,
                            user.userEmail,
                            "accept"
                          )
                        }
                      >
                        Allow
                      </ActionButton>{" "}
                      &nbsp; &nbsp;
                      <ActionButton2
                        onClick={() =>
                          handleUserRequest(
                            user.userId,
                            user.roomId,
                            user.userName,
                            user.userEmail,
                            "reject"
                          )
                        }
                      >
                        Reject
                      </ActionButton2>
                    </div>
                    <PlceHolderDiv>
                      {waitingPeople.length === 0 ? "No Request Available" : ""}
                    </PlceHolderDiv>
                  </UserRequest>
                ))}
              </WaitingList>
            ) : (
              <AcceptedUsers>
                <Sideh2>Attendees ({acceptedUsers.size})</Sideh2>
                <hr style={{ color: "#3f51b5" }} />
                <br />
                <div>
                  {Array.from(acceptedUsers.entries()).map(([email, data]) => (
                    <div key={email}>
                      <li style={{ position: "relative" }}>
                        {" "}
                        {data.name} <Mobilebr /> &nbsp; {`( `} {email} {` )`}
                        {handRaised[email] ? (
                          <div
                            style={{
                              position: "absolute",
                              top: "-12px",
                              right: "0px",
                              fontSize: "15px",
                              color: "white",
                            }}
                          >
                            {" "}
                            <FaHandPaper />
                          </div>
                        ) : null}
                      </li>
                    </div>
                  ))}
                </div>
                <PlceHolderDiv>
                  {acceptedUsers.size == 0 ? "No attendee present" : ""}
                </PlceHolderDiv>
              </AcceptedUsers>
            )}
          </SidebarContent>
        </AttendeeDiv>
      </Main>
      <HostControls>
        <HostControlInner>
          {roomId === host.meeting.id ? (
            <SlideIconWrapper
              style={{ backgroundColor: "#3498db" }}
              onClick={() => setShowVideoSlider(!showVideoSlider)}
            >
              <FaChevronUp />
            </SlideIconWrapper>
          ) : null}

          <IconWrapper
            style={{ position: "relative", overflow: "hidden" }}
            onClick={getScreenShareStream}
          >
            {isScreenSharing ? <MdStopScreenShare /> : <FaDesktop />}
          </IconWrapper>
          <IconWrapper
            style={{
              backgroundColor: handColor ? "white" : "#282c34",
              color: handColor ? "#282c34" : "",
            }}
            onClick={handRaise}
          >
            <FaHandPaper />
          </IconWrapper>
          {roomId === host.meeting.id ? (
            <div
              style={{
                display: "flex",
                gap: window.innerWidth < 756 ? "10px" : "15px",
                position: window.innerWidth < 756 ? "absolute" : "",
                top: "85px",
                left: "20px",
              }}
            >
              {" "}
              <IconWrapper
                style={{
                  backgroundColor:
                    window.innerWidth < 756 ? "#3f51b5" : "#282c34",
                  paddingTop: "8.5px",
                }}
                onClick={saveRecording}
              >
                <FaDownload style={{ color: "white" }} />
              </IconWrapper>
              <IconWrapper
                style={{
                  backgroundColor: !isRecording
                    ? window.innerWidth < 756
                      ? "#3f51b5"
                      : "white"
                    : "",
                  paddingTop: window.innerWidth < 756 ? "8px" : "8.5px",
                }}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <FaStopCircle />
                ) : (
                  <FaCircle style={{ color: "#e74c3c" }} />
                )}
              </IconWrapper>
            </div>
          ) : null}

          <IconWrapper onClick={() => setIsConfirmMessageOpen(true)}>
            <FaCommentDots />
          </IconWrapper>
          <IconWrapper onClick={toggleWebcamVideo}>
            {isVideoSharing ? <FaVideo /> : <FaVideoSlash />}
          </IconWrapper>
          <IconWrapper onClick={toggleMicrophoneAudio}>
            {isAudioSharing ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </IconWrapper>
          <SlideIconWrapper
            style={{ backgroundColor: "#e74c3c" }}
            onClick={() => setIsConfirmModalOpen(true)}
          >
            <MdCallEnd />
          </SlideIconWrapper>
        </HostControlInner>
      </HostControls>
      {roomId == host.meeting.id ? (
        <VideoSlider showVideoSlider={showVideoSlider}>
          <h4>Attendees</h4>
          <hr style={{ color: "#3f51b5" }} />
          <SliderToggle onClick={() => setShowVideoSlider(!showVideoSlider)}>
            <FaChevronDown />
          </SliderToggle>
          <SliderContent>
            {Object.keys(remoteStream).map((email) => (
              <VideoContainer key={email}>
                <h5>
                  {" "}
                  {acceptedUsers.get(email)?.name} <br />
                  {`( `} {email} {` )`}{" "}
                </h5>
                {handRaised[email] ? (
                  <div
                    style={{
                      position: "absolute",
                      top: "50px",
                      right: "10px",
                      fontSize: "25px",
                      color: "white",
                      zIndex: 200,
                    }}
                  >
                    {" "}
                    <FaHandPaper />
                  </div>
                ) : null}
                <Video
                  ref={(el) => (remoteVideoRefs.current[email] = el)}
                  autoPlay
                />
              </VideoContainer>
            ))}
          </SliderContent>
        </VideoSlider>
      ) : null}
      <AnimatePresence>
        {isConfirmModalOpen && (
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
              <CloseButton onClick={() => setIsConfirmModalOpen(false)}>
                &times;
              </CloseButton>
              <Title>Are you surely want to leave?</Title>
              <ModalForm>
                <ModalLink onClick={leaveMeeting}>Confirm</ModalLink>
              </ModalForm>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmMessageOpen && (
          <Modal2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ModalContent2
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {" "}
              <CloseButton onClick={() => setIsConfirmMessageOpen(false)}>
                &times;
              </CloseButton>
              <ModalTitle>
                Chat Box{" "}
                <h6 style={{ display: "inline" }}>(Message To Everyone)</h6>
              </ModalTitle>
              <ModalChat>
                {messages.length == 0 ? (
                  <div
                    style={{
                      color: "#c5cae9",
                      fontSize: "1.2rem",

                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    No Chat Available
                  </div>
                ) : null}
                {messages.map((data, index) => (
                  <div key={index}>
                    {data.email != host.email ? (
                      <div
                        style={{
                          margin: "5px",
                          display: "flex",
                          justifyContent: "left",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "left",
                            paddingLeft: "6px",
                            fontSize: "0.8rem",
                            color: "#c5cae9",
                          }}
                        >
                          {data.email}
                        </div>
                        <div
                          style={{
                            color: "white",
                            backgroundColor: "#3f51b5",
                            margin: "5px",
                            borderRadius: "1rem",
                            padding: "8px 20px",
                            width: "fit-content",
                          }}
                        >
                          {data.message}
                        </div>
                      </div>
                    ) : null}
                    {data.email == host.email ? (
                      <div
                        style={{
                          margin: "5px",
                          display: "flex",
                          alignItems: "end",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "left",
                            paddingRight: "16px",
                            fontSize: "0.8rem",
                            color: "#c5cae9",
                          }}
                        >
                          You
                        </div>
                        <div
                          style={{
                            color: "white",
                            backgroundColor: "#777",
                            margin: "5px",
                            position: "relative",
                            right: "0",
                            borderRadius: "1rem",
                            padding: "8px 20px",
                            width: "fit-content",
                          }}
                        >
                          {data.message}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </ModalChat>
              <ModalForm2>
                <Input
                  id="message"
                  type="text"
                  value={myMessage}
                  onChange={(e) => setMyMessage(e.target.value)}
                  placeholder="Write here ..."
                />
                <ModalButton onClick={sendMessage}>Send</ModalButton>
              </ModalForm2>
            </ModalContent2>
          </Modal2>
        )}
      </AnimatePresence>
    </RoomContainer>
  );
};

const Modal2 = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding-left: 20px;
  padding-right: 20px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalForm2 = styled.div`
  display: flex;
  gap: 0.6rem;
`;
const ModalChat = styled.div`
  height: 77.5vh;
  margin-top: 40px;
  margin-bottom: 0.5rem;
  overflow: scroll;
  @media (min-width: 768px) {
    height: 74vh;
  }
`;

const ModalButton = styled.div`
  padding: 0.75rem;
  border: none;
  border-radius: 1rem;
  background: #3f51b5;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.3s ease;
  width: 20%;
  &:hover {
    background: #5c6bc0;
  }
  @media (max-width: 768px) {
    width: 30%;
  }
`;

const ModalContent2 = styled(motion.div)`
  background: white;
  padding: 0.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 50%;
  height: 90vh;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ModalTitle = styled.h2`
  position: absolute;
  text-align: center;
  margin-bottom: 1.5rem;
  top: 10px;
  left: 15px;
  color: #3f51b5;
  font-weight: 500;
  font-size: 25px;
`;

const Input = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 1rem;
  background-color: #c5cae9;
  font-size: 1rem;
  outline: none;
  width: 80%;
  height: 50px;
  resize: none;
  transition: border-color 0.3s ease;
  color: #666;
  &:focus {
    border-color: #2575fc;
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

const ModalLink = styled(Link)`
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  background: #3f51b5;
  color: white;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #5c6bc0;
  }
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

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
  color: #3f51b5;
  font-weight: 500;
  font-size: 25px;
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

const RoomContainer = styled.div`
  background-color: #f4f4f9;
  //   padding: 10px;
  border-radius: 0px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  height: 100vh;
  z-index: 1001;
  background: linear-gradient(0deg, #7986cb 0%, white 40%, white 100%);
  overflow: hidden;

  @media (max-width: 768px) {
    background: linear-gradient(0deg, #7986cb 0%, white 80%, white 100%);
  }
`;

const HostControls = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px;
  margin: 0px 20px 20px 20px;
  border-radius: 200px;
  background-color: #3f51b5;
`;
const HostControlInner = styled.div`
  display: flex;
  gap: 15px;
  //   justify-content: space-around;
  //   margin-top: 10px;
`;

const IconWrapper = styled.div`
  cursor: pointer;
  padding: 10px 14px;
  background: #282c34;
  color: white;
  border-radius: 50%;
  &: hover {
    background-color: #777;
  }
`;

const SlideIconWrapper = styled.div`
  cursor: pointer;
  padding: 10px 14px;
  background: #282c34;
  color: white;
  border-radius: 50%;
  @media (max-width: 768px) {
    display: none;
  }
  &: hover {
    opacity: 0.7;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 10px;
  box-shadow: -12px 0 15px rgba(0, 0, 0, 0.1);

  h3 {
    padding-top: 5px;
    font-size: 1.5rem;
    color: #3f51b5;
  }

  h4 {
    font-size: 1rem;
    padding-top: 7px;
    padding-left: 100px;
    color: #888;
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const Sideh2 = styled.h2`
  font-size: 1.5rem;
  color: #3f51b5;
`;

const Mainh4 = styled.h4`
  font-size: 1rem;
  color: #777;
  text-align: center;
  @media (min-width: 768px) {
    display: none;
  }
`;

const PlceHolderDiv = styled.div`
  opacity: 0.5;
  position: absolute;
  top: 50vh;
  left: 35%;
  font-size: 1.5rem;
  color: #3f51b5;
  @media (max-width: 768px) {
    left: 20%;
  }
`;

const Main = styled.div`
  display: flex;
  padding: 20px;
  justify-content: center;
`;

const Mobilebr = styled.br`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const AttendeeDiv = styled.div`
  position: fixed;
  right: ${(props) => (props.showSidebar ? "0" : "-40%")};
  top: 0;
  bottom: 0;
  width: 40%;
  background-color: #fff;
  transition: right 0.7s ease;
  z-index: 2005;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    right: ${(props) => (props.showSidebar ? "0" : "-80%")};
    width: 80%;
  }
`;

const SidebarToggle = styled.button`
  position: absolute;
  top: 8px;
  left: -57px;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 50%;
  height: 45px;
  width: 45px;
  padding: 0px 2px 5px 0px;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 1001;

  &:hover {
    background-color: #7986cb;
  }
`;

const SidebarContent = styled.div`
  padding: 20px;
`;

const WaitingList = styled.div`
  margin-bottom: 20px;
`;

const UserRequest = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #3f51b5;
  padding: 10px;
  color: white;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 0.9rem;
    flex-direction: column;
    text-align: center;
    list-style-type: none;
    gap: 10px;
  }
`;

const LeaveButton = styled.button`
  background-color: #e74c3c;
  color: white;
  padding: 8px 30px;
  margin-right: 62px;
  border: none;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c0392b;
  }
`;

const ActionButton = styled.button`
  background-color: #3498db;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

const ActionButton2 = styled.button`
  background-color: #e74c3c;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #666;
  }
`;

const AcceptedUsers = styled.div`
  margin-bottom: 20px;

  div {
    padding: 0;

    div {
      background-color: #3f51b5;
      color: white;
      padding: 12px 10px;
      margin-bottom: 18px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
  }
`;

const VideoSection = styled.div`
  margin-bottom: 20px;

  h2 {
    font-size: 1.2rem;
    color: #333;
  }
`;

const ParticipantVideoSection = styled.div`
  position: absolute;
  right: 24px;
  bottom: 17px;

  h3 {
    position: absolute;
    top: 5px;
    left: 10px;
    font-size: 1.3rem;
    color: white;
  }
`;
const Video = styled.video`
  max-width: 250px;
  min-height: 182px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const VideoDiv = styled.div`
  display: flex;
  width: 100%;
  //   gap: 20px;
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  height: 74vh;
  justify-content: space-evenly;
  align-item: center;
  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    height: ${({ host }) => (host ? "35vh" : "72vh")};
  }
`;

const HostVideoSection = styled.div`
  margin: 15px 0px;
  width: 40%;
  height: 70vh;
  text-align: center;
  //   background-color: green;
  position: relative;
  padding-top: 40px;
  display: flex;

  h2 {
    font-size: 1.5rem;
    color: #3f51b5;
    position: absolute;
    top: 2px;
    width: 100%;
    margin-left: 50%;
    transform: translateX(-50%);
  }
  @media (max-width: 768px) {
    width: 94%;
    margin: 15px 3%;
    height: 35vh;
  }
`;

const HostVideo = styled.video`
  border-radius: 10px;
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  //   background-color: #3f51b5;
  @media (max-width: 768px) {
    width: 100%;
  }
`;
const ParticipantVideo = styled.video`
  max-width: 220px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const VideoSlider = styled.div`
  position: fixed;
  bottom: ${(props) => (props.showVideoSlider ? "0" : "-500px")};
  left: 0;
  right: 0;
  background-color: #fff;
  transition: bottom 0.6s ease;
  z-index: 1000;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;

  h4 {
    padding: 20px 0px 0px 25px;
    margin-bottom: 20px;
    font-size: 1.5rem;
    color: #3f51b5;
  }

  @media (max-width: 768px) {
    text-align: center;
    bottom: 0;
  }
`;

const SliderToggle = styled.button`
  position: absolute;
  top: -70px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 1.2rem;

  &:hover {
    background-color: #2980b9;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SliderContent = styled.div`
  padding: 0px 20px 20px 20px;
  display: flex;
  overflow-x: auto;
  gap: 20px;
  min-height: 240px;
  display: flex;
  align-content: center;

  @media (max-width: 768px) {
    // flex-direction: column;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  border-radius: 10px;
  @media (max-width: 768px) {
    text-align: center;
  }
  h5 {
    margin-left: -15px;
    text-align: center;
    color: #3f51b5;
    font-size: 1rem;
    // position: absolute;
    // top: 10px;
  }
`;

export default MyRoom;
