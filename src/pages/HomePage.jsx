import { Button, Form } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomModal from "../components/CustomModal";
import { Checkbox, Input } from "antd";

const HomePage = ({ children }) => {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      {children}
    </div>
  );
};

export default HomePage;
