import React, { useRef, useState, useEffect } from "react";
import { fabric } from "fabric";
import styled, { keyframes } from "styled-components";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useDispatch, useSelector } from "react-redux";
import { updateNotification, updateLoader } from "../../utils/counterSlice.js";
import BoxOne from "../Overlay/BoxOne.jsx";
import RecordRTC from "recordrtc";
import {
  FiMenu,
  FiSave,
  FiFileText,
  FiRefreshCw,
  FiEdit3,
  FiX,
  FiPenTool,
  FiMousePointer,
  FiMinusCircle,
  FiBold,
  FiItalic,
  FiUnderline,
  FiTriangle,
  FiCircle,
  FiSquare,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiTrash2,
  FiDroplet,
  FiStar,
  FiMinus,
  FiLogOut,
  FiZap,
  FiMic,
  FiMicOff,
} from "react-icons/fi";
import { FaStopCircle, FaCircle } from "react-icons/fa";
import { socket } from "../SocketConnection/Lobby.jsx";

import ApiCall from "../../utils/ApiCall.jsx";

const Board = () => {
  const userinfo = useSelector((state) => state.userinfo);
  const currentUrl = window.location.href;
  const lastUrlPart = currentUrl.split("/").pop();

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [currentColor, setCurrentColor] = useState(
    lastUrlPart == "whiteboard" ? "#000000" : "white"
  );
  // const [backgroundColor, setbackgroundColor] = useState("");
  const [currentMode, setCurrentMode] = useState("");
  const [brushSize, setBrushSize] = useState(5);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 756);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [savedImages, setSavedImages] = useState([]);
  const [showModal, setModal] = useState({
    show: false,
    message: "",
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [animationFrameId, setAnimationFrameId] = useState(null);
  const [recordedBlobs, setRecordedBlobs] = useState([]);

  const dispatch = useDispatch();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleToolbar = () => {
    setIsToolbarOpen(!isToolbarOpen);
  };

  useEffect(() => {
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: lastUrlPart == "whiteboard" ? "white" : "#31343a",
    });
    initCanvas.freeDrawingBrush.color = currentColor;
    initCanvas.freeDrawingBrush.width = brushSize;
    setCanvas(initCanvas);

    const handleResize = () => {
      initCanvas.setWidth(1504);
      initCanvas.setHeight(800);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      initCanvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (canvas) {
      if (currentMode !== "erase") {
        canvas.freeDrawingBrush.color = currentColor;
      }
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [currentColor, brushSize, canvas]);

  const handleToolChange = (tool) => {
    setCurrentMode(tool);
    if (tool === "draw") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = currentColor;
    } else if (tool === "erase") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = canvas.backgroundColor;
    } else {
      canvas.isDrawingMode = false;
      canvas.defaultCursor = "default";
    }
  };

  const addText = (tool) => {
    setCurrentMode(tool);
    const text = new fabric.IText("Type here", {
      left: window.innerWidth < 756 ? 200 : 350,
      top: 300,
      fill: currentColor,
    });
    canvas.isDrawingMode = false;
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const clearCanvas = () => {
    setCurrentMode("");
    canvas.clear();
    canvas.backgroundColor = lastUrlPart == "whiteboard" ? "white" : "#31343a";
  };

  const handleFontStyleChange = (style) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      if (style === "bold") {
        activeObject.set(
          "fontWeight",
          activeObject.fontWeight === "bold" ? "normal" : "bold"
        );
      } else if (style === "italic") {
        activeObject.set(
          "fontStyle",
          activeObject.fontStyle === "italic" ? "normal" : "italic"
        );
      } else if (style === "underline") {
        activeObject.set("underline", !activeObject.underline);
      }
      canvas.renderAll();
    }
  };

  const addShape = (shapeType) => {
    setCurrentMode(shapeType);
    let shape = null;
    const canvasWidth = window.innerWidth < 756 ? 200 : 350;
    const canvasHeight = 300;

    switch (shapeType) {
      case "triangle":
        shape = new fabric.Triangle({
          left: canvasWidth,
          top: canvasHeight,
          width: 100,
          height: 100,
          fill: "",
          stroke: currentColor,
          strokeWidth: brushSize,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          left: canvasWidth,
          top: canvasHeight,
          radius: 50,
          fill: "",
          stroke: currentColor,
          strokeWidth: brushSize,
        });
        break;
      case "rectangle":
        shape = new fabric.Rect({
          left: canvasWidth,
          top: canvasHeight,
          width: 100,
          height: 50,
          fill: "",
          stroke: currentColor,
          strokeWidth: brushSize,
        });
        break;
      case "line":
        shape = new fabric.Line([0, 0, 100, 0], {
          left: canvasWidth,
          top: canvasHeight,
          stroke: currentColor,
          strokeWidth: brushSize,
        });
        break;
      case "oval":
        shape = new fabric.Ellipse({
          left: canvasWidth,
          top: canvasHeight,
          rx: 50,
          ry: 25,
          fill: "",
          stroke: currentColor,
          strokeWidth: brushSize,
        });
        break;
      case "star":
        shape = new fabric.Path(
          "M 100 0 L 127 50 L 200 50 L 145 84 L 166 150 L 100 120 L 34 150 L 55 84 L 0 50 L 73 50 L 100 0 z",
          {
            left: canvasWidth,
            top: canvasHeight,
            fill: "",
            stroke: currentColor,
            strokeWidth: brushSize,
          }
        );
        break;
      default:
        break;
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
    }
  };

  const handleFillShape = () => {
    const activeObject = canvas.getActiveObject();
    if (
      activeObject &&
      (activeObject.type === "triangle" ||
        activeObject.type === "circle" ||
        activeObject.type === "rect" ||
        activeObject.type === "line" ||
        activeObject.type === "oval" ||
        activeObject.type === "star")
    ) {
      activeObject.set("fill", currentColor);
      canvas.renderAll();
    }
  };

  const handleDeleteShape = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
    }
  };

  const saveAsPDF = async () => {
    if (userinfo.email == "" || !userinfo.email) {
      dispatch(
        updateNotification({
          show: true,
          type: "failure",
          message: `You are not logged in.`,
        })
      );
      return;
    }

    dispatch(
      updateLoader({
        loader: true,
      })
    );
    const pdf = new jsPDF("landscape");
    savedImages.forEach((image, index) => {
      if (index > 0) {
        pdf.addPage();
      }
      pdf.addImage(
        image,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight()
      );
    });

    const pdfBlob = pdf.output("blob");

    try {
      const formData = new FormData();
      formData.append("file", pdfBlob, "whiteboard.pdf");
      const response = await ApiCall(
        `/users/addItem`,
        "POST",
        formData,
        dispatch
      );
      if (response) {
        console.log("item is added successfully", response);
        dispatch(
          updateNotification({
            show: true,
            type: "success",
            message: `PDF saved successfully.`,
          })
        );
      }
    } catch (error) {
      dispatch(
        updateNotification({
          show: true,
          type: "failure",
          message: `PDF not saved.`,
        })
      );
      console.error("Error while adding item: ", error);
    } finally {
      dispatch(
        updateLoader({
          loader: false,
        })
      );
    }
  };

  const saveAsImage = () => {
    if (userinfo.email == "" || !userinfo.email) {
      dispatch(
        updateNotification({
          show: true,
          type: "failure",
          message: `You are not logged in.`,
        })
      );
      return;
    }
    dispatch(
      updateNotification({
        show: true,
        type: "success",
        message: `Page ${savedImages.length + 1} saved`,
      })
    );
    html2canvas(canvasRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      setSavedImages((prevImages) => [...prevImages, imgData]);
    });
  };

  const leaveBoard = () => {
    window.location.href = "/";
  };

  if (showModal.message === "exit") {
    leaveBoard();
  }
  const startRecording = async () => {
    if (userinfo.email == "" || !userinfo.email) {
      dispatch(
        updateNotification({
          show: true,
          type: "failure",
          message: `You are not logged in.`,
        })
      );
      return;
    }
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const canvasStream = canvasRef.current.captureStream(60);

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    const options = {
      mimeType: "video/webm; codecs=vp9",
    };

    const recorderInstance = new RecordRTC(combinedStream, options);
    recorderInstance.startRecording();
    setRecorder(recorderInstance);
    setIsRecording(true);

    const animateCanvas = () => {
      canvas.renderAll();
      setAnimationFrameId(requestAnimationFrame(animateCanvas));
    };

    animateCanvas();
    dispatch(
      updateNotification({
        show: true,
        type: "success",
        message: `Recording started.`,
      })
    );
  };

  const stopRecording = async () => {
    dispatch(
      updateLoader({
        loader: true,
      })
    );
    cancelAnimationFrame(animationFrameId);
    recorder.stopRecording(async () => {
      const blob = recorder.getBlob();

      try {
        const formData = new FormData();
        formData.append("file", blob, "whiteboard-recording.webm");

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
        dispatch(
          updateNotification({
            show: true,
            type: "failure",
            message: `Error while adding recording.`,
          })
        );
        console.error("Error while adding recording: ", error);
      } finally {
        dispatch(
          updateLoader({
            loader: false,
          })
        );
      }

      setRecorder(null);
      setIsRecording(false);
    });
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Container>
      {showModal.show ? (
        <BoxOne
          setModal={setModal}
          saveAsPDF={saveAsPDF}
          showModal={showModal}
        />
      ) : (
        ""
      )}
      <MainContent>
        <Sidebar isOpen={isSidebarOpen}>
          <CloseButton onClick={toggleSidebar}>
            <FiX />
          </CloseButton>
          <NavMenu>
            <NavInner>
              <NavItem
                onClick={() => handleToolChange("draw")}
                active={currentMode === "draw"}
              >
                <FiPenTool />
                Draw
              </NavItem>
              <NavItem
                onClick={() => addText("text")}
                active={currentMode === "text"}
              >
                <FiFileText />
                Text
              </NavItem>
              <NavItem
                onClick={() => handleToolChange("erase")}
                active={currentMode === "erase"}
              >
                <FiMinusCircle />
                Erase
              </NavItem>
            </NavInner>
            <NavInner>
              {" "}
              <NavItem onClick={clearCanvas}>
                <FiRefreshCw />
                Clear
              </NavItem>
              <NavItem onClick={() => handleToolChange("")}>
                <FiMousePointer />
                Select
              </NavItem>
              <NavItem onClick={handleDeleteShape}>
                <FiTrash2 />
                Delete
              </NavItem>
            </NavInner>
            <HorizontalLine />
            <NavInner>
              {" "}
              <NavItem onClick={() => handleFontStyleChange("bold")}>
                <FiBold />
                Bold
              </NavItem>
              <NavItem onClick={() => handleFontStyleChange("italic")}>
                <FiItalic />
                Italic
              </NavItem>
              <NavItem onClick={() => handleFontStyleChange("underline")}>
                <FiUnderline />
                Underline
              </NavItem>
            </NavInner>
            <NavInner>
              {" "}
              {/* <NavItem onClick={handleUndo}>
                <div style={{ fontSize: "10px", fontWeight: "bold" }}>U</div>
                Undo
              </NavItem>
              <NavItem onClick={handleRedo}>
                <div style={{ fontSize: "10px", fontWeight: "bold" }}>R</div>
                Redo
              </NavItem> */}
            </NavInner>
            <HorizontalLine />
            <NavInner>
              <NavItem onClick={() => addShape("triangle")}>
                <FiTriangle />
                Triangle
              </NavItem>
              <NavItem onClick={() => addShape("circle")}>
                <FiCircle />
                Circle
              </NavItem>
              <NavItem onClick={() => addShape("rectangle")}>
                <FiSquare />
                Rectangle
              </NavItem>
            </NavInner>
            <NavInner>
              {" "}
              <NavItem onClick={() => addShape("line")}>
                <FiMinus />
                Line
              </NavItem>
              <NavItem onClick={() => addShape("oval")}>
                <FiCircle />
                Oval
              </NavItem>
              <NavItem onClick={() => addShape("star")}>
                <FiStar />
                Star
              </NavItem>
            </NavInner>
            <HorizontalLine />
            <NavItemBox>
              <label>Brush Size: </label>
              <BrushSizeInput
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
              />
            </NavItemBox>
            <NavItemBox>
              <label>Color Picker: </label>
              <ColorPickerContainer>
                <ColorInput
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                />
              </ColorPickerContainer>
              <FillBox onClick={handleFillShape}>
                <FiDroplet />
              </FillBox>
            </NavItemBox>
            <ColorBoxes>
              {" "}
              <ColorBox
                color="#FF0000"
                onClick={() => setCurrentColor("#FF0000")}
              />
              <ColorBox
                color="#000000"
                onClick={() => setCurrentColor("#000000")}
              />
              <ColorBox
                color="#FFFFFF"
                onClick={() => setCurrentColor("#FFFFFF")}
              />
              <ColorBox
                color="#0000FF"
                onClick={() => setCurrentColor("#0000FF")}
              />
            </ColorBoxes>
            <HorizontalLine />
          </NavMenu>
          <SidebarButtons>
            <SidebarButton onClick={saveAsImage}>
              <FiSave />
              <span>Save</span>
            </SidebarButton>
            {window.innerWidth < 756 ? (
              <SidebarButton
                onClick={() => {
                  setModal({
                    show: true,
                    message: "Are you want to save as PDF?",
                  });
                }}
              >
                <FiSave />
                <span>Save as PDF</span>
              </SidebarButton>
            ) : null}
          </SidebarButtons>
        </Sidebar>

        <BoardWrapper board={lastUrlPart} ref={containerRef}>
          <MenuButton isOpen={isSidebarOpen} onClick={toggleSidebar}>
            <FiEdit3 />
          </MenuButton>
          <ToolbarButton isOpen={isSidebarOpen} onClick={toggleToolbar}>
            <FiArrowDownCircle />
          </ToolbarButton>
          <Toolbar isOpen={isToolbarOpen}>
            <ToolbarClose2 onClick={toggleToolbar}>
              <FiArrowUpCircle /> Hide
            </ToolbarClose2>
            <ToolbarClose2 onClick={toggleRecording}>
              {isRecording ? (
                <>
                  <FaStopCircle /> Stop
                </>
              ) : (
                <>
                  <FaCircle color="#ff4081" /> Record
                </>
              )}
            </ToolbarClose2>

            {window.innerWidth > 756 ? (
              <ToolbarClose3
                onClick={() => {
                  setModal({
                    show: true,
                    message: "Are you want to save as PDF?",
                  });
                }}
              >
                {" "}
                <FiSave />
                Save as PDF
              </ToolbarClose3>
            ) : null}

            <ToolbarClose
              onClick={() => {
                setModal({
                  show: true,
                  message: "Are you want to Exit?",
                });
              }}
            >
              <FiLogOut />
              Exit
            </ToolbarClose>
          </Toolbar>
          <WhiteboardArea board={lastUrlPart}>
            <CanvasElement ref={canvasRef} />
          </WhiteboardArea>
        </BoardWrapper>
      </MainContent>
    </Container>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-150%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-150%);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-100%);
  }
