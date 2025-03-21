import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiHomeOfficeLine } from "react-icons/ri";

const Branch = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([
    { id: "branch1", name: "สาขา A", details: "รายละเอียดของสาขา A" },
    { id: "branch2", name: "สาขา B", details: "รายละเอียดของสาขา B" },
    { id: "branch3", name: "สาขา C", details: "รายละเอียดของสาขา C" },
  ]);

  const handleSelectBranch = (branchId) => {
    navigate(`/branch/${branchId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-[120px]">
      <div className="text-start mb-10">
        <h1 className="mt-4 text-3xl font-bold mb-2">หน้าร้าน / สาขา</h1>
        <h1 className="text-2xl mb-2">โปรดเลือกสาขาที่ต้องการจัดการข้อมูล</h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      <div className="w-full h-full ml-16 mt-[120px]">
        <div className="grid grid-cols-3 gap-8">
          {branches.map(({ id, name, details }) => (
            <div
              key={id}
              className="flex flex-col items-center cursor-pointer transition-all text-[#DD9F52] hover:text-[#C68A47]"
              onClick={() => handleSelectBranch(id)}
            >
              <RiHomeOfficeLine size={120} className="mb-2" />
              <p className="mt-2 text-3xl font-bold text-black">{name}</p>
              <p className="mt-2 text-2xl text-black">{details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Branch;
