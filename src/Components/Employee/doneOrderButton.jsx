import React, { useState } from "react";
import "react-simple-keyboard/build/css/index.css";
import fetchApi from "../../Config/fetchApi";
import configureAPI from "../../Config/configureAPI";

const DoneOrderButton = ({ order, onSuccess }) => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log("order", order);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const speakQueueNumber = (queueNumber) => {
    // ตรวจสอบว่าเบราว์เซอร์รองรับ Speech Synthesis หรือไม่
    if ("speechSynthesis" in window) {
      // สร้างข้อความที่จะพูด
      const message = `ออเดอร์คิวที่ ${queueNumber} เชิญรับเครื่องดื่มที่เคาน์เตอร์`;
      const utterance = new SpeechSynthesisUtterance(message);

      // ตั้งค่าเสียงเป็นภาษาไทย
      utterance.lang = "th-TH";
      // ปรับความเร็วของการพูด (0.1 ถึง 10)
      utterance.rate = 0.6;
      // ปรับระดับเสียง (0 ถึง 1)
      utterance.volume = 1;
      // ปรับความถี่เสียง (0 ถึง 2)
      utterance.pitch = 1;

      // เล่นเสียง
      window.speechSynthesis.speak(utterance);
    } else {
      console.log("เบราว์เซอร์ไม่รองรับ Speech Synthesis");
    }
  };

  const completeOrder = async () => {
    const orderData = {
      order_id: order.order_id,
      status: "เสร็จสิ้น",
      order_date: Date.now(),
      queue_number: order.queue_number,
      customer_name: null,
      customer_contact: null,
      cancel_status: null,
      is_paid: false,
    };

    console.log("orderData", orderData);
    console.log("order", order);

    try {
      const response = await fetchApi(
        `${URL}/employee/orders/${order.order_id}/complete`,
        "PATCH",
        orderData
      );

      if (response.ok) {
        console.log("Order completed successfully!");
        // เรียกใช้ฟังก์ชันพูดหมายเลขคิว
        if (order.queue_number) {
          speakQueueNumber(order.queue_number);
        }
        closeModal();
        await onSuccess();
      } else {
        console.log(response);
        console.log("Failed to complete the order.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <button
        className="w-full bg-[#DD9F52] hover:bg-[#C68A47] text-white font-bold py-2 px-4 rounded-full"
        onClick={openModal}
      >
        เสร็จสิ้นออเดอร์
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-[#F5F5F5] w-[500px] h-auto rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-center mb-4">
              ออเดอร์เสร็จสิ้นครบทุกรายการ ใช่หรือไม่
            </h2>
            <p className="text-gray-700 text-center mb-6">
              การกดเสร็จสิ้นออเดอร์จะไม่สามารถย้อนกลับมาแก้ไขได้อีก
            </p>
            <div className="flex justify-between space-x-4 mt-12">
              <button
                className="w-full text-[#DD9F52] border border-[#DD9F52]   hover:bg-[#afafaf] hover:text-white font-bold py-2 px-4 rounded-full"
                onClick={closeModal}
              >
                ยกเลิก
              </button>
              <button
                className="w-full bg-[#DD9F52] hover:bg-[#C68A47] text-white font-bold py-2 px-4 rounded-full"
                onClick={completeOrder}
              >
                เสร็จสิ้นออเดอร์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoneOrderButton;
