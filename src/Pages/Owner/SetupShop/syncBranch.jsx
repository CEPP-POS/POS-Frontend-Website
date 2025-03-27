import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiHomeOfficeLine } from "react-icons/ri";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";
import LoadingPopup from "../../../Components/General/loadingPopup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const SyncBranch = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const MAIN_SERVER = configureAPI[environment].MAIN_SERVER;

  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(false);

  const ownerId = sessionStorage.getItem("owner_id");
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetchApi(
          `${MAIN_SERVER}/branches/owner/${ownerId}`
        );
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

  const handleSelectBranch = (branch_id, branch_name, branch_address) => {
    setSelectedBranch({
      id: branch_id,
      name: branch_name,
      address: branch_address,
    });
    setIsModalOpen(true);
  };

  const handleConfirmSync = async () => {
    console.log("Syncing branch:", selectedBranch);
    // logic sync

    setLoading(true);
    try {
      const response = await fetchApi(
        `${URL}/branches/owner/clone-branch-setup/${selectedBranch.branch_id}`,
        "POST"
      );

      if (response.ok) {
        MySwal.fire({
          icon: "success",
          title: "ซิงค์ข้อมูลสาขาสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/role");
        });
      } else {
        MySwal.fire({
          icon: "error",
          title: "ซิงค์ข้อมูลสาขาไม่สำเร็จ",
          text: "โปรดลองอีกครั้ง",
          timer: 5000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }

    setIsModalOpen(false);
  };

  const handleCancelSync = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-[120px] bg-[#F5F5F5] h-screen-navbar">
      <div className="text-start mb-10 bg-[#F5F5F5]">
        <h1 className="mt-4 text-3xl font-bold mb-2">
          ซิงค์ข้อมูลหน้าร้าน / สาขา
        </h1>
        <h1 className="text-2xl mb-2">
          โปรดเลือกสาขาที่ต้องการซิงค์ข้อมูลมายังสาขาปัจจุบัน
        </h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      <div className="w-full h-full ml-16 mt-[120px] bg-[#F5F5F5]">
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
                onClick={() =>
                  handleSelectBranch(branch_id, branch_name, branch_address)
                }
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

      {/* Confirmation Modal */}
      {isModalOpen && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-[#F5F5F5] w-[700px] h-auto rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-4">
              ยืนยันการซิงค์ข้อมูลจากสาขา {selectedBranch.name}{" "}
              {selectedBranch.address} หรือไม่?
            </h2>
            <p className="text-gray-700 text-center mb-6 text-xl">
              การยืนยันซิงค์ข้อมูลจะไม่สามารถย้อนกลับมาแก้ไขได้อีก
            </p>
            <div className="flex justify-between space-x-4 mt-8">
              <button
                className="w-[200px] text-[#DD9F52] border border-[#DD9F52] font-bold py-2 px-4 rounded-full"
                onClick={handleCancelSync}
              >
                ยกเลิก
              </button>
              <button
                className="w-[200px] bg-[#DD9F52] hover:bg-[#C68A47] text-white font-bold py-2 px-4 rounded-full"
                onClick={handleConfirmSync}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadingPopup loading={loading} />
    </div>
  );
};

export default SyncBranch;
