import React, { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import { useSelector } from "react-redux";
import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import useToast from "./NotificationPopup";

const MainChatComponent = ({ socket }) => {
  

  

  return (
    <>
      <ChatWindow
        socket={socket}
        notifications={notifications}
        sendNotification={sendNotification}
      />
    </>
  );
};

export default MainChatComponent;
