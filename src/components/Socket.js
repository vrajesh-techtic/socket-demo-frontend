import { io } from "socket.io-client";

let socket;
const connectSocket = () => {
  socket = io("http://localhost:8000");
  socket.on("connect", () => {
    console.log("Socket connected!");
  });
};

const sendMessage = (msgInput) => {
  socket.emit("Room1", msgInput);
  socket.on("Room1", (msg) => {
    console.log(msg);
  });
};

const disconnectHandler = () => {
  socket.disconnect();
  socket.on("disconnect", (msg) => {
    console.log(msg);
  });
};

export { connectSocket, sendMessage, disconnectHandler };
