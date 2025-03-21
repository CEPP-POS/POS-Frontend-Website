import React from "react";
import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useState } from "react";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";

const EnterOTP = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirm = () => {
    navigate("/enter-new-password");
  };

  const handleSignIn = () => {
    navigate("/");
  };

  return (
    <div className="font-noto flex flex-col items-center min-h-screen bg-[#F5F5F5]">
      <div className="max-w-md w-full bg-[#F5F5F5] p-8 rounded-lg shadow-md">
        <h2 className="text-2xl text-black mb-2 text-left">กรุณากรอกเลข OTP</h2>
        <p className="text-primaryRegular text-gray-500 mb-6 text-left">
          ที่ส่งไปยังอีเมล
          <strong> pappich.2002@gmail.com </strong>
          เพื่อตั้งค่ารหัสผ่านใหม่
        </p>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
        <div className="mb-4">
          <label className="block text-black mb-2 text-left" htmlFor="username">
            รหัส OTP
          </label>
          <div className="flex items-center border rounded-full bg-gray-50 px-3">
            <FaLock style={{ color: "#DD9F52" }} className="mr-2" />
            <ThaiVirtualKeyboardInput
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="กรอกรหัส OTP 6 หลัก..."
              className="w-full py-2 px-3 bg-transparent outline-none text-gray-700"
            />
            <button
              type="button"
              onClick={handleTogglePassword}
              className="ml-2"
            >
              {showPassword ? (
                <BsEyeSlash style={{ color: "#DD9F52" }} />
              ) : (
                <BsEye style={{ color: "#DD9F52" }} />
              )}
            </button>
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

export default EnterOTP;
