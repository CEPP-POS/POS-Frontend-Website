import React, { useState, useEffect } from "react";
import "react-simple-keyboard/build/css/index.css";
import fetchApi from "../../Config/fetchApi";
import configureAPI from "../../Config/configureAPI";
import ThaiVirtualKeyboardInput from "../Common/ThaiVirtualKeyboardInput";
import { useWebSocket } from "../../webSocketContext";

const PayWithCash = ({ isOpen, onClose, totalAmount, onConfirm, onCancel }) => {
  const [cashReceived, setCashReceived] = useState("");
  const [change, setChange] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const socket = useWebSocket();

  useEffect(() => {
    if (cashReceived) {
      const changeAmount = parseFloat(cashReceived) - totalAmount;
      setChange(changeAmount >= 0 ? changeAmount : 0);
    } else {
      setChange(0);
    }
  }, [cashReceived, totalAmount]);

  const handleConfirm = () => {
    // Reset error message
    setErrorMessage("");

    // Validate cash received
    if (!cashReceived) {
      setErrorMessage("กรุณากรอกจำนวนเงินที่รับมา");
      return;
    }

    if (parseFloat(cashReceived) < totalAmount) {
      setErrorMessage("จำนวนเงินที่รับมาน้อยกว่าจำนวนเงินที่ลูกค้าต้องจ่าย");
      return;
    }

    if (socket) {
      // Send confirmation message through WebSocket
      const message = {
        type: "CONFIRM_CASH_PAYMENT",
        data: {
          cashReceived: parseFloat(cashReceived),
          change: change,
        },
      };
      socket.send(JSON.stringify(message));
    }
    onConfirm({ cashReceived: parseFloat(cashReceived), change });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-[#F5F5F5] w-[500px] h-auto rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-1">
          ชำระเงินด้วยเงินสด
        </h2>
        <hr className="h-0.5 bg-[#DD9F52] border-0" />

        <div className="mb-4 mt-2">
          <label className="block mb-2">จำนวนเงินที่ลูกค้าต้องจ่าย</label>
          <input
            type="text"
            value={totalAmount.toFixed(2)}
            readOnly
            className="w-full border border-[#DD9F52] rounded-full px-3 py-1.5 text-black bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">จำนวนเงินที่รับมา</label>
          <ThaiVirtualKeyboardInput
            type="number"
            value={cashReceived}
            onChange={setCashReceived}
            className="w-full border border-[#DD9F52] rounded-full px-3 py-1.5 text-black focus:outline-none focus:ring-2 focus:ring-brown-400"
          />
          {errorMessage && (
            <p className="text-red-500 text-center text-sm mt-1">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-2">เงินทอน</label>
          <input
            type="text"
            value={change.toFixed(2)}
            readOnly
            className="w-full border border-[#DD9F52] rounded-full px-3 py-1.5 text-black bg-gray-100"
          />
        </div>

        <div className="flex justify-end">
          {/* <button
            onClick={onCancel}
            className="text-[#DD9F52] w-40 bg-[#F5F5F5] border border-[#DD9F52] hover:bg-[#DD9F52] hover:text-white rounded-full text-xl px-4 py-2"
          >
            ยกเลิก
          </button> */}
          <button
            onClick={handleConfirm}
            className="w-40 bg-[#DD9F52] hover:bg-[#C68A47] text-white font-bold py-2 px-4 rounded-full"
          >
            ยืนยันออเดอร์
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayWithCash;
