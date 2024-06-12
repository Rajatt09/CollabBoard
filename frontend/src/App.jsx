import "./App.css";
import Layout from "./Layout/Layout";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./LandingPage/LandingPage";
import Dashboard from "./Dashboard/Dashboard";
import NavBar from "./Navbar/Navbar";
import SignUp from "./Login/Signup.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { updateUserinfo } from "../utils/counterSlice.js";
import InnerLoading from "./Loading/InnerLoading.jsx";
import Notification from "./Loading/Notification.jsx";
import Board from "./Whiteboard/Board.jsx";

function App() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const userinfo = useSelector((state) => state.userinfo);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    async function redirectingfunction() {
      try {
        const res = await axios.post(`/users/redirecting`, {});

        if (res.status == 200) {
          dispatch(
            updateUserinfo({
              email: res.data.data.email,
              phone: res.data.data.phnumber,
              joined: res.data.data.createdAt,
              show: true,
            })
          );
        }
      } catch (error) {
        console.error("Error while redirecting: ", error);
      } finally {
        setLoading(false);
      }
    }
    redirectingfunction();
  }, []);

  return (
    <>
      <NavBar openModal={openModal} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/user/whiteboard" element={<Board />} />

        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>

      {isModalOpen && <SignUp closeModal={closeModal} />}
      <InnerLoading />
      <Notification />
      {/* <Board /> */}
    </>
  );
}

export default App;
