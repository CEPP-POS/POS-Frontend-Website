import React from "react";
import { useNavigate } from "react-router-dom";
import HomeEmButton from "../../../Components/Employee/homeEmButton";
const PauseSection = () => {
  const navigate = useNavigate();

  const handleBackButton = () => {
    navigate("/order-list");
  };

  const handlePauseIngredient = () => {
    navigate("/pause-ingredient");
  };

  const handlePauseMenu = () => {
    navigate("/pause-menu");
  };
  return (
    <>
      {/* <div className="flex justify-end">
        <HomeEmButton />
      </div> */}
      <div className="flex flex-col items-center bg-[#F5F5F5] h-screen-navbar">
        <div className="text-center mb-10 mt-[40px]">
          <h1 className="text-3xl font-bold mb-2">วัตถุดิบที่ต้องการพัก</h1>
          <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
        </div>

        <div className="w-full">
          <div className="w-full mb-4">
            <div className="flex justify-between items-start">
              <p className="text-2xl">วัตถุดิบที่เลือกทั้งหมด</p>
              <div className="flex items-center space-x-4 text-[#DD9F52] font-bold">
                {/* <button className="hover:underline font-bold">ดูรายการ</button>
                <span className="text-gray-300">|</span> */}
                <button
                  onClick={handlePauseIngredient}
                  className="hover:underline font-bold"
                >
                  แก้ไข
                </button>
              </div>
            </div>
            <div className="w-full h-[1px] bg-gray-300 mt-2"></div>
          </div>
        </div>
        <div className="w-full">
          <div className="w-full mb-4">
            <div className="flex justify-between items-start">
              <p className="text-2xl">เมนูที่เลือกทั้งหมด</p>
              <div className="flex items-center space-x-4 text-[#DD9F52] font-bold">
                {/* <button className="hover:underline font-bold">ดูรายการ</button>
                <span className="text-gray-300">|</span> */}
                <button
                  onClick={handlePauseMenu}
                  className="hover:underline font-bold"
                >
                  แก้ไข
                </button>
              </div>
            </div>
            <div className="w-full h-[1px] bg-gray-300 mt-2"></div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-[#F5F5F5] px-4 py-4 shadow-md flex justify-between">
          <button
            onClick={handleBackButton}
            className="px-14 py-4 w-[300px] rounded-full border text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
          >
            ย้อนกลับ
          </button>
          {/* <button className="px-6 py-3 w-[250px] rounded-full bg-[#DD9F52] text-white hover:bg-[#C68A47] transition-colors font-bold">
            บันทึก
          </button> */}
        </div>
      </div>
    </>
  );
};

export default PauseSection;
