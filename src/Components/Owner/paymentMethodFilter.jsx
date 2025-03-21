import React, { useState } from "react";

const PaymentMethodFilter = ({ onFilterChange }) => {
  const tags = ["ทั้งหมด", "QR CODE", "เงินสด"];
  const [selectedTag, setSelectedTag] = useState("ทั้งหมด");

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    // ส่งค่าที่เลือกไปยัง parent component
    const filterValue =
      tag === "ทั้งหมด" ? "" : tag === "QR CODE" ? "qr" : "cash";
    onFilterChange(filterValue);
  };

  return (
    <div>
      <div className="my-3">
        <div className="flex items-center space-x-4">
          <div>ช่องทางการชำระเงิน</div>
          {/* Tags Section */}
          {tags.map((tag, index) => (
            <button
              key={index}
              onClick={() => handleTagClick(tag)}
              className={`px-4 py-1 ${
                selectedTag === tag
                  ? "bg-[#DD9F52] text-white rounded-full border"
                  : "bg-[#F5F5F5] border-[#DD9F52] text-[#DD9F52] border rounded-full"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodFilter;
