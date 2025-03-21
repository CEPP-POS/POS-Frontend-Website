import React from "react";

const DeleteChoice = ({ isOpen, onClose, onConfirm, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-1">
      <div className="bg-[#F5F5F5] p-8 rounded-lg w-[700px] h-[300px] shadow-lg flex flex-col justify-center items-center text-center">
        <h2 className="text-3xl mb-4">
          ลบตัวเลือก <span className="font-bold">{product.name}</span> หรือไม่ ?
        </h2>
        <p className="text-gray-600 mb-8">
          การลบตัวเลือกจะไม่สามารถย้อนกลับมาแก้ไขได้อีก
        </p>
        <div className="w-full flex justify-between space-x-8">
          <button
            onClick={onClose}
            className="px-14 py-4 w-[300px] border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-14 py-4 w-[300px] bg-[#DD9F52] text-white rounded-full hover:bg-[#C68A47] transition-colors"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChoice;
