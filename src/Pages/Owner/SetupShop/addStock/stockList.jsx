import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import { useSelector } from "react-redux";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";

const StockList = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [menuData, setMenuData] = useState({
    available_category: [],
    categories: [],
    menus: [],
  });

  // Fetch menu data
  useEffect(() => {
    fetchApi(`${URL}/owner/categories/all/menus`, "GET")
      .then((response) => response.json())
      .then((data) => {
        setMenuData(data);
      })
      .catch((error) => {
        console.error("Error fetching menu data:", error);
      });
  }, [URL]);

  // Get all menus including those in categories and standalone menus
  const getAllMenus = () => {
    const allMenus = new Set();

    // Add standalone menus
    menuData.menus?.forEach((menu) => {
      allMenus.add(JSON.stringify(menu));
    });

    // Add menus from categories
    menuData.categories?.forEach((category) => {
      category.menus?.forEach((menu) => {
        allMenus.add(JSON.stringify(menu));
      });
    });

    return Array.from(allMenus).map((menu) => JSON.parse(menu));
  };

  // Get filtered menus based on selected category and search term
  const getFilteredMenus = () => {
    let menus = [];

    if (selectedCategory === "ทั้งหมด") {
      menus = getAllMenus();
    } else {
      const category = menuData.categories?.find(
        (cat) => cat.name === selectedCategory
      );
      menus = category?.menus || [];
    }

    return menus.filter((menu) =>
      menu.menu_name
        .toLowerCase()
        .normalize("NFC")
        .includes(searchTerm.toLowerCase().normalize("NFC"))
    );
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    navigate("/main-menu");
  };

  const handleEditClick = (menu) => {
    navigate("/add-stock", {
      state: {
        menu: menu.menu_name,
        menu_id: menu.menu_id,
      },
    });
  };

  return (
    <div className="flex flex-col items-center h-screen-navbar bg-[#F5F5F5]">
      <div className="text-center mb-10 mt-[40px]">
        <h1 className="text-3xl font-bold mb-2">รายการสินค้า</h1>
        <div className="w-20 h-1 bg-[#DD9F52] mt-6"></div>
      </div>

      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">เมนูทั้งหมด</h1>
      </div>

      <div className="w-full mb-8 bg-[#F5F5F5]">
        <div className="relative w-full bg-[#F5F5F5]">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DD9F52]" />
          <ThaiVirtualKeyboardInput
            placeholder="ค้นหาด้วยชื่อสินค้า..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full py-3 pl-10 pr-4 text-gray-700 outline-none"
          />
        </div>
      </div>

      <div className="w-full flex items-center pb-2 mb-6 h-auto">
        {/* Add "ทั้งหมด" category button */}
        <button
          onClick={() => handleCategoryClick("ทั้งหมด")}
          className={`px-6 py-3 rounded-full border border-[#DD9F52] font-bold mr-2 ${
            selectedCategory === "ทั้งหมด"
              ? "bg-[#DD9F52] text-white"
              : "bg-[#F5F5F5] text-[#DD9F52]"
          }`}
        >
          ทั้งหมด
        </button>

        {/* Category buttons */}
        {menuData.available_category?.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(category)}
            className={`px-6 py-3 rounded-full border border-[#DD9F52] font-bold mr-2 ${
              selectedCategory === category
                ? "bg-[#DD9F52] text-white"
                : "bg-[#F5F5F5] text-[#DD9F52]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="w-full overflow-y-auto pb-32 pr-4">
        {getFilteredMenus().map((menu, index) => (
          <div key={index} className="w-full mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-2xl">{menu.menu_name}</p>
              <button
                onClick={() => handleEditClick(menu)}
                className="text-[#DD9F52] font-bold"
              >
                แก้ไข
              </button>
            </div>
            <div className="w-full h-px bg-gray-300 mt-2"></div>
          </div>
        ))}

        {getFilteredMenus().length === 0 && (
          <p className="text-gray-400 text-center">ไม่พบสินค้า</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#F5F5F5] px-4 py-4 shadow-md flex justify-between">
        <button
          onClick={handleBack}
          className="px-14 py-4 w-[300px] rounded-full border text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
};

export default StockList;
