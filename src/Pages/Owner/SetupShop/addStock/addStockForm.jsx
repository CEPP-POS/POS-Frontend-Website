import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import configureAPI from "../../../../Config/configureAPI";
import { useSelector } from "react-redux";
import fetchApi from "../../../../Config/fetchApi";
import { useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import IngredientDropdown from "../../../../Components/General/ingredientDropdown";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";
import LoadingPopup from "../../../../Components/General/loadingPopup";

const AddStockForm = () => {
  const location = useLocation();
  const { menu, menu_id } = location.state || {};
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const userData = useSelector((state) => state.user.userData);

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [rows, setRows] = useState([{ material: "", unit: "" }]);
  const [sizeItems, setSizeItems] = useState([]);
  const [typeItems, setTypeItems] = useState([]);
  const [addOnItems, setAddOnItems] = useState([]);
  const [selectedType, setSelectedType] = useState(typeItems[0]?.menu_type_id);
  const [typeData, setTypeData] = useState({ selectedType: [] });
  const [stockData, setStockData] = useState([]);
  const [ingredientData, setIngredientData] = useState([]);
  const [menuIngredientData, setMenuIngredientData] = useState([]);
  const [filterIngredientData, setFilterIngredientData] = useState([]);
  const [menuIngredientDataSet, setMenuIngredientDataSet] = useState([]);
  const [ingredients, setIngredients] = useState([]); // Add this line
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    material: "",
    unit: "",
    quantity: "",
  });

  // List options
  const unitOptions = [
    { value: "กรัม", label: "กรัม (g)" },
    { value: "กิโลกรัม", label: "กิโลกรัม (kg)" },
    { value: "มิลลิลิตร", label: "มิลลิลิตร (ml)" },
    { value: "ลิตร", label: "ลิตร (l)" },
    { value: "ชิ้น", label: "ชิ้น (unit)" },
  ];

  // fetch ingredient
  useEffect(() => {
    fetchApi(`${URL}/owner/ingredient/${menu_id}`, "GET")
      .then((response) => response.json())
      .then((data) => {
        if (
          data.ingredients &&
          Array.isArray(data.ingredients) &&
          data.ingredients.length > 0
        ) {
          setIngredientData(
            data.ingredients.map((item) => ({
              ingredient_id: item.ingredient_id,
              ingredient_name: item.ingredient_name,
              ingredient_unit: item.ingredient_unit || "",
            }))
          );
        } else {
          console.error("Unexpected ingredient data format:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching ingredient data:", error);
      });
  }, []);

  console.log("ingredient data:", ingredientData);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetchApi(`${URL}/owner/ingredient`, "GET");
        const data = await response.json();
        setIngredients(data); // Set the ingredients state
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, [URL]);

  // Update the fetch for size and type data
  useEffect(() => {
    const fetchMenuOptions = async () => {
      try {
        const response = await fetchApi(
          `${URL}/owner/menus/stock/option/${menu_id}`,
          "GET"
        );
        const data = await response.json();
        console.log("Menu options data:", data);

        // Set size items
        if (data.sizes && Array.isArray(data.sizes)) {
          setSizeItems(
            data.sizes.map((size) => ({
              size_id: size.size_id,
              size_name: size.size_name,
            }))
          );
        }

        // Set type items and default selected type
        if (data.menu_types && Array.isArray(data.menu_types)) {
          const formattedTypes = data.menu_types.map((type) => ({
            menu_type_id: type.type_id,
            menu_type_name: type.type_name,
          }));
          setTypeItems(formattedTypes);

          // Set first type as default selected
          if (formattedTypes.length > 0) {
            setSelectedType(formattedTypes[0].menu_type_id);
          }
        }
      } catch (error) {
        console.error("Error fetching menu options:", error);
      }
    };

    if (menu_id) {
      fetchMenuOptions();
    }
  }, [URL, menu_id]);

  //fetch add on
  useEffect(() => {
    fetchApi(`${URL}/owner/menus/options/add-ons/${menu_id}`, "GET")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAddOnItems(
            data.map((item) => ({
              add_on_id: item.add_on_id,
              add_on_name: item.add_on_name,
            }))
          );
        } else {
          console.error("Unexpected size data format:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching size data:", error);
      });
  }, []);

  //fetch menu ingredient
  useEffect(() => {
    fetchApi(`${URL}/owner/menus/options/add-ons/${menu_id}`, "GET")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMenuIngredientData(
            data.map((item) => ({
              add_on_id: item.add_on_id,
              add_on_name: item.add_on_name,
            }))
          );
        } else {
          console.error("Unexpected size data format:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching size data:", error);
      });
  }, []);

  // filter add on out of ingredient
  useEffect(() => {
    const addOnNames = addOnItems.map((item) => item.add_on_name);

    const filteredIngredients = ingredientData.filter(
      (ingredient) => !addOnNames.includes(ingredient.ingredient_name)
    );

    setFilterIngredientData(filteredIngredients);
  }, [addOnItems, ingredientData]);

  console.log("filter ingredientData:", filterIngredientData);

  //store data for each type
  const handleTypeClick = (type) => {
    setSelectedType(
      type.menu_type_id === selectedType ? null : type.menu_type_id
    );
  };

  // const handleInputChange = (index, field, value) => {
  //   setRows((prevRows) =>
  //     prevRows.map((row, idx) =>
  //       idx === index ? { ...row, [field]: value } : row
  //     )
  //   );
  // };

  const handleInputChange = (index, field, value, label = "", unit) => {
    setRows((prevRows) =>
      prevRows.map((row, idx) => {
        if (idx === index) {
          return {
            ...row,
            [field]: value,
            material: field === "ingredientId" ? label || value : row.material,
            unit: field === "ingredientId" ? unit || "" : value, 
          };
        }
        return row;
      })
    );
  };

  const handleInputChangeForFilter = (ingredientId, field, value) => {
    setFilterIngredientData((prevData) =>
      prevData.map((ingredient) =>
        ingredient.ingredient_id === ingredientId
          ? { ...ingredient, [field]: value }
          : ingredient
      )
    );
  };

  // select each typ data ex. ร้อน เย็น ปั่น ให้ข้อมูลมันเป็น set
  const handleSizeDataChange = (rowIndex, sizeId, value) => {
    console.log(
      "Updating typeData for row:",
      rowIndex,
      "size:",
      sizeId,
      "value:",
      value,
      "selectedType:",
      selectedType
    );
    setTypeData((prevData) => {
      const updatedData = {
        ...prevData,
        [selectedType]: {
          ...(prevData[selectedType] || {}),
          [rowIndex]: {
            ...(prevData[selectedType]?.[rowIndex] || {}),
            [sizeId]: value,
          },
        },
      };
      console.log("Updated typeData:", updatedData);
      return updatedData;
    });
  };

  // เพิ่ม useEffect สำหรับดึงข้อมูล stock เดิม (ถ้ามี)
  useEffect(() => {
    const fetchExistingStock = async () => {
      try {
        const response = await fetchApi(
          `${URL}/owner/menus/stock/${menu_id}`,
          "GET"
        );
        const data = await response.json();
        console.log("Existing stock data:", data);

        if (data.menuData && data.menuData.length > 0) {
          // Set rows with existing data
          const existingRows = data.menuData.map((item, index) => ({
            id: index, // หรือใช้ ID อื่นที่เหมาะสม
            material: item.ingredient_name,
            unit: item.unit,
          }));
          setRows(existingRows);

          // Set type data for table
          const newTypeData = {};
          data.menuData.forEach((ingredient, rowIndex) => {
            ingredient.ingredientListForStock.forEach((stock) => {
              if (!newTypeData[stock.menu_type_id]) {
                newTypeData[stock.menu_type_id] = {};
              }
              if (!newTypeData[stock.menu_type_id][rowIndex]) {
                newTypeData[stock.menu_type_id][rowIndex] = {};
              }
              newTypeData[stock.menu_type_id][rowIndex][stock.size_id] =
                stock.quantity_used;
            });
          });
          setTypeData(newTypeData);
        }
      } catch (error) {
        console.error("Error fetching existing stock:", error);
      }
    };

    if (menu_id) {
      fetchExistingStock();
    }
  }, [URL, menu_id]);

  // Validate inputs for Step 1
  const validateStep1 = () => {
    let valid = true;
    const newErrors = { material: "", unit: "", quantity: "" };

    rows.forEach((row, index) => {
      if (!row.material) {
        newErrors.material = "กรุณากรอกข้อมูลวัตถุดิบ";
        valid = false;
      }
      if (!row.unit) {
        newErrors.unit = "กรุณาเลือกหน่วย";
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(step + 1);
      }
    } else if (step === 2) {
      let allQuantitiesValid = true;
      const newErrors = {}; // Initialize the newErrors object

      rows.forEach((row, rowIndex) => {
        sizeItems.forEach((size) => {
          typeItems.forEach((type) => {
            const quantity_used = parseFloat(
              typeData[selectedType]?.[rowIndex]?.[size.size_id] || 0
            );

            // Ensure the structure of newErrors[selectedType][rowIndex]
            if (!newErrors[selectedType]) {
              newErrors[selectedType] = {}; // Initialize selectedType if not exists
            }
            if (!newErrors[selectedType][rowIndex]) {
              newErrors[selectedType][rowIndex] = {}; // Initialize rowIndex if not exists
            }

            // Validate quantity_used
            if (isNaN(quantity_used) || quantity_used < 0) {
              newErrors[selectedType][rowIndex][size.size_id] =
                "กรุณากรอกข้อมูลเป็นตัวเลข";
              allQuantitiesValid = false;
            }
          });
        });
      });

      setErrors(newErrors); // Update errors state with new errors

      if (allQuantitiesValid) {
        setStep(step + 1);
      }
    } else if (step === 3) {
      setLoading(true);
      try {
        const requestData = {
          menuData: rows.map((row, rowIndex) => ({
            ingredient_name: row.material,
            unit: row.unit,
            ingredientListForStock: sizeItems.flatMap((size) =>
              typeItems.map((type) => ({
                size_id: size.size_id,
                menu_type_id: type.menu_type_id,
                quantity_used: parseFloat(
                  typeData[type.menu_type_id]?.[rowIndex]?.[size.size_id] || 0
                ),
              }))
            ),
          })),
        };

        console.log("Sending stock data:", requestData);

        const response = await fetchApi(
          `${URL}/owner/menus/stock/${menu_id}`,
          "POST",
          requestData
        );

        if (response.ok) {
          console.log("Stock data saved successfully!");
          navigate("/stock-list");
        } else {
          console.error("Failed to save stock data");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/stock-list");
    } else {
      setStep(step - 1);
    }
  };

  console.log("Step 3 Data:", rows);

  // push filter ingredient data in to row
  useEffect(() => {
    const newRows = filterIngredientData.map((ingredient, index) => ({
      id: ingredient.ingredient_id,
      material: ingredient.ingredient_name,
      unit: ingredient.ingredient_unit,
    }));

    console.log("Generated Rows:", newRows);

    // Set rows เฉพาะเมื่อยังไม่มีข้อมูลเดิม
    setRows((prevRows) => (prevRows.length === 0 ? newRows : prevRows));
  }, [filterIngredientData]);

  console.log("ROWS:", rows);

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(), // Unique ID
      material: "",
      unit: " ",
    };

    setRows((prevRows) => [...prevRows, newRow]);
  };

  console.log("ROWs:", rows);
  const removeChoice = (id) => {
    console.log("Removing:", { id });
    // Remove from rows (only new rows have id)
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  return (
    <div className="flex flex-col items-center h-screen-navbar bg-[#F5F5F5]">
      <div className="text-center mb-8 mt-[40px]">
        <h1 className="text-3xl font-bold mb-2">ระบบตัดคลังสินค้า</h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      <div className="flex items-start w-full font-bold text-2xl">
        วัตถุดิบ และปริมาณที่ใช้: {menu}
      </div>

      {step === 1 && (
        <div className="space-y-4 w-full">
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="mb-2">รายการวัตถุดิบ</div>
            <div className="mb-2">หน่วย</div>
          </div>

          {/* Conditional Rendering */}
          {rows.map(
            (ingredient, index) => (
              console.log("ingredient JA:", ingredient),
              (
                <div
                  key={ingredient.id}
                  className="grid grid-cols-[1fr_1fr_auto] gap-4 mb-4 w-full items-center"
                >
                  <div>
                    <IngredientDropdown
                      value={ingredient.material}
                      onChange={(
                        value,
                        label,
                        unit // Accept the unit
                      ) =>
                        handleInputChange(
                          index,
                          "ingredientId",
                          value,
                          label,
                          unit // Pass the unit
                        )
                      }
                    />
                    {errors.material && (
                      <p className="text-red-500">{errors.material}</p>
                    )}
                  </div>

                  <div>
                    <select
                      value={ingredient.unit} // This reflects the current unit
                      onChange={(e) => {
                        handleInputChange(index, "unit", e.target.value); // Allow changing the unit
                      }}
                      className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
                    >
                      <option value="">เลือกหน่วย</option>
                      {unitOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.unit && (
                      <p className="text-red-500">{errors.unit}</p>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => removeChoice(ingredient.id)}
                      className="flex items-center justify-center rounded-full p-2 transition duration-200 text-[#C94C4C] hover:text-[#B03E3E] hover:opacity-100"
                    >
                      <AiOutlineDelete size={36} />
                    </button>
                  </div>
                </div>
              )
            )
          )}

          {/* Button to add new row */}
          <button
            onClick={handleAddRow}
            className="w-full py-2 bg-[#F0ECE3] text-[#DD9F52] rounded-full font-semibold transition mt-8"
          >
            + เพิ่มวัตถุดิบ
          </button>
        </div>
      )}
      {step === 2 && (
        <>
          <div className="mb-4 items-start w-full flex">
            <div className="w-[300px] font-bold text-2xl mt-4">
              ตัวเลือก:
              <span className="text-[#DD9F52]">ชนิดเครื่องดื่ม</span>
            </div>
            <div className="w-full flex items-start overflow-x-auto whitespace-nowrap pb-2 ml-2">
              {typeItems.map((type) => (
                <button
                  key={type.menu_type_id}
                  onClick={() => handleTypeClick(type)}
                  className={`px-6 py-3 rounded-full border border-[#DD9F52] font-bold ml-2 ${
                    selectedType === type.menu_type_id
                      ? "bg-[#DD9F52] text-white"
                      : "bg-[#F5F5F5] text-[#DD9F52]"
                  }`}
                >
                  {type.menu_type_name}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="border border-gray-300 px-4 py-2 text-center"
                  rowSpan={2}
                >
                  รายการวัตถุดิบ
                </th>
                <th
                  className="border border-gray-300 px-4 py-2 text-center"
                  colSpan={sizeItems.length}
                >
                  ขนาด
                </th>
              </tr>
              <tr className="bg-gray-100">
                {sizeItems.map((size) => (
                  <th
                    key={size.size_id}
                    className="border border-gray-300 px-4 py-2 text-center"
                  >
                    {size.size_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id || row.ingredient_id || index}
                  className="bg-[#F5F5F5] text-start"
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {index + 1}. {row.material} ({row.unit})
                  </td>

                  {sizeItems.map((size) => {
                    // Get the quantityUsed value from menuIngredientDataSet or allow user to input manually
                    const ingredientData =
                      menuIngredientDataSet[selectedType]?.[row.id];
                    const quantityUsed = ingredientData
                      ? ingredientData[size.size_id]
                      : "";

                    return (
                      <td
                        key={size.size_id}
                        className="border border-gray-300 px-4 py-2 text-center"
                      >
                        <ThaiVirtualKeyboardInput
                          value={
                            typeData[selectedType]?.[index]?.[size.size_id] ||
                            ""
                          }
                          onChange={(value) =>
                            handleSizeDataChange(index, size.size_id, value)
                          }
                          className="w-full border rounded p-2"
                          placeholder="กรอกข้อมูล"
                        />
                        {errors[selectedType]?.[index]?.[size.size_id] && (
                          <p className="text-red-500">
                            {errors[selectedType][index][size.size_id]}
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {step === 3 && (
        <div className="w-full">
          <table className="w-full border-collapse border border-gray-200 mt-4">
            {/* Table Header */}
            <thead>
              {/* First Header Row: Group Types */}
              <tr className="bg-gray-100">
                <th
                  className="border border-gray-300 px-4 py-2 text-center"
                  rowSpan={2}
                >
                  รายการวัตถุดิบ
                </th>
                {typeItems.map((type) => (
                  <th
                    key={type.menu_type_id}
                    className="border border-gray-300 px-4 py-2 text-center"
                    colSpan={sizeItems.length}
                  >
                    {type.menu_type_name}
                  </th>
                ))}
              </tr>

              {/* Second Header Row: Sizes under each Type */}
              <tr className="bg-gray-100">
                {typeItems.map(() =>
                  sizeItems.map((size) => (
                    <th
                      key={size.size_id}
                      className="border border-gray-300 px-4 py-2 text-center"
                    >
                      {size.size_name}
                    </th>
                  ))
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="bg-[#F5F5F5] text-start"
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {rowIndex + 1}. {row.material} ({row.unit})
                  </td>

                  {/* Iterate over each type and size */}
                  {typeItems.map((type) =>
                    sizeItems.map((size) => {
                      const value =
                        typeData[type.menu_type_id]?.[row.id]?.[size.size_id] ||
                        typeData[type.menu_type_id]?.[rowIndex]?.[
                          size.size_id
                        ] ||
                        "-";
                      return (
                        <td
                          key={`${type.menu_type_id}-${size.size_id}`}
                          className="border border-gray-300 px-4 py-2 text-center"
                        >
                          {value}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          {step < 3 ? "ถัดไป" : "บันทึก"}
        </button>
      </div>
      <LoadingPopup loading={loading} />
    </div>
  );
};

export default AddStockForm;
