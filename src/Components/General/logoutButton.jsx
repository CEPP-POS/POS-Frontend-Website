import React, { useState } from "react";
import { FaPowerOff } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { TbLogout } from "react-icons/tb";

const LogoutButton = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogoutButton = () => {
    setShowModal(true);
  };

  const handleConfirmLogout = () => {
    setShowModal(false);
    navigate("/");
  };

  const handleCancelLogout = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleLogoutButton}
        className="flex p-2 text-white hover:text-red-600 transition-all duration-300"
      >
        <TbLogout size={24} />
        <span className="text-xl font-bold">ออกจากระบบ</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-1">
          <div className="bg-[#F5F5F5] p-8 rounded-lg w-[700px] h-[300px] shadow-lg flex flex-col justify-center items-center text-center">
            <h2 className="text-3xl mb-4 text-black font-bold">
              ยืนยันการออกจากระบบ ?
            </h2>
            <p className="text-gray-600 mb-8">
              หากกดยืนยันแล้วจะต้องเข้าสู่ระบบใหม่อีกครั้ง
            </p>
            <div className="w-full flex justify-between space-x-8">
              <button
                onClick={handleCancelLogout}
                className="px-8 py-3 w-[250px] font-bold border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-8 py-3 w-[250px] bg-[#DD9F52] font-bold text-white rounded-full hover:bg-[#C68A47] transition-colors"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
