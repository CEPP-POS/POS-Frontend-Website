import React, { useState } from "react";
import { FaPowerOff } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogoutButton = () => {
    setShowModal(true);
  };

  const handleConfirmLogout = () => {
    setShowModal(false);
    navigate("/"); // Redirect to the homepage after logout
  };

  const handleCancelLogout = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleLogoutButton}
        className="bg-[#EFEFEF] text-[#FF5555] hover:bg-[#FF5555] hover:text-[#EFEFEF] rounded-full p-1 flex justify-center items-center"
      >
        <FaPowerOff size={32} />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#F5F5F5] rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-center mb-4">
              ยืนยันการออกจากระบบ
            </h2>
            <p className="text-gray-700 text-center mb-6">
              หากกดยืนยันแล้วจะต้องเข้าสู่ระบบใหม่อีกครั้ง
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleCancelLogout}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-full px-4 py-2"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmLogout}
                className="bg-[#C94C4C] text-white hover:bg-red-600 rounded-full px-4 py-2"
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
