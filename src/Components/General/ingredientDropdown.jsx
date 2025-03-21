import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import fetchApi from "../../Config/fetchApi";
import configureAPI from "../../Config/configureAPI";

const IngredientDropdown = ({ value, onChange }) => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const [ingredients, setIngredients] = useState([]);
  const [currentValue, setCurrentValue] = useState(null);
  const [isCustomInput, setIsCustomInput] = useState(false);

  // Fetch ingredients once
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetchApi(`${URL}/owner/ingredient`, "GET");
        const data = await response.json();
        setIngredients(
          data.map((ingredient) => ({
            value: ingredient.ingredient_id,
            label: ingredient.ingredient_name,
            unit: ingredient.unit,
            isFixed: true,
          }))
        );
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, [URL]);

  console.log("ingredients in dropdown:", ingredients);

  // Sync with external value
  useEffect(() => {
    if (value) {
      const existingOption = ingredients.find((ing) => ing.label === value);
      if (existingOption) {
        setCurrentValue(existingOption);
        setIsCustomInput(false);
      } else {
        setCurrentValue({
          value: value,
          label: value,
          isFixed: false,
        });
        setIsCustomInput(true);
      }
    } else {
      setCurrentValue(null);
      setIsCustomInput(false);
    }
  }, [value, ingredients]);

  const handleChange = useCallback(
    (selected) => {
      if (selected) {
        const newValue = {
          value: selected.isFixed ? selected.value : selected.label,
          label: selected.label,
          unit: selected.unit,
          isFixed: selected.isFixed,
        };
        setCurrentValue(newValue);
        setIsCustomInput(!selected.isFixed);
        onChange(newValue.value, newValue.label, newValue.unit);
      } else {
        setCurrentValue(null);
        setIsCustomInput(false);
        onChange("", "", "");
      }
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (newValue, { action }) => {
      if (action === "input-change") {
        // Check if the current value is from the dropdown
        const isFromDropdown = ingredients.some(
          (ing) => ing.value === currentValue?.value && currentValue?.isFixed
        );

        // If it's not from the dropdown, allow editing
        if (!isFromDropdown) {
          const customValue = {
            value: newValue,
            label: newValue,
            isFixed: false,
          };
          setCurrentValue(customValue);
          setIsCustomInput(true);
          onChange(newValue, newValue, ""); // Pass empty unit for custom input
        }
      }
    },
    [onChange, ingredients, currentValue]
  );

  const options = React.useMemo(
    () => [
      ...ingredients,
      // เพิ่มตัวเลือกใหม่ถ้าเป็นการพิมพ์และไม่มีในรายการ
      ...(currentValue?.label &&
      !ingredients.some((ing) => ing.label === currentValue.label)
        ? [
            {
              value: currentValue.label,
              label: currentValue.label,
              isFixed: false,
            },
          ]
        : []),
    ],
    [ingredients, currentValue]
  );

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #D4B28C",
      borderRadius: "30px",
      padding: "6px",
      color: "#4B5563",
      fontSize: "16px",
    }),
  };

  return (
    <Select
      options={options}
      onChange={handleChange}
      value={currentValue}
      onInputChange={handleInputChange}
      isSearchable={true}
      isClearable
      placeholder="เลือกหรือพิมพ์ชื่อวัตถุดิบ..."
      styles={customStyles}
      noOptionsMessage={() => "พิมพ์เพื่อเพิ่มวัตถุดิบใหม่"}
      menuPortalTarget={document.body}
      menuPosition="fixed"
    />
  );
};

export default IngredientDropdown;
