import { useEffect, useState } from "react";
import LeftChatWindow from "./LeftChatWindow";
import RightChatWindow from "./RightChatWindow";
import CustomAPI from "../api/CustomAPI";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../store/reducers/userReducer";
import useToast from "./NotificationPopup";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

const ChatWindow = ({ socket }) => {
  const { contextHolder, showToast } = useToast();
  const loginData = useSelector((state) => state.loginUser);
  const currIndex = useSelector((state) => state.currIndex);
  const currUser = useSelector((state) => state.currUser);
  const [chats, setChats] = useState([]);

  const [tempData, setTempData] = useState(currUser);
  useEffect(() => {
    setTempData(currUser);
  }, [currUser]);
  console.log("currUser", currUser);
  console.log("loginData", loginData);
  const senderId = loginData?._id;

  // List of registered Users
  const [allUsers, setAllUsers] = useState([]);

  // Conversation List
  const [convoList, setConvoList] = useState([]);

  const fetchAllUsers = async () => {
    const reqObj = {
      reqType: "user",
      route: "/users-list",
      method: "GET",
      headers: {
        withCredentials: true,
      },
      // data: values,
    };

    const api = await CustomAPI(reqObj);

    if (api?.status) {
      setAllUsers(() => api?.data);
    }
  };

  const fetchConvoList = async () => {
    const reqObj = {
      reqType: "chat",
      route: "/get-convo-list",
      method: "GET",
      headers: {
        withCredentials: true,
      },
    };

    const api = await CustomAPI(reqObj);

    if (api?.status) {
      setConvoList(() => api?.data);
    }
  };

  const sendNotification = (senderName, message, isGroup, groupName) => {
    const title = isGroup ? (
      <div className="flex flex-col  justify-center-center">
        <div className="flex items-center">
          <Avatar
            className="w-10 h-10"
            icon={<UserOutlined className="text-xl" />}
          />
          <span className="ms-4 text-lg font-medium">
            {groupName || "New User"}
          </span>
        </div>
      </div>
    ) : (
      <div className="flex items-center">
        <Avatar
          className="w-10 h-10"
          icon={<UserOutlined className="text-xl" />}
        />
        <span className="ms-4 text-lg font-medium">
          {senderName || "New User"}
        </span>
      </div>
    );

    const description = isGroup ? (
      <div>
        <span className="ms-14 text-lg font-medium">{senderName}:</span>
        <span className="ms-4 text-lg">{message}</span>
      </div>
    ) : (
      <span className="ms-14 text-lg">{message}</span>
    );
    showToast("open", title, description);
  };

  useEffect(() => {
    fetchAllUsers();
    fetchConvoList();
    socket.emit("join");
    return () => {
      socket.emit("leaveRoom");
    };
  }, []);
  // Notification Useffect
  // useEffect(() => {
  //   console.log("Notify called!");
  //   const handleNotify = (msgObj) => {
  //     console.log("received notification:", msgObj);

  //     if (msgObj?.convoId !== currUser?.convoId) {
  //       // if (findUser) {
  //       //   console.log("findUser", findUser);

  //       //   const tempIdx = convoList.indexOf(findUser);

  //       //   findUser.unread = findUser?.unread + 1 || 1;

  //       //   convoList.splice(tempIdx, 1, findUser);
  //       // }

  //       sendNotification(msgObj?.senderName, msgObj?.message);
  //       // if (!findUser) {
  //       //   setTimeout(() => {
  //       //     console.log("Fetch New COnvo");
  //       //     fetchConvoList();
  //       //   }, 500);
  //       // }
  //     }
  //   };

  //   if (senderId) {
  //     socket.on("notify", handleNotify);
  //     socket.emit("join", senderId);
  //     console.log("Started Listening to Notification");
  //     console.log("senderId", senderId);
  //   }

  //   return () => {
  //     if (senderId) {
  //       console.log("Cleaning up listeners for Notification:", senderId);
  //       socket.emit("leaveRoom", senderId);
  //       socket.off("notify", handleNotify);
  //     }
  //   };
  // }, [currUser]);
  // UseEffect for receiving messages from socket
  useEffect(() => {
    const handleReceiveMessage = (msgObj) => {
      console.log("received message:", msgObj);
      //   {
      //     "senderId": "664aea18ed9609df939bea8e",
      //     "convoId": "665596307eb3373a9279160f",
      //     "message": "Hey VD",
      //     "createdAt": "2024-05-31T04:05:57.492Z",
      //     "senderName": "Anuj"
      // }
      if (currUser?.convoId === msgObj?.convoId) {
        setChats((prev) => [...prev, msgObj]);
      } else {
        const findChat = convoList.findIndex(
          (i) => i.convoId === msgObj?.convoId
        );
        console.log("findChat", findChat);
        if (findChat === -1) {
          fetchConvoList();
        }
        if (msgObj?.isGroup) {
          sendNotification(
            msgObj?.senderName,
            msgObj?.message,
            true,
            msgObj?.groupName
          );
        } else {
          sendNotification(msgObj?.senderName, msgObj?.message, false);
        }
      }
    };

    const handleAcknowledgement = (ackObj) => {
      console.log("ackObj", ackObj);
      if (ackObj?.status) {
        const tempObj = ackObj?.message;
        tempObj.status = ackObj?.stage;

        console.log("tempObj", tempObj);
        setChats((prev) => {
          let newChat = [...prev];
          newChat.push(tempObj);
          return newChat;
        });

        // console.log("chats", chats);
      }
    };

    if (currUser?.convoId) {
      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("ACK", handleAcknowledgement);
      console.log("Started Listening");
    }

    return () => {
      if (currUser?.convoId) {
        console.log(
          "Cleaning up listeners and leaving room:",
          currUser?.convoId
        );
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("ACK", handleAcknowledgement);
      }
    };
  }, [currUser]);

  console.log("Chat WIndow called");
  console.log("convoList", convoList);
  console.log("allUsers", allUsers);
  return (
    <>
      {contextHolder}
      <div className="main-chat-container rounded-bl-xl  h-full flex">
        <div
          className="left-chat-container mr-2  w-[25%] flex flex-col h-full  "
          style={{
            // background: `url(${chatBg})`,
            backgroundColor: "#f4f5f7",

            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <LeftChatWindow
            socket={socket}
            convoList={convoList}
            setConvoList={setConvoList}
            allUsers={allUsers}
            fetchConvoList={fetchConvoList}
          />
        </div>

        <div
          className="right-chat-container w-[75%] rounded-xl  h-full flex flex-col justify-between"
          style={{
            // background: `url(${chatBg})`,
            backgroundColor: "#f4f5f7",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          {currUser?.convoId.trim() !== "" ? (
            <RightChatWindow
              socket={socket}
              chats={chats}
              setChats={setChats}
              allUsers={allUsers}
              isNew={currUser?.isNew || false}
              fetchConvoList={fetchConvoList}
              setConvoList={setConvoList}
              convoList={convoList}
              // currIndex={currIndex}
              // setcurrIndex={setcurrIndex}
            />
          ) : (
            <div className="h-full">
              <div className="h-[10%]  bg-[#5c6ac4] rounded-tl-xl rounded-tr-xl"></div>
              <div className="flex h-[90%] justify-center border-2 border-[#B4B4B8] rounded-bl-xl rounded-br-xl items-center text-5xl">
                Select a user to start chatting
              </div>
              {/* <div className="h-[10%]  bg-[#5c6ac4] rounded-bl-xl rounded-br-xl"></div> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
