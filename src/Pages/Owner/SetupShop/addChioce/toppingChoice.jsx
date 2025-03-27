import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useEffect } from "react";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import { useSelector } from "react-redux";
import { AiOutlineDelete } from "react-icons/ai";
import { useLocation } from "react-router-dom";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";
import LoadingPopup from "../../../../Components/General/loadingPopup";

const ToppingChoice = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isRequired, setIsRequired] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [choices, setChoices] = useState([
    { id: "", name: "", price: "", quantity: "", unit: "" },
  ]);
  const [toppingData, setToppingData] = useState([]);
  const groupedMenus = [];
  const [errors, setErrors] = useState({
    price: "",
    choiceName: "",
    choiceQuantity: "",
    menuSelection: "",
  });
  const [loading, setLoading] = useState(false);

  console.log("CHOICE:", choices);

  const [menuData, setMenuData] = useState({
    available_category: [],
    categories: [],
    menus: [],
    available_menus: [],
  });

  const location = useLocation();
  const { mode, groupName: initialGroupName } = location.state || {
    mode: "add",
    groupName: "",
  };

  const [oldGroupName, setOldGroupName] = useState("");
  const [groupName, setGroupName] = useState(initialGroupName);

  // List options
  const unitOptions = [
    { value: "กรัม", label: "กรัม (g)" },
    { value: "กิโลกรัม", label: "กิโลกรัม (kg)" },
    { value: "มิลลิลิตร", label: "มิลลิลิตร (ml)" },
    { value: "ลิตร", label: "ลิตร (l)" },
    { value: "ชิ้น", label: "ชิ้น (unit)" },
  ];

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetchApi(
          `${URL}/owner/categories/all/menus`,
          "GET"
        );
        const data = await response.json();
        setMenuData(data);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    };

    fetchMenuData();
  }, [URL]);

  useEffect(() => {
    const fetchToppingData = async () => {
      if (mode === "edit" && initialGroupName) {
        try {
          const response = await fetchApi(
            `${URL}/owner/menus/options/add-on`,
            "GET"
          );
          const data = await response.json();
          console.log("Fetched topping data:", data);

          setGroupName(data.group_name);
          setOldGroupName(data.group_name);

          // Transform backend data format to match component state
          const existingChoices = data.options.map((option) => ({
            id: option.add_on_id,
            name: option.add_on_name,
            price: option.price,
            quantity: option.quantity,
            unit: option.unit,
          }));

          setChoices(existingChoices);
          setSelectedMenus(data.menu_id);
          setIsRequired(data.is_require || false);
          setIsMultiple(data.is_multiple || false);
        } catch (error) {
          console.error("Error fetching topping data:", error);
        }
      }
    };

    fetchToppingData();
  }, [mode, initialGroupName, URL]);

  useEffect(() => {
    if (mode !== "edit") {
      setChoices([{ id: "", name: "", price: "", quantity: "", unit: "" }]);
    }
  }, [mode]);

  useEffect(() => {
    if (menuData?.categories) {
      const defaultExpanded = menuData.categories.reduce((acc, category) => {
        acc[category.id] = true; // Set each category to expanded
        return acc;
      }, {});
      setExpandedGroups(defaultExpanded);
    }
  }, [menuData]);

  const handleNext = async () => {
    let valid = true;
    // const newErrors = {
    //   price: "",
    //   choiceName: "",
    //   choiceQuantity: "",
    //   menuSelection: "",
    // };

    // // case price
    // choices.forEach((choice, index) => {
    //   if (!choice.price || isNaN(choice.price)) {
    //     valid = false;
    //     newErrors.price = "กรุณากรอกเฉพาะตัวเลขเท่านั้น";
    //   } else {
    //     newErrors.price = "";
    //   }

    //   if (!choice.name) {
    //     valid = false;
    //     newErrors.choiceName = "กรุณากรอกชื่อช้อยส์";
    //   } else if (index === choices.length - 1 && !choice.name) {
    //     valid = false;
    //     newErrors.choiceName = "กรุณากรอกชื่อช้อยส์";
    //   } else {
    //     newErrors.choiceName = "";
    //   }

    //   if (step === 2 && (!choice.quantity || isNaN(choice.quantity))) {
    //     valid = false;
    //     newErrors.choiceQuantity = "กรุณากรอกเฉพาะตัวเลขเท่านั้น";
    //   } else {
    //     newErrors.choiceQuantity = "";
    //   }
    // });

    // console.log("ERROR:", errors);

    // // case select menu
    // if (step === 3 && selectedMenus.length === 0) {
    //   valid = false;
    //   newErrors.menuSelection = "กรุณาเลือกอย่างน้อย 1 เมนู";
    // } else {
    //   newErrors.menuSelection = "";
    // }

    // setErrors(newErrors);
    if (valid) {
      if (step === 4) {
        setLoading(true);
        try {
          let endpoint = `${URL}/owner/menus/options/add-ons`;
          let method = "POST";
          let requestData;

          if (mode === "edit") {
            method = "PATCH";
            requestData = {
              old_add_on_group_name: oldGroupName,
              new_add_on_group_name: groupName,
              options: choices.map((choice) => ({
                add_on_id: choice.id?.toString() || "null",
                add_on_name: choice.name,
                price: choice.price,
                quantity: choice.quantity,
                unit: choice.unit,
              })),
              menu_id: selectedMenus,
              is_require: isRequired,
              is_multiple: isMultiple,
            };
            console.log("PATCH requestData:", requestData);
          } else {
            // POST format remains the same
            const formattedOptions = choices.map((choice) => {
              const option = {};
              option[choice.name] = {
                price: choice.price,
                unit: choice.unit,
                quantity: parseInt(choice.quantity),
              };
              return option;
            });

            requestData = {
              options: formattedOptions,
              menu_id: selectedMenus,
              is_required: isRequired,
              is_multipled: isMultiple,
            };
            console.log("POST requestData:", requestData);
          }

          const response = await fetchApi(endpoint, method, requestData);

          if (response.ok) {
            navigate("/choice-list");
          } else {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            alert("Failed to save topping options");
          }
        } catch (error) {
          console.error("Error saving topping options:", error);
          alert("An error occurred while saving");
        } finally {
          setLoading(false);
        }
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step === 1) {
      if (mode === "edit") {
        navigate("/choice-list");
      } else {
        navigate("/choice-option");
      }
    } else {
      setStep(step - 1);
    }
  };

  const handleChoiceChange = (index, field, value) => {
    const updatedChoices = [...choices];
    updatedChoices[index][field] = value;
    setChoices(updatedChoices);
  };

  const addChoice = () => {
    setChoices((prev) => [
      ...prev,
      { id: "", name: "", price: "", quantity: "", unit: "" },
    ]);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleSelectMenu = (menuId) => {
    setSelectedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleSelectAllInGroup = (group) => {
    const groupMenuIds = group.menus.map((menu) => menu.menu_id);
    const allSelected = groupMenuIds.every((id) => selectedMenus.includes(id));

    if (allSelected) {
      setSelectedMenus((prev) =>
        prev.filter((id) => !groupMenuIds.includes(id))
      );
    } else {
      setSelectedMenus((prev) => [...new Set([...prev, ...groupMenuIds])]);
    }
  };

  const filteredGroups = groupedMenus.map((group) => ({
    ...group,
    menus: group.menus.filter((menu) =>
      menu.menu_name.normalize("NFD").includes(searchTerm.normalize("NFD"))
    ),
  }));

  console.log("filteredGroups", filteredGroups);

  const toggleGroup = (categoryId) => {
    setExpandedGroups((prevState) => ({
      ...prevState,
      [categoryId]: !prevState[categoryId],
    }));
  };

  const removeChoice = (index) => {
    setChoices((prev) => prev.filter((_, i) => i !== index));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="w-full flex justify-start text-2xl mb-5 font-bold">
              1. เพิ่มช้อยส์ในตัวเลือก:
              <span className="text-[#DD9F52] ml-2"> ท็อปปิ้ง</span>
            </div>

            <div className="flex mb-4 w-full items-center">
              <div className="mr-12">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={() => setIsRequired(!isRequired)}
                    className="form-checkbox h-5 w-5 accent-[#DD9F52] mr-2"
                  />
                  ลูกค้าจำเป็นต้องเลือก
                </label>
              </div>
              <div className="">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isMultiple}
                    onChange={() => setIsMultiple(!isMultiple)}
                    className="form-checkbox h-5 w-5 accent-[#DD9F52] mr-2"
                  />
                  ลูกค้าสามารถเลือกได้มากกว่า 1 ช้อยส์
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 mb-4 items-start text-start w-full">
              <div className="font-bold">ชื่อช้อยส์</div>
              <div className="font-bold">ส่วนต่างของราคาที่คิดเพิ่ม (บาท)</div>
            </div>

            {/* Form Section */}
            <div className="space-y-4 w-full">
              {choices.map((choice, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_auto] gap-4 w-full items-center"
                >
                  <div className="grid grid-cols-2 gap-4 w-full items-center">
                    <ThaiVirtualKeyboardInput
                      placeholder="กรอกชื่อท็อปปิ้ง..."
                      value={choice.name}
                      onChange={(value) =>
                        handleChoiceChange(index, "name", value)
                      }
                      className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
                    />
                    {/* Unit Selection Dropdown */}
                    <select
                      value={choice.unit || ""}
                      onChange={(e) =>
                        handleChoiceChange(index, "unit", e.target.value)
                      }
                      className="border border-[#DD9F52] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
                    >
                      <option value="">เลือกหน่วย...</option>
                      {unitOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ThaiVirtualKeyboardInput
                    type="text"
                    placeholder="ราคา..."
                    value={choice.price || ""}
                    onChange={(value) =>
                      handleChoiceChange(index, "price", value)
                    }
                    className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
                  />
                  <button
                    onClick={() => removeChoice(index)}
                    className="flex items-center justify-center w-10 h-10 border border-[#C94C4C] text-[#C94C4C] rounded-full transition duration-200 hover:bg-[#C94C4C] hover:text-white"
                  >
                    <span className="text-2xl">−</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addChoice}
              className="w-full py-2 bg-[#F0ECE3] text-[#DD9F52] rounded-full font-semibold mt-6"
            >
              + เพิ่มช้อยส์
            </button>
          </>
        );

      case 2:
        return (
          <>
            <div className="w-full flex justify-start text-2xl mb-5 font-bold">
              2. เพิ่มปริมาณที่ใช้ช้อยส์ในตัวเลือก:
              <span className="text-[#DD9F52] ml-2"> ท็อปปิ้ง</span>
            </div>

            <div className="grid grid-cols-2 mb-4">
              <div className="font-bold mb-2">ชื่อช้อยส์</div>
              <div className="font-bold mb-2 ml-20">ปริมาณที่ใช้</div>
            </div>

            {/* Form Section */}
            <div className="space-y-4 w-full">
              {choices.map((choice, index) => (
                <div key={index} className="grid grid-cols-2 gap-6 mb-6">
                  {/* Left Column */}
                  <div>
                    <input
                      type="text"
                      value={choice.name}
                      disabled
                      className="w-full border border-[#DD9F52] rounded-full p-3 bg-gray-200 text-gray-600"
                    />
                  </div>

                  {/* Right Column */}
                  <div>
                    <ThaiVirtualKeyboardInput
                      placeholder="ยังไม่มีข้อมูล..."
                      value={choice.quantity}
                      onChange={(value) =>
                        handleChoiceChange(index, "quantity", value)
                      }
                      className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
                    />
                    {errors.choiceQuantity && (
                      <div className="text-[#C94C4C] text-sm mt-2">
                        {errors.choiceQuantity}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="w-full flex justify-start text-2xl mb-5 font-bold">
              3. เลือกเมนูที่ต้องการใช้ตัวเลือก:
              <span className="text-[#DD9F52] ml-2"> ท็อปปิ้ง</span>
            </div>

            <div className="w-full flex justify-start text-xl mb-8">
              <div className="relative flex items-start w-full">
                <FaSearch
                  style={{ color: "#DD9F52" }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <ThaiVirtualKeyboardInput
                  type="text"
                  placeholder="ค้นหาด้วยชื่อสินค้า..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 pl-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
                />
              </div>
            </div>

            <label
              htmlFor="selectedMenus"
              className="text-2xl w-full text-start font-bold"
            >
              เมนูทั้งหมด
            </label>

            {/* Scrollable menu categories container */}
            <div className="w-full flex-1 overflow-y-auto pr-4 pb-32">
              {menuData.categories
                .filter((category) =>
                  category.menus.some((menu) =>
                    menu.menu_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                )
                .map((category) => (
                  <div
                    className="w-full flex justify-start mt-2"
                    key={category.id}
                  >
                    <div className="w-full mb-4">
                      <div
                        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-full cursor-pointer"
                        onClick={() => toggleGroup(category.id)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={category.menus.every((menu) =>
                              selectedMenus.includes(menu.menu_id)
                            )}
                            onChange={() => handleSelectAllInGroup(category)}
                            className="form-checkbox h-5 w-5 accent-[#DD9F52] mr-3"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-bold text-2xl">
                            {category.name}
                          </span>
                        </div>
                        <button className="ml-auto focus:outline-none">
                          {expandedGroups[category.id] ? (
                            <FaChevronUp className="text-[#DD9F52]" />
                          ) : (
                            <FaChevronDown className="text-[#DD9F52]" />
                          )}
                        </button>
                      </div>

                      {expandedGroups[category.id] && (
                        <div className="ml-8 grid grid-cols-4 gap-4 mt-2 max-h-[200px] overflow-y-auto">
                          {category.menus
                            .filter((menu) =>
                              menu.menu_name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((menu) => (
                              <label
                                key={menu.menu_id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedMenus.includes(menu.menu_id)}
                                  onChange={() =>
                                    handleSelectMenu(menu.menu_id)
                                  }
                                  className="form-checkbox h-5 w-5 accent-[#DD9F52]"
                                />
                                <span>{menu.menu_name}</span>
                              </label>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {/* Uncategorized menus section */}
              {menuData.menus.length > 0 && (
                <div className="w-full flex justify-start mt-2">
                  <div className="w-full mb-4">
                    <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-full">
                      <span className="font-bold text-2xl">เมนูอื่นๆ</span>
                    </div>
                    <div className="ml-8 grid grid-cols-4 gap-4 mt-2 max-h-[200px] overflow-y-auto">
                      {menuData.menus
                        .filter((menu) =>
                          menu.menu_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((menu) => (
                          <label
                            key={menu.menu_id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMenus.includes(menu.menu_id)}
                              onChange={() => handleSelectMenu(menu.menu_id)}
                              className="form-checkbox h-5 w-5 accent-[#DD9F52]"
                            />
                            <span>{menu.menu_name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errors.menuSelection && (
              <div className="text-[#C94C4C] text-sm mt-2">
                {errors.menuSelection}
              </div>
            )}
          </>
        );
      case 4:
        return (
          <>
            <div className="w-full flex justify-start text-2xl mb-5 font-bold">
              4. สรุปตัวเลือก:
              <span className="text-[#DD9F52] ml-2"> ท็อปปิ้ง</span>
            </div>

            {/* GROUP DETAIL */}
            <div className="w-full ml-16 mb-4">
              <div className="w-full flex justify-start text-2xl font-bold">
                ช้อยส์ในตัวเลือก
              </div>

              <div className="mb-4 w-full">
                {/* Table Header */}
                <div className="overflow-x-auto mr-16">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-[#DD9F52] bg-opacity-40">
                        <th className="border border-gray-300 px-4 py-2 text-center">
                          ชื่อช้อยส์
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center">
                          ส่วนต่างของราคาที่คิดเพิ่ม
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center">
                          ปริมาณที่ใช้
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center">
                          หน่วย
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Displaying all choices and their price differences */}
                      {choices.map((choice, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {choice.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {choice.price} บาท
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {choice.quantity}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {choice.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* select menu */}
            <div className="w-full ml-16">
              <label
                htmlFor="selectedMenus"
                className="text-2xl w-full text-start font-bold"
              >
                เมนูทั้งหมดที่ใช้ในตัวเลือก
              </label>
              <div className="w-full grid grid-cols-3 gap-4 mb-8 mt-4">
                {selectedMenus.map((menuId) => {
                  // Find menu in both categorized and uncategorized menus
                  const findMenu = (menuId) => {
                    // Search in categorized menus
                    for (const category of menuData.categories) {
                      const menu = category.menus.find(
                        (m) => m.menu_id === menuId
                      );
                      if (menu) return menu;
                    }
                    // Search in uncategorized menus
                    return menuData.menus.find((m) => m.menu_id === menuId);
                  };

                  const menu = findMenu(menuId);
                  if (!menu) return null;

                  return (
                    <div key={menuId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={true}
                        className="form-checkbox h-5 w-5 accent-[#DD9F52]"
                        readOnly
                      />
                      <span>{menu.menu_name}</span>
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
    <div className="flex flex-col items-center bg-[#F5F5F5] h-screen-navbar">
      {/* Header */}
      <div className="text-center mb-10 mt-[40px]">
        <h1 className="text-3xl font-bold mb-2">เพิ่มตัวเลือก</h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      {/* Render step content using switch */}
      {renderStepContent()}

      {/* Buttons */}
      <div className="fixed bottom-0 left-0 w-full bg-[#F5F5F5] px-4 py-4 shadow-md flex justify-between">
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
          {step < 4 ? "ถัดไป" : "บันทึก"}
        </button>
      </div>
      <LoadingPopup loading={loading} />
    </div>
  );
};

export default ToppingChoice;
