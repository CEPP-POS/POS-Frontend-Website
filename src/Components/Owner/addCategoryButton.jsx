import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import configureAPI from "../../Config/configureAPI";
import fetchApi from "../../Config/fetchApi";
import ThaiVirtualKeyboardInput from "../Common/ThaiVirtualKeyboardInput";
import LoadingPopup from "../General/loadingPopup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const AddCategoryButton = ({ onAdd }) => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const MySwal = withReactContent(Swal);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      setIsModalOpen(false);
    }
  };

  const handleAddIngredientCategory = async () => {
    setLoading(true);
    try {
      const response = await fetchApi(`${URL}/owner/stock-group`, "POST", {
        category_name: categoryName,
      });

      if (response.ok) {
        toggleModal();
        onAdd(categoryName);
        setCategoryName("");
        MySwal.fire({
          icon: "success",
          title: "เพิ่มหมวดหมู่สำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error create ingredient category:", error);
    } finally {
      setLoading(false);
      setCategoryName("");
    }
  };

  return (
    <div>
      <button
        type="button"
        className="text-[#DD9F52] bg-[#F5F5F5] border border-[#DD9F52] focus:outline-none hover:bg-[#DD9F52] hover:text-white focus:ring-4 focus:ring-gray-100 font-bold rounded-full text-xl px-3 py-1"
        onClick={toggleModal}
      >
        <div className="flex items-center">
          <span className="pl-1">
            <FaPlus size={24} />
          </span>
          <span className="pl-2">เพิ่มหมวดหมู่</span>
        </div>
      </button>

      {/* Modal Popup */}
      {isModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOutsideClick}
        >
          <div
            className="bg-[#F5F5F5] rounded-lg w-[800px] p-10 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-center text-3xl font-bold mb-4">
              เพิ่มหมวดหมู่
            </h1>

            <div className="mb-6">
              <label
                htmlFor="categoryName"
                className="block text-2xl font-medium text-black mb-2"
              >
                ชื่อหมวดหมู่
              </label>
              <ThaiVirtualKeyboardInput
                id="categoryName"
                placeholder="กรอกชื่อหมวดหมู่..."
                value={categoryName}
                onChange={(value) => setCategoryName(value)}
                className="w-full bg-[#F5F5F5] border border-[#DD9F52] rounded-full p-2 focus:outline-none focus:ring-1 focus:ring-[#DD9F52]"
              />
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                className="w-40 bg-[#F5F5F5] border text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold rounded-full text-xl px-4 py-2"
                onClick={toggleModal}
              >
                ย้อนกลับ
              </button>

              <button
                type="button"
                onClick={handleAddIngredientCategory}
                className="text-white  w-40 bg-[#DD9F52] focus:outline-none hover:bg-[#C68A47] focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-xl px-4 py-2"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
      <LoadingPopup loading={loading} />
    </div>
  );
};

export default AddCategoryButton;
