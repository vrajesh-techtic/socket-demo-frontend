import { useEffect, useState } from "react";
import { Avatar, Button, Input, Select } from "antd";
import LeftChatWindow from "./LeftChatWindow";
import RightChatWindow from "./RightChatWindow";
import { UserOutlined } from "@ant-design/icons";
import CustomAPI from "../api/CustomAPI";
import chatBg from "../assets/chatBg.png";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../store/reducers/userReducer";
import useToast from "./NotificationPopup";
// const chatHistory = [
//   {
//     user: "User - 1",
//     userId: "001",
//     chats: [],
//   },
// ];

// const chatHistory = [
//   { user: "sender", message: "Hii" },
//   { user: "receiver", message: "How are you?" },
//   { user: "sender", message: "My name is Vrajesh" },
//   { user: "receiver", message: "Where do you live?" },
//   { user: "sender", message: "Great I live in Gandhinagar!" },
//   { user: "receiver", message: "Hello" },
//   { user: "sender", message: "I am fine!" },
//   { user: "sender", message: "What about you?" },
//   { user: "receiver", message: "My name is Anirudh" },
//   { user: "sender", message: "I live in Kutch" },
//   { user: "sender", message: "What about you?" },
//   { user: "receiver", message: "My name is Anirudh" },
// ];

const ChatWindow = ({ socket }) => {
  const [currUser, setCurrUser] = useState(null);
  const [currIndex, setcurrIndex] = useState(
    useSelector((state) => state.currIndex) || null
  );
  const [convoList, setConvoList] = useState([]);
  const [userData, setUserData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [notifications, setNotifications] = useState({});
  const { contextHolder, showToast } = useToast();
  const loginData = useSelector((state) => state.user);
  const senderId = loginData?._id;
  const dispatch = useDispatch();
  const { setCurrUserData } = userActions;
  const [room, setRoom] = useState(null);
  // const [currData, setCurrData] = useState(null);

  const changeCurrUserHandler = (index) => {
    setCurrUser(() => index);
    console.log("convoList[index]", convoList[index]);
    dispatch(setCurrUserData(convoList[index]));
  };

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
  useEffect(() => {
    fetchAllUsers();
    fetchConvoList();
  }, []);

  const sendNotification = (senderName, message) => {
    const title = (
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

    const description = <span className="ms-14 text-lg">{message}</span>;
    showToast("open", title, description);
  };

  useEffect(() => {
    console.log("Notify called!");
    const handleNotify = (msgObj) => {
      console.log("received notification:", msgObj);
      console.log("userData?.receiverId", userData?.receiverId);
      if (msgObj?.senderId !== userData?.receiverId) {
        const findUser = convoList.find(
          (i) => i.receiverId === msgObj?.senderId
        );
        // if (findUser) {
        //   console.log("findUser", findUser);

        //   const tempIdx = convoList.indexOf(findUser);

        //   findUser.unread = findUser?.unread + 1 || 1;

        //   convoList.splice(tempIdx, 1, findUser);
        // }

        sendNotification(findUser?.name, msgObj?.message);
        // if (!findUser) {
        //   setTimeout(() => {
        //     console.log("Fetch New COnvo");
        //     fetchConvoList();
        //   }, 500);
        // }
      }
      setNotifications(msgObj);
    };

    if (senderId) {
      socket.on("notify", handleNotify);
      socket.emit("join", senderId);
      console.log("Started Listening to Notification");
      console.log("senderId", senderId);
    }

    return () => {
      if (senderId) {
        console.log("Cleaning up listeners for Notification:", senderId);
        socket.emit("leaveRoom", senderId);
        socket.off("notify", handleNotify);
      }
    };
  }, [userData, currIndex]);

  useEffect(() => {
    setUserData(() => convoList[currIndex] || []);
    setRoom(() => convoList[currIndex]?.convoId);

    // setReceiverId(() => userData?.receiverId);
  }, [convoList, currIndex]);

  console.log("Chat WIndow called");

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
            convoList={convoList}
            setConvoList={setConvoList}
            allUsers={allUsers}
            currIndex={currIndex}
            setcurrIndex={setcurrIndex}
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
          {userData.length !== 0 ? (
            <RightChatWindow
              socket={socket}
              roomId={room}
              // chats={chats}
              // setChats={setChats}
              isNew={userData?.isNew || false}
              fetchConvoList={fetchConvoList}
              currIndex={currIndex}
              setcurrIndex={setcurrIndex}
              currUser={currUser}
              userData={userData}
              changeCurrUserHandler={changeCurrUserHandler}
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
