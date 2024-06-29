// import { server } from "../app.js";
import { Server } from "socket.io";

const emailToSocket = new Map();

const socketIdToEmailMapping = new Map();
const emailToData = new Map();
let hostId, room;

const socketConnection = async (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.emit("me", { id: socket.id });

    socket.on("join-room", ({ roomId, name, email, hostStatus }) => {
      console.log(
        `${name} with email ${email} joined room ${roomId} `,
        socket.id
      );

      socket.join(roomId);

      emailToSocket.set(email, socket.id);
      socketIdToEmailMapping.set(socket.id, email);

      if (!hostStatus) {
        console.log("called");
        if (roomId == room) {
          socket.to(hostId).emit("allow-permission", {
            userName: name,
            userEmail: email,
            userId: socket.id,
            roomId,
          });
        }
        socket.emit("joined-room", { admin: false });
      } else {
        hostId = socket.id;
        room = roomId;
        socket.emit("joined-room", { roomId, admin: true });
      }

      //   socket.emit("joined-room", { roomId });
      //   socket.broadcast.to(roomId).emit("user-joined", { name, email });
    });

    socket.on(
      "permission-status",
      ({ id, roomId, name, email, allow, offer, from }) => {
        console.log("permission-status called: ", id);
        const hostEmail = socketIdToEmailMapping.get(hostId);
        if (allow) {
          emailToData.set(email, { id, name });
          io.to(id).emit("permission-status", {
            roomId,
            allow,
            offer,
            from,
            email: hostEmail,
            myEmail: email,
            other: Object.fromEntries(emailToData),
          });

          io.to(room).emit("user-joined", {
            emailToData: Object.fromEntries(emailToData),
          });
        } else {
          io.to(id).emit("permission-status", {
            roomId,
            allow,
            offer,
            from,
            email: hostEmail,
            myEmail: email,
            other: Object.fromEntries(emailToData),
          });
        }
      }
    );

    socket.on("call-user", ({ email, mail, offer, from }) => {
      const socketId = emailToSocket.get(email);

      socket.to(socketId).emit("incomming-call", {
        from,
        offer,
        email: mail,
        myEmail: email,
      });
    });

    socket.on("call-accepted", ({ from, ans, email, mail }) => {
      console.log("call-accepted called", from);
      const socketId = emailToSocket.get(mail);

      socket.to(socketId).emit("call-accepted", { ans, email });
    });

    socket.on("hand-raise", ({ email, hand }) => {
      io.to(room).emit("hand-raise", { email, hand });
    });

    socket.on("messages", ({ email, message }) => {
      console.log("email and message is: ", email, " and ", message);
      io.to(room).emit("messages", { email, message });
    });

    socket.on("draw-start", (data) => {
      console.log("draw start called", data);
      io.to(room).emit("draw-start", data);
    });

    socket.on("draw-progress", (data) => {
      io.to(room).emit("draw-progress", data);
    });

    socket.on("draw-end", () => {
      io.to(room).emit("draw-end");
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      const email = socketIdToEmailMapping.get(socket.id);
      if (email) {
        // const roomId = socket.rooms.values().next().value;
        socket.leave(room);
        emailToSocket.delete(email);
        socketIdToEmailMapping.delete(socket.id);
        emailToData.delete(email);
        io.to(room).emit("user-disconnected", {
          email,
          emailToData: Object.fromEntries(emailToData),
        });
      }
    });
  });
};

export default socketConnection;
