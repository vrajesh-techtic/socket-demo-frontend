import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Form,
  Input,
  Select,
  Space,
  Tooltip,
} from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import CustomAPI from "../api/CustomAPI";
import CustomModal from "./CustomModal";
import useToast from "./NotificationPopup";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../store/reducers/userReducer";
import { data } from "autoprefixer";

const LeftChatWindow = ({
  convoList,
  setConvoList,
  allUsers,
  socket,
  fetchConvoList,
}) => {
  const localUserData = useSelector((state) => state.loginUser);
  const currIndex = useSelector((state) => state.currIndex);
  const [groupModal, setGroupModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [show, setShow] = useState(true);

  const { contextHolder, showToast } = useToast();

  const dispatch = useDispatch();
  const { setCurrUserData, setReduxCurrIndex } = userActions;

  const changeCurrUserHandler = (index) => {
    // console.log("convoList[index]", convoList);

    dispatch(setReduxCurrIndex(index));
    dispatch(setCurrUserData(convoList[index]));
  };

  const newChathandler = async (e) => {
    if (e === localUserData._id) {
      showToast("error", "Cannot chat with yourself!");
    } else {
      const newUserData = allUsers.find((i) => i._id === e);
      console.log("newUserData", newUserData);
      const reqObj = {
        reqType: "chat",
        route: "/add-new-conversation",
        method: "POST",
        headers: {
          withCredentials: true,
        },
        data: { receiverId: newUserData?._id },
      };

      const newConvoAPI = await CustomAPI(reqObj);
      console.log("newConvoAPI", newConvoAPI);
      if (newConvoAPI?.status) {
        showToast("success", newConvoAPI?.message);
        // let newObj = {
        //   receiverId: newUserData?._id,
        //   convoId: newConvoAPI?.convoId,
        //   name: newUserData?.name,
        // };
        fetchConvoList();
        // setConvoList((prev) => {
        //   let newArr = [...prev];

        //   newArr.push(newObj);
        //   return newArr;
        // });
      } else {
        // const newUserData = allUsers.find((i) => i._id === e);

        const findUser = convoList.findIndex((i) => i.receiverId === e);
        console.log("findUser", findUser);
        // showToast("error", newConvoAPI?.error);
        changeCurrUserHandler(findUser);
      }

      // console.log("convoList.length", convoList.length);
    }
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
    socket.emit("leaveRoom", localUserData?._id);
  };

  //   {
  //     "_id": "664ae6236046ab8f1586c9d5",
  //     "name": "VD"
  // }

  const createGroupHandler = async (values) => {
    console.log("values", values);
    const reqObj = {
      reqType: "chat",
      route: "/create-group",
      method: "POST",
      customHeaders: {},
      data: values,
    };
    const api = await CustomAPI(reqObj);

    if (api?.status) {
      showToast("success", api?.message);
      fetchConvoList();
    } else {
      showToast("error", api?.error);
    }
  };

  const options = allUsers.map((i) => ({ label: i.name, value: i._id }));
  // console.log("convoList", convoList);
  const items = [
    {
      label: <span className="w-full ">Profile</span>,
      key: "0",
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

      {/* Create Group Modal  */}
      <CustomModal
        closable={true}
        modalOpen={groupModal}
        setModalOpen={setGroupModal}
      >
        <div className="flex flex-col  bg-[#5c6ac4] text-white p-8 rounded-xl">
          <span className="text-2xl font-medium text-center">Create Group</span>
          <div className="flex flex-col items-center my-4">
            {/* <div className="flex-col flex items-center">
              <Avatar
                className="w-12 h-12"
                icon={<UserOutlined className="text-3xl" />}
              />
              <span className="text-lg">
                {localUserData?.lastSeen || "Last Seen"}
              </span>
            </div> */}

            <div className="flex flex-col text-black justify-around my-4 bg-white w-[80%] rounded-xl h-fit p-6 text-lg">
              <Form size="large" onFinish={createGroupHandler}>
                <Form.Item
                  label="Group Name"
                  name="groupName"
                  rules={[{ type: "string", required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Users"
                  name="users"
                  rules={[{ type: "array", required: true }]}
                >
                  <Select
                    mode="multiple"
                    style={{
                      width: "100%",
                    }}
                    placeholder="Please select"
                    // defaultValue={["a10", "c12"]}
                    // onChange={handleChange}
                    options={options}
                  />
                </Form.Item>

                <div className="flex justify-center">
                  <Button type="primary" htmlType="submit">
                    Create Group
                  </Button>
                </div>
              </Form>

              {/* <span className="text-xl flex items-center my-2">
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
              </span> */}
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

          <Button
            className="ms-2"
            type="primary"
            onClick={() => setGroupModal(true)}
          >
            New Group
          </Button>
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
                  changeCurrUserHandler(index);
                }}
              >
                <div className="flex items-center">
                  <span>
                    <Avatar icon={<UserOutlined />} />
                  </span>
                  <span className="ms-3">{i.name || i?.groupName}</span>
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
