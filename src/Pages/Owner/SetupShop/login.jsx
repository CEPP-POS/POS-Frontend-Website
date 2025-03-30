import React, { useRef, useState, useEffect } from "react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import ThaiVirtualKeyboard from "../../../Components/General/thaiVirtualKeyboard";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import LoadingPopup from "../../../Components/General/loadingPopup";

const Login = () => {
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

  console.log("URL: ", URL);

  const formRef = useRef(null);
  const keyboardContainerRef = useRef(null);
  const inputContainerRef = useRef(null);

  const handleLogin = async (email, password) => {
    try {
      if (!email || !password) {
        alert("Please enter both email and password");
        return;
      }

      const response = await fetch(`${URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log("Response object:", response); // Log the response object here to inspect its structure
      console.log("Response type:", typeof response); // Check the type of the response object

      if (response.ok) {
        const userData = await response.json();
        console.log("USER DATA FROM JWT:", userData);
        const decodedToken = jwtDecode(userData.token);
        console.log("JWT PAYLOAD:", decodedToken);

        sessionStorage.setItem("token", userData.token);
        sessionStorage.setItem("owner_id", decodedToken["owner-id"]);
        sessionStorage.setItem("email", decodedToken.email);
        sessionStorage.setItem("branch_id", decodedToken.branch_id);
        sessionStorage.setItem("role", decodedToken.roles[0]);

        const passwordReset = sessionStorage.getItem("password_reset");
        const role = decodedToken.roles[0];

        if (role === "employee") {
          sessionStorage.setItem("owner_id", decodedToken.manager);
          sessionStorage.setItem("branch_id", decodedToken.branch_id);
        }

        if (role === "employee") {
          navigate("/role");
        } else {
          navigate("/branch");
        }
      } else {
        const errorData = await response.json();
        alert(
          errorData.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred while logging in. Please try again.");
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
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
    <div className="w-full font-noto flex flex-col justify-center items-center min-h-screen bg-[#F5F5F5]">
      <div
        ref={formRef}
        className="max-w-md w-full bg-[#F5F5F5] p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl text-black mb-2 text-left">
          ยินดีต้อนรับสู่ระบบการขายหน้าร้าน
        </h2>
        <p className="text-primaryRegular text-gray-500 mb-6 text-left">
          โปรดลงทะเบียนเพื่อเข้าสู่ระบบ
        </p>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>

        {/* Username Input */}
        <div className="mb-4 relative">
          <label className="block text-black mb-2 text-left" htmlFor="username">
            ชื่อผู้ใช้
          </label>
          <div className="flex items-center border rounded-full bg-gray-50 px-3">
            <FaUserAlt style={{ color: "#DD9F52" }} className="mr-2" />
            <input
              type="text"
              id="username"
              value={usernameInput}
              placeholder="กรอกชื่อผู้ใช้..."
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
              type={showPassword ? "text" : "password"}
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

        {/* <div className="flex justify-end">
          <button
            onClick={handleForgotPassword}
            style={{ color: "#DD9F52" }}
            className="block mb-6"
          >
            ลืมรหัสผ่าน?
          </button>
        </div> */}

        <button
          onClick={() => handleLogin(usernameInput, passwordInput)}
          className="w-full py-2 bg-[#DD9F52] text-white rounded-full font-semibold hover:bg-[#c9a07e] transition"
        >
          เข้าสู่ระบบ
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
    </div>
  );
};

export default Login;
