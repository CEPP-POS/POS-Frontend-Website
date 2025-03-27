import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useEffect } from "react";
import fetchApi from "../../../../Config/fetchApi";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import configureAPI from "../../../../Config/configureAPI";
import LoadingPopup from "../../../../Components/General/loadingPopup";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";

const AddGroupForm = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const navigate = useNavigate();
  const location = useLocation();
  const { mode, groupData } = location.state || {
    mode: "add",
    groupData: {},
  };

  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [selectedMenuErrors, setSelectedMenuErrors] = useState("");

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

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
  }, []);

  console.log("selectedMenus:", selectedMenus);
  console.log("mode:", mode);

  // fetch group data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        if (mode === "edit" && groupData) {
          const categoryId = groupData.category_id;
          const response = await fetchApi(
            `${URL}/owner/categories/${categoryId}/menus`,
            "GET"
          );
          const groupMenus = await response.json();
          console.log("Group menus:", groupMenus);

          setGroupName(groupData.category_name || "");

          // Find menu IDs based on menu names from the response
          if (Array.isArray(groupMenus)) {
            const menuIds = menuItems
              .filter((menuItem) => groupMenus.includes(menuItem.menu_name))
              .map((menu) => menu.menu_id);

            console.log("Matched menu IDs:", menuIds);
            setSelectedMenus(menuIds);
          }
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };

    // Only fetch group data if menuItems is populated
    if (menuItems.length > 0) {
      fetchGroupData();
    }
  }, [mode, groupData, URL, menuItems]); // Add menuItems to dependencies

  // Add a debug useEffect to monitor selectedMenus changes
  useEffect(() => {
    console.log("Selected Menus Updated:", selectedMenus);
  }, [selectedMenus]);

  console.log("groupData", groupData);
  console.log("selectedMenus", selectedMenus);

  const handleAddGroup = async () => {
    setLoading(true);
    try {
      if (step === 3) {
        const endpoint =
          mode === "add"
            ? `${URL}/owner/categories`
            : `${URL}/owner/categories/${groupData.category_id}`;
        const method = mode === "add" ? "POST" : "PATCH";

        const response = await fetchApi(endpoint, method, {
          category_name: groupName,
          menu_id: selectedMenus,
        });

        if (response.ok) {
          navigate("/group-list");
        }
      }
    } catch (error) {
      console.error("Error create category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateForm()) return;
    }
    if (step === 2) {
      if (!validateMenuSelect()) return;
    }
    if (step === 3) {
      //ADD HANDLE SEND TO BACKEND
      console.log("save button click");
      handleAddGroup();
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/group-list");
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSelectMenu = (menuId) => {
    console.log("Toggling menu ID:", menuId);
    setSelectedMenus((prev) => {
      const newSelection = prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId];
      console.log("New selection:", newSelection);
      return newSelection;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!groupName.trim()) {
      newErrors.groupName = "กรุณากรอกชื่อกลุ่มสินค้า";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMenuSelect = () => {
    const newErrors = {};

    if (selectedMenus.length === 0) {
      newErrors.selectedMenus = "กรุณาเลือกอย่างน้อย 1 เมนู";
    }

    setSelectedMenuErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredMenus = menuItems.filter((menu) =>
    menu.menu_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="w-full flex justify-start text-2xl mb-5 font-bold">
              1. กรอกชื่อกลุ่มรายการสินค้าที่ต้องการ
            </div>
            <label
              htmlFor="groupName"
              className="text-2xl mb-2 w-full text-center"
            >
              ชื่อกลุ่ม
            </label>
            <ThaiVirtualKeyboardInput
              type="text"
              id="groupName"
              value={groupName}
              onChange={setGroupName}
              placeholder="กรอกชื่อกลุ่ม..."
              className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
            />
            {errors.groupName && (
              <p className="text-[#C94C4C] text-sm mt-2">{errors.groupName}</p>
            )}
          </>
        );
      case 2:
        return (
          <>
            <div className="w-full flex justify-start text-2xl mb-5 font-bold">
              2. เลือกเมนูที่ต้องการเพิ่มในกลุ่มรายการสินค้า
              <span className="text-[#DD9F52] ml-2"> {groupName}</span>
            </div>

            <div className="w-full flex justify-start text-xl mb-8">
              <div className="relative flex items-center w-full">
                <FaSearch
                  style={{ color: "#DD9F52" }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <ThaiVirtualKeyboardInput
                  type="text"
                  placeholder="ค้นหาด้วยชื่อเมนู..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full border border-[#DDw-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
                />
              </div>
            </div>
            <div className="w-full ml-16">
              <label
                htmlFor="productDetails"
                className="text-2xl w-full text-start font-bold"
              >
                เมนูทั้งหมด
              </label>
              <div className="w-full grid grid-cols-3 gap-4 mb-8 mt-4">
                {filteredMenus.map((menu) => {
                  const isChecked = selectedMenus.includes(menu.menu_id);
                  console.log(
                    `Menu ${menu.menu_name} (${menu.menu_id}) checked:`,
                    isChecked
                  );
                  return (
                    <label
                      key={menu.menu_id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectMenu(menu.menu_id)}
                        className="form-checkbox h-5 w-5 accent-[#DD9F52]"
                      />
                      <span>{menu.menu_name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            {selectedMenuErrors.selectedMenus && (
              <p className="text-[#C94C4C] text-sm mt-2">
                {selectedMenuErrors.selectedMenus}
              </p>
            )}
          </>
        );
      case 3:
        return (
          <>
            <div className="w-full flex justify-start text-2xl mb-5 font-bold">
              3. สรุปกลุ่มรายการสินค้า
              <span className="text-[#DD9F52] ml-2"> {groupName}</span>
            </div>
            <div className="w-full ml-16">
              <label
                htmlFor="selectedMenus"
                className="text-2xl w-full text-start font-bold"
              >
                เมนูทั้งหมดในหมวดหมู่
              </label>
              <div className="w-full grid grid-cols-3 gap-4 mb-8 mt-4">
                {selectedMenus.map((menuId) => {
                  const menu = menuItems.find((m) => m.menu_id === menuId);
                  return (
                    <div key={menuId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="form-checkbox h-5 w-5 accent-[#DD9F52]"
                      />
                      <span>{menu?.menu_name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center bg-[#F5F5F5] h-screen-navbar">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">เพิ่มกลุ่มรายการสินค้า</h1>
          <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
        </div>

        <div className="w-full">
          <div className="flex flex-col items-center w-full">
            {renderStepContent()}
          </div>

          <div className="flex fixed bottom-0 left-0 w-full bg-[#F5F5F5] px-4 py-4 shadow-md flex justify-between justify-between">
            <button
              className="px-14 py-4 w-[300px] border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
              onClick={handleBack}
            >
              ย้อนกลับ
            </button>
            <button
              className="px-14 py-4 w-[300px] bg-[#DD9F52] text-white rounded-full hover:bg-[#C68A47] transition-colors font-bold"
              onClick={handleNext}
            >
              {step < 3 ? "ถัดไป" : "บันทึก"}
            </button>
          </div>
        </div>
      </div>

      <LoadingPopup loadingStatus={loading} />
    </>
  );
};

export default AddGroupForm;
