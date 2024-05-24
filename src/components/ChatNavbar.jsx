import React from "react";
import CustomAPI from "../api/CustomAPI";

const ChatNavbar = () => {
  const userData = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="h-[9%] flex justify-between items-center text-white bg-gradient-to-r from-[#6366f1] to-[#7e3af2] rounded-xl  ">
      <span className="text-4xl mx-6  ">Socket Chat App Demo</span>

      <div className="userDetails  text-2xl  flex ">
        <span className="">Username: </span>
        <span className="border-2 border-black bg-white text-black mx-4 px-3 rounded-lg  ">
          {userData?.name}
        </span>
      </div>

      <button
        className="bg-red-400 mx-8 text-white p-2 rounded-lg "
        onClick={async () => {
          localStorage.clear();
          const reqObj = {
            reqType: "user",
            route: "/logout",
            method: "GET",
            customHeaders: {},
          };
          const api = await CustomAPI(reqObj);
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default ChatNavbar;
