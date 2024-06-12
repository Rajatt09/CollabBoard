import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { store } from "../utils/store.js";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import axios from "axios";

axios.defaults.withCredentials = true;

if (import.meta.env.DEV) {
  console.log("Running in development mode");
  axios.defaults.baseURL = import.meta.env.VITE_LOCALHOST;
} else {
  console.log("Running in production mode");
  axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <GoogleOAuthProvider clientId="476507831071-k6jpckrm0luapjd73gdbb3iue1pjrahi.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
