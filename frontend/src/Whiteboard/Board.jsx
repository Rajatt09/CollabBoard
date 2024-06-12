import React, { useRef, useState, useEffect } from "react";
import { fabric } from "fabric";
import styled, { keyframes } from "styled-components";
import {
  FiMenu,
  FiSave,
  FiFileText,
  FiRefreshCw,
  FiEdit3,
  FiX,
  FiPenTool,
  FiTrash,
  FiMinusCircle,
  FiBold,
  FiItalic,
  FiUnderline,
} from "react-icons/fi";

const Board = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentMode, setCurrentMode] = useState("");
  const [brushSize, setBrushSize] = useState(5);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 756);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleToolbar = () => {
    setIsToolbarOpen(!isToolbarOpen);
  };

  useEffect(() => {
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "white",
    });
    initCanvas.freeDrawingBrush.color = currentColor;
    initCanvas.freeDrawingBrush.width = brushSize;
    setCanvas(initCanvas);

    const handleResize = () => {
      initCanvas.setWidth(window.innerWidth);
      initCanvas.setHeight(window.innerHeight);
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
    }
  };

  const addText = (tool) => {
    setCurrentMode(tool);
    const text = new fabric.IText("Type here", {
      left: 100,
      top: 100,
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
    canvas.backgroundColor = "white";
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

  return (
    <Container>
      <MainContent>
        <Sidebar isOpen={isSidebarOpen}>
          <CloseButton onClick={toggleSidebar}>
            <FiX />
          </CloseButton>
          <NavMenu>
            <NavItem
              onClick={() => handleToolChange("draw")}
              active={currentMode === "draw"}
            >
              <FiPenTool />
              <span>Draw</span>
            </NavItem>
            <NavItem
              onClick={() => addText("text")}
              active={currentMode === "text"}
            >
              <FiFileText />
              <span>Text</span>
            </NavItem>
            <NavItem
              onClick={() => handleToolChange("erase")}
              active={currentMode === "erase"}
            >
              <FiMinusCircle />
              <span>Erase</span>
            </NavItem>
            <NavItem onClick={clearCanvas}>
              <FiRefreshCw />
              <span>Clear</span>
            </NavItem>
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
            <SidebarButton>
              <FiSave />
              <span>Save as Image</span>
            </SidebarButton>
            <SidebarButton>
              <FiFileText />
              <span>Save as PDF</span>
            </SidebarButton>
          </SidebarButtons>
        </Sidebar>

        <BoardWrapper>
          <MenuButton onClick={toggleSidebar}>
            <FiMenu />
          </MenuButton>
          <ToolbarButton onClick={toggleToolbar}>
            <FiEdit3 />
          </ToolbarButton>
          <Toolbar isOpen={isToolbarOpen}>
            <ToolbarItem onClick={() => handleFontStyleChange("bold")}>
              <FiBold />
            </ToolbarItem>
            <ToolbarItem onClick={() => handleFontStyleChange("italic")}>
              <FiItalic />
            </ToolbarItem>
            <ToolbarItem onClick={() => handleFontStyleChange("underline")}>
              <FiUnderline />
            </ToolbarItem>
            <ToolbarItem>
              <label>Background Color: </label>
              <ColorInput
                type="color"
                onChange={(e) =>
                  canvas.setBackgroundColor(
                    e.target.value,
                    canvas.renderAll.bind(canvas)
                  )
                }
              />
            </ToolbarItem>
          </Toolbar>
          <WhiteboardArea>
            <canvas ref={canvasRef} />
          </WhiteboardArea>
        </BoardWrapper>
      </MainContent>
    </Container>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100%);
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
    transform: translateX(-100%);
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f0f2f5;
`;

const HorizontalLine = styled.hr`
  color: white;
`;

const BoardWrapper = styled.div`
  position: relative;
  z-index: 2000;
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
`;

const MenuButton = styled.button`
  top: 22px;
  left: 34px;
  background: none;
  border: none;
  color: #3f51b5;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  z-index: 400;
`;

const ToolbarButton = styled.button`
  top: 22px;
  right: 34px;
  background: none;
  border: none;
  color: #3f51b5;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  z-index: 400;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  height: 100vh;
`;

const Sidebar = styled.div`
  position: absolute;
  z-index: 20001;
  background: #3f51b5;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 3rem;
  margin-top: 4.8vh;
  margin-left: 2rem;
  height: 89.8vh;
  border-radius: 15px;
  animation: ${({ isOpen }) => (isOpen ? fadeIn : fadeOut)} 0.5s forwards;
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
  margin: 0 1rem;
  border-radius: 15px;
  background-color: ${(props) => (props.active ? "#303f9f" : "")};

  &:hover {
    transform: ${(props) => (props.active ? "" : "translateX(5px)")};
  }

  span {
    margin-left: 1rem;
  }
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
  padding: 1rem 2rem;
  width: 200px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin: 0.5rem 1rem;
  border-radius: 15px;
  background-color: #303f9f;

  &:hover {
    transform: translateX(5px);
  }

  span {
    margin-left: 1rem;
  }
`;

const ColorInput = styled.input`
  margin-left: 10px;
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

const WhiteboardArea = styled.div`
  flex: 1;
  background: white;
  border-radius: 15px;
  margin: 1rem;
  height: 95vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
`;

const Toolbar = styled.div`
  z-index: 20001;
  position: absolute;
  top: 1.5rem;
  left: 1.5vw;
  width: 97vw;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1rem;
  background: #3f51b5;
  border-radius: 15px;
  transform: ${({ isOpen }) =>
    isOpen ? "translateY(0)" : "translateY(-100%)"};
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
