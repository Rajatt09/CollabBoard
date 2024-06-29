import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { FiUpload, FiFileText, FiVideo, FiTrash2, FiEye } from "react-icons/fi";
import ApiCall from "../../utils/ApiCall";
import { useDispatch } from "react-redux";
import { updateNotification, updateLoader } from "../../utils/counterSlice";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../assets/StoreAnimation.json";

const StorePage = () => {
  const [fileList, setFileList] = useState([]);
  const [fileType, setFileType] = useState("pdf");
  const [dragging, setDragging] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const getItemDetails = async () => {
      try {
        dispatch(
          updateLoader({
            loader: true,
          })
        );
        const response = await ApiCall("/users/getItems", "GET", null);
        console.log("data is: ", response.data.data);
        setFileList(response.data.data);
      } catch (error) {
        dispatch(
          updateNotification({
            show: true,
            type: "failure",
            message: `Item details not fetched.`,
          })
        );
        console.error("Error while fetching details of items: ", error);
      } finally {
        dispatch(
          updateLoader({
            loader: false,
          })
        );
      }
    };
    getItemDetails();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    // Handle the dropped files here
    console.log("files are : ", files);

    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    dispatch(
      updateLoader({
        loader: true,
      })
    );
    console.log("files are : ", files[0]);
    const formData = new FormData();

    formData.append("file", files[0]);

    try {
      const response1 = await ApiCall(
        "/users/addItem",
        "POST",
        formData,
        dispatch
      );

      const response = await ApiCall("/users/getItems", "GET", null, dispatch);

      setFileList(response.data.data);
      dispatch(
        updateNotification({
          show: true,
          type: "success",
          message: `File uploaded successfully.`,
        })
      );
    } catch (error) {
      dispatch(
        updateNotification({
          show: true,
          type: "failure",
          message: `Something went wrong.`,
        })
      );
      console.error("Error while uploading files: ", error);
    } finally {
      dispatch(
        updateLoader({
          loader: false,
        })
      );
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    uploadFiles(files);
  };

  const viewItem = (fileName) => {
    window.open(
      `${import.meta.env.VITE_SOCKET_SERVER_URL}/public/files/${fileName}`,
      "_blank",
      "noreferrer"
    );
  };

  const handleDelete = async (id) => {
    dispatch(
      updateLoader({
        loader: true,
      })
    );
    try {
      const response1 = await ApiCall(
        `/users/deleteItem/${id}`,
        "POST",
        {},
        dispatch
      );
      const response = await ApiCall("/users/getItems", "GET", null, dispatch);

      setFileList(response.data.data);
    } catch (error) {
      dispatch(
        updateNotification({
          show: true,
          type: "failure",
          message: `Something went wrong.`,
        })
      );
      console.error("Error while deleting item: ", error);
    } finally {
      dispatch(
        updateLoader({
          loader: false,
        })
      );
    }
  };

  return (
    <Container>
      <ResponsivePlayer autoplay loop src={animationData} />
      <ResponsivePlayer1 autoplay loop src={animationData} />
      <ResponsivePlayer2 autoplay loop src={animationData} />
      <ResponsivePlayer3 autoplay loop src={animationData} />

      <Content>
        <Header>Recordings and PDFs</Header>
        <UploadSection
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          dragging={dragging}
        >
          <UploadIcon />
          <UploadText>Drag & Drop or Upload File</UploadText>
          <UploadLabel htmlFor="fileUpload">
            Upload File
            <UploadInput
              id="fileUpload"
              type="file"
              onChange={handleFileInputChange}
            />
          </UploadLabel>
        </UploadSection>
        <ToggleButtons>
          <ToggleButton
            active={fileType === "pdf"}
            onClick={() => setFileType("pdf")}
          >
            PDFs
          </ToggleButton>
          <ToggleButton
            active={fileType === "recording"}
            onClick={() => setFileType("recording")}
          >
            Recordings
          </ToggleButton>
        </ToggleButtons>
        <StoredFilesSection>
          <StoredFilesHeader>
            {fileType === "pdf" ? "Stored PDFs" : "Stored Recordings"}
          </StoredFilesHeader>
          {fileType === "pdf" ? (
            <StoredFilesList>
              {fileList.map((file, index) =>
                file.name.endsWith(".pdf") ? (
                  <StoredFileItem key={index}>
                    <FileIcon>
                      <FiFileText />
                    </FileIcon>
                    <FileName>{file.name}</FileName>
                    <ActionButton
                      onClick={() => {
                        viewItem(file.name);
                      }}
                    >
                      <FiEye />
                    </ActionButton>
                    <DeleteButton onClick={() => handleDelete(file._id)}>
                      <FiTrash2 />
                    </DeleteButton>
                  </StoredFileItem>
                ) : null
              )}
            </StoredFilesList>
          ) : (
            <StoredFilesList>
              {fileList.map((file, index) =>
                file.name.endsWith(".webm") ? (
                  <StoredFileItem key={index}>
                    <FileIcon>
                      <FiVideo />
                    </FileIcon>
                    <FileName>{file.name}</FileName>
                    <ActionButton
                      onClick={() => {
                        viewItem(file.name);
                      }}
                    >
                      <FiEye />
                    </ActionButton>
                    <DeleteButton onClick={() => handleDelete(file._id)}>
                      <FiTrash2 />
                    </DeleteButton>
                  </StoredFileItem>
                ) : null
              )}
            </StoredFilesList>
          )}
        </StoredFilesSection>
      </Content>
    </Container>
  );
};

