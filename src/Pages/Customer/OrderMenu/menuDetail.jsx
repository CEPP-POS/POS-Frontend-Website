import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PiShoppingCart } from "react-icons/pi";
import { IoChevronBack } from "react-icons/io5";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../Config/redux/cartSlice";

const MenuDetail = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const cartItems = useSelector((state) => state.cart.items);

  const location = useLocation();
  const { menuId } = location.state || {};

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [menu, setMenu] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSweetness, setSelectedSweetness] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedAddOn, setSelectedAddOn] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetchApi(
          `${URL}/customer/menus/${menuId}`,
          "GET"
        );
        const data = await response.json();

        setMenu(data);

        console.log("DATA:", data);
        setSelectedType(data.menu_type_group[0]?.type_name || "");
        setSelectedSweetness(data.sweetness_group[0]?.level_name || "");
        setSelectedSize(data.size_group[0]?.size_name || "");
        setSelectedAddOn([]);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    };

    if (menuId) {
      fetchMenuData();
    }
  }, [menuId]);

  const handleBack = () => navigate("/menu");

  const handleAddToCart = () => {
    const newErrors = {};
    if (menu?.menu_type_group[0]?.is_required && !selectedType) {
      newErrors.type = "โปรดเลือกชนิดเครื่องดื่มที่ต้องการ";
    }

    if (menu?.sweetness_group.length > 0 && !selectedSweetness) {
      newErrors.sweetness = "โปรดเลือกระดับความหวานที่ต้องการ";
    }

    if (menu?.size_group.length > 0 && !selectedSize) {
      newErrors.size = "โปรดเลือกขนาดที่ต้องการ";
    }

    // if (
    //   menu?.add_on.length > 0 &&
    //   (selectedAddOn.length === 0 ||
    //     selectedAddOn.some((id) => id === null || id === undefined))
    // ) {
    //   newErrors.addOn = "โปรดเลือกตัวเลือกที่ต้องการอย่างน้อย 1 ตัวเลือก";
    // }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedMenuDetails = {
      menuId: menuId,
      menuName: menu.menu_name,
      menu_img: menu.image_url,
      selectedType: {
        id: menu.menu_type_group.find((type) => type.type_name === selectedType)
          ?.menu_type_id,
        name: selectedType,
      },
      selectedSweetness: {
        id: menu.sweetness_group.find(
          (sweetness) => sweetness.level_name === selectedSweetness
        )?.sweetness_id,
        name: selectedSweetness,
      },
      selectedSize: {
        id: menu.size_group.find((size) => size.size_name === selectedSize)
          ?.size_id,
        name: selectedSize,
      },
      price: calculatePrice(),
      quantity,
      selectedAddOn: selectedAddOn.map((addOnId) => ({
        id: addOnId,
        name: menu.add_on.find((addOn) => addOn.add_on_id === addOnId)
          ?.ingredient_name,
      })),
    };
    console.log("selectedMenuDetails:", selectedMenuDetails);

    dispatch(addToCart(selectedMenuDetails));
    navigate("/menu");
  };

  const handleSelection = (setter, value) => {
    setter(value);
  };

  const handleAddOnSelection = (addOnId) => {
    setSelectedAddOn((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const handleAdd = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDelete = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const calculatePrice = () => {
    let price = parseFloat(menu.price) || 0;

    if (selectedAddOn.length > 0) {
      selectedAddOn.forEach((addon) => {
        const selectedAddOnOption = menu.add_on.find(
          (addonOption) => addonOption.add_on_id === addon
        );
        price += parseFloat(selectedAddOnOption?.add_on_price || "0");
      });
    }

    if (selectedType) {
      const selectedTypeOption = menu.menu_type_group.find(
        (type) => type.type_name === selectedType
      );
      price += parseFloat(selectedTypeOption?.price_difference || "0");
    }

    if (selectedSize) {
      const selectedSizeOption = menu.size_group.find(
        (size) => size.size_name === selectedSize
      );
      price += parseFloat(selectedSizeOption?.size_price || "0");
    }

    return price * quantity;
  };

  if (!menu) return <div>Loading...</div>;

  return (
    <div className="font-noto flex flex-col bg-[#F5F5F5] mb-8">
      <div className="flex justify-between items-center mb-6 relative">
        <button onClick={handleBack}>
          <IoChevronBack className="w-[40px] h-[40px] text-[#DD9F52]" />
        </button>
        <button onClick={handleAddToCart} className="relative">
          <PiShoppingCart className="w-[40px] h-[40px] text-[#DD9F52]" />
          <span className="absolute -top-2 -right-2 bg-[#C94C4C] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {getCartItemCount()}
          </span>
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <img
          src={`${URL}/${menu.image_url.replace(/\\/g, "/")}`}
          alt={menu.menu_name}
          className="h-[250px] w-[350px] aspect-[4/3] object-cover rounded-md mb-2 border border-gray-200 shadow-sm"
        />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-600">{menu.menu_name}</h1>
        <p className="text-gray-500">{menu.description}</p>
      </div>

      <div className="mt-4">
        {menu.menu_type_group && menu.menu_type_group.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-2 mt-4">ชนิดเครื่องดื่ม</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {menu.menu_type_group.map((type) => (
                <button
                  key={type.menu_type_id}
                  onClick={() =>
                    handleSelection(setSelectedType, type.type_name)
                  }
                  className={`px-6 py-3 flex-1 max-w-[250px] text-center rounded-full border border-[#DD9F52] font-bold ${
                    selectedType === type.type_name
                      ? "bg-[#DD9F52] text-white"
                      : ""
                  }`}
                >
                  {type.type_name} +{type.price_difference} บาท
                </button>
              ))}
            </div>
          </>
        )}

        {menu.sweetness_group && menu.sweetness_group.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-2 mt-8">ระดับความหวาน</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {menu.sweetness_group.map((sweetness) => (
                <button
                  key={sweetness.sweetness_id}
                  onClick={() =>
                    handleSelection(setSelectedSweetness, sweetness.level_name)
                  }
                  className={`px-6 py-3 flex-1 max-w-[250px] text-center rounded-full border border-[#DD9F52] font-bold ${
                    selectedSweetness === sweetness.level_name
                      ? "bg-[#DD9F52] text-white"
                      : ""
                  }`}
                >
                  {sweetness.level_name}
                </button>
              ))}
            </div>
          </>
        )}

        {menu.size_group && menu.size_group.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-2 mt-8">ขนาดแก้ว</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {menu.size_group.map((size) => (
                <button
                  key={size.size_id}
                  onClick={() =>
                    handleSelection(setSelectedSize, size.size_name)
                  }
                  className={`px-6 py-3 flex-1 max-w-[250px] text-center rounded-full border border-[#DD9F52] font-bold ${
                    selectedSize === size.size_name
                      ? "bg-[#DD9F52] text-white"
                      : ""
                  }`}
                >
                  {size.size_name} +{size.size_price} บาท
                </button>
              ))}
            </div>
          </>
        )}

        {menu.add_on && menu.add_on.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-2 mt-8">ท็อปปิ้ง</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {menu.add_on.map((addOn) => (
                <button
                  key={addOn.add_on_id}
                  onClick={() => handleAddOnSelection(addOn.add_on_id)}
                  className={`px-6 py-3 flex-1 max-w-[250px] text-center rounded-full border border-[#DD9F52] font-bold ${
                    selectedAddOn.includes(addOn.add_on_id)
                      ? "bg-[#DD9F52] text-white"
                      : ""
                  }`}
                >
                  {addOn.ingredient_name} +{addOn.add_on_price} บาท
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center space-y-4">
        <div className="w-full flex flex-row items-center justify-between">
          <span className="font-bold">จำนวน</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDelete}
              className="w-14 h-14 font-bold text-white bg-[#C94C4C] rounded-full flex items-center justify-center"
            >
              -
            </button>
            <div className="w-24 h-14 font-bold text-center border border-[#AD8B73] rounded-full flex items-center justify-center">
              {quantity}
            </div>
            <button
              onClick={handleAdd}
              className="w-14 h-14 text-white bg-[#4B8455] rounded-full flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <div className="w-full flex flex-row items-center justify-between">
          <span className="font-bold">ราคา</span>
          <div className="w-60 h-14 text-center flex items-center justify-center border border-[#AD8B73] text-black font-bold text-2xl rounded-full">
            {calculatePrice().toFixed(2)} บาท
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full py-3 bg-[#DD9F52] text-white rounded-full font-semibold mb-8"
        >
          + เพิ่มเข้าตระกร้า
        </button>
      </div>
    </div>
  );
};

export default MenuDetail;
