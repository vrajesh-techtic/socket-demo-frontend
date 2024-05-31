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

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addUserData } = userActions;
  const { contextHolder, showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const onFinish = async (values) => {
    console.log("values", values);
    const reqObj = {
      reqType: "user",
      route: "/login",
      method: "POST",
      customHeaders: {},
      data: values,
    };
    setLoading(true);
    const api = await CustomAPI(reqObj);
    console.log("api", api);
    if (api?.status) {
      showToast("success", api?.message);
      console.log("api?.data", api?.data);
      // localStorage.setItem("user", JSON.stringify(api?.data));
      dispatch(addUserData(api?.data));
      setTimeout(() => {
        setLoading(false);
        // navigate("/chats");
      }, 5000);
    } else {
      showToast("error", api?.error);
      setLoading(false);

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
          <Spin spinning={loading}>
            <div className="flex flex-col  bg-white  p-8 rounded-xl">
              <div className="w-full text-center ">
                <span className="text-4xl">Login</span>
              </div>
              <div className="h-fit  p-8 pt-16">
                <Form
                  className=" mx-auto"
                  name="basic"
                  labelCol={{
                    span: 6,
                  }}
                  size="large"
                  wrapperCol={{
                    span: 16,
                  }}
                  style={{
                    // width: "200px",
                    // width: "300px",
                    maxWidth: 600,
                    color: "white",
                    margin: 0,
                  }}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="on"
                >
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
                      Login
                    </Button>
                  </Form.Item>
                </Form>

                <div className="text-center">
                  <span
                    className="text-blue-400 text-lg underline cursor-pointer"
                    onClick={() => navigate("/signup")}
                  >
                    New User? Signup
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

export default WithoutAuth(Login);
