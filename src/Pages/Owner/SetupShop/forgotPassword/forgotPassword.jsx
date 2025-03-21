import React from "react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";
const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate("/enter-otp");
  };

  const handleSignIn = () => {
    navigate("/");
  };

  return (
    <div className="font-noto flex flex-col items-center min-h-screen bg-[#F5F5F5]">
      <div className="max-w-md w-full bg-[#F5F5F5] p-8 rounded-lg shadow-md">
        <h2 className="text-2xl text-black mb-2 text-left">ลืมรหัสผ่าน?</h2>
        <p className="text-primaryRegular text-gray-500 mb-6 text-left">
          กรุณาใส่อีเมลของคุณ เราจะส่งฟอร์มเพื่อตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ
        </p>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
        <div className="mb-4">
          <label className="block text-black mb-2 text-left" htmlFor="username">
            อีเมล
          </label>
          <div className="flex items-center border rounded-full bg-gray-50 px-3">
            <MdEmail style={{ color: "#DD9F52" }} className="mr-2" />
            <ThaiVirtualKeyboardInput
              id="email"
              placeholder="กรอกอีเมล..."
              className="w-full py-2 px-3 bg-transparent outline-none text-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSignIn}
            style={{ color: "#DD9F52" }}
            className="block mb-6"
          >
            กลับไปเข้าสู่ระบบ
          </button>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-2 bg-[#DD9F52] text-white rounded-full font-semibold hover:bg-[#c9a07e] transition"
        >
          ยืนยัน
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
