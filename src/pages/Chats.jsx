import { io } from "socket.io-client";
import ChatWindow from "../components/ChatWindow";
import WithAuth from "../auth/WithAuth";
import ChatNavbar from "../components/ChatNavbar";
import { useEffect, useState } from "react";
import useToast from "../components/NotificationPopup";
import { useSelector } from "react-redux";

const Chats = () => {
  const socket = io(import.meta.env.VITE_BACKEND_URL);
  socket.on("connect", () => {
    console.log("Socket connected!");
  });
  // const loginData = JSON.parse(localStorage.getItem("user"));
  const [currUser, setCurrUser] = useState(
    useSelector((state) => state.currUser)
  );
  console.log("currUser", currUser);
  

  return (
    <>
      <div className="flex flex-col h-screen p-2 justify-between">
        {/* <ChatNavbar /> */}

        <ChatWindow socket={socket} />
        {/* <ChatWindow /> */}
      </div>
    </>
  );
};

export default WithAuth(Chats);
