import React, { useState, useEffect } from "react";

const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // ปิด popup หลังจาก 5 วินาที
    }, 5000);

    return () => clearTimeout(timer); // ทำความสะอาดเมื่อ component ถูกลบ
  }, [message, onClose]);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#F5F5F5] h-[200px] w-[300px] rounded-md shadow-lg flex justify-center items-center flex-col">
        <p className="text-xl font-bold text-green-600">{message}</p>
      </div>
    </div>
  );
};

const FailPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // ปิด popup หลังจาก 5 วินาที
    }, 5000);

    return () => clearTimeout(timer); // ทำความสะอาดเมื่อ component ถูกลบ
  }, [message, onClose]);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#F5F5F5] h-[200px] w-[300px] rounded-md shadow-lg flex justify-center items-center flex-col">
        <p className="text-xl font-bold text-red-600">{message}</p>
      </div>
    </div>
  );
};

export { SuccessPopup, FailPopup };
