import React, { useState, useEffect } from "react";
import SideBar from "../../../../Components/Owner/sideBar";
import { useNavigate, useLocation } from "react-router-dom";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";
import LoadingPopup from "../../../../Components/General/loadingPopup";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const EditOwnerProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const MySwal = withReactContent(Swal);

  const [productData, setProductData] = useState(null);
  const [productName, setProductName] = useState();
  const [loading, setLoading] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categoryOption, setCategoryOption] = useState("");
  const [categories, setCategories] = useState([]);
  const ingredientId = new URLSearchParams(location.search).get("id");
  const [productImage, setProductImage] = useState(null);
  const [unitOption, setUnitOption] = useState("");
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [imageFile, setImageFile] = useState(null);

  const unitOptions = [
    { value: "กรัม", label: "กรัม (g)" },
    { value: "กิโลกรัม", label: "กิโลกรัม (kg)" },
    { value: "มิลลิลิตร", label: "มิลลิลิตร (ml)" },
    { value: "ลิตร", label: "ลิตร (l)" },
    { value: "ชิ้น", label: "ชิ้น (unit)" },
  ];

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
  }, [URL]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProductImage(window.URL.createObjectURL(file));
    }
  };

  const handleSelectUnit = (option) => {
    setUnitOption(option.value); // Change to use option.value
    setIsUnitDropdownOpen(false);
  };

  const handleSelectCategory = (option) => {
    setCategoryOption(option);
    setIsCategoryDropdownOpen(false);
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${URL}/owner/menus/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.filePath;
      } else {
        console.error("Image upload failed");
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/stock"); // Navigate after closing modal
  };

  const handleBack = () => {
    navigate("/stock");
  };

  useEffect(() => {
    const fetchProductData = async () => {
      console.log("INGREDIENT ID CLICK:", ingredientId);
      try {
        const response = await fetchApi(
          `${URL}/owner/stock-ingredients/${ingredientId}`,
          "GET"
        );
        const data = await response.json();
        console.log("Fetched product data:", data);

        setProductData(data);
        setUnitOption(data.unit || "");
        setProductName(data.ingredient_name);
        setCategoryOption(data.category_name || "");
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [ingredientId]);

  console.log("DATA INGREDIENT:", productData);

  const imageUrl = productData?.image_url
    ? `${URL}/${productData.image_url.replace(/\\/g, "/")}`
    : null;

  useEffect(() => {
    console.log("Updated PRODUCT DATA INGREDIENT:", productName);
  }, [productName]);

  const handleInputChange = (value) => {
    console.log("User Input:", value);
    setProductName(value);
  };

  const handleSave = async () => {
    setLoading(true);

    const ingredientData = {};
    console.log("Sending updated data:", ingredientData);

    try {
      let imagePath = productData.image_url;

      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }

      if (imagePath !== productData.image_url) {
        ingredientData.image_url = imagePath;
      }
      console.log("PRODUCT NAME:", productName);
      console.log("INGREDIENT NAME:", productData.ingredient_name);

      if (productName && productName !== productData.ingredient_name) {
        ingredientData.ingredient_name = productName;
      }
      if (unitOption && unitOption !== productData.unit) {
        ingredientData.unit = unitOption;
      }
      if (categoryOption && categoryOption !== productData.category_name) {
        ingredientData.category_name = categoryOption;
      }

      if (Object.keys(ingredientData).length === 0) {
        console.log("No changes detected. Skipping update.");
        return;
      }

      const response = await fetchApi(
        `${URL}/owner/edit-stock-ingredients/${ingredientId}`,
        "PATCH",
        ingredientData
      );

      if (response.ok) {
        setIsModalOpen(true);
        MySwal.fire({
          icon: "success",
          title: "แก้ไขข้อมูลวัตถุดิบสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        console.error("Failed to update ingredient");
      }
    } catch (error) {
      console.error("Error updating ingredient:", error);
    } finally {
      setLoading(false);
      navigate("/stock");
    }
  };

  if (!productData) return <LoadingPopup loading={true} />;

  return (
    <div className="h-screen-website bg-[#F5F5F5]">
      <SideBar menuTab={"stock"} />
      <div className="ml-8 mr-8">
        <h1 className="font-bold text-xl">คลังสินค้า</h1>
        <h1 className="font-bold">แก้ไขรายการสินค้า</h1>
        <div className="px-10">
          {/* upload รูปภาพสินค้า */}
          <div className="py-2">
            <span className="font-bold">รูปภาพสินค้า</span>
          </div>
          <div className="w-full flex justify-center">
            <label className="w-full border-2 border-dashed border-[#DD9F52] rounded-lg flex flex-col items-center justify-center cursor-pointer">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="h-80 object-contain"
                />
              ) : productImage ? (
                <img
                  src={productImage}
                  alt="Uploaded"
                  className="h-80 object-contain"
                />
              ) : (
                <>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2716/2716054.png"
                    alt="Upload Icon"
                    className="w-40 h-40"
                  />
                </>
              )}
              <p className="text-center text-brown-500 mb-2 mt-2">
                <span className="text-[#DD9F52] font-bold">คลิก</span>{" "}
                เพื่ออัปโหลดรูปภาพ
              </p>
              <p className="text-gray-400 text-sm">
                ชนิดไฟล์ PNG, JPG, JPEG, WEBP
              </p>

              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* ชื่อสินค้า */}
            <div className="w-full">
              <div className="py-2">
                <span className="font-bold">ชื่อสินค้า</span>
              </div>
              <ThaiVirtualKeyboardInput
                value={productName}
                onChange={handleInputChange}
                placeholder="ชื่อสินค้า"
                className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
              />
            </div>

            {/* หมวดหมู่ */}
            <div className="w-full">
              <div className="py-2">
                <span className="font-bold">หมวดหมู่</span>
              </div>
              <div className="relative w-full">
                <div
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className={`border border-[#DD9F52] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400 cursor-pointer ${
                    isCategoryDropdownOpen ? "ring-2 ring-brown-400" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {categoryOption || "เลือกตัวเลือก"}
                    <IoIosArrowDown size={16} />
                  </div>
                </div>

                {isCategoryDropdownOpen && (
                  <div className="absolute mt-2 w-full bg-[#F5F5F5] border border-[#DD9F52] rounded-lg shadow-lg z-10">
                    {categories.map((category) => (
                      <div
                        key={category.category_id}
                        onClick={() =>
                          handleSelectCategory(category.category_name)
                        }
                        className="p-3 hover:bg-[#F3E5D8] cursor-pointer text-gray-600"
                      >
                        {category.category_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* unit */}
            <div className="col-span-3">
              <div className="py-2">
                <span className="font-bold">หน่วย</span>
              </div>
              <div className="relative w-full">
                <div
                  onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                  className={`border border-[#DD9F52] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400 cursor-pointer ${
                    isUnitDropdownOpen ? "ring-2 ring-brown-400" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {unitOption
                      ? unitOptions.find((opt) => opt.value === unitOption)
                          ?.label
                      : "เลือกหน่วย"}
                    <IoIosArrowDown size={16} />
                  </div>
                </div>

                {isUnitDropdownOpen && (
                  <div className="absolute mt-2 w-full bg-[#F5F5F5] border border-[#DD9F52] rounded-lg shadow-lg z-10">
                    {unitOptions.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectUnit(option)}
                        className="p-3 hover:bg-[#F3E5D8] cursor-pointer text-gray-600"
                      >
                        {option.label}{" "}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {/* {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#F5F5F5] rounded-lg p-6 w-[400px] text-center">
              <AiOutlineCheckCircle
                size={60}
                className="text-green-500 mx-auto"
              />
              <h2 className="font-bold text-xl my-4">บันทึกเสร็จสิ้น</h2>
              <button
                className="px-4 py-2 bg-[#DD9F52] text-white rounded-full hover:bg-[#C68A47] transition-colors font-bold"
                onClick={closeModal}
              >
                ปิด
              </button>
            </div>
          </div>
        )} */}
        {/* Save and Back buttons */}
        <div className="flex fixed bottom-0 left-0 px-4 py-4 pb-4 w-full space-x-8 justify-between bg-[#F5F5F5]">
          <button
            className="px-14 py-4 w-[300px] border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
            onClick={handleBack}
          >
            ย้อนกลับ
          </button>
          <button
            className="px-6 py-2 w-[300px] bg-[#DD9F52] text-white rounded-full hover:bg-[#C68A47] transition-colors font-bold"
            onClick={handleSave}
          >
            บันทึก
          </button>
        </div>
      </div>
      <LoadingPopup loading={loading} />
    </div>
  );
};

export default EditOwnerProduct;
