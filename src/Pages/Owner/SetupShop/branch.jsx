import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiHomeOfficeLine } from "react-icons/ri";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";

const Branch = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);

  const ownerId = sessionStorage.getItem("owner_id");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetchApi(`${URL}/branches/owner/${ownerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch branches");
        }
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranches();
  }, []);

  const handleSelectBranch = (branchId) => {
    navigate(`/enter-new-password`);
    sessionStorage.setItem("branch_id", branchId);
    console.log("BRANCH ID:", branchId);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-[120px] bg-white">
      <div className="text-start mb-10 bg-white">
        <h1 className="mt-4 text-3xl font-bold mb-2">หน้าร้าน / สาขา</h1>
        <h1 className="text-2xl mb-2">โปรดเลือกสาขาที่ต้องการจัดการข้อมูล</h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      <div className="w-full h-full ml-16 mt-[120px]">
        <div
          className="grid gap-8 justify-center"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`,
          }}
        >
          {branches.length > 0 ? (
            branches.map(({ branch_id, branch_name, branch_address }) => (
              <div
                key={branch_id}
                className="flex flex-col items-center cursor-pointer transition-all text-[#DD9F52] hover:text-[#C68A47]"
                onClick={() => handleSelectBranch(branch_id)}
              >
                <RiHomeOfficeLine size={120} className="mb-2" />
                <p className="mt-2 text-3xl font-bold text-black">
                  {branch_name}
                </p>
                <p className="mt-2 text-2xl text-black">{branch_address}</p>
              </div>
            ))
          ) : (
            <p className="text-2xl text-gray-500 text-center col-span-full">
              ไม่มีข้อมูลสาขา
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Branch;
