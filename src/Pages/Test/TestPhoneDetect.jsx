import React, { useState, useEffect } from "react";
import PhoneDetect from "../../Components/PhoneDetect/phoneDetect";
import { useWebSocket } from "../../webSocketContext";

function TestPhoneDetect() {
  const socket = useWebSocket();
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState("");
  const [modelStatus, setModelStatus] = useState("กำลังตรวจสอบ...");

  useEffect(() => {
    // ตรวจสอบสถานะการโหลดโมเดลจาก network requests
    const checkModelStatus = () => {
      if (!navigator.onLine) {
        setModelStatus("อยู่ในโหมด Offline");
        return;
      }

      // ดูว่าโมเดลถูกโหลดหรือยัง
      const modelLoaded = window.performance
        .getEntriesByType("resource")
        .some((entry) => entry.name.includes("lite_mobilenet_v2"));

      setModelStatus(
        modelLoaded
          ? "โมเดลถูกโหลดแล้ว พร้อมใช้งาน"
          : "ยังไม่ได้โหลดโมเดล (จะดาวน์โหลดเมื่อใช้งานครั้งแรก)"
      );
    };

    // เช็คสถานะทุกครั้งที่ online/offline status เปลี่ยน
    window.addEventListener("online", checkModelStatus);
    window.addEventListener("offline", checkModelStatus);

    // เช็คสถานะครั้งแรก
    checkModelStatus();

    return () => {
      window.removeEventListener("online", checkModelStatus);
      window.removeEventListener("offline", checkModelStatus);
    };
  }, []);

  const handleCapture = (image) => {
    console.log("Image captured:", image);
    setCapturedImage(image);
    setDetectionStatus("ถ่ายภาพสำเร็จ");
  };

  // Mock socket for testing
  const mockSocket = {
    send: (data) => {
      console.log("Mock socket sending data:", data);
      setDetectionStatus("ส่งรูปภาพสำเร็จ (Mock)");
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 text-center">
            ทดสอบ Phone Detection
          </h1>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">สถานะการทำงาน:</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                • สถานะ:{" "}
                <span className="text-blue-600">
                  {detectionStatus || "กำลังรอตรวจจับโทรศัพท์..."}
                </span>
              </p>
              <p className="text-gray-600">
                • การเชื่อมต่อ:{" "}
                <span
                  className={
                    navigator.onLine ? "text-green-600" : "text-red-600"
                  }
                >
                  {navigator.onLine ? "Online" : "Offline"}
                </span>
              </p>
              <p className="text-gray-600">
                • WebSocket:{" "}
                <span className={socket ? "text-green-600" : "text-red-600"}>
                  {socket
                    ? "เชื่อมต่อแล้ว"
                    : "ไม่ได้เชื่อมต่อ (ใช้ Mock Socket)"}
                </span>
              </p>
              <p className="text-gray-600">
                • สถานะโมเดล:{" "}
                <span className="text-blue-600">{modelStatus}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Phone Detection Component */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <PhoneDetect
              onCapture={handleCapture}
              socket={socket || mockSocket}
            />
          </div>

          {/* Debug Information */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">ข้อมูลการทดสอบ:</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {capturedImage
                ? `มีภาพที่ถ่ายได้ (ความยาว: ${capturedImage.length} ตัวอักษร)`
                : "ยังไม่มีภาพที่ถ่าย"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestPhoneDetect;
