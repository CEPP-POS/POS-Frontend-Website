import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BsCashCoin } from "react-icons/bs";
import { IoChevronBack } from "react-icons/io5";
import { useSelector } from "react-redux";
import { QRCodeCanvas } from "qrcode.react";
import generatePayload from "promptpay-qr";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";
import { useWebSocket } from "../../../webSocketContext";
import PhoneDetect from "../../../Components/PhoneDetect/phoneDetect";
import LoadingPopup from "../../../Components/General/loadingPopup";

const PaymentMethod = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const { orderDetails } = location.state || {};
  const total = orderDetails?.total;
  const items = orderDetails?.items;
  const selectedPayment = orderDetails?.selectedPayment;

  console.log("Full orderDetails:", orderDetails);
  console.log("selectedPayment type:", typeof selectedPayment);
  console.log("selectedPayment value:", selectedPayment);

  const accountNumber = "0869201512";
  const qrData = generatePayload(accountNumber, { amount: parseFloat(total) });

  console.log("qrData: ", qrData);

  const bankIcons = [
    "BAAC.png",
    "BAY.png",
    "BBL.png",
    "GSB.png",
    "KBANK.png",
    "KTB.png",
    "PromptPay.png",
    "SCB.png",
    "TrueMoney.png",
    "TTB.png",
  ];

  const socket = useWebSocket();
  const [showPhoneDetect, setShowPhoneDetect] = useState(false);

  useEffect(() => {
    console.log("Socket state:", socket);
    if (socket) {
      const messageHandler = async (event) => {
        try {
          let messageData;
          if (event.data instanceof Blob) {
            const text = await event.data.text();
            messageData = JSON.parse(text);
          } else {
            messageData = JSON.parse(event.data);
          }

          console.log("PaymentMethod received message:", messageData);

          let createOrderDto = {
            order_date: new Date().toISOString(),
            total_price: total,
            queue_number: null,
            status: "รอทำ",
            payment_method: selectedPayment,
            path_img: messageData.data,
            cancel_status: null,
          };

          switch (messageData.type) {
            case "CONFIRM_SLIP":
              console.log("Got slip path:", messageData.data);
              break;

            case "RETAKE_SLIP":
              setShowPhoneDetect(true);
              return;

            case "CANCEL_SLIP":
              createOrderDto.cancel_status = "ยกเลิกโดยพนักงาน";
              break;

            default:
              return;
          }

          // Format items for backend
          const formattedItems = items.map((item) => ({
            menu_id: item.menuId,
            sweetness_id: item.selectedSweetness.id,
            size_id: item.selectedSize.id,
            add_on_id: item.selectedAddOn.map((addon) => addon.id),
            menu_type_id: item.selectedType.id,
            quantity: item.quantity,
            price: item.price,
          }));

          console.log("SEND ORDER:", formattedItems);

          const payload = {
            createOrderDto,
            items: formattedItems,
          };

          console.log("Sending order payload:", payload);

          try {
            setLoading(true);
            const response = await fetchApi(
              `${URL}/employee/orders`,
              "POST",
              payload
            );

            console.log("Got response:", response);

            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error data:", errorData);
              throw new Error("Error submitting the order");
            }

            const responseData = await response.json();
            // console.log("Order submitted successfully:", responseData);
            socket.send(JSON.stringify({ type: "ORDER_SUBMITTED" })); //send to fetch order
            navigate("/queue-summary", {
              state: { orderData: responseData },
            });
          } catch (error) {
            console.error("Error during order submission:", error);
          }
        } catch (error) {
          console.error("Error in WebSocket message handler:", error);
          console.error("Event data:", event.data);
        } finally {
          setLoading(false);
        }
      };

      socket.addEventListener("message", messageHandler);

      return () => {
        socket.removeEventListener("message", messageHandler);
      };
    }
  }, [socket, total, selectedPayment, items, navigate, URL]);

  const handleBack = () => navigate("/summary");

  const handleConfirmPayment = () => {
    console.log("selectedPayment:", selectedPayment);
    console.log("socket:", socket);
    console.log("total:", total);
    console.log("items:", items);

    if (selectedPayment === "cash" && socket) {
      console.log("Sending cash payment message");
      const message = {
        type: "CASH_PAYMENT",
        data: {
          totalAmount: total,
          items: items.map((item) => ({
            menu_id: item.menuId,
            sweetness_id: item.selectedSweetness.id,
            size_id: item.selectedSize.id,
            add_on_id: item.selectedAddOn.map((addon) => addon.id),
            menu_type_id: item.selectedType.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      };
      console.log("Sending WebSocket message:", message);
      socket.send(JSON.stringify(message));
    } else if (selectedPayment === "qr") {
      setShowPhoneDetect(true);
    }
  };

  const handlePhoneDetectCapture = async (imageData) => {
    setShowPhoneDetect(false);

    if (socket) {
      const message = {
        type: "NEW_SLIP",
        data: imageData,
        total: total,
      };
      socket.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    if (selectedPayment === "cash" && socket) {
      console.log("Sending cash payment message");
      const message = {
        type: "CASH_PAYMENT",
        data: {
          totalAmount: total,
          items: items.map((item) => ({
            menu_id: item.menuId,
            sweetness_id: item.selectedSweetness.id,
            size_id: item.selectedSize.id,
            add_on_id: item.selectedAddOn.map((addon) => addon.id),
            menu_type_id: item.selectedType.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      };

      console.log("Sending WebSocket message:", message);
      socket.send(JSON.stringify(message));
    }
  }, [selectedPayment, socket, total, items]);

  useEffect(() => {
    if (socket) {
      const messageHandler = async (event) => {
        try {
          let messageData;
          if (event.data instanceof Blob) {
            const text = await event.data.text();
            messageData = JSON.parse(text);
          } else {
            messageData = JSON.parse(event.data);
          }

          console.log("PaymentMethod received message:", messageData);

          if (messageData.type === "CONFIRM_CASH_PAYMENT") {
            navigate("/queue-summary");
          }
        } catch (error) {
          console.error("Error in WebSocket message handler:", error);
        }
      };

      socket.addEventListener("message", messageHandler);
      return () => socket.removeEventListener("message", messageHandler);
    }
  }, [socket, navigate]);

  return (
    <div className="h-screen-navbar">
      <div className="flex justify-start items-center mb-6">
        <button onClick={handleBack}>
          <IoChevronBack className="w-[40px] h-[40px] text-[#DD9F52]" />
        </button>
      </div>

      {/* QR code */}
      {selectedPayment === "qr" && (
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-2 gap-8">
            {/* QR code */}
            <div className="flex justify-center">
              <QRCodeCanvas value={qrData} size={360} />
            </div>
            {/* Detail */}
            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-bold mb-[8px]">ชำระด้วย QR Code</h1>
              <h1 className="text-xl mb-[48px]">โปรดแสกนเพื่อชำระเงิน</h1>
              <h2 className="text-3xl text-[#DD9F52] font-bold mb-[40px]">
                รวมทั้งสิ้น {total} บาท
              </h2>
              <p className="text-2xl font-bold mb-[8px]">
                เมื่อชำระเงินเสร็จสิ้นแล้ว
              </p>
              <p className="text-2xl font-bold mb-[16px]">
                โปรดนำหลักฐานไว้ที่ช่องด้านขวามือ
              </p>
              <p className="text-xl mb-[16px]">
                อย่าลืมรับสลิปที่ช่องทางด้านขวามือ
              </p>
              <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
                {bankIcons.map((bankName, index) => (
                  <div key={index} className="w-1/6 flex justify-center">
                    <img
                      src={require(`../../../Assets/Images/bankIcons/${bankName}`)}
                      alt={`Bank logo ${index + 1}`}
                      className="w-[40px] h-[40px] rounded-full shadow-lg"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleConfirmPayment}
                className="w-full mt-8 px-4 py-2 bg-[#DD9F52] text-white rounded-full"
              >
                ยืนยันการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* cash */}
      {selectedPayment === "cash" && (
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-[4px]">ชำระด้วยเงินสด</h1>
          <div className="my-[20px]">
            <BsCashCoin className="w-[200px] h-[200px] text-[#C68A47]" />
          </div>
          <h2 className="text-3xl text-[#DD9F52] font-bold mb-[40px]">
            รวมทั้งสิ้น {total} บาท
          </h2>
          <p className="text-2xl font-bold mb-[8px]">
            กรุณาชำระเงินที่เคาน์เตอร์พนักงาน
          </p>
          <p className="text-2xl">อย่าลืมรับสลิปที่ช่องทางด้านขวามือ</p>
        </div>
      )}

      {/* Phone Detect Modal */}
      {showPhoneDetect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#F5F5F5] p-6 rounded-xl shadow-lg w-4/5 max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ตรวจจับใบเสร็จโอนเงิน
            </h2>
            <hr className="h-0.5 bg-[#DD9F52] border-0" />
            <PhoneDetect onCapture={handlePhoneDetectCapture} socket={socket} />
          </div>
        </div>
      )}
      <LoadingPopup loading={loading} />
    </div>
  );
};

export default PaymentMethod;
