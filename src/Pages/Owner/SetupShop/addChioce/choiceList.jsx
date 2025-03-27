import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeleteChoice from "./deleteChoice";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";
import LoadingPopup from "../../../../Components/General/loadingPopup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ChoiceList = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const MySwal = withReactContent(Swal);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupsData, setGroupsData] = useState({
    sweetness_groups: [],
    size_groups: [],
    menu_type_groups: [],
    add_ons: [],
  });

  const fetchGroupsData = async () => {
    try {
      const response = await fetchApi(
        `${URL}/owner/menus/options/groups`,
        "GET"
      );
      const data = await response.json();
      setGroupsData(data);
    } catch (error) {
      console.error("Error fetching groups data:", error);
    }
  };

  useEffect(() => {
    fetchGroupsData();
  }, [URL]);

  // Group items by type
  const groupedItems = {
    ขนาดแก้ว: groupsData.size_groups || [],
    ความหวาน: groupsData.sweetness_groups || [],
    ...(groupsData.add_ons?.length > 0 && { ท็อปปิ้ง: ["ท็อปปิ้ง"] }),
    ชนิด: groupsData.menu_type_groups || [],
  };

  // Add console log to check the data structure
  console.log("Groups Data:", groupsData);
  console.log("Grouped Items:", groupedItems);

  // Filter items based on search term
  const getFilteredItems = (items, type) => {
    // Ensure items is an array
    if (!Array.isArray(items)) {
      console.warn(`Items for type ${type} is not an array:`, items);
      return [];
    }

    return items
      .filter((name) => {
        if (typeof name !== "string") {
          console.warn(`Non-string name found in ${type}:`, name);
          return false;
        }
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .map((name) => ({ name, type }));
  };

  // Render section if it has items
  const renderSection = (title, items) => {
    // Skip if items is undefined (which will happen for ท็อปปิ้ง when there's no data)
    if (!items) return null;

    const filteredItems = getFilteredItems(items, title);
    if (filteredItems.length === 0) return null;

    return (
      <div key={title} className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-[#DD9F52]">{title}</h2>
        {filteredItems.map((item, index) => (
          <div key={index} className="w-full mb-4">
            <div className="flex justify-between items-center">
              <p className="text-xl">{item.name}</p>
              <div className="flex items-center space-x-4 text-[#DD9F52] font-bold">
                <button
                  className="hover:underline font-bold"
                  onClick={() => handleMenuClick(item)}
                >
                  สินค้าที่ใช้ตัวเลือก
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
        ))}
      </div>
    );
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleSuccess = () => {
    navigate("/main-menu");
  };

  const handleAddChoice = () => {
    navigate("/choice-option");
  };

  const handleDeleteClick = (item) => {
    setProductToDelete({
      name: item.name,
      type: item.type, // This will help us determine which endpoint to use
    });
    setIsDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    let endpoint;
    switch (productToDelete.type) {
      case "ขนาดแก้ว":
        endpoint = `${URL}/owner/menus/options/size/${productToDelete.name}`;
        break;
      case "ความหวาน":
        endpoint = `${URL}/owner/menus/options/sweetness/${productToDelete.name}`;
        console.log("DELETE GROUP:", productToDelete.name);
        break;
      case "ท็อปปิ้ง":
        endpoint = `${URL}/owner/menus/options/add-ons`;
        break;
      case "ชนิด":
        endpoint = `${URL}/owner/menus/options/menu_type/${productToDelete.name}`;
        break;
      default:
        console.error("Unknown option type");
        return;
    }

    try {
      setLoading(true);
      const response = await fetchApi(endpoint, "DELETE");

      if (response.ok) {
        await fetchGroupsData();
        setIsDeletePopupOpen(false);
        setProductToDelete(null);
        MySwal.fire({
          icon: "success",
          title: "ลบข้อมูลตัวเลือกสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const errorData = await response.json();
        console.error("Error deleting option:", errorData);
        alert("Failed to delete option");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeletePopupOpen(false);
    setProductToDelete(null);
  };

  const handleEditClick = (item) => {
    switch (item.type) {
      case "ขนาดแก้ว":
        navigate("/glass-choice", {
          state: {
            mode: "edit",
            groupName: item.name,
          },
        });
        break;
      case "ความหวาน":
        navigate("/sweet-level-choice", {
          state: {
            mode: "edit",
            groupName: item.name,
          },
        });
        break;
      case "ท็อปปิ้ง":
        navigate("/topping-choice", {
          state: {
            mode: "edit",
            groupName: item.name,
          },
        });
        break;
      case "ชนิด":
        navigate("/type-choice", {
          state: {
            mode: "edit",
            groupName: item.name,
          },
        });
        break;
    }
  };

  const translateGroupType = (thaiType) => {
    const typeMap = {
      ท็อปปิ้ง: "topping",
      ความหวาน: "sweetness",
      ความเย็น: "temperature",
      ขนาดแก้ว: "size",
    };
    return typeMap[thaiType] || thaiType;
  };

  const handleMenuClick = (item) => {
    navigate("/choice-menu", {
      state: {
        groupName: item.name,
        groupType: translateGroupType(item.type),
      },
    });
  };

  return (
    <>
      <div className="flex flex-col items-center h-screen-navbar bg-[#F5F5F5]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 mt-[40px]">
            ตัวเลือกรายการสินค้า
          </h1>
          <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
        </div>

        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">ตัวเลือกรายการสินค้าทั้งหมด</h1>
        </div>

        {/* Search Bar */}
        <div className="w-full flex justify-start text-xl mb-8">
          <div className="relative flex items-center w-full">
            <FaSearch
              style={{ color: "#DD9F52" }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <ThaiVirtualKeyboardInput
              placeholder="ค้นหาด้วยชื่อตัวเลือก..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 pl-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
            />
          </div>
        </div>

        {/* Render Groups */}
        <div className="w-full overflow-y-auto pb-32 pr-4">
          {Object.entries(groupedItems).some(
            ([_, items]) => items.length > 0
          ) ? (
            Object.entries(groupedItems).map(([type, items]) =>
              renderSection(type, items)
            )
          ) : (
            <p className="text-gray-500 text-center">
              ไม่มีตัวเลือกรายการสินค้า
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex fixed bottom-0 left-0 px-4 py-4 pb-4 w-full space-x-8 justify-between bg-[#F5F5F5]">
          <button
            className="px-14 py-4 w-[300px] rounded-full border text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
            onClick={handleSuccess}
          >
            ย้อนกลับ
          </button>
          <button
            className="px-14 py-4 w-[300px] rounded-full bg-[#DD9F52] text-white hover:bg-[#C68A47] transition-colors font-bold"
            onClick={handleAddChoice}
          >
            เพิ่มตัวเลือก
          </button>
        </div>
      </div>

      <DeleteChoice
        isOpen={isDeletePopupOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
      />

      <LoadingPopup loading={loading} />
    </>
  );
};

export default ChoiceList;
