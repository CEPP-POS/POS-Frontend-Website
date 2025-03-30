import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const AddProductForm = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const MySwal = withReactContent(Swal);

  const navigate = useNavigate();
  const location = useLocation();
  const { mode, productData } = location.state || {
    mode: "add",
    productData: {},
  };

  const [step, setStep] = useState(1);
  const [menuName, setMenuName] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [productPrice, setProductPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState({
    menuName: "",
    productPrice: "",
  });

  useEffect(() => {
    if (mode === "edit" && productData) {
      const imageUrl = `${URL}/${productData.image_url.replace(/\\/g, "/")}`;

      console.log("image url:", imageUrl);
      setMenuName(productData.menu_name || null);
      setProductDetails(productData.description || null);
      setProductImage(imageUrl || null);
      setProductPrice(productData.price || null);
    }
  }, [mode, productData]);

  console.log("IMAGE:", productFile);

  const handleUploadImage = async (productFile) => {
    try {
      const formData = new FormData();
      formData.append("file", productFile);

      console.log("Uploading file:", productFile);

      const response = await fetch(`${URL}/owner/menus/upload`, {
        method: "POST",
        body: formData,
      });

      console.log("FILE DATA", formData);

      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded successfully", data);
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

  const handleAddProduct = async () => {
    console.log("add product");
    setLoading(true);

    try {
      // Only handle image upload if there's a new file
      let imagePath = null;
      if (productFile) {
        imagePath = await handleUploadImage(productFile);
      }

      const endpoint =
        mode === "add"
          ? `${URL}/owner/menus`
          : `${URL}/owner/menus/${productData.menu_id}`;
      const method = mode === "add" ? "POST" : "PATCH";

      console.log("MODE:", mode);

      // Create payload based on whether we're updating the image
      const payload = {
        menu_name: menuName,
        description: productDetails,
        price: parseInt(productPrice),
        ...(imagePath || mode === "add"
          ? { image_url: imagePath }
          : { image_url: productData.image_url }),
      };

      console.log("DATA TO SEND:", payload);

      const response = await fetchApi(endpoint, method, payload);

      console.log("DATA SENT:", payload);

      console.log("RESPONSE :", response);
      if (response.ok) {
        navigate("/product-list");
        MySwal.fire({
          icon: "success",
          title: "เพิ่ม/จัดการข้อมูลรายการสินค้าสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error submitting menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 || step === 4) {
      if (!validateForm()) return;
    }
    if (step === 5) {
      //ADD HANDLE SEND TO BACKEND
      console.log("save button click");
      handleAddProduct(menuName, productDetails, productPrice, productFile);
    }
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/product-list");
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        setFileError("Only PNG, JPG, JPEG, and WEBP files are allowed.");
        setProductImage(null);
        return;
      }

      setFileError("");
      setProductImage(window.URL.createObjectURL(file));
      setProductFile(file);
    }
  };

  const handlePriceChange = (value) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setProductPrice(value);
      setPriceError("");
    } else {
      setPriceError("กรุณากรอกเฉพาะตัวเลขเท่านั้น");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!menuName.trim()) {
      newErrors.menuName = "กรุณากรอกชื่อสินค้า";
    }

    if (step == 2 && !productPrice.trim()) {
      newErrors.productPrice = "กรุณากรอกราคาสินค้า";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  console.log("ERROR:", errors);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="w-full flex justify-start text-2xl mb-6 font-bold">
              1. กรอกชื่อสินค้าที่ต้องการ
            </div>
            <label
              htmlFor="menuName"
              className="text-2xl mb-4 w-full text-center"
            >
              ชื่อสินค้า
            </label>
            <ThaiVirtualKeyboardInput
              id="menuName"
              value={menuName}
              onChange={setMenuName}
              placeholder="กรอกชื่อสินค้า..."
              className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
            />
            {errors.menuName && (
              <p className="text-[#C94C4C] text-sm mt-2">{errors.menuName}</p>
            )}
          </>
        );
      case 2:
        return (
          <>
            <div className="w-full flex justify-start text-2xl mb-6 font-bold">
              2. กรอกรายละเอียดของสินค้า
            </div>
            <label
              htmlFor="productDetails"
              className="text-2xl mb-4 w-full text-center"
            >
              รายละเอียดสินค้า
            </label>
            <ThaiVirtualKeyboardInput
              id="productDetails"
              value={productDetails}
              onChange={setProductDetails}
              placeholder="กรอกรายละเอียดสินค้า..."
              className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
            />
          </>
        );
      case 3:
        return (
          <>
            <div className="w-full flex justify-start text-xl mb-5 font-bold">
              3. อัปโหลดรูปภาพสินค้า
            </div>
            <label
              htmlFor="productDetails"
              className="text-xl mb-2 w-full text-center"
            >
              รูปภาพสินค้า
            </label>

            <div className="w-full flex justify-center">
              <label className="w-full h-[400px] border-2 border-dashed border-[#DD9F52] rounded-lg flex flex-col items-center justify-center cursor-pointer">
                {productImage ? (
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
                  <span className="text-[#DD9F52] font-bold">คลิก</span>
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
            {fileError && (
              <p className="text-[#C94C4C] text-sm mt-2 text-center">
                {fileError}
              </p>
            )}
          </>
        );
      case 4:
        return (
          <>
            <div className="w-full flex justify-start text-xl mb-5 font-bold">
              4. กรอกราคาของสินค้า
            </div>
            <label
              htmlFor="productPrice"
              className="text-xl mb-2 w-full text-center"
            >
              ราคาสินค้า (บาท)
            </label>
            <ThaiVirtualKeyboardInput
              id="productPrice"
              value={productPrice}
              onChange={handlePriceChange}
              isInvalid={!!priceError}
              placeholder="กรอกราคาสินค้า..."
              className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
            />
            {priceError && (
              <p className=" text-[#C94C4C] text-sm mt-2">{priceError}</p>
            )}
            {errors.productPrice && (
              <p className="text-[#C94C4C] text-sm mt-2">
                {errors.productPrice}
              </p>
            )}
          </>
        );
      case 5:
        return (
          <>
            <div className="w-full flex justify-start text-xl mb-5 font-bold">
              5. สรุปรายการสินค้า
            </div>
            <div className="flex w-full space-x-8 justify-between mb-2">
              <p className="font-bold">ชื่อสินค้า {menuName}</p>
              <p className="font-bold">ราคาสินค้า {productPrice} บาท</p>
            </div>
            <div className="font-bold text-left mb-2 w-full">รูปภาพสินค้า</div>
            <div className="w-full h-[400px] border border-[#DD9F52] rounded-lg flex flex-col items-center justify-center mb-4">
              {productImage && (
                <img
                  src={productImage}
                  alt="Uploaded"
                  className="h-[380px] object-contain"
                />
              )}
            </div>
            <div className="w-full">
              <p className="font-bold">รายละเอียดสินค้า</p>
              <div className=" h-[40px] border border-[#DD9F52] rounded-full p-3 text-gray-600 flex items-center">
                {productDetails}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center h-screen-navbar bg-[#F5F5F5] mt-[40px]">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">
          {mode === "add" ? "เพิ่มรายการสินค้า" : "แก้ไขรายการสินค้า"}
        </h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      <div className="w-full">
        <div className="flex flex-col items-center w-full">
          {renderStepContent()}
        </div>

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
            {step < 5 ? "ถัดไป" : "บันทึก"}
          </button>
        </div>
      </div>

      {/* loading popup */}
      {loading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#F5F5F5] h-[250px] w-[300px] rounded-md shadow-lg flex justify-center items-center flex-col">
            <svg
              aria-hidden="true"
              className="w-36 h-36 text-gray-200 animate-spin dark:text-gray-300 fill-[#485058]"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <p className="mt-8 text-center text-xl">โหลดข้อมูล...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
