import React from "react";
import configureAPI from "../../../../Config/configureAPI";
import fetchApi from "../../../../Config/fetchApi";
import LoadingPopup from "../../../../Components/General/loadingPopup";
import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const DeleteGroup = ({ isOpen, onClose, onConfirm, deleteCategory }) => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const MySwal = withReactContent(Swal);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetchApi(
        `${URL}/owner/categories/${deleteCategory.category_id}`,
        "DELETE"
      );

      if (response.ok) {
        console.log("category deleted successfully");
        MySwal.fire({
          icon: "success",
          title: "ลบกลุ่มรายการสินค้าสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        });
        onConfirm();
      } else {
        console.error("Failed to delete the category");
      }
    } catch (error) {
      console.error("An error occurred while deleting the category:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-1">
      <div className="bg-[#F5F5F5] p-8 rounded-lg w-[700px] h-[300px] shadow-lg flex flex-col justify-center items-center text-center">
        <h2 className="text-3xl mb-4">
          ลบกลุ่ม{" "}
          <span className="font-bold">{deleteCategory.category_name}</span>{" "}
          หรือไม่ ?
        </h2>
        <p className="text-gray-600 mb-8">
          การลบกลุ่มจะไม่สามารถย้อนกลับมาแก้ไขได้อีก
        </p>
        <div className="w-full flex justify-between space-x-8">
          <button
            onClick={onClose}
            className="px-8 py-3 w-[250px] font-bold border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleDelete}
            className="px-8 py-3 w-[250px] bg-[#DD9F52] font-bold text-white rounded-full hover:bg-[#C68A47] transition-colors"
          >
            ลบ
          </button>
        </div>
      </div>
      <LoadingPopup loadingStatus={loading} />
    </div>
  );
};

export default DeleteGroup;
