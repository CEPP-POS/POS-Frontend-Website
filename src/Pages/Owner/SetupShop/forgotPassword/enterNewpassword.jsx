import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";

const EnterNewPassword = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const owner_id = sessionStorage.getItem("owner_id");
  console.log("OWNER_ID FROM TOKEN:", owner_id);
  const email = sessionStorage.getItem("email");
  console.log("email FROM TOKEN:", email);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirm = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{10,}$/;
    let isValid = true;

    if (!passwordRegex.test(password)) {
      setPasswordError(
        "รหัสผ่านต้องมีตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก และยาวกว่า 10 ตัวอักษร"
      );
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("รหัสผ่านไม่ตรงกัน");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (isValid) {
      try {
        const response = await fetchApi(
          `${URL}/owner/reset-password`,
          "PATCH",
          { email: email, newPassword: password }
        );

        console.log("RESET PASSWORD", { email: email, newPassword: password });

        if (response.ok) {
          sessionStorage.setItem("password_reset", "true");
          navigate("/create-account");
        } else {
          console.error("Failed to reset password");
        }
      } catch (error) {
        console.error("Error resetting password:", error);
      }
    }
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <div className="w-full font-noto flex flex-col justify-center items-center min-h-screen">
      <div className="max-w-md w-full bg-[#F5F5F5] p-8 rounded-lg shadow-md">
        <h2 className="text-2xl text-black mb-2 text-left">ตั้งรหัสผ่านใหม่</h2>
        <p className="text-primaryRegular text-gray-500 mb-6 text-left">
          กรุณากรอกรหัสผ่านที่ต้องการเพื่อตั้งค่ารหัสผ่านใหม่
        </p>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>

        {/* Password Field */}
        <div className="mb-4">
          <label className="block text-black mb-2 text-left" htmlFor="password">
            รหัสผ่าน
          </label>
          <div className="flex items-center border rounded-full bg-gray-50 px-3">
            <FaLock style={{ color: "#DD9F52" }} className="mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="กรอกรหัสผ่าน..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {passwordError && (
            <p className="text-[#C94C4C] text-sm mt-2">{passwordError}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-4">
          <label
            className="block text-black mb-2 text-left"
            htmlFor="confirmPassword"
          >
            ยืนยันรหัสผ่าน
          </label>
          <div className="flex items-center border rounded-full bg-gray-50 px-3">
            <FaLock style={{ color: "#DD9F52" }} className="mr-2" />
            <ThaiVirtualKeyboardInput
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="ยืนยันรหัสผ่าน..."
              value={confirmPassword}
              onChange={setConfirmPassword}
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
          {confirmPasswordError && (
            <p className="text-[#C94C4C] text-sm mt-2">
              {confirmPasswordError}
            </p>
          )}
        </div>

        {/* <div className="flex justify-end">
          <button
            onClick={handleSignIn}
            style={{ color: "#DD9F52" }}
            className="block mb-6"
          >
            กลับไปเข้าสู่ระบบ
          </button>
        </div> */}

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

export default EnterNewPassword;
