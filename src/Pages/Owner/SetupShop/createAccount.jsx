import React, { useRef, useState, useEffect } from "react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import ThaiVirtualKeyboard from "../../../Components/General/thaiVirtualKeyboard";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";
import bcrypt from "bcryptjs";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../Config/redux/userSlice";
import { jwtDecode } from "jwt-decode";
import LoadingPopup from "../../../Components/General/loadingPopup";

const CreateAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [keyboardLayout, setKeyboardLayout] = useState("default");
  const [loading, setLoading] = useState(false);

  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const branchId = sessionStorage.getItem("branch_id");

  console.log("URL: ", URL);

  const formRef = useRef(null);
  const keyboardContainerRef = useRef(null);
  const inputContainerRef = useRef(null);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetchApi(`${URL}/owner/create-employee`, "POST", {
        email: email,
        password: password,
        branch_id: 3, //mock branch id for now
      });

      if (response.ok) {
        navigate("/role");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = (field) => {
    setFocusedField(field);
    setShowKeyboard(true);
  };

  const handleBlur = (e) => {
    if (
      keyboardContainerRef.current &&
      !keyboardContainerRef.current.contains(e.target) &&
      inputContainerRef.current &&
      !inputContainerRef.current.contains(e.target)
    ) {
      setShowKeyboard(false);
    }
  };

  const handleCloseKeyboard = () => {
    setShowKeyboard(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleBlur);
    return () => {
      document.removeEventListener("mousedown", handleBlur);
    };
  }, []);

  return (
    <div className="w-full font-noto flex flex-col justify-center items-center min-h-screen">
      <div
        ref={formRef}
        className="max-w-md w-full bg-[#F5F5F5] p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl text-black mb-2 text-left">
          สร้างบัญชีสำหรับพนักงาน
        </h2>
        <p className="text-primaryRegular text-gray-500 mb-6 text-left">
          โปรดสร้างบัญชีสำหรับพนักงานของคุณ เพื่อใช้งานระบบการขายหน้าร้าน
        </p>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>

        {/* Username Input */}
        <div className="mb-4 relative">
          <label className="block text-black mb-2 text-left" htmlFor="username">
            อีเมลล์
          </label>
          <div className="flex items-center border rounded-full bg-gray-50 px-3">
            <FaUserAlt style={{ color: "#DD9F52" }} className="mr-2" />
            <input
              type="text"
              id="username"
              value={usernameInput}
              placeholder="กรอกอีเมลล์ผู้ใช้..."
              className="w-full py-2 px-3 bg-transparent outline-none text-gray-700"
              onFocus={() => handleFocus("username")}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6 relative">
          <label className="block text-black mb-2 text-left" htmlFor="password">
            รหัสผ่าน
          </label>
          <div className="flex items-center border rounded-full bg-gray-50 px-3">
            <FaLock style={{ color: "#DD9F52" }} className="mr-2" />
            <input
              type="password"
              id="password"
              value={passwordInput}
              placeholder="กรอกรหัสผ่าน..."
              className="w-full py-2 px-3 bg-transparent outline-none text-gray-700"
              onFocus={() => handleFocus("password")}
              onChange={(e) => setPasswordInput(e.target.value)}
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

        <button
          onClick={() => handleLogin(usernameInput, passwordInput)}
          className="w-full py-2 bg-[#DD9F52] text-white rounded-full font-semibold hover:bg-[#c9a07e] transition"
        >
          สร้างบัญชี
        </button>
      </div>

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <div ref={keyboardContainerRef}>
          <ThaiVirtualKeyboard
            input={focusedField === "username" ? usernameInput : passwordInput}
            setInput={
              focusedField === "username" ? setUsernameInput : setPasswordInput
            }
            layout={keyboardLayout}
            setLayout={setKeyboardLayout}
            inputRef={inputContainerRef}
            onClose={handleCloseKeyboard}
          />
        </div>
      )}
      <LoadingPopup loading={loading} />
    </div>
  );
};

export default CreateAccount;
