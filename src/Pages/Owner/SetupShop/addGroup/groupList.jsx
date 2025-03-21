import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeleteGroup from "./deleteGroup";
import fetchApi from "../../../../Config/fetchApi";
import { useEffect } from "react";
import configureAPI from "../../../../Config/configureAPI";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";

const GroupList = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const navigate = useNavigate();
  const [categoryItems, setCategoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteCategory, setCategoryToDelete] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetchApi(`${URL}/owner/categories`, "GET");
        const data = await response.json();
        setCategoryItems(data);
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };

    fetchCategory();
  }, [categoryItems]);

  const filteredItems = categoryItems.filter((item) =>
    item.category_name.normalize("NFD").includes(searchTerm.normalize("NFD"))
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleSuccess = () => {
    navigate("/main-menu");
  };

  const handleAddGroup = () => {
    navigate("/add-group", { state: { mode: "add" } });
  };

  const handleDeleteClick = (deleteCategory) => {
    setCategoryToDelete(deleteCategory);
    setIsDeletePopupOpen(true);
  };

  const handleConfirmDelete = () => {
    // DELETE PRODUCT API PATH
    setIsDeletePopupOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
  };

  const handleEditClick = (group) => {
    // EDIT PRODUCT => FLOW ADD BUT HAVE DATA OF EACH PRODUCT
    console.log("group click", group);
    navigate("/add-group", { state: { mode: "edit", groupData: group } });
  };

  const handleGroupClick = async (group) => {
    try {
      const categoryId = group.category_id;
      navigate("/group-menu", {
        state: {
          groupName: group.category_name,
          categoryId: categoryId,
        },
      });
    } catch (error) {
      console.error("Error handling group click:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center bg-[#F5F5F5] h-screen-navbar mt-[40px]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">กลุ่มรายการสินค้า</h1>
          <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
        </div>

        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">กลุ่มรายการสินค้าทั้งหมด</h1>
        </div>

        <div className="w-full flex justify-start text-xl mb-8">
          <div className="relative flex items-center w-full">
            <FaSearch
              style={{ color: "#DD9F52" }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <ThaiVirtualKeyboardInput
              placeholder="ค้นหาด้วยชื่อกลุ่ม..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border border-[#DDw-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
            />
          </div>
        </div>

        {/* RENDER MENU */}
        <div className="w-full overflow-y-auto pb-32 pr-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div key={index} className="w-full mb-4">
                <div className="flex justify-between items-start">
                  <p className="text-2xl">{item.category_name}</p>
                  <div className="flex items-center space-x-4 text-[#DD9F52] font-bold">
                    <button
                      className="hover:underline font-bold"
                      onClick={() => handleGroupClick(item)}
                    >
                      รายการสินค้าในกลุ่ม
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      className="hover:underline font-bold"
                      onClick={() => handleEditClick(item)}
                    >
                      แก้ไข
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      className="hover:underline font-bold"
                      onClick={() => handleDeleteClick(item)}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-gray-300 mt-2"></div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">ไม่มีกลุ่มรายการสินค้า</p>
          )}
        </div>

        <div className="flex fixed bottom-0 left-0 w-full bg-[#F5F5F5] px-4 py-4 shadow-md flex justify-between justify-between">
          <button
            className="px-14 py-4 w-[300px] rounded-full border text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
            onClick={handleSuccess}
          >
            ย้อนกลับ
          </button>
          <button
            className="px-14 py-4 w-[300px] rounded-full bg-[#DD9F52] text-white hover:bg-[#C68A47] transition-colors font-bold"
            onClick={handleAddGroup}
          >
            เพิ่มกลุ่ม
          </button>
        </div>
      </div>

      {/* DELETE PRODUCT POPUP */}
      <DeleteGroup
        isOpen={isDeletePopupOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        deleteCategory={deleteCategory}
      />
    </>
  );
};

export default GroupList;
