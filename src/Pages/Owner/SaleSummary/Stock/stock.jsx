import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS
import { registerLocale, setLocale } from "react-datepicker";
import th from "date-fns/locale/th"; // Import Thai locale from date-fns
import AddCategoryButton from "../../../../Components/Owner/addCategoryButton";
import { LuInfo } from "react-icons/lu";
import { IoMdTime } from "react-icons/io";
import { IoWarningOutline } from "react-icons/io5";
import { FiSearch } from "react-icons/fi"; // Import magnifier icon
import { FaPlus, FaRegCalendar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaMinus } from "react-icons/fa";
import SideBar from "../../../../Components/Owner/sideBar";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";
import { AiOutlineDelete } from "react-icons/ai";
import LoadingPopup from "../../../../Components/General/loadingPopup";
import DeleteIngredientModal from "../../../../Components/Owner/deleteIngredient";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const thLocaleWithMondayStart = {
  ...th,
  options: {
    ...th.options,
    weekStartsOn: 1, // Start the week on Monday (0 = Sunday, 1 = Monday)
  },
};

const Stock = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const MySwal = withReactContent(Swal);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [ingredientHistory, setIngredientHistory] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    quantity_in_stock: "",
    total_volume: "",
    net_volume: "",
    expiration_date: "",
  });
  const [isEditingNetVolume, setIsEditingNetVolume] = useState(false);
  const [isEditingTotalVolume, setIsEditingTotalVolume] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStockQuantity, setCurrentStockQuantity] = useState();
  const [currentTotalVolume, setCurrentTotalVolume] = useState();
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [data, setData] = useState({
    nearly_out_of_stock: [],
    nearly_expired: [],
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetchApi(`${URL}/owner/stock-ingredients`, "GET");
      const data = await response.json();

      const processedData = data.map((category) => {
        if (category.category_id === null) {
          return {
            ...category,
            ingredients: category.ingredients.filter(
              (ingredient, index, self) =>
                index ===
                self.findIndex(
                  (i) => i.ingredient_id === ingredient.ingredient_id
                )
            ),
          };
        }
        return category;
      });

      setIngredients(processedData);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchApi(`${URL}/owner/nearly-expired-out`, "GET")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Bangkok", // Ensure Thailand timezone
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchApi(
          `${URL}/owner/stock-ingredients/categories`,
          "GET"
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [handleCategoryChange]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleAddOwnerProduct = () => {
    navigate("/add-owner-product");
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
    setCurrentStockQuantity(0);
    setCurrentTotalVolume(0);
  };

  const filteredIngredients = ingredients.flatMap((category) => {
    if (
      selectedCategory === null ||
      category.category_id === selectedCategory
    ) {
      return category.ingredients.map((ingredient) => ({
        ...ingredient,
        category_name: category.category_name || "-",
      }));
    }
    return [];
  });

  // Fetch ingredient history
  const handleShowHistory = async (ingredientId) => {
    try {
      const response = await fetchApi(
        `${URL}/owner/stock-ingredients/sub-ingredient/${ingredientId}`,
        "GET"
      );
      const data = await response.json();
      setIngredientHistory(data);
      setHistoryModalVisible(true);
    } catch (error) {
      console.error("Error fetching ingredient history:", error);
    }
  };

  const handleEditIngredient = (ingredientId) => {
    navigate(`/edit-owner-product?id=${ingredientId}`);
  };

  // Fetch product details when clicking อัปเดต button
  const handleUpdate = async (updateId) => {
    console.log("Update ID", updateId);
    try {
      const response = await fetchApi(
        `${URL}/owner/update-stock-ingredients/${updateId}`,
        "GET"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }

      const data = await response.json();

      // แปลงวันที่จาก string เป็น Date object
      const expDate = data.expiration_date
        ? new Date(data.expiration_date + "T00:00:00") // เพิ่มเวลาเพื่อให้ parse ถูกต้อง
        : new Date();

      setSelectedDate(expDate);
      setSelectedProduct(data);
      setUpdateFormData({
        quantity_in_stock: data.quantity || "",
        total_volume: data.total_volume || "",
        net_volume: data.net_volume || "",
        expiration_date: data.expiration_date || "", // เก็บวันที่ในรูปแบบ YYYY-MM-DD
      });
      setIsUpdateMode(true);
      setModalVisible(true);
      setCurrentStockQuantity(updateFormData.quantity_in_stock || 0);
      setCurrentTotalVolume(updateFormData.total_volume || 0);

      console.log("Update Form Data", updateFormData);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  useEffect(() => {
    setCurrentStockQuantity(updateFormData.quantity_in_stock || 0);
    setCurrentTotalVolume(updateFormData.total_volume || 0);
  }, [updateFormData]);

  // Handle form submission for update
  const handleUpdateSubmit = async () => {
    setLoading(true);
    try {
      // กรณีเพิ่มใหม่
      if (!selectedProduct.update_id) {
        const payload = {
          image_url: selectedProduct.image_url,
          ingredient_name: selectedProduct.ingredient_name,
          net_volume: parseInt(updateFormData.net_volume),
          unit: selectedProduct.unit,
          quantity_in_stock: parseInt(currentStockQuantity),
          category_name: selectedProduct.category_name || "",
          expiration_date:
            updateFormData.expiration_date ||
            new Date().toISOString().split("T")[0],
        };

        console.log("Sending POST payload:", payload);

        const response = await fetchApi(
          `${URL}/owner/create-stock-ingredients`,
          "POST",
          payload
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to create product: ${errorData.message || "Unknown error"}`
          );
        }

        const responseData = await response.json();
        console.log("POST Response:", responseData);
      } else {
        // กรณีอัพเดต
        const payload = {
          quantity_in_stock: parseInt(updateFormData.quantity_in_stock),
          total_volume: parseInt(updateFormData.total_volume),
          net_volume: parseInt(updateFormData.net_volume),
          expiration_date: updateFormData.expiration_date,
        };

        console.log("UPDATE STOCK INGREDIENT:", payload);

        const response = await fetchApi(
          `${URL}/owner/update-stock-ingredients/${selectedProduct.update_id}`,
          "PATCH",
          payload
        );

        if (!response.ok) {
          throw new Error("Failed to update product");
        }
      }

      await fetchProducts();
      setModalVisible(false);
      MySwal.fire({
        icon: "success",
        title: "แก้ไขข้อมูลคลังสินค้าสำเร็จ",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      await fetchProducts();
      console.error("Error updating/creating product:", error);
      // alert(`เกิดข้อผิดพลาด: ${error.message}`);
      setModalVisible(false);
      MySwal.fire({
        icon: "success",
        title: "แก้ไขข้อมูลคลังสินค้าสำเร็จ",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const removeIngredient = async (ingredientId) => {
    try {
      const response = await fetchApi(
        `${URL}/owner/stock-ingredients/${ingredientId}`,
        "PATCH"
      );

      if (response.ok) {
        console.log("Ingredient removed successfully!");
        await fetchProducts(); // Refresh the ingredient list
        MySwal.fire({
          icon: "success",
          title: "ลบวัตถุดิบสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to remove ingredient");
      }
    } catch (error) {
      console.error("Error removing ingredient:", error);
      alert("เกิดข้อผิดพลาดในการลบส่วนผสม");
    } finally {
      setDeleteModalOpen(false); // Close the modal
      setIngredientToDelete(null); // Reset the selected ingredient
    }
  };

  const handleIncrease = () => {
    if (selectedProduct?.update_id === null) {
      setCurrentStockQuantity((prev) => prev + 1);
    } else {
      const newQuantity = currentStockQuantity + 1;
      setCurrentStockQuantity(newQuantity);
      const volumeChange = 1 * selectedProduct.net_volume;
      setCurrentTotalVolume((prev) => prev + volumeChange);

      setUpdateFormData((prev) => ({
        ...prev,
        quantity_in_stock: prev.quantity_in_stock + 1,
        total_volume: prev.total_volume + selectedProduct.net_volume,
      }));
    }
  };

  const handleDecrease = () => {
    if (selectedProduct?.update_id === null) {
      if (currentStockQuantity > 0) {
        setCurrentStockQuantity((prev) => prev - 1);
      }
    } else {
      if (currentStockQuantity > 0) {
        const newQuantity = currentStockQuantity - 1;
        setCurrentStockQuantity(newQuantity);
        const volumeChange = 1 * selectedProduct.net_volume;
        setCurrentTotalVolume((prev) => prev - volumeChange);

        if (currentStockQuantity > 0) {
          setUpdateFormData((prev) => ({
            ...prev,
            quantity_in_stock: prev.quantity_in_stock - 1,
            total_volume: prev.total_volume - selectedProduct.net_volume,
          }));
        }
      }
    }
  };

  return (
    <div className="bg-[#F5F5F5] h-screen-website">
      <SideBar menuTab={"stock"} />
      <div className="px-10 mt-[40px] bg-[#F5F5F5]">
        <h1 className="font-bold text-3xl">คลังสินค้า</h1>
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <span className="font-bold mt-2">หมวดหมู่</span>
            {/* <span className="pl-2 text-[#DD9F52]">
              <LuInfo size={24} />
            </span> */}
          </span>
          <AddCategoryButton />
        </div>
        {/* category Section */}
        <div className="my-3">
          <div className="flex overflow-x-auto space-x-4 scrollbar-hide whitespace-nowrap">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-1 ${
                selectedCategory === null
                  ? "bg-[#DD9F52] text-white rounded-full border"
                  : "bg-[#F5F5F5] border-[#DD9F52]"
              }`}
            >
              ทั้งหมด
            </button>

            {/* Category buttons */}
            {categories.map((category) => (
              <button
                key={category.category_id}
                onClick={() => handleCategoryChange(category.category_id)}
                className={`px-4 py-1 ${
                  selectedCategory === category.category_id
                    ? "bg-[#DD9F52] text-white rounded-full border"
                    : "bg-[#F5F5F5] border-[#DD9F52]"
                }`}
              >
                {category.category_name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex">
            {/* รายรับทั้งหมด */}
            {data.nearly_out_of_stock.map((item, index) => (
              <div className="flex py-2 px-4 w-3/4 mr-2 bg-[#F5F5F5] border rounded-lg ">
                <div
                  key={index}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-[#C94C4C]"
                >
                  <div className="pb-1">
                    <IoWarningOutline color="white" size={32} />
                  </div>
                </div>
                <div className="ml-3">
                  <p>สินค้าที่ใกล้จะหมด</p>
                  <div className="flex">
                    <p className="font-bold">{item.ingredient_name}</p>
                    <p className="pl-1">
                      ปริมาณคงเหลือ {item.total_volume} {item.ingredient_unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* สินค้าที่ใกล้จะหมดอายุ */}
            {data.nearly_expired.map((item, index) => (
              <div
                key={index}
                className="flex py-2 px-4 w-full bg-[#F5F5F5] border rounded-lg "
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#DD9F52]">
                  <IoMdTime color="white" size={32} />
                </div>
                <div className="ml-3">
                  <p>
                    สินค้าที่ใกล้จะหมดอายุ วันที่{" "}
                    {formatDateForDisplay(item.expire_date)}
                  </p>
                  <p className="font-bold">{item.ingredient_name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="my-4 relative flex bg-[#F5F5F5]">
            <div className="mr-5 flex items-center bg-[#F5F5F5] border-[#DD9F52] border rounded-full px-4 py-1 w-full">
              <FiSearch className="text-[#DD9F52] mr-2" size={36} />
              <ThaiVirtualKeyboardInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ค้นหาสินค้า..."
                className="w-full focus:outline-none bg-[#F5F5F5]"
              />
            </div>
            {/* เพิมรายการสินค้า */}
            <button
              type="button"
              className="flex justify-center items-center w-1/4 text-white border border-[#DD9F52] bg-[#DD9F52] hover:bg-[#C68A47] focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-2xl px-3 py-1"
              onClick={handleAddOwnerProduct}
            >
              <div className="flex items-center whitespace-nowrap">
                <span className="pl-1">
                  <FaPlus size={12} />
                </span>
                <span className="pl-2">เพิ่มรายการสินค้า</span>
              </div>
            </button>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto border rounded-lg p-5">
            <table className="border-collapse table-auto w-full">
              <thead>
                <tr>
                  <th className="py-2 pr-5 text-center border-b border-[#000000]">
                    ลำดับที่
                  </th>
                  <th className="py-2 text-left border-b border-[#000000]">
                    รายการสินค้า
                  </th>
                  <th className="py-2 text-center border-b border-[#000000]">
                    ปริมาณคงเหลือ
                  </th>
                  <th className="pl-10 py-2 border-b border-[#000000]">
                    หมวดหมู่
                  </th>
                  <th className="pl-16 pr-5 py-2 border-b border-[#000000]">
                    อัปเดต
                  </th>
                  <th className="pl-16 pr-5 py-2 border-b border-[#000000]">
                    แก้ไข
                  </th>
                  <th className="pl-16 pr-5 py-2 border-b border-[#000000]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((item, index) => (
                  <tr
                    key={item.ingredient_id}
                    onClick={() =>
                      navigate(`/product-detail?id=${item.ingredient_id}`)
                    }
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <td className="pr-5 text-center border-b border-[#F1F4F7]">
                      {index + 1}
                    </td>
                    <td className="py-2 break-words border-b border-[#F1F4F7]">
                      {item.ingredient_name}
                    </td>
                    <td className="py-2 border-b border-[#F1F4F7] text-center">
                      {item.total_volume} {item.unit}
                    </td>
                    <td className="py-2 pl-10 text-center border-b border-[#F1F4F7]">
                      {item.category_name}
                    </td>
                    <td className="py-2 pl-16 pr-5 text-center border-b border-[#F1F4F7]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the row click handler from firing
                          handleShowHistory(item.ingredient_id);
                        }}
                        className="text-[#DD9F52] bg-[#F5F5F5] border border-[#DD9F52] focus:outline-none hover:bg-[#DD9F52] hover:text-white focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-xl px-2 py-0"
                      >
                        อัปเดต
                      </button>
                    </td>
                    <td className="py-2 pl-16 pr-5 text-center border-b border-[#F1F4F7]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditIngredient(item.ingredient_id);
                        }}
                        className="text-[#DD9F52] bg-[#F5F5F5] border border-[#DD9F52] focus:outline-none hover:bg-[#DD9F52] hover:text-white focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-xl px-2 py-0"
                      >
                        แก้ไข
                      </button>
                    </td>
                    <td className="py-2 pl-16 pr-5 text-center border-b border-[#F1F4F7] flex justify-center">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setIngredientToDelete(item);
                          setDeleteModalOpen(true);
                        }}
                        className="flex items-center justify-center rounded-full p-2 transition duration-200 text-[#C94C4C] hover:text-[#B03E3E] hover:opacity-100"
                      >
                        <AiOutlineDelete size={24} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Update / Create new update stock Modal */}
        {modalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#F5F5F5] rounded-lg p-8 flex flex-col h-auto w-auto relative">
              {/* Product Name */}
              <h2 className="text-xl font-bold text-center top-4 w-full">
                {selectedProduct?.ingredient_name}
              </h2>

              {/* Modal Content */}
              <div className="flex mt-4">
                <div className="flex-shrink-0 mr-8">
                  {selectedProduct?.update_id === null ? (
                    ingredientHistory?.ingredient_img ? ( // Check if ingredient_img exists
                      <img
                        src={`${URL}/${ingredientHistory?.ingredient_img.replace(
                          /\\/g,
                          "/"
                        )}`}
                        alt={ingredientHistory?.ingredient_img}
                        className="w-[240px] h-[360px] object-cover rounded-lg border border-gray-300"
                      />
                    ) : null // Don't render anything if ingredient_img is not available
                  ) : (
                    <div>
                      {
                        selectedProduct?.image_url ? ( // Check if image_url exists
                          <img
                            src={`${URL}/${selectedProduct?.image_url.replace(
                              /\\/g,
                              "/"
                            )}`}
                            alt={selectedProduct?.image_url}
                            className="w-[240px] h-[360px] object-cover rounded-lg border border-gray-300"
                          />
                        ) : null // Don't render anything if image_url is not available
                      }
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-4 text-gray-700">
                  {/* Category */}
                  {selectedProduct?.update_id !== null && (
                    <p className="flex items-center">
                      <span className="font-bold text-gray-800">หมวดหมู่</span>
                      <span className="ml-2 px-3 py-1 border border-purple-600 rounded-full text-purple-600">
                        {selectedProduct?.category_name}
                      </span>
                    </p>
                  )}

                  {/* Expiry Date */}
                  <div>
                    <div className="font-bold text-gray-800 mb-1">
                      วันหมดอายุของสินค้า
                    </div>
                    <div className="relative">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {
                          setSelectedDate(date);
                          const formattedDate = date
                            .toISOString()
                            .split("T")[0];
                          setUpdateFormData((prev) => ({
                            ...prev,
                            expiration_date: formattedDate,
                          }));
                        }}
                        dateFormat="dd / MM / yyyy"
                        placeholderText="DD / MM / YYYY"
                        locale={thLocaleWithMondayStart}
                        className="pl-10 py-2 border border-gray-300 rounded-full w-full"
                      />
                      <FaRegCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  {/* Net Volume */}
                  <div>
                    <div className="font-bold text-gray-800 mb-1">
                      ปริมาณสุทธิต่อหน่วย
                    </div>
                    <div className="flex items-center">
                      <ThaiVirtualKeyboardInput
                        value={updateFormData.net_volume}
                        onChange={(value) =>
                          setUpdateFormData((prev) => ({
                            ...prev,
                            net_volume: value,
                          }))
                        }
                        type="number"
                        readOnly={!isEditingNetVolume}
                        className="border border-gray-300 rounded-full p-2 text-gray-600 focus:outline-none w-full mr-3"
                      />
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-full font-medium ${
                          isEditingNetVolume
                            ? "bg-[#C68A47] text-white"
                            : "border border-[#C68A47] text-[#C68A47]"
                        } hover:bg-[#C68A47] hover:text-white`}
                        onClick={() =>
                          setIsEditingNetVolume(!isEditingNetVolume)
                        }
                      >
                        {isEditingNetVolume ? "บันทึก" : "แก้ไข"}
                      </button>
                    </div>
                  </div>

                  {/* Total Volume (Only visible for updates) */}
                  {!isAddingUpdate && (
                    <div>
                      <div className="font-bold text-gray-800 mb-1">
                        ปริมาณรวมทั้งหมด
                      </div>
                      <div className="flex items-center">
                        <ThaiVirtualKeyboardInput
                          value={currentTotalVolume}
                          onChange={(value) =>
                            setUpdateFormData((prev) => ({
                              ...prev,
                              total_volume: value,
                            }))
                          }
                          type="number"
                          readOnly={!isEditingTotalVolume}
                          className="border border-gray-300 rounded-full p-2 text-gray-600 focus:outline-none w-full mr-3"
                        />
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-full font-medium ${
                            isEditingTotalVolume
                              ? "bg-[#C68A47] text-white"
                              : "border border-[#C68A47] text-[#C68A47]"
                          } hover:bg-[#C68A47] hover:text-white`}
                          onClick={() =>
                            setIsEditingTotalVolume(!isEditingTotalVolume)
                          }
                        >
                          {isEditingTotalVolume ? "บันทึก" : "แก้ไข"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stock Quantity */}
                  <div>
                    <div className="font-bold text-gray-800 mb-1">
                      จำนวนคงเหลือในสต็อค
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="px-3 py-3 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                        onClick={handleIncrease}
                      >
                        <FaPlus />
                      </button>
                      <span className="px-6 font-bold text-gray-800">
                        {currentStockQuantity}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-3 bg-[#C94C4C] text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        onClick={handleDecrease}
                      >
                        <FaMinus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  className="w-[110px] h-[50px] border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
                  onClick={closeModal}
                >
                  ย้อนกลับ
                </button>
                <button
                  className="w-[110px] h-[50px] bg-[#DD9F52] text-white rounded-full hover:bg-[#C68A47] transition-colors font-bold"
                  onClick={handleUpdateSubmit}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ingredient History Modal */}
        {historyModalVisible && ingredientHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#F5F5F5] rounded-lg p-8 flex flex-col h-[600px] w-[800px] relative">
              {/* Modal Header */}
              <h2 className="text-xl font-bold text-center mb-4">
                ประวัติการอัปเดต {ingredientHistory.ingredient_name}
              </h2>

              {/* Table Section */}
              <div className="overflow-x-auto border rounded-lg p-5 flex-grow">
                <table className="border-collapse table-auto w-full">
                  <thead>
                    <tr>
                      <th className="py-2 pr-5 text-center border-b border-[#000000]">
                        ลำดับที่
                      </th>
                      <th className="py-2 text-center border-b border-[#000000]">
                        จำนวนคงเหลือ
                      </th>
                      <th className="py-2 text-center border-b border-[#000000]">
                        ปริมาณรวม
                      </th>
                      <th className="py-2 text-center border-b border-[#000000]">
                        ปริมาณสุทธิ
                      </th>
                      <th className="py-2 text-center border-b border-[#000000]">
                        วันหมดอายุ
                      </th>
                      <th className="py-2 text-center border-b border-[#000000]">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientHistory.updates.map((update, index) => (
                      <tr key={update.update_id}>
                        <td className="py-2 text-center border-b border-[#F1F4F7]">
                          {index + 1}
                        </td>
                        <td className="py-2 text-center border-b border-[#F1F4F7]">
                          {update.quantity_in_stock} ชิ้น
                        </td>
                        <td className="py-2 text-center border-b border-[#F1F4F7]">
                          {update.total_volume}
                        </td>
                        <td className="py-2 text-center border-b border-[#F1F4F7]">
                          {update.net_volume}
                        </td>
                        <td className="py-2 text-center border-b border-[#F1F4F7]">
                          {new Date(update.expiration_date).toLocaleDateString(
                            "th-TH"
                          )}
                        </td>
                        <td className="py-2 text-center border-b border-[#F1F4F7]">
                          <button
                            onClick={() => {
                              setHistoryModalVisible(false);
                              handleUpdate(update.update_id);
                              setIsAddingUpdate(false); // Open modal in update mode
                              setModalVisible(true);
                            }}
                            className="text-[#DD9F52] bg-[#F5F5F5] border border-[#DD9F52] focus:outline-none hover:bg-[#DD9F52] hover:text-white focus:ring-4 focus:ring-gray-100 rounded-full px-4 py-1"
                          >
                            อัปเดต
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Button */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setHistoryModalVisible(false)}
                  className="w-[150px] h-[50px] border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
                >
                  ปิด
                </button>
                <button
                  onClick={() => {
                    setHistoryModalVisible(false);
                    // Set initial values for a new addition
                    setUpdateFormData({
                      quantity_in_stock: "",
                      total_volume: "",
                      net_volume: ingredientHistory.net_volume || "",
                      expiration_date: "",
                    });
                    setSelectedProduct({
                      ...ingredientHistory,
                      update_id: null, // Setting update_id to null for a new update
                    });
                    setIsAddingUpdate(true); // Open modal in add mode
                    setModalVisible(true);
                  }}
                  className="w-[150px] h-[50px] bg-[#DD9F52] text-white rounded-full hover:bg-[#C68A47] transition-colors font-bold"
                >
                  เพิ่มการอัปเดต
                </button>
              </div>
            </div>
          </div>
        )}

        <DeleteIngredientModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={removeIngredient}
          ingredient={ingredientToDelete}
        />
      </div>
    </div>
  );
};

export default Stock;
