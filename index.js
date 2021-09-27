const express = require("express");
const path = require("path");
const {
  userJoin,
  userLeave,
  getCurrentUser,
  getRoomUsers,
} = require("./utils/user");
const formatMessage = require("./utils/message");

const current_rooms = [];

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "client")));

io.on("connection", (socket) => {
  socket.on("room-create", (code) => {
    current_rooms.push(code);
    socket.emit("room-created", code);
  });

  socket.on("room-join", (code) => {
    if (current_rooms.includes(code)) socket.emit("room-joined", code);
  });

  socket.on("new-user", ({ code, username }) => {
    const user = userJoin(socket.id, username, code);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", "Welcome to ChatCord!");

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit("message", `${user.username} has joined the chat`);

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("chat", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit("message", `${user.username} has left the chat`);

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on 3000");
});
