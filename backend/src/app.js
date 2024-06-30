import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import socketConnection from "./socketConnection/socket.js";
const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "https://collab-lime.vercel.app"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/public", express.static("public"));

app.use(cookieParser());

const server = http.createServer(app);

//routes import

import userRouter from "./routes/user.routes.js";

//routes declaration

app.use("/api/v1/users", userRouter);

//socket Connection

socketConnection(server);

export { app, server };
