import { notification } from "antd";

const useToast = () => {
  const [api, contextHolder] = notification.useNotification();
  const notify = (type, message, description, duration = 2) => {
    api[type]({
      message: message,
      description,
      className: " rounded-xl",
      duration,
    });
  };

  return {
    contextHolder,
    showToast: notify,
  };
};

export default useToast;
