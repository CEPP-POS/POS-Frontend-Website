import React, { useState, useEffect } from "react";
import { IoChevronBack, IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import PaymentMethod from "./paymentMethod";
import { useSelector } from "react-redux";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";
import { useDispatch } from "react-redux";
import { removeFromCart } from "../../../Config/redux/cartSlice";
import { AiOutlineDelete } from "react-icons/ai";
import { useWebSocket } from "../../../webSocketContext";
import PayWithCash from "../../../Components/Employee/payWithCash";

const Summary = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("qr");
  const [menuData, setMenuData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showPayWithCash, setShowPayWithCash] = useState(false);
  const [cashPaymentData, setCashPaymentData] = useState(null);
  const socket = useWebSocket();

  const items = useSelector((state) => state.cart.items);

  console.log("cart item:", items);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetchApi(`${URL}/customer/menus`, "GET");
        const data = await response.json();

        const selectedMenus = items.map((item) => {
          return data.available_menus.find(
            (menuItem) => menuItem.menu_id === item.menuId
          );
        });

        console.log("selectedMenus:", selectedMenus);

        if (selectedMenus) {
          setMenuData(selectedMenus);
          console.log(menuData);
        } else {
          console.error("Menu item not found");
        }
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    };

    fetchMenuData();
  }, []);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = 0;
  const total = subtotal + parseFloat(tax);

  const handleBack = () => navigate("/menu");

  const handlePaymentClick = () => setShowPaymentPopup(true);

  const closePaymentPopup = () => setShowPaymentPopup(false);

  const handleSelectPayment = (method) => setSelectedPayment(method);

  const handleConfirmPayment = () => {
    // Prepare order details to pass to the payment method
    const orderDetails = {
      total,
      items,
      selectedPayment,
    };
    console.log("orderDetails: ", orderDetails);
    navigate("/payment-method", { state: { orderDetails } });
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart(item));
  };

  const handleIncreaseQuantity = (item) => {
    dispatch({
      type: "cart/increaseQuantity",
      payload: {
        menuId: item.menuId,
        selectedSize: item.selectedSize,
        selectedSweetness: item.selectedSweetness,
        selectedType: item.selectedType,
        selectedAddOn: item.selectedAddOn,
      },
    });
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch({
        type: "cart/decreaseQuantity",
        payload: {
          menuId: item.menuId,
          selectedSize: item.selectedSize,
          selectedSweetness: item.selectedSweetness,
          selectedType: item.selectedType,
          selectedAddOn: item.selectedAddOn,
        },
      });
    }
  };

  return (
    <div className="w-full font-noto flex flex-col items-center bg-[#F5F5F5] h-screen-navbar">
      <div className="w-full flex justify-start items-center mb-6">
        <button onClick={handleBack} className="text-[#DD9F52] text-4xl">
          <IoChevronBack className="w-[40px] h-[40px] text-[#DD9F52]" />
        </button>
      </div>

      <div className="flex flex-col mb-2 mt-[40px]">
        <h1 className="text-3xl font-bold">สรุปรายการสินค้า</h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      <div className="w-full rounded-lg overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr className="border-b border-gray-300 text-2xl">
                <th className="text-left py-2 px-4">เมนู</th>
                <th className="text-center py-2 px-4">จำนวน</th>
                <th className="text-center py-2 px-4">ราคาทั้งหมด</th>
                <th className="text-center py-2 px-4">ลบ</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-4 text-gray-500 text-2xl"
                  >
                    ยังไม่มีสินค้าในตระกร้าขณะนี้
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="flex items-center py-2 px-4">
                      <img
                        src={`${URL}/${item.menu_img.replace(/\\/g, "/")}`}
                        alt={item.menuName}
                        className="mr-2 rounded h-[72px] w-[72px]"
                      />
                      <div>
                        <p className="font-semibold text-xl">{item.menuName}</p>
                        <div className="text-xl text-gray-500">
                          {item.selectedSize && (
                            <span>ขนาด: {item.selectedSize.name} </span>
                          )}
                          {item.selectedSweetness && (
                            <span>| หวาน: {item.selectedSweetness.name} </span>
                          )}
                          {item.selectedType && (
                            <span>| ชนิด: {item.selectedType.name} </span>
                          )}
                          {item.selectedAddOn.length > 0 && (
                            <span>
                              | ท็อปปิ้ง:{" "}
                              {item.selectedAddOn
                                .map((addOn) => addOn.name)
                                .join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-4">
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={() => handleDecreaseQuantity(item)}
                          className="w-8 h-8 font-bold text-white bg-[#C94C4C] rounded-full flex items-center justify-center"
                        >
                          -
                        </button>
                        <div>{item.quantity}</div>
                        <button
                          onClick={() => handleIncreaseQuantity(item)}
                          className="w-8 h-8 text-white bg-[#4B8455] rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="text-center px-4">
                      {item.price * item.quantity} บาท
                    </td>
                    <td className="text-center justify-center px-4">
                      <button
                        onClick={() => handleRemove(item)}
                        className="transition duration-200 text-[#C94C4C] hover:text-[#B03E3E]"
                      >
                        <AiOutlineDelete size={32} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order summary */}
      <div className="w-full fixed bottom-32 border-t border-gray-300 pt-4 text-2xl px-12 bg-[#F5F5F5]">
        {/* <div className="flex justify-between mb-2 font-bold">
          <span>รวมเป็นเงิน</span>
          <span>{subtotal} บาท</span>
        </div> */}
        {/* <div className="flex font-bold justify-between mb-2">
          <span>ภาษีมูลค่าเพิ่ม 7%</span>
          <span>{tax} บาท</span>
        </div> */}
        <div className="flex justify-between text-3xl font-bold">
          <span>รวมทั้งหมด</span>
          <span className="text-[#DD9F52]">{total} บาท</span>
        </div>
      </div>

      <button
        onClick={handlePaymentClick}
        className="fixed bottom-4 py-3 w-full px-8 bg-[#DD9F52] text-white rounded-full font-bold"
      >
        จ่ายเงิน
      </button>

      {/* Payment popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#F5F5F5] rounded-lg p-10 w-[800px] relative">
            <h2 className="text-3xl font-bold mb-4 flex justify-center">
              วิธีการชำระเงิน
            </h2>
            <div className="flex items-center mb-4">
              <input
                type="radio"
                id="qr-code"
                name="payment-method"
                className="mr-2"
                checked={selectedPayment === "qr"}
                onChange={() => handleSelectPayment("qr")}
              />
              <label htmlFor="qr-code" className="text-2xl">
                QR Code
              </label>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="radio"
                id="cash"
                name="payment-method"
                className="mr-2"
                checked={selectedPayment === "cash"}
                onChange={() => handleSelectPayment("cash")}
              />
              <label htmlFor="cash" className="text-2xl">
                เงินสด
              </label>
            </div>
            <div className="w-full flex justify-between space-x-8">
              <button
                onClick={closePaymentPopup}
                className="w-full py-2 mt-4 border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleConfirmPayment}
                className="w-full py-2 mt-4 bg-[#DD9F52] text-white rounded-full font-bold"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
