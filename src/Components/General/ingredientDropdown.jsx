import React, { useState, useEffect, useCallback, useRef } from "react";
import fetchApi from "../../Config/fetchApi";
import configureAPI from "../../Config/configureAPI";
import ThaiVirtualKeyboardInput from "../Common/ThaiVirtualKeyboardInput";
import { MdOutlineExpandLess } from "react-icons/md";
import { MdOutlineExpandMore } from "react-icons/md";

const IngredientDropdown = ({ value, onChange }) => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // สร้าง ref สำหรับ dropdown เพื่อตรวจจับคลิกภายนอก
  const dropdownRef = useRef(null);

  // Fetch ingredients once
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetchApi(`${URL}/owner/ingredient`, "GET");
        const data = await response.json();
        const mappedIngredients = data.map((ingredient) => ({
          value: ingredient.ingredient_id,
          label: ingredient.ingredient_name,
          unit: ingredient.unit,
        }));
        setIngredients(mappedIngredients);
        setFilteredIngredients(mappedIngredients);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, [URL]);

  // ปิด dropdown เมื่อคลิกที่อื่น
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync with external value
  useEffect(() => {
    if (value) {
      const foundIngredient = ingredients.find((ing) => ing.label === value);
      if (foundIngredient) {
        setSelectedIngredient(foundIngredient);
      } else {
        setSelectedIngredient({ value: value, label: value, unit: "" });
      }
      setInputValue(value);
    } else {
      setSelectedIngredient(null);
      setInputValue("");
    }
  }, [value, ingredients]);

  // Filter ingredients based on input
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredIngredients(ingredients);
    } else {
      const filtered = ingredients.filter((ing) =>
        ing.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredIngredients(filtered);
    }
  }, [inputValue, ingredients]);

  // Handle input change from ThaiVirtualKeyboardInput
  const handleInputChange = useCallback(
    (newValue) => {
      setInputValue(newValue);

      // Show dropdown when typing
      if (newValue.trim() !== "") {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }

      // Check if the input matches any existing ingredient
      const matchingIngredient = ingredients.find(
        (ing) => ing.label.toLowerCase() === newValue.toLowerCase()
      );

      if (matchingIngredient) {
        setSelectedIngredient(matchingIngredient);
        onChange(
          matchingIngredient.value,
          matchingIngredient.label,
          matchingIngredient.unit
        );
      } else {
        // Custom ingredient
        setSelectedIngredient({ value: newValue, label: newValue, unit: "" });
        onChange(newValue, newValue, "");
      }
    },
    [ingredients, onChange]
  );

  // Handle selection from dropdown
  const handleSelectIngredient = useCallback(
    (ingredient) => {
      setSelectedIngredient(ingredient);
      setInputValue(ingredient.label);
      setShowDropdown(false);
      onChange(ingredient.value, ingredient.label, ingredient.unit);
    },
    [onChange]
  );

  // Toggle dropdown visibility
  const toggleDropdown = useCallback(() => {
    setShowDropdown((prev) => !prev);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Main input with Thai Virtual Keyboard */}
      <div className="flex items-center">
        <div className="flex-grow">
          <ThaiVirtualKeyboardInput
            value={inputValue}
            onChange={handleInputChange}
            placeholder="เลือกหรือพิมพ์ชื่อวัตถุดิบ..."
            className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
          />
        </div>
        <button
          type="button"
          onClick={toggleDropdown}
          className="ml-2 p-2 bg-[#DD9F52] text-white rounded-full w-10 h-10 flex items-center justify-center"
          title="แสดง/ซ่อนรายการวัตถุดิบ"
        >
          {showDropdown ? (
            <MdOutlineExpandLess size={36} />
          ) : (
            <MdOutlineExpandMore size={36} />
          )}
        </button>
      </div>

      {/* Dropdown list */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-[#D4B28C] rounded-lg shadow-lg">
          {filteredIngredients.length > 0 ? (
            filteredIngredients.map((ingredient) => (
              <div
                key={ingredient.value}
                className={`p-2 cursor-pointer transition-colors duration-150 hover:bg-[#F5F5F5] ${
                  selectedIngredient?.value === ingredient.value
                    ? "bg-[#F5F5F5] font-medium"
                    : ""
                }`}
                onClick={() => handleSelectIngredient(ingredient)}
              >
                {ingredient.label}
                {ingredient.unit && (
                  <span className="text-gray-500 text-sm ml-2">
                    ({ingredient.unit})
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-gray-500">
              ไม่พบวัตถุดิบ "{inputValue}" ในระบบ
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IngredientDropdown;
