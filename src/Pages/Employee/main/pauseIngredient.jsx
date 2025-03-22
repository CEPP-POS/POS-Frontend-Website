import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";
import ThaiVirtualKeyboardInput from "../../../Components/Common/ThaiVirtualKeyboardInput";
import {
  SuccessPopup,
  FailPopup,
} from "../../../Components/General/statusPopup";
import LoadingPopup from "../../../Components/General/loadingPopup";
import { useWebSocket } from "../../../webSocketContext";

const PauseIngredient = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const navigate = useNavigate();
  const socket = useWebSocket();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredientItems, setSelectedIngredientItems] = useState([]);
  const [filter, setFilter] = useState("ทั้งหมด");
  const [ingredientItems, setIngredientItems] = useState([]);

  const [showLoading, setShowLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failMessage, setFailMessage] = useState("");

  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        const response = await fetchApi(
          `${URL}/employee/pause/ingredients`,
          "GET"
        );
        const data = await response.json();
        setIngredientItems(data);
        setSelectedIngredientItems(data.filter((item) => item.paused));
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredient();
  }, []);

  console.log("ingredientItems", ingredientItems);

  const getFilteredIngredientItems = () => {
    if (filter === "ทั้งหมด") return ingredientItems;

    if (filter === "วัตถุดิบที่พัก") {
      return ingredientItems.filter(
        (ingredient) =>
          ingredient.paused || selectedIngredientItems.includes(ingredient)
      );
    }

    if (filter === "วัตถุดิบที่ไม่พัก") {
      return ingredientItems.filter(
        (ingredient) =>
          !ingredient.paused && !selectedIngredientItems.includes(ingredient)
      );
    }

    return ingredientItems;
  };

  const filteredIngredientItems = getFilteredIngredientItems().filter(
    (ingredient) =>
      ingredient.ingredient_name
        .normalize("NFD")
        .includes(searchTerm.normalize("NFD"))
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleBackButton = () => navigate("/pause-section");

  const handleSaveButton = async () => {
    if (ingredientItems.length === 0) {
      console.warn("No ingredients available.");
      return;
    }

    const payload = ingredientItems.map((ingredient) => ({
      ingredient_id: ingredient.ingredient_id,
      paused: selectedIngredientItems.some(
        (selected) => selected.ingredient_id === ingredient.ingredient_id
      ),
    }));

    console.log("selectedIngredientItems", selectedIngredientItems);
    console.log("payload", payload);

    try {
      setShowLoading(true);
      const response = await fetchApi(
        `${URL}/employee/pause/ingredients`,
        "PATCH",
        payload
      );

      if (!response.ok) {
        throw new Error(`Failed to update ingredients: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Ingredients updated successfully:", data);
      setShowLoading(true);
      setSelectedIngredientItems([]);
      setSuccessMessage("บันทึกข้อมูลเสร็จสิ้น");
      setFailMessage("");
      setShowLoading(false);
      navigate("/pause-section");
      if (socket) {
        socket.send(JSON.stringify({ type: "PAUSE_MENU" }));
      }
    } catch (error) {
      console.error("Error updating ingredients:", error);
      setShowLoading(true);
      setFailMessage("ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง");
      setSuccessMessage("");
      setShowLoading(false);
    }
  };

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredientItems((prev) => {
      const isSelected = prev.find(
        (item) => item.ingredient_id === ingredient.ingredient_id
      );
      if (isSelected) {
        return prev.filter(
          (item) => item.ingredient_id !== ingredient.ingredient_id
        );
      } else {
        return [...prev, { ...ingredient, paused: !ingredient.paused }];
      }
    });

    setIngredientItems((prevItems) =>
      prevItems.map((item) =>
        item.ingredient_id === ingredient.ingredient_id
          ? { ...item, paused: !item.paused }
          : item
      )
    );
  };

  const handleFilterChange = (filterName) => {
    setFilter(filterName);
  };

  return (
    <div className="w-full h-screen-navbar">
      <div className="flex justify-center text-xl font-bold">
        <div className="text-center mb-10 mt-[40px]">
          <h1 className="text-3xl font-bold mb-2">วัตถุดิบที่ต้องการพัก</h1>
          <div className="w-20 h-1 bg-[#DD9F52]"></div>
        </div>
      </div>

      <div className="w-full flex justify-between items-center mb-8">
        <div className="relative flex items-center w-full">
          <FaSearch
            style={{ color: "#DD9F52" }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
          <ThaiVirtualKeyboardInput
            placeholder="ค้นหาด้วยชื่อวัตถุดิบ..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border border-[#DDw-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
          />
        </div>
      </div>

      <div className="w-full flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <label
            htmlFor="productDetails"
            className="text-2xl font-bold text-start"
          >
            วัตถุดิบทั้งหมด
          </label>
          <button
            className={`px-4 py-2 rounded-full ${
              filter === "ทั้งหมด"
                ? "bg-[#DD9F52] text-white"
                : "border border-[#DD9F52] text-[#DD9F52]"
            }`}
            onClick={() => handleFilterChange("ทั้งหมด")}
          >
            ทั้งหมด
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              filter === "วัตถุดิบที่ไม่พัก"
                ? "bg-[#DD9F52] text-white"
                : "border border-[#DD9F52] text-[#DD9F52]"
            }`}
            onClick={() => handleFilterChange("วัตถุดิบที่ไม่พัก")}
          >
            วัตถุดิบที่ไม่พัก
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              filter === "วัตถุดิบที่พัก"
                ? "bg-[#DD9F52] text-white"
                : "border border-[#DD9F52] text-[#DD9F52]"
            }`}
            onClick={() => handleFilterChange("วัตถุดิบที่พัก")}
          >
            วัตถุดิบที่พัก
          </button>
        </div>
      </div>

      <div className="w-full ml-2">
        <div className="grid grid-cols-3 gap-4 mt-4">
          {filteredIngredientItems.map((ingredient, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={
                  selectedIngredientItems.includes(ingredient) ||
                  ingredient.paused
                }
                onChange={() => handleSelectIngredient(ingredient)}
                className="form-checkbox h-5 w-5 accent-[#DD9F52]"
              />
              <span>{ingredient.ingredient_name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="p-4 flex justify-center">
        {selectedIngredientItems.length === 0 &&
        ingredientItems.filter((item) => item.paused).length === 0 &&
        filter === "วัตถุดิบที่พัก"
          ? "ไม่มีวัตถุดิบที่พักในขณะนี้"
          : null}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#F5F5F5] px-4 py-4 shadow-md flex justify-between">
        <button
          onClick={handleBackButton}
          className="px-14 py-4 w-[300px] rounded-full border text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
        >
          ย้อนกลับ
        </button>

        <button
          onClick={handleSaveButton}
          className="px-14 py-4 w-[300px] rounded-full bg-[#DD9F52] text-white hover:bg-[#C68A47] transition-colors font-bold"
        >
          บันทึก
        </button>
      </div>

      {showLoading && <LoadingPopup loading={showLoading} />}
      {successMessage && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
      {failMessage && (
        <FailPopup message={failMessage} onClose={() => setFailMessage("")} />
      )}
    </div>
  );
};

export default PauseIngredient;
