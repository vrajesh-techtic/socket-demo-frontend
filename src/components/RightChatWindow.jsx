import React, { createRef, useEffect, useRef, useState } from "react";
import {
  DownOutlined,
  MoreOutlined,
  SendOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Form, Input, Space } from "antd";
import CustomAPI from "../api/CustomAPI";
import useToast from "./NotificationPopup";
import CustomModal from "./CustomModal";
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../store/reducers/userReducer";

const RightChatWindow = ({
  socket,
  roomId,
  setcurrIndex,
  isNew,
  fetchConvoList,
  userData,
  currIndex,
}) => {
  const [msgInput, setMsgInput] = useState("");
  const [emoji, setEmoji] = useState(false);
  const { contextHolder, showToast } = useToast();
  const [profileModal, setProfileModal] = useState(false);
  const listRef = useRef(null);
  const messageEl = useRef(null);
  const dispatch = useDispatch();
  const { setCurrUserData, setReduxCurrIndex } = userActions;
  const loginData = useSelector((state) => state.user);
  const currUser = useSelector((state) => state.currUser);

  const [chats, setChats] = useState([]);

  const scrollToBottom = (messageEl) => {
    if (messageEl) {
      messageEl.current.addEventListener("DOMNodeInserted", (event) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: "smooth" });
      });
    }
  };

  const fetchChats = async () => {
    const reqObj = {
      reqType: "chat",
      route: "/fetch-chats",
      method: "POST",
      headers: {
        withCredentials: true,
      },
      data: { convoId: roomId },
    };

    const api = await CustomAPI(reqObj);

    if (api?.status) {
      setChats(() => api?.chats);
      listRef.current?.lastElementChild?.scrollIntoView();
      scrollToBottom(messageEl);
    } else {
      setChats(() => []);
    }
  };

  // useEffect to fetch chats of current user
  useEffect(() => {
    if (roomId) {
      fetchChats();
      console.log("Fetching Chat API called...");
    }
  }, [roomId]);

  // UseEffect for receiving messages from socket
  useEffect(() => {
    const handleReceiveMessage = (msgObj) => {
      console.log("received message:", msgObj);
      setChats((prev) => [...prev, msgObj]);
    };

    if (roomId) {
      socket.on("receiveMessage", handleReceiveMessage);
      socket.emit("join", roomId);
      console.log("Started Listening");
    }

    return () => {
      if (roomId) {
        console.log("Cleaning up listeners and leaving room:", roomId);
        socket.emit("leaveRoom", roomId);
        socket.off("receiveMessage", handleReceiveMessage);
      }
    };
  }, [roomId, socket]);

  const sendMessage = async () => {
    console.log("sent");
    if (msgInput.trim() !== "") {
      const msgObj = {
        senderId: loginData?._id,
        message: msgInput,
        createdAt: Date.now(),
      };
      socket.emit("sendMessage", roomId, msgObj, userData?.receiverId);

      setChats((prev) => {
        let newChat = [...prev];
        newChat.push(msgObj);
        return newChat;
      });

      const reqObj = {
        reqType: "chat",
        route: "/send-message",
        method: "POST",
        headers: {
          withCredentials: true,
        },
        data: {
          convoId: roomId,
          message: msgInput,
          receiverId: userData?.receiverId,
        },
      };

      const api = await CustomAPI(reqObj);

      console.log("Send message API...", api);
      if (isNew) {
        fetchConvoList();
      }

      setMsgInput(() => "");
    }
  };

  const deleteConversationHandler = async () => {
    console.log("Delete Conversation");
    console.log("roomId", roomId);
    if (chats.length === 0) {
      fetchConvoList();
      setcurrIndex((prev) => prev - 1);
      dispatch(setReduxCurrIndex(currIndex - 1));
      // changeCurrUserHandler(currUser - 1);
      // setCurrUser((prev) => prev - 1);
      return;
    }

    const confirmDeletion = window.confirm("Are you sure, you want to delete?");

    console.log("confirmDeletion", confirmDeletion);

    if (confirmDeletion) {
      const reqObj = {
        reqType: "chat",
        route: "/delete-conversation",
        method: "POST",
        headers: {
          withCredentials: true,
        },
        data: { convoId: roomId },
      };

      const api = await CustomAPI(reqObj);

      console.log("api", api);

      if (api?.status) {
        showToast("success", api?.message);
        fetchConvoList();
        // changeCurrUserHandler(currUser - 1);
        setcurrIndex((prev) => prev - 1);
        dispatch(setReduxCurrIndex(currIndex - 1));
        // setCurrUser((prev) => prev - 1);
      } else {
        showToast("error", api?.error);
      }
    }
  };

  const clearChatsHandler = async () => {
    if (chats.length === 0) {
      showToast("error", "No chats present!");
      return;
    }

    const reqObj = {
      reqType: "chat",
      route: "/clear-chats",
      method: "POST",
      headers: {
        withCredentials: true,
      },
      data: { convoId: roomId },
    };

    const api = await CustomAPI(reqObj);

    console.log("api", api);

    if (api?.status) {
      showToast("success", api?.message);
      fetchChats();
    } else {
      showToast("error", api?.error);
    }
  };

  const items = [
    {
      label: (
        <span onClick={clearChatsHandler} className="w-full ">
          Clear Chats
        </span>
      ),
      key: "0",
    },
    {
      label: (
        <span onClick={deleteConversationHandler} className="w-full">
          Delete Conversation
        </span>
      ),
      key: "1",
    },
  ];

  return (
    <>
      {contextHolder}
      {/* Profile Modal  */}
      <CustomModal
        closable={true}
        modalOpen={profileModal}
        setModalOpen={setProfileModal}
      >
        <div className="flex flex-col  bg-[#5c6ac4] text-white p-8 rounded-xl">
          <span className="text-2xl font-medium text-center">User Profile</span>
          <div className="flex flex-col items-center my-4">
            <div className="flex-col flex items-center">
              <Avatar
                className="w-12 h-12"
                icon={<UserOutlined className="text-3xl" />}
              />
              <span className="text-lg">
                {userData?.lastSeen || "Last Seen"}
              </span>
            </div>

            <div className="flex flex-col text-black justify-around my-4 bg-gray-100 w-[80%] rounded-xl h-[200px] p-6 text-lg">
              <span className="text-xl flex items-center my-2">
                <span className=" me-4 w-[20%]">Name:</span>
                <span className="border-2 border-black p-1 rounded-lg w-[80%]">
                  {userData?.name}
                </span>
              </span>
              <span className="text-xl flex items-center my-2">
                <span className=" me-4 w-[20%]">Email:</span>
                <span className="border-2 border-black p-1 rounded-lg w-[80%]">
                  {userData?.email}
                </span>
              </span>
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Chat Container  */}
      <div className="h-full">
        <div className="profile-header h-[10%] text-2xl  flex items-center justify-between bg-[#5c6ac4] rounded-tl-xl rounded-tr-xl ">
          <span
            className="mx-8 w-[25%] overflow-hidden flex items-center cursor-pointer "
            onClick={() => setProfileModal(true)}
          >
            <Avatar
              className="w-10 h-10"
              icon={<UserOutlined className="text-xl" />}
            />
            <span className="mx-2 w-[70%] text-white ">{userData?.name}</span>
          </span>

          <Dropdown
            menu={{
              items,
            }}
            trigger={["click"]}
            className="mx-8 cursor-pointer"
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <MoreOutlined className="text-white text-2xl" />
              </Space>
            </a>
          </Dropdown>
        </div>

        <div className="display-message h-[80%] px-2 flex flex-col justify-end border-l-2 border-r-2 border-[#B4B4B8] ">
          <div
            ref={messageEl}
            className="user-chat-container  overflow-auto px-3"
          >
            {chats?.map((i, key) => (
              <div
                key={key}
                style={{
                  justifyContent:
                    i.senderId === loginData?._id ? "end" : "start",
                }}
                className=" my-2 flex "
              >
                <div
                  style={{
                    justifyContent:
                      i.senderId === loginData?._id ? "end" : "start",
                  }}
                  className=" w-[70%]  flex justify-start "
                >
                  <span
                    className="p-3 rounded-lg bg-white"
                    style={{
                      background:
                        i.senderId !== loginData?._id ? "white" : "#e6e8f0",
                      color: i.senderId !== loginData?._id ? "black" : "black",
                      boxShadow:
                        i.senderId !== loginData?._id
                          ? "0px 3px 5px  #C7C8CC"
                          : "0px 2px 5px  #C7C8CC",
                      minWidth: "100px",
                    }}
                  >
                    {i.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Form className="message-container bg-[#f4f5f7] border-2 border-[#B4B4B8] h-[10%] py-4 flex items-center rounded-bl-xl rounded-br-xl">
          <div className="emoji-container mx-8">
            <span className="text-3xl cursor-pointer relative">
              <SmileOutlined
                className="text-[#5c6ac4]"
                onClick={() => setEmoji(true)}
              />
              <EmojiPicker
                className="text-white absolute"
                open={emoji}
                theme="dark"
                // height={200}
                onEmojiClick={(temp) => {
                  setMsgInput((prev) => prev + temp.emoji);
                  setEmoji(false);
                }}
                style={{ position: "absolute", top: "-450px" }}
              />
            </span>
          </div>

          <div className="message-input-container flex items-center h-full w-full">
            <input
              className="w-full border-2 border-[#B4B4B8]  px-4 py-2 rounded-lg"
              type="text"
              value={msgInput}
              placeholder="Type your message here"
              onChange={(e) => setMsgInput(e.target.value)}
            />
            {/* <InputEmoji
            value={msgInput}
            onChange={setMsgInput}
            cleanOnEnter
            onEnter={sendMessage}
            placeholder="Type a message"
          /> */}
          </div>

          <button
            type="submit"
            onClick={sendMessage}
            className="send-button bg-[#5c6ac4] rounded-full p-2 flex justify-center cursor-pointer text-2xl items-center mx-8"
          >
            <SendOutlined className="text-white" />
          </button>
        </Form>
      </div>
    </>
  );
};

export default RightChatWindow;
