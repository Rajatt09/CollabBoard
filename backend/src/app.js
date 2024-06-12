import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));

app.use(cookieParser());

const server = http.createServer(app);

//routes import

import userRouter from "./routes/user.routes.js";

//routes declaration

app.use("/api/v1/users", userRouter);

export { app, server };
