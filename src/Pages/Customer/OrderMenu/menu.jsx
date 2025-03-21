import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PiShoppingCart } from "react-icons/pi";
import { useSelector } from "react-redux";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";
import { useWebSocket } from "../../../webSocketContext";

const Menu = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const socket = useWebSocket();

  const userData = useSelector((state) => state.user.userData);
  const { owner_id } = userData || {};
  const cartItems = useSelector((state) => state.cart.items);

  const navigate = useNavigate();
  const [menuData, setMenuData] = useState({
    categories: [],
  });
  const { categories } = menuData;
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(false);

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const fetchMenu = async () => {
    try {
      const response = await fetchApi(`${URL}/customer/menus`, "GET");
      const data = await response.json();
      setMenuData({
        categories: data.categories || [],
      });
    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [URL, owner_id, activeCategory]);

  console.log("Menu Data:", menuData);

  useEffect(() => {
    if (socket) {
      console.log("Setting up WebSocket listener in Menu page");

      const messageHandler = async (event) => {
        try {
          let messageData;
          if (event.data instanceof Blob) {
            const text = await event.data.text();
            messageData = JSON.parse(text);
          } else {
            messageData = JSON.parse(event.data);
          }

          console.log("Menu page received message:", messageData);

          switch (messageData.type) {
            case "PAUSE_MENU":
              await fetchMenu();
              break;
            default:
              break;
          }
        } catch (error) {
          console.error("Error in WebSocket message handler:", error);
        }
      };

      socket.addEventListener("message", messageHandler);

      return () => {
        socket.removeEventListener("message", messageHandler);
      };
    }
  }, [socket]);

  // Group menus by category, filtering out null or empty categories
  const groupedMenus = (categories || [])
    .filter((category) => category.category_name) // Filter out null or empty category names
    .map((category) => {
      return {
        category_name: category.category_name,
        menus: category.menus || [], // Ensure menus is an array
      };
    });

  // Add a group for "ทั้งหมด" with unique menus
  const allMenus = categories.flatMap((category) => category.menus || []);
  const uniqueMenus = Array.from(
    new Set(allMenus.map((menu) => menu.menu_id))
  ).map((id) => allMenus.find((menu) => menu.menu_id === id));

  groupedMenus.unshift({
    category_name: "ทั้งหมด",
    menus: uniqueMenus,
  });

  const handleCategoryClick = (category) => {
    if (activeCategory === category) {
      setActiveCategory("");
    } else {
      setActiveCategory(category);
    }
  };

  const filteredMenus =
    activeCategory === ""
      ? uniqueMenus // Show all unique menus if no category is selected
      : groupedMenus
          .filter((group) => group.category_name === activeCategory)
          .flatMap((group) => group.menus);

  const handleMenuClick = (menuId) => {
    console.log("menu id click:", menuId);
    navigate("/menu-detail", {
      state: { menuId },
    });
  };

  const handleAddToCart = () => {
    navigate("/summary");
  };

  return (
    <div className="font-noto flex flex-col bg-[#F5F5F5] mb-8">
      {/* Cart */}
      <div className="flex justify-end items-center mb-6 relative">
        <button onClick={handleAddToCart} className="relative">
          <PiShoppingCart className="w-[40px] h-[40px] text-[#DD9F52]" />
          <span className="absolute -top-2 -right-2 bg-[#C94C4C] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {getCartItemCount()}
          </span>
        </button>
      </div>

      {/* Category Buttons */}
      <div className="w-full flex items-start overflow-x-auto whitespace-nowrap pb-2 ml-2 space-x-4 mb-4">
        {groupedMenus.map((group) => (
          <button
            key={group.category_name}
            onClick={() => handleCategoryClick(group.category_name)}
            className={`px-4 py-2 rounded-full border border-[#DD9F52] ${
              activeCategory === group.category_name
                ? "bg-[#DD9F52] text-white"
                : "border-[#DD9F52] text-[#DD9F52]"
            }`}
          >
            {group.category_name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-4 gap-6">
        {filteredMenus.map((menu, index) => {
          const imageUrl = `${URL}/${menu.image_url.replace(/\\/g, "/")}`;
          return (
            <button
              className="px-6 py-3 rounded-md border border-[#DD9F52] shadow-md ml-2"
              key={index}
              onClick={() => handleMenuClick(menu.menu_id)}
            >
              <img
                className="w-full aspect-[4/3] object-cover rounded-md mb-2 border border-gray-200 shadow-sm"
                src={imageUrl}
                alt={menu.menu_name}
              />
              <div className="font-bold text-xl">{menu.menu_name}</div>
              <div className="text-gray-600">{menu.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
