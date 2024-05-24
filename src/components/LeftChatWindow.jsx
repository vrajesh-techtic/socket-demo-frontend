import React, { useEffect, useState } from "react";
import { Avatar, Badge, Button, Dropdown, Select, Space, Tooltip } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import CustomAPI from "../api/CustomAPI";
import CustomModal from "./CustomModal";
import useToast from "./NotificationPopup";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../store/reducers/userReducer";

const LeftChatWindow = ({
  convoList,
  setConvoList,
  allUsers,
  currIndex,
  setcurrIndex,
}) => {
  const [convoModal, setConvoModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [show, setShow] = useState(true);

  const { contextHolder, showToast } = useToast();

  // const localUserData = JSON.parse(localStorage.getItem("user"));
  const localUserData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { setCurrUserData, setReduxCurrIndex } = userActions;

  const newChathandler = async (e) => {
    if (e === localUserData._id) {
      showToast("error", "Cannot chat with yourself!");
    } else {
      console.log("e", e);
      const findUser = convoList.findIndex((i) => i.receiverId === e);

      console.log("findUser", findUser);
      if (findUser !== -1) {
        setcurrIndex(findUser);
        dispatch(setReduxCurrIndex(findUser));
        dispatch(setCurrUserData(convoList[findUser]));
        // setCurrUser(findUser);
      } else {
        console.log("User not found!");
        showToast("success", "New conversation added!");
        const newUserData = allUsers.find((i) => i._id === e);
        let newObj = {
          receiverId: newUserData?._id,
          convoId: Date.now().toString(),
          name: newUserData?.name,
          isNew: true,
        };
        setConvoList((prev) => {
          let newArr = [...prev];

          newArr.push(newObj);
          return newArr;
        });

        setcurrIndex(convoList.length);
        dispatch(setReduxCurrIndex(convoList.length));
        dispatch(setCurrUserData(convoList.length));

        // setCurrUser(convoList.length);
      }
    }

    setConvoModal(false);
  };

  const logoutHandler = async () => {
    localStorage.clear();
    const reqObj = {
      reqType: "user",
      route: "/logout",
      method: "GET",
      customHeaders: {},
    };
    const api = await CustomAPI(reqObj);
  };

  const items = [
    {
      label: <span className="w-full ">Profile</span>,
      key: "0",
    },
  ];
  return (
    <>
      {contextHolder}
      <CustomModal
        closable={true}
        modalOpen={convoModal}
        setModalOpen={setConvoModal}
      >
        <span className="text-xl font-medium">
          Select a User to start chatting...
        </span>
        <div className="p-4 flex justify-around flex-col h-[200px]">
          <div className="flex justify-center">
            <Button type="primary" onClick={newChathandler}>
              Create new chat
            </Button>
          </div>
        </div>
      </CustomModal>

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
                {localUserData?.lastSeen || "Last Seen"}
              </span>
            </div>

            <div className="flex flex-col text-black justify-around my-4 bg-gray-100 w-[80%] rounded-xl h-[200px] p-6 text-lg">
              <span className="text-xl flex items-center my-2">
                <span className=" me-4 w-[20%]">Name:</span>
                <span className="border-2 border-black p-1 rounded-lg w-[80%]">
                  {localUserData?.name}
                </span>
              </span>
              <span className="text-xl flex items-center my-2">
                <span className=" me-4 w-[20%]">Email:</span>
                <span className="border-2 border-black p-1 rounded-lg w-[80%]">
                  {localUserData?.email}
                </span>
              </span>
            </div>
          </div>
        </div>
      </CustomModal>

      <div className="h-full  ">
        <div className="select-user-container bg-[#5c6ac4] h-[10%] flex items-center w-full px-4 rounded-tl-xl rounded-tr-xl ">
          <Select
            showSearch
            style={{
              width: "100%",
            }}
            placeholder="Search to Select"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").includes(input)
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            allowClear
            onChange={(e) => newChathandler(e)}
            options={allUsers?.map((i) => ({
              value: i?._id,
              label: i?.name,
            }))}
          />
        </div>

        <div className="user-list-container border-r-2 border-l-2  border-[#B4B4B8] h-[80%] p-4 overflow-auto  w-[100%]">
          {convoList.length !== 0 ? (
            convoList?.map((i, index) => (
              <div
                className="my-2  p-4 text-lg cursor-pointer flex items-center justify-between rounded-lg"
                style={{
                  background:
                    convoList[currIndex]?.convoId === i?.convoId
                      ? "#e6e8f0"
                      : "white",
                  color:
                    convoList[currIndex]?.convoId === i?.convoId
                      ? "black"
                      : "black",
                  boxShadow:
                    convoList[currIndex]?.convoId === i?.convoId
                      ? "0px 5px 5px  #C7C8CC"
                      : "0px 2px 5px  #C7C8CC",
                }}
                key={index + 1}
                onClick={() => {
                  setcurrIndex(index);
                  dispatch(setReduxCurrIndex(index));
                  dispatch(setCurrUserData(convoList[index]));
                }}
              >
                <div className="flex items-center">
                  <span>
                    <Avatar icon={<UserOutlined />} />
                  </span>
                  <span className="ms-3">{i.name}</span>
                </div>
                <Badge
                  className="site-badge-count-109"
                  count={show ? i?.unread : 0}
                  style={{
                    backgroundColor: "#52c41a",
                  }}
                />
              </div>
            ))
          ) : (
            <div className=" flex justify-center h-[80%] p-4 overflow-auto  w-[100%]">
              <span className="text-2xl font-medium ">
                No conversations yet
              </span>
            </div>
          )}
        </div>
        <div className="flex  items-center justify-between bg-[#f4f5f7] border-2 border-[#B4B4B8] rounded-bl-xl rounded-br-xl h-[10%] px-4">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setProfileModal(true)}
          >
            <Avatar
              className="w-10 h-10"
              icon={<UserOutlined className="text-xl" />}
            />
            <span className="ms-4 text-lg font-medium">
              {localUserData?.name}
            </span>
          </div>

          <div className="me-8 flex items-center">
            <Tooltip title="Logout">
              <LogoutOutlined
                className="text-2xl text-[#5c6ac4]"
                onClick={logoutHandler}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftChatWindow;