const ResponsivePlayer = styled(Player)`
  height: 600px;
  width: 600px;
  position: absolute;
  top: -120px;
  left: -120px;

  transform: rotate(30deg);
  @media (max-width: 768px) {
    display: none;
  }
`;

const ResponsivePlayer1 = styled(Player)`
  height: 600px;
  width: 600px;
  position: absolute;
  top: -120px;
  right: -120px;

  transform: rotate(-210deg);
  @media (max-width: 768px) {
    display: none;
  }
`;

const ResponsivePlayer2 = styled(Player)`
  width: 400px;
  position: absolute;
  bottom: 50px;
  left: -120px;

  transform: rotate(-210deg);
  @media (max-width: 768px) {
    display: none;
  }
`;

const ResponsivePlayer3 = styled(Player)`
  width: 400px;
  position: absolute;
  bottom: 50px;
  right: -120px;

  transform: rotate(30deg);
  @media (max-width: 768px) {
    display: none;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const UploadLabel = styled.label`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #3f51b5;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-block;

  &:hover {
    background-color: #303f9f;
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const Container = styled.div`
  display: flex;
  position: relative;
  overflow: hidden;
  justify-content: center;
  // align-items: center;
  height: 100vh;
  padding: 20px;
  background-color: #f0f2f5;
  overflow-y: scroll;
  @media (max-width: 768px) {
    // height: 96vh;
    // margin-top: 20px;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 400;
  max-width: 800px;
  width: 100%;
  min-height: 90%;
  height: fit-content;
  padding: 20px;
  margin-top: 65px;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const Header = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const UploadSection = styled.div`
  text-align: center;
  padding: 40px;
  border: 2px dashed ${(props) => (props.dragging ? "#3f51b5" : "#ddd")};
  border-radius: 10px;
  transition: border-color 0.3s;
  margin-bottom: 20px;
`;

const UploadIcon = styled(FiUpload)`
  font-size: 3rem;
  color: #3f51b5;
`;

const UploadText = styled.p`
  margin-top: 20px;
  font-size: 1.2rem;
  color: #777;
`;

const UploadButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #3f51b5;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #303f9f;
  }
`;

const ToggleButtons = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button`
  padding: 10px 20px;
  width: 140px;
  background-color: ${(props) => (props.active ? "#3f51b5" : "#ddd")};
  color: ${(props) => (props.active ? "#fff" : "#333")};
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) => (props.active ? "#303f9f" : "#ccc")};
  }
`;

const StoredFilesSection = styled.div`
  margin-top: 20px;
`;

const StoredFilesHeader = styled.h2`
  font-size: 1.5rem;
  color: #333;
  text-align: center;
`;

const StoredFilesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StoredFileItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  background-color: #f0f0f0;
  justify-content: space-between;
  gap: 10px;
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #555;
`;

const FileName = styled.span`
  flex: 1;
  font-size: 1.2rem;
  color: #555;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  background-color: #00bcd4;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0097a7;
  }
`;

const DeleteButton = styled.button`
  padding: 5px 10px;
  background-color: #e91e63;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c2185b;
  }
`;

export default StorePage;
