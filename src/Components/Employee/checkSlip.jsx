import React from "react";
import configureAPI from "../../Config/configureAPI";
import { useWebSocket } from "../../webSocketContext";
import fetchApi from "../../Config/fetchApi";
import { useState } from "react";
import LoadingPopup from "../General/loadingPopup";

const CheckSlip = ({ imageUrl, onConfirm, total }) => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const socket = useWebSocket();
  const [loading, setLoading] = useState(false);

  console.log("TOTAL:", total);

  const handleRetake = () => {
    if (socket) {
      const message = {
        type: "RETAKE_SLIP",
      };
      socket.send(JSON.stringify(message));
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Convert base64 to blob and upload to backend
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, "slip.png");

      const uploadResponse = await fetchApi(
        `${URL}/owner/menus/upload`,
        "POST",
        formData
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload slip");
      }

      const uploadData = await uploadResponse.json();

      // Send path back to backend
      if (socket) {
        const message = {
          type: "CONFIRM_SLIP",
          data: uploadData.filePath,
        };
        socket.send(JSON.stringify(message));
      }

      // Call the onConfirm function passed from the parent
      onConfirm(); // Trigger the fetch operation in order
    } catch (error) {
      console.error("Error handling slip confirmation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      // แปลง base64 เป็น blob และอัพโหลดไป backend
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, "slip.png");

      const uploadResponse = await fetchApi(
        `${URL}/owner/menus/upload`,
        "POST",
        formData
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload slip");
      }

      const uploadData = await uploadResponse.json();

      if (socket) {
        const message = { type: "CANCEL_SLIP", data: uploadData.filePath };
        socket.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error("Error handling slip confirmation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-[#F5F5F5] w-[500px] rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-center mb-2">
          ตรวจสอบสลิปโอนเงิน
        </h2>
        <hr className="h-0.5 bg-[#DD9F52] border-0 mb-4" />

        <div className="justify-between items-center grid grid-cols-2 gap-6 mb-4">
          <span className="text-black text-left font-bold">
            จำนวนเงินที่ลูกค้าต้องจ่าย
          </span>
          <div
            id="order-id"
            className="w-full py-2 px-3 bg-transparent text-black border border-[#DD9F52] rounded-full"
          >
            {total} บาท
          </div>
        </div>

        {/* แสดงรูป base64 โดยตรง */}
        {imageUrl ? (
          <img
            src={imageUrl} // ใช้ base64 string โดยตรง
            alt="Slip"
            className="w-full rounded-lg mb-6"
            onError={(e) => console.error("Image loading error:", e)}
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg mb-6">
            ไม่พบรูปภาพ
          </div>
        )}

        <div className="flex gap-2 mt-6">
          {/* <button
            className="w-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all duration-300 py-2 rounded-full"
            onClick={handleCancel}
          >
            ยกเลิก
          </button> */}
          <button
            className="w-full border border-[#DD9F52] text-[#DD9F52] bg-transparent hover:bg-[#DD9F52] hover:text-white font-bold py-2 rounded-full transition-all"
            onClick={handleRetake}
          >
            ถ่ายใหม่
          </button>
          <button
            className="w-full bg-[#DD9F52] text-white font-bold py-2 rounded-full hover:bg-[#C68A47] transition-all"
            onClick={handleConfirm}
          >
            ตกลง
          </button>
        </div>
      </div>
      <LoadingPopup loading={loading} />
    </div>
  );
};

export default CheckSlip;
