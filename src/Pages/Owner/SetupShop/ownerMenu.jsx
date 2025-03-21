import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsBox2 } from "react-icons/bs";
import { RiMenuAddLine } from "react-icons/ri";

const OwnerMenu = () => {
  const navigate = useNavigate();

  const icons = [
    {
      id: "createMenu",
      label: "ระบบสร้างรายการสินค้า",
      details: "เพิ่มรายการ กลุ่ม ตัวเลือกของสินค้า และการตัดคลังสินค้า",
      icon: <RiMenuAddLine size={100} />,
    },
    {
      id: "stock",
      label: "เว็บไซต์ตรวจสอบคลังสินค้า",
      details: "ดูภาพรวมยอดขาย ประวัติออเดอร์ และอัปเดตคลังสินค้า",
      icon: <BsBox2 size={100} />,
    },
  ];

  const handleClick = (id) => {
    if (id === "createMenu") {
      navigate("/guideline");
    } else if (id === "stock") {
      navigate("/overview");
    }
  };

  const handleBack = () => {
    navigate("/role");
  };

  return (
    <div className="flex flex-col items-center pt-36 h-screen-navbar bg-[#F5F5F5]">
      <div className="text-start mb-10">
        <h1 className="text-3xl font-bold mb-2">เจ้าของร้าน</h1>
        <h1 className="text-2xl mb-2">โปรดเลือกเว็บไซต์ที่ต้องการเข้าใช้งาน</h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      <div className="w-full ml-16 mt-[120px]">
        <div className="grid grid-cols-2 gap-8">
          {icons.map(({ id, label, details, icon }) => (
            <div
              key={id}
              className={
                "flex flex-col items-center cursor-pointer transition-all text-[#DD9F52] hover:text-[#C68A47]"
              }
              onClick={() => handleClick(id)}
            >
              <div
                className={
                  "p-3 transition-colors duration-300 mb-2 text-[#DD9F52] hover:text-[#C68A47]"
                }
              >
                {icon}
              </div>
              <p className={"mt-2 text-3xl font-bold text-black"}>{label}</p>
              <p className={"mt-2 text-2xl text-black"}>{details}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#F5F5F5] px-4 py-4 shadow-md flex justify-between">
        <button
          className="px-14 py-4 w-[300px] border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
          onClick={handleBack}
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
};

export default OwnerMenu;
