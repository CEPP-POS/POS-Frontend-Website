import React from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineDocumentChartBar,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { BiFoodMenu } from "react-icons/bi";
import CameraDetector from "../../../Components/Customer/cameraDetector";

const UserRole = () => {
  const navigate = useNavigate();

  const icons = [
    {
      id: "owner",
      label: "ฝั่งเจ้าของร้าน",
      details: "เว็บไซต์ตรวจสอบคลังสินค้าและยอดขาย ระบบสร้างรายการสินค้า",
      icon: <HiOutlineDocumentChartBar size={120} />,
    },
    {
      id: "employee",
      label: "ฝั่งพนักงาน",
      details: "เว็บไซต์ดูคำสั่งซื้อ",
      icon: <HiOutlineClipboardDocumentList size={120} />,
    },
    {
      id: "customer",
      label: "ฝั่งลูกค้า",
      details: "เว็บไซต์สั่งอาหาร",
      icon: <BiFoodMenu size={120} />,
    },
  ];

  const handleClick = (id) => {
    if (id === "owner") {
      navigate("/owner");
    } else if (id === "employee") {
      navigate("/order-list");
    } else if (id === "customer") {
      window.open("/menu", "_blank");
    }
  };

  return (
    <div className="flex flex-col items-center pt-36 h-screen-navbar bg-[#F5F5F5]">
      <div className="flex flex-col items-center">
        <div className="text-start mb-24">
          <h1 className="text-3xl font-bold mb-2">ผู้ใช้งาน</h1>
          <h1 className="text-2xl mb-2">
            โปรดเลือกเว็บไซต์ฝั่งผู้ใช้งานที่ต้องการ
          </h1>
          <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-3 gap-8">
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
      </div>
    </div>
  );
};

export default UserRole;
