import React, { createRef, useEffect, useRef, useState } from "react";
import {
  DownOutlined,
  MoreOutlined,
  SendOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { RiCheckDoubleLine } from "react-icons/ri";
import moment from "moment";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Form,
  Input,
  Select,
  Space,
} from "antd";
import CustomAPI from "../api/CustomAPI";
import useToast from "./NotificationPopup";
import CustomModal from "./CustomModal";
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../store/reducers/userReducer";

const RightChatWindow = ({
  socket,
  allUsers,
  // roomId,
  // setcurrIndex,
  isNew,
  fetchConvoList,
  chats,
  setChats,
  setConvoList,
  convoList,
  // currIndex,
}) => {
  const { contextHolder, showToast } = useToast();
  const [profileModal, setProfileModal] = useState(false);
  const dispatch = useDispatch();
  const { setCurrUserData, setReduxCurrIndex } = userActions;
  const loginData = useSelector((state) => state.loginUser);
  const currIndex = useSelector((state) => state.currIndex);
  const currUser = useSelector((state) => state.currUser);
  const [editGroup, setEditGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState(null);
  const [roomId, setRoomId] = useState(currUser?.convoId);
  const [participantList, setParticipantList] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setRoomId(currUser?.convoId);

    if (currUser?.isGroup) {
      setEditGroupName(currUser?.groupName);
      const tempArr = currUser?.users.filter(
        (i) => i._id !== currUser?.admin?._id
      );
      setParticipantList(tempArr.map((i) => i._id));
    } else {
      fetchUserData(currUser?.receiverId);
    }
  }, [currUser]);

  const fetchUserData = async (receiverId) => {
    const reqObj = {
      reqType: "user",
      route: "/find-user",
      method: "POST",
      customHeaders: {},
      data: { receiverId },
    };

    const api = await CustomAPI(reqObj);
    console.log("api", api);
    if (api?.status) {
      // showToast("success", api?.message);
      console.log("User Status", api?.data?.isOnline);
      // localStorage.setItem("user", JSON.stringify(api?.data));
      // dispatch(addUserData(api?.data));
      setIsOnline(api?.data?.isOnline);
    } else {
      showToast("error", api?.error);
    }
  };

  // Message Input states
  const [msgInput, setMsgInput] = useState("");
  const [emoji, setEmoji] = useState(false);

  // Scorll down
  const listRef = useRef(null);
  const messageEl = useRef(null);

  // console.log("Right Chat Window currUser", currUser);

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
      data: { convoId: roomId, receiverId: currUser?.receiverId },
    };

    const api = await CustomAPI(reqObj);

    if (api?.status) {
      setChats(() => api?.chats);
      // if (api?.convoId !== roomId) {
      //   const oldData = convoList.find(
      //     (i) => i.receiverId === currUser?.receiverId
      //   );
      //   delete oldData?.isNew;
      //   oldData.convoId = api?.convoId;

      //   setConvoList((prev) => {
      //     let newArr = [...prev];

      //     const tempIdx = newArr.findIndex(
      //       (i) => i.receiverId === oldData.receiverId
      //     );

      //     newArr.splice(tempIdx, 1, oldData);

      //     return newArr;
      //   });
      //   showToast("success", "New conversation added!");
      // }
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

  console.log("convoList", convoList);

  const sendMessage = async () => {
    console.log("sent");
    if (msgInput.trim() !== "") {
      const newMsg = {
        senderId: loginData?._id,
        message: msgInput,
        convoId: roomId,
        receiverId: currUser?.receiverId,
        createdAt: Date.now(),
        senderName: loginData?.name,
        isGroup: currUser?.isGroup,
        groupName: currUser?.isGroup ? currUser?.groupName : null,
      };
      // console.log("newMsg", newMsg);

      socket.emit("sendMessage", roomId, newMsg, currUser?.convoId);

      if (isNew) {
        fetchConvoList();
      }
      setMsgInput(() => "");
    }
  };

  const deleteConversationHandler = async () => {
    console.log("Delete Conversation");

    const confirmDeletion = window.confirm("Are you sure, you want to delete?");

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

      if (api?.status) {
        showToast("success", api?.message);
        fetchConvoList();
        dispatch(setCurrUserData(convoList[currIndex - 1]));
        dispatch(setReduxCurrIndex(currIndex - 1));
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

  // console.log(
  //   "currUser.users.find((i) => i._id === currUser?.admin)",
  //   currUser.users.find((i) => i._id === currUser?.admin)
  // );

  // console.log("currUser.users", currUser.users);

  // const groupAdminDetails = currUser?.users.find(
  //   (i) => i._id === currUser?.admin
  // );

  // console.log("groupAdminDetails", groupAdminDetails);
  const options = allUsers.map((i) => ({ label: i.name, value: i._id }));

  console.log("participantList", participantList);
  const handleParticipantListChange = (e) => {
    // const arr = e;
    // arr.append(currUser?.admin._id);
    // console.log("arr", arr);
    const arr = Object.values(e);
    // arr.push(currUser?.admin?._id);
    setParticipantList(() => arr);
    console.log("allUsers", allUsers);
    // console.log("participantList", participantList);
  };

  const editGroupHandler = async () => {
    participantList.push(currUser?.admin?._id);

    const obj = {
      users: participantList,
      convoId: roomId,
      groupName: editGroupName,
    };
    //   {
    //     "isGroup": true,
    //     "groupName": "Demo Group",
    //     "convoId": "6657fe209d8f3d5fdcf9595a",
    //     "admin": {
    //         "email": "margish@gmail.com",
    //         "name": "Margish",
    //         "_id": "665040c4ef35676b0ff0e5ae"
    //     },
    //     "users": [
    //         {
    //             "_id": "664ae6236046ab8f1586c9d5",
    //             "email": "vd@gmail.com",
    //             "name": "VD"
    //         },
    //         {
    //             "_id": "664aea18ed9609df939bea8e",
    //             "email": "anuj@gmail.com",
    //             "name": "Anuj"
    //         },
    //         {
    //             "_id": "665040c4ef35676b0ff0e5ae",
    //             "email": "margish@gmail.com",
    //             "name": "Margish"
    //         }
    //     ]
    // }
    console.log("obj", obj);

    const reqObj = {
      reqType: "chat",
      route: "/edit-group",
      method: "POST",
      customHeaders: {},
      data: obj,
    };

    const api = await CustomAPI(reqObj);
    console.log("api", api);
    if (api?.status) {
      showToast("success", api?.message);
      console.log("api?.data", api?.data);
      // localStorage.setItem("user", JSON.stringify(api?.data));
      // dispatch(addUserData(api?.data));
    } else {
      showToast("error", api?.error);
    }
    setProfileModal(false);
    fetchConvoList();
  };

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
          <span className="text-2xl font-medium text-center">
            {currUser?.isGroup ? "Group Details" : "User Details:"}
          </span>
          <div className="flex flex-col items-center my-4">
            <div className="flex-col flex items-center">
              <Avatar
                className="w-12 h-12"
                icon={<UserOutlined className="text-3xl" />}
              />
              {!currUser?.isGroup && (
                <span className="text-lg">
                  {currUser?.lastSeen || "Last Seen"}
                </span>
              )}
            </div>

            <div className="flex flex-col text-black justify-around my-4 bg-gray-100 w-[100%] rounded-xl h-fit p-6 text-lg">
              <span className="text-xl flex items-center my-2">
                <span className="  w-[30%] ">
                  {currUser?.isGroup ? "Group Name:" : "Name:"}
                </span>
                <input
                  disabled={!editGroup}
                  value={currUser?.isGroup ? editGroupName : currUser?.name}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="border-2 border-black p-1 rounded-lg w-[70%] "
                />
              </span>
              {currUser?.isGroup && (
                <span className="text-xl flex items-center my-2">
                  <span className="  w-[30%] ">Admin:</span>
                  <span className="border-2 border-black p-1 rounded-lg w-[70%] ">
                    {currUser?.admin.name}
                  </span>
                </span>
              )}
              <span className="text-xl flex items-center my-2 w-full">
                {currUser?.isGroup ? (
                  <div className="flex w-full">
                    <span className="  w-[30%]">Participants:</span>
                    {editGroup ? (
                      <Select
                        mode="multiple"
                        // style={{
                        //   width: "100%",
                        // }}
                        o
                        className=" my-1  w-[70%] rounded-md"
                        placeholder="Please select"
                        defaultValue={participantList}
                        onChange={(e) => handleParticipantListChange(e)}
                        options={options}
                      />
                    ) : (
                      <div className="user-chat-container flex flex-col border-2 border-black p-3 overflow-auto h-[150px] rounded-lg w-[70%]">
                        {currUser?.users.map((i, index) => (
                          <span
                            className="bg-gray-200 my-1 px-5 p-1 flex justify-between rounded-md"
                            key={index}
                          >
                            <span>{i.name}</span>
                            <span>{i._id === loginData._id && "(You)"}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <span className=" w-[30%] ">Email:</span>
                    <span className="border-2 border-black p-1 rounded-lg w-[70%]">
                      {currUser?.email}
                    </span>
                  </>
                )}
              </span>

              {/* {editGroup && (
                <span className="text-xl flex items-center my-2">
                  <span className="  w-[30%] ">Admin:</span>
                  <span className="border-2 border-black p-1 rounded-lg w-[70%] ">
                    {currUser?.admin.name}
                  </span>
                </span>
              )} */}

              {currUser?.admin?._id === loginData._id && (
                <span
                  className="text-xl flex mx-auto items-center my-2"
                  onClick={() => setEditGroup((prev) => !prev)}
                >
                  <Button
                    type="primary"
                    onClick={editGroup ? editGroupHandler : null}
                  >
                    {editGroup ? "Save Changes" : "Edit Group "}
                  </Button>
                </span>
              )}
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Chat Container  */}
      <div className="h-full">
        <div className="profile-header h-[10%] text-2xl  flex items-center justify-between bg-[#5c6ac4] rounded-tl-xl rounded-tr-xl ">
          <span
            className="mx-8 w-fit overflow-hidden flex items-center cursor-pointer "
            onClick={() => setProfileModal(true)}
          >
            <Avatar
              className="w-10 h-10"
              icon={<UserOutlined className="text-xl" />}
            />
            <span className="mx-2  text-white ">
              {currUser?.name || currUser?.groupName}
            </span>

            {currUser?.isGroup === false && (
              <span className="ms-3">
                <Badge
                  styles={{
                    indicator: {
                      height: "10px",
                      width: "10px",
                    },
                  }}
                  status={isOnline ? "success" : "error"}
                />
              </span>
            )}
          </span>
          {currUser?.admin === loginData._id || currUser?.isGroup === false ? (
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
          ) : null}
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
                    alignItems: i.senderId === loginData?._id ? "end" : "start",
                  }}
                  className=" w-[70%]  flex flex-col  "
                >
                  {currUser?.isGroup === true &&
                    i.senderId !== loginData?._id && (
                      <div className="flex items-center mb-1 ms-1">
                        <span className="text-xs me-1">{i?.senderName}</span>
                        <span>
                          {/* <RiCheckDoubleLine
                            // className="text-blue-500"
                            style={{
                              color: i.status === "read" ? "blue" : "black",
                            }}
                          /> */}
                        </span>
                      </div>
                    )}
                  <span
                    className="pl-2 pb-1 pr-1 pt-1 rounded-lg bg-white"
                    style={{
                      background:
                        i.senderId !== loginData?._id ? "white" : "#e6e8f0",
                      color: i.senderId !== loginData?._id ? "black" : "black",
                      boxShadow:
                        i.senderId !== loginData?._id
                          ? "0px 3px 5px  #C7C8CC"
                          : "0px 2px 5px  #C7C8CC",
                      minWidth: "130px",
                    }}
                  >
                    <span>{i.message}</span>

                    <div className="flex justify-end items-center ">
                      <span className="text-xs me-1 ">
                        {moment(i.createdAt).format("LT")}
                      </span>
                      {i.senderId === loginData?._id && (
                        <span>
                          <RiCheckDoubleLine
                            // className="text-blue-500"
                            style={{
                              color: i.status === "read" ? "blue" : "black",
                            }}
                          />
                        </span>
                      )}
                    </div>
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