`;

const ToolbarClose2 = styled.div`
  background-color: #e3f2fd;
  border-radius: 15px;
  cursor: pointer;
  color: #3f51b5;
  width: 100px;
  height: 40px;
  display: flex;
  // margin-left: 25px;
  align-items: center;
  gap: 6px;
  justify-content: center;
  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
  @media (max-width: 768px) {
    margin-left: 0px;
  }
`;
const ToolbarClose3 = styled.div`
  background-color: #e3f2fd;
  border-radius: 15px;
  cursor: pointer;
  color: #3f51b5;
  height: 40px;
  display: flex;
  padding: 0px 12px;
  min-width: fit-content;
  align-items: center;
  gap: 5px;
  justify-content: center;
  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
  @media (max-width: 768px) {
    margin-left: 0px;
  }
`;

const ToolbarClose = styled.div`
  background-color: #ff4081;
  border-radius: 15px;
  cursor: pointer;
  color: white;
  width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
  &:hover {
    background-color: rgba(255, 64, 129, 0.9);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  background: #f0f2f5;
`;

const HorizontalLine = styled.hr`
  color: white;
`;

const BoardWrapper = styled.div`
  position: relative;
  z-index: 1998;
  width: 100%;
  height: 100%;
  background-color: ${({ board }) =>
    board == "whiteboard" ? "#f0f2f5" : "#e3f2fd"};
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  height: 100vh;
`;

const WhiteboardArea = styled.div`
  flex: 1;
  background: white;
  border-radius: 15px;
  margin: 1rem;
  height: 95vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: auto;
  background-color: ${({ board }) =>
    board == "whiteboard" ? "#f0f2f5" : "rgba(49, 52, 58, 0.8)"};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CanvasElement = styled.canvas`
  margin-top: 10px;
`;

const MenuButton = styled.button`
  top: 30px;
  left: 34px;
  background: #e3f2fd;
  border-radius: 50%;
  padding: 10px 10px;
  display: ${({ isOpen }) => (isOpen ? "none" : "flex")};
  align-item: center;
  justify-content: center;
  border: none;
  color: #3f51b5;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  z-index: 400;
`;

const ToolbarButton = styled.button`
  top: 30px;
  left: 85px;
  background: #e3f2fd;
  border-radius: 50%;
  padding: 10px 10px;
  display: ${({ isOpen }) => (isOpen ? "none" : "flex")};
  align-item: center;
  border: none;
  color: #3f51b5;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  z-index: 400;
`;

const CloseButton = styled.button`
  position: absolute;
  background: #e3f2fd;
  color: #3f51b5;
  border-radius: 50%;
  padding: 10px 10px;
  display: flex;
  align-item: center;
  justify-content: center;
  top: 0px;
  right: -50px;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Sidebar = styled.div`
  position: absolute;
  z-index: 1999;
  background: #3f51b5;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  margin-top: 4.8vh;
  margin-left: 2rem;
  height: 89.8vh;
  border-radius: 15px;
  animation: ${({ isOpen }) => (isOpen ? fadeIn : fadeOut)} 0.8s forwards;
`;

const NavMenu = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
  padding: 10px 12px;
  width: 100px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;

  border-radius: 15px;
  background-color: ${(props) => (props.active ? "#303f9f" : "")};

  &:hover {
    transform: ${(props) => (props.active ? "" : "translateX(5px)")};
  }

  span {
    margin-left: 1rem;
  }
`;

const NavInner = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

const NavItemBox = styled.div`
  display: flex;
  align-items: center;
  padding: 0.6rem 1.5rem;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-left: 0rem;
  border-radius: 15px;

  label {
    margin-right: 10px;
  }
`;

const ColorBoxes = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.6rem;
`;

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ColorBox = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #e3f2fd;
  background-color: ${(props) => props.color};
  margin-right: 15px;
  cursor: pointer;
`;

const FillBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-item: center;
  background-color: #303f9f;
  padding: 10px;
  border-radius: 15px;

  margin-left: 15px;
  transition: background 0.3s, transform 0.2s;
  &:hover {
    transform: translateX(5px);
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const SidebarButtons = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: auto;
  width: 100%;
  align-items: center;
  padding-bottom: 1rem;
`;

const SidebarButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  width: 200px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin: 0.5rem 1rem;
  border-radius: 15px;
  background-color: #303f9f;

  &:hover {
    transform: translateX(5px);
  }

  span {
    margin-left: 6px;
  }
`;

const ColorInput = styled.input`
  margin-left: 5px;
  width: 35px;
  padding: 2px;
  border: none;
  border-radius: 2px;
  outline: none;
  background-color: white;
  cursor: pointer;
`;

const BrushSizeInput = styled.input`
  margin-left: 4px;
  border: none;
  width: 110px;
  border-radius: 5px;
  outline: none;
  background-color: white;
  cursor: pointer;
`;

const Toolbar = styled.div`
  z-index: 1999;
  position: absolute;
  top: 1.5rem;
  left: 1.5vw;
  width: 97vw;
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  align-items: center;
  padding: 1rem;
  background: #3f51b5;
  border-radius: 15px;
  @media (max-width: 768px) {
    left: 6vw;
    justify-content: space-evenly;
    width: 88vw;
  }
  transform: ${({ isOpen }) =>
    isOpen ? "translateY(0)" : "translateY(-140%)"};
  transition: transform 0.5s ease-in-out;
`;

const ToolbarItem = styled.div`
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  margin: 0 1rem;

  label {
    margin-left: 10px;
    font-size: 1rem;
  }
`;

export default Board;
