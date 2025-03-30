import React from "react";
import { FaBahtSign } from "react-icons/fa6";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdOutlineRemoveShoppingCart } from "react-icons/md";

const IncomeOrderCancel = ({ data }) => {
  return (
    <div className="w-full">
      <div className="flex w-full justify-between gap-4">
        {/* รายรับทั้งหมด */}
        <div className="flex flex-1 py-2 px-4 bg-[#F5F5F5] border rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#DD9F52]">
            <FaBahtSign color="white" size={16} />
          </div>
          <div className="ml-3">
            <p>รายรับทั้งหมด</p>
            <p className="font-bold">
              {Number.isFinite(parseFloat(data?.total_revenue))
                ? parseInt(data.total_revenue).toLocaleString()
                : "0"}{" "}
              บาท
            </p>
          </div>
        </div>

        {/* ยอดออเดอร์ทั้งหมด */}
        <div className="flex flex-1 py-2 px-4 bg-[#F5F5F5] border rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#DD9F52]">
            <MdOutlineShoppingCart color="white" size={16} />
          </div>
          <div className="ml-3">
            <p>ยอดออเดอร์ทั้งหมด</p>
            <p className="font-bold">{data?.total_orders} ออเดอร์</p>
          </div>
        </div>

        {/* จำนวนออเดอร์ที่ถูกยกเลิก */}
        <div className="flex flex-1 py-2 px-4 bg-[#F5F5F5] border rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#DD9F52]">
            <MdOutlineRemoveShoppingCart color="white" size={16} />
          </div>
          <div className="ml-3">
            <p>จำนวนออเดอร์ที่ถูกยกเลิก</p>
            <p className="font-bold">{data?.canceled_orders} ออเดอร์</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeOrderCancel;
