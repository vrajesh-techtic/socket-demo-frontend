import axios from "axios";

const CustomAPI = async ({ reqType, route, method, customHeaders, data }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const USER_URL = import.meta.env.VITE_BACKEND_USER_URL;
  const CHAT_URL = import.meta.env.VITE_BACKEND_CHAT_URL;

  try {
    if (method === "GET" && reqType === "user") {
      const api = await axios
        .get(USER_URL + route, { withCredentials: true })
        .then((res) => res.data);
      return api;
    } else if (method === "GET" && reqType === "chat") {
      const api = await axios
        .get(CHAT_URL + route, { withCredentials: true })
        .then((res) => res.data);
      return api;
    } else if (method === "POST" && reqType === "user") {
      const api = await axios
        .post(USER_URL + route, data, { withCredentials: true })
        .then((res) => res.data);

      return api;
    } else if (method === "POST" && reqType === "chat") {
      const api = await axios
        .post(CHAT_URL + route, data, { withCredentials: true })
        .then((res) => res.data);
      return api;
    }
  } catch (error) {
    console.log("error.response.data", error?.response?.data);
    console.log("error", error);
    var errorMsg = error?.response?.data?.error || error?.message || error;

    return { status: false, error: errorMsg };
  }
};

export default CustomAPI;
