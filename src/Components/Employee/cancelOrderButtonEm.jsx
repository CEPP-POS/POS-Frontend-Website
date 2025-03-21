import React, { useState } from "react";
import "react-simple-keyboard/build/css/index.css";
import fetchApi from "../../Config/fetchApi";
import configureAPI from "../../Config/configureAPI";
import ThaiVirtualKeyboardInput from "../Common/ThaiVirtualKeyboardInput";

const CancelOrderButtonEm = ({ order, onSuccess }) => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("cancel order", order);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const cancelOrder = async () => {
    const customerData = {
      order_id: order.order_id,
      // order_date: Date.now(),
      // queue_number: order.queue_number,
      // status: "canceled",
      customer_name: customerName,
      contact: contact,
      // cancel_status: "ยังไม่คืนเงิน",
    };

    console.log("customerData", customerData);

    try {
      const response = await fetchApi(
        `${URL}/employee/orders/${order.order_id}/cancel`,
        "PATCH",
        customerData
      );

      if (response.ok) {
        console.log("Order cancel successfully!");
        closeModal();
        await onSuccess();
      } else {
        throw new Error("Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("เกิดข้อผิดพลาดในการยกเลิกออเดอร์");
    }
  };

  return (
    <div className="relative">
      <button
        className="w-full border text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold py-2 px-4 rounded-full"
        onClick={openModal}
      >
        ยกเลิกออเดอร์
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-[#F5F5F5] w-[500px] h-auto rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-center mb-1">
              ยกเลิกออเดอร์
            </h2>
            <hr className="h-0.5 bg-[#DD9F52] border-0" />

            <div className="mt-2">
              <label>หมายเลขออเดอร์</label>
              <input
                type="text"
                value={order.order_id}
                disabled
                className="w-full border border-[#DD9F52] rounded-full px-3 py-1.5 text-gray-600 bg-gray-100"
              />
            </div>

            <div className="mt-2">
              <label>ชื่อลูกค้า</label>
              <ThaiVirtualKeyboardInput
                placeholder="กรอกชื่อของลูกค้า..."
                value={customerName}
                onChange={setCustomerName}
                className="w-full border border-[#DD9F52] rounded-full px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
              />
            </div>

            <div className="mt-2">
              <label>เบอร์โทรศัพท์ลูกค้า</label>
              <ThaiVirtualKeyboardInput
                placeholder="กรอกเบอร์โทรศัพท์ของลูกค้า..."
                value={contact}
                onChange={setContact}
                className="w-full border border-[#DD9F52] rounded-full px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400"
              />
            </div>

            <div className="flex justify-between space-x-4 mt-10">
              <button
                className="w-full rounded-full text-[#DD9F52] border border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
                onClick={closeModal}
              >
                ยกเลิก
              </button>
              <button
                className="w-full bg-[#DD9F52] hover:bg-[#C68A47] text-white font-bold py-2 px-4 rounded-full"
                onClick={cancelOrder}
              >
                ยกเลิกออเดอร์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelOrderButtonEm;
