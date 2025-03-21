import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeleteProduct from "./deleteProduct";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import { useEffect } from "react";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";

const ProductList = () => {
  const navigate = useNavigate();

  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetchApi(`${URL}/owner/menus`, "GET");
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };

    fetchMenus();
  }, [menuItems]);

  const filteredItems = menuItems?.length
    ? menuItems.filter((item) =>
        item.menu_name.normalize("NFD").includes(searchTerm.normalize("NFD"))
      )
    : []; // Return an empty array if menuItems is empty or undefined

  // Optional: Display a message or handle when there are no results
  if (filteredItems.length === 0) {
    console.log("No menu items match the search term.");
  }

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleSuccess = () => {
    navigate("/main-menu");
  };

  const handleAddProduct = () => {
    navigate("/add-product", { state: { mode: "add" } });
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeletePopupOpen(true);
  };

  const handleConfirmDelete = () => {
    // DELETE PRODUCT API PATH
    console.log("Deleting:", productToDelete);
    setIsDeletePopupOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
  };

  const handleEditClick = (product) => {
    // EDIT PRODUCT => FLOW ADD BUT HAVE DATA OF EACH PRODUCT
    navigate("/add-product", { state: { mode: "edit", productData: product } });
  };

  return (
    <>
      <div className="flex flex-col items-center h-screen-navbar bg-[#F5F5F5] mt-[40px]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">รายการสินค้า</h1>
          <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
        </div>

        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">เมนูทั้งหมด</h1>
        </div>

        <div className="w-full flex justify-start text-2xl mb-8">
          <div className="relative flex items-center w-full">
            <FaSearch
              style={{ color: "#DD9F52" }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <ThaiVirtualKeyboardInput
              placeholder="ค้นหาด้วยชื่อสินค้า..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 pl-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
            />
          </div>
        </div>

        <div className="w-full overflow-y-auto pb-32 pr-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.menu_id} className="w-full mb-4">
                <div className="flex justify-between items-start">
                  <p className="text-2xl">{item.menu_name}</p>
                  <div className="flex items-center space-x-4 text-[#DD9F52] font-bold">
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
            <p className="text-gray-500 text-center">ไม่พบสินค้า</p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-[#F5F5F5] px-4 py-4 shadow-md">
          <div className="flex space-x-8 justify-between">
            <button
              className="px-14 py-4 w-[300px] rounded-full border text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
              onClick={handleSuccess}
            >
              ย้อนกลับ
            </button>
            <button
              className="px-14 py-4 w-[300px] rounded-full bg-[#DD9F52] text-white hover:bg-[#C68A47] transition-colors font-bold"
              onClick={handleAddProduct}
            >
              เพิ่มรายการสินค้า
            </button>
          </div>
        </div>
      </div>

      {/* DELETE PRODUCT POPUP */}
      <DeleteProduct
        isOpen={isDeletePopupOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
      />
    </>
  );
};

export default ProductList;
