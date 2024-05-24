import { useState } from "react";
import { Modal } from "antd";
const CustomModal = ({ modalOpen, setModalOpen, children, closable }) => {
  return (
    <>
      <Modal
        footer={null}
        centered
        open={modalOpen}
        closeIcon={false}
        closable={closable}
        onCancel={() => (closable ? setModalOpen(false) : null)}
        styles={{
          body: {},
          content: { margin: "0px auto", padding: "0px", borderRadius: "50px" },
        }}
      >
        {children}
      </Modal>
    </>
  );
};
export default CustomModal;
