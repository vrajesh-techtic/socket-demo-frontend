import React from "react";
import { useCookies } from "react-cookie";

const WithoutAuth = (Component) => {
  const Auth = (props) => {
    const [cookies, setCookies] = useCookies();
    const access_token = cookies?.access_token;
    const refresh_token = cookies?.refresh_token;

    if (!access_token || !refresh_token) {
      return <Component {...props} />;
    } else {
      return (window.location = "/chats");
    }
  };
  return Auth;
};

export default WithoutAuth;
