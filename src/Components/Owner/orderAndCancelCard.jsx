import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdOutlineRemoveShoppingCart,
  MdOutlineShoppingCart,
} from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";

const OrderAndCancelCard = ({ total_orders, canceled_orders }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/cancel-order-summary");
  };

  return (
    <div className="flex">
      {/* รายรับทั้งหมด */}
      <div className="flex py-2 px-4 w-3/4 mr-2 bg-[#F5F5F5] border rounded-lg ">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#DD9F52]">
          <MdOutlineShoppingCart color="white" size={28} />
        </div>
        <div className="ml-3">
          <p>ยอดออเดอร์ทั้งหมด</p>
          <div className="flex">
            <p className="font-bold">{total_orders} ออเดอร์</p>
          </div>
        </div>
      </div>

      {/* สินค้าที่ใกล้จะหมดอายุ */}
      <div
        onClick={handleClick}
        className="flex items-center justify-between py-2 px-4 w-full bg-[#F5F5F5] border rounded-lg"
      >
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#DD9F52]">
            <MdOutlineRemoveShoppingCart color="white" size={28} />
          </div>
          <div className="ml-3">
            <p>จำนวนออเดอร์ที่ถูกยกเลิก</p>
            <p className="font-bold">{canceled_orders} ออเดอร์</p>
          </div>
        </div>
        <IoIosArrowForward size={30} className="text-[#DD9F52]" />
      </div>
    </div>
  );
};

export default OrderAndCancelCard;
