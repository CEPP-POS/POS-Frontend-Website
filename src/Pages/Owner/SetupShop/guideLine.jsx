import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaList, FaThLarge, FaBox } from "react-icons/fa";

const GuideLine = () => {
  const navigate = useNavigate();

  const steps = [
    { label: "เพิ่มรายการสินค้า", icon: <FaUtensils size={48} /> },
    { label: "เพิ่มกลุ่มรายการสินค้า", icon: <FaList size={48} /> },
    { label: "เพิ่มตัวเลือก", icon: <FaThLarge size={48} /> },
    { label: "เพิ่มการตัดคลังสินค้า", icon: <FaBox size={48} /> },
  ];

  const handleStart = () => {
    navigate("/main-menu");
  };

  const handleBack = () => {
    navigate("/owner");
  };

  return (
    <div className="font-noto flex flex-col items-center h-screen-navbar bg-[#F5F5F5]">
      <div className="mb-8 text-center mt-[120px]">
        <h1 className="text-3xl font-semibold text-black mb-2">
          ขั้นตอนการตั้งค่าเพื่อใช้งานระบบการขายหน้าร้าน
        </h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      <div className="space-y-4 w-4/5 max-w-lg mt-[60px]">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-center p-4 w-[480px] border rounded-full shadow-sm text-2xl"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-[#DD9F52] rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {index + 1}
            </div>
            <div className="flex items-center ml-4 space-x-2 w-full justify-between">
              <span className="text-black">{step.label}</span>
              <span className="text-[#DD9F52] pr-4">{step.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#F5F5F5] px-4 py-4 shadow-md flex justify-between flex justify-between">
        <button
          className="px-14 py-4 w-[300px] rounded-full border text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
          onClick={handleBack}
        >
          ย้อนกลับ
        </button>
        <button
          className="px-14 py-4 w-[300px] rounded-full bg-[#DD9F52] text-white hover:bg-[#C68A47] transition-colors font-bold"
          onClick={handleStart}
        >
          เริ่มต้น
        </button>
      </div>
    </div>
  );
};

export default GuideLine;
