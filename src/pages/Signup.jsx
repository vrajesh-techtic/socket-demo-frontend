import { useState } from "react";
import { Button, Form, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import CustomModal from "../components/CustomModal";
import { Input } from "antd";
import HomePage from "./HomePage";
import useToast from "../components/NotificationPopup";
import CustomAPI from "../api/CustomAPI";
import WithoutAuth from "../auth/WithoutAuth";
import { useDispatch } from "react-redux";
import { userActions } from "../store/reducers/userReducer";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addUserData } = userActions;

  const { contextHolder, showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const onFinish = async (values) => {
    const reqObj = {
      reqType: "user",
      route: "/signup",
      method: "POST",
      customHeaders: {},
      data: values,
    };
    setLoading(() => true);

    const api = await CustomAPI(reqObj);
    setLoading(() => false);
    if (api?.status) {
      showToast("success", api?.message);
      // localStorage.setItem("user", JSON.stringify(api?.data));
      dispatch(addUserData(api?.data));

      setTimeout(() => {
        navigate("/chats");
      }, 1000);
    } else {
      showToast("error", api?.error);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <>
      {contextHolder}
      <HomePage>
        <CustomModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          closable={false}
        >
          <Spin spinning={loading} delay={100}>
            <div className="flex flex-col  bg-white  p-8 rounded-xl">
              <div className="w-full text-center ">
                <span className="text-4xl">Signup</span>
              </div>
              <div className="h-fit  p-8 pt-16">
                <Form
                  name="basic"
                  labelCol={{
                    span: 6,
                  }}
                  wrapperCol={{
                    span: 16,
                  }}
                  style={{
                    maxWidth: 600,
                    margin: 0,
                  }}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="on"
                >
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your name!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      {
                        type: "email",
                        required: true,
                        message: "Please enter correct email!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    wrapperCol={{
                      offset: 10,
                      span: 16,
                    }}
                  >
                    <Button type="primary" htmlType="submit">
                      Signup
                    </Button>
                  </Form.Item>
                </Form>

                <div className="text-center">
                  <span
                    className="text-blue-400 text-lg underline cursor-pointer"
                    onClick={() => navigate("/")}
                  >
                    Already have an account? Login
                  </span>
                </div>
              </div>
            </div>
          </Spin>
        </CustomModal>
      </HomePage>
    </>
  );
};

export default WithoutAuth(Signup);
