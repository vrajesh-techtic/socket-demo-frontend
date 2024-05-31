import { io } from "socket.io-client";
import ChatWindow from "../components/ChatWindow";
import WithAuth from "../auth/WithAuth";
import ChatNavbar from "../components/ChatNavbar";
import { useEffect, useState } from "react";
import useToast from "../components/NotificationPopup";
import { useSelector } from "react-redux";
import MainChatComponent from "../components/MainChatComponent";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useCookies } from "react-cookie";

const Chats = () => {
  const socket = io(import.meta.env.VITE_BACKEND_URL, {
    withCredentials: true,
    secure: true,
  });
  socket.on("connect", () => {
    console.log("Socket connected!");
  });
  // const loginData = JSON.parse(localStorage.getItem("user"));
  // const [notifications, setNotifications] = useState({});

  return (
    <>
      <div className="flex flex-col h-screen p-2 justify-between">
        {/* <ChatNavbar /> */}
        {/* <MainChatComponent socket={socket} /> */}
        <ChatWindow socket={socket} />
        {/* <ChatWindow /> */}
        
      </div>
    </>
  );
};

export default WithAuth(Chats);
