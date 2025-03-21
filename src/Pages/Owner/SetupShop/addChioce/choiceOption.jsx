import React from "react";
import { CiBoxList } from "react-icons/ci";
import { CgMenuGridO } from "react-icons/cg";
import { CiGlass } from "react-icons/ci";
import { LiaMugHotSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";

const ChoiceOptions = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/choice-list");
  };

  const handleGlassClick = () => {
    navigate("/glass-choice");
  };

  const handleTypeClick = () => {
    navigate("/type-choice");
  };

  const handleToppingClick = () => {
    navigate("/topping-choice");
  };

  const handleSweetLevelClick = () => {
    navigate("/sweet-level-choice");
  };

  return (
    <div className="flex flex-col items-center bg-[#F5F5F5] h-screen-navbar">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 mt-[40px]">
          ตัวเลือกรายการสินค้า
        </h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      {/* Options Section */}
      <div className="w-full ml-16 mt-[240px]">
        <div className="grid grid-cols-4 gap-8">
          {/* glass size */}
          <div className="flex flex-col items-center">
            <CiGlass
              className="text-[#DD9F52] mb-2"
              size={120}
              onClick={handleGlassClick}
            />
            <p className="text-black font-semibold">ขนาดแก้ว</p>
          </div>

          {/* sweet level */}
          <div className="flex flex-col items-center">
            <CiBoxList
              className="text-[#DD9F52] mb-2"
              size={120}
              onClick={handleSweetLevelClick}
            />
            <p className="text-black font-semibold">ความหวาน</p>
          </div>

          {/* topping */}
          <div className="flex flex-col items-center">
            <CgMenuGridO
              className="text-[#DD9F52] mb-2"
              size={120}
              onClick={handleToppingClick}
            />
            <p className="text-black font-semibold">ท็อปปิ้ง</p>
          </div>

          {/* type */}
          <div className="flex flex-col items-center">
            <LiaMugHotSolid
              className="text-[#DD9F52] mb-2"
              size={120}
              onClick={handleTypeClick}
            />
            <p className="text-black font-semibold">ชนิดเครื่องดื่ม</p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex fixed bottom-4 left-0 px-4 py-4 w-full space-x-8 justify-between">
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

export default ChoiceOptions;
