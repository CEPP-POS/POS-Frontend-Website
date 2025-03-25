import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegClock } from "react-icons/fa6";
import { MdOutlineTableBar } from "react-icons/md";
import { MdOutlinePauseCircleOutline } from "react-icons/md";
import { IoMdHome } from "react-icons/io";
import { CiCalendar } from "react-icons/ci";
import { MdOutlineShoppingCart } from "react-icons/md";
import { IoMdStopwatch } from "react-icons/io";
import { MdDone } from "react-icons/md";
import DoneOrderButton from "../../../Components/Employee/doneOrderButton";
import CancelOrderButtonEm from "../../../Components/Employee/cancelOrderButtonEm";
import LogoutButton from "../../../Components/General/logoutButton";
import fetchApi from "../../../Config/fetchApi";
import configureAPI from "../../../Config/configureAPI";
import CheckSlip from "../../../Components/Employee/checkSlip";
import PayWithCash from "../../../Components/Employee/payWithCash";
import { useWebSocket } from "../../../webSocketContext";
import LoadingPopup from "../../../Components/General/loadingPopup";

const Order = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const navigate = useNavigate();
  const handlePauseSection = () => {
    navigate("/pause-section");
  };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderStats, setOrderStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
  });
  const [checkSlipData, setCheckSlipData] = useState(null);
  const [totalAmountSlipData, setTotalAmountSlipData] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayWithCash, setShowPayWithCash] = useState(false);
  const [cashPaymentData, setCashPaymentData] = useState(null);
  const socket = useWebSocket();
  const [slipModalVisible, setSlipModalVisible] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const fetchOrders = async () => {
    setLoading(false);
    try {
      setIsLoading(true);
      const response = await fetchApi(`${URL}/employee/orders`, "GET");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();

      setOrderStats({
        total_orders: data.total_orders || 0,
        pending_orders: data.pending_orders || 0,
        completed_orders: data.completed_orders || 0,
      });

      if (data.orders && Array.isArray(data.orders)) {
        const pendingOrders = data.orders.filter(
          (order) => order.status === "รอทำ"
        );

        const formattedOrders = pendingOrders.map((order) => ({
          ...order,
          order_items: order.order_item || [],
          order_date: new Date(order.order_date).toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }),
        }));
        setOrders(formattedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("ORDER DATA:", orders);

  useEffect(() => {
    if (socket) {
      console.log("Setting up WebSocket listener in Order page");

      const messageHandler = async (event) => {
        try {
          let messageData;
          if (event.data instanceof Blob) {
            const text = await event.data.text();
            messageData = JSON.parse(text);
          } else {
            messageData = JSON.parse(event.data);
          }

          console.log("Order page received message:", messageData);
          //set total
          if (messageData.total !== undefined) {
            console.log("Setting total amount:", messageData.total);
            setTotalAmountSlipData(messageData.total);
          }

          switch (messageData.type) {
            case "NEW_SLIP":
              console.log("New slip received:", messageData);
              if (messageData.data.startsWith("data:image")) {
                setCheckSlipData(messageData.data);
              }
              break;

            case "CONFIRM_SLIP":
              console.log("Slip confirmed, sending order...");
              setCheckSlipData(null);
              break;

            case "CASH_PAYMENT":
              console.log("Cash payment received:", messageData.data);
              setCashPaymentData(messageData.data);
              setShowPayWithCash(true);
              break;

            case "ORDER_SUBMITTED":
              console.log("Order submitted, fetching updated orders...");
              await fetchOrders();
              break;

            default:
              break;
          }
        } catch (error) {
          console.error("Error in WebSocket message handler:", error);
        }
      };

      socket.addEventListener("message", messageHandler);
      return () => socket.removeEventListener("message", messageHandler);
    }
  }, [socket]);

  const handlePaymentSuccess = async (paymentData) => {
    setLoading(true);
    try {
      const orderData = {
        createOrderDto: {
          order_date: new Date().toISOString(),
          total_price: cashPaymentData.totalAmount,
          queue_number: null,
          status: "รอทำ",
          payment_method: "cash",
          cash_given: paymentData.cashReceived,
          change: paymentData.change,
          cancel_status: null,
        },
        items: cashPaymentData.items,
      };

      console.log("Sending order data:", orderData);

      const response = await fetchApi(
        `${URL}/employee/orders`,
        "POST",
        orderData
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("Order created successfully:", responseData);

        if (socket) {
          const message = {
            type: "CASH_PAYMENT_CONFIRMED",
            data: responseData,
          };
          socket.send(JSON.stringify(message));
        }
        await fetchOrders();
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("เกิดข้อผิดพลาดในการสร้างออเดอร์");
    } finally {
      setLoading(false);
    }

    setShowPayWithCash(false);
  };
  useEffect(() => {
    fetchOrders();
  }, [URL, socket]);

  const handlePaymentCancel = async () => {
    setLoading(true);
    try {
      const orderData = {
        createOrderDto: {
          order_date: new Date().toISOString(),
          total_price: cashPaymentData.totalAmount,
          queue_number: null,
          status: "รอทำ",
          payment_method: "cash",
          cash_given: 0,
          change: 0,
          cancel_status: "ยกเลิกโดยพนักงาน",
        },
        items: cashPaymentData.items,
      };

      console.log("Sending cancel order data:", orderData);

      const response = await fetchApi(
        `${URL}/employee/orders`,
        "POST",
        orderData
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("Order cancelled successfully:", responseData);

        if (socket) {
          const message = {
            type: "CASH_PAYMENT_CANCELLED",
            data: responseData,
          };
          socket.send(JSON.stringify(message));
        }
        await fetchOrders();
      } else {
        throw new Error("Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("เกิดข้อผิดพลาดในการยกเลิกออเดอร์");
    } finally {
      setLoading(false);
    }

    setShowPayWithCash(false);
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Bangkok",
    });
  };

  const handleViewSlip = (slipUrl) => {
    setSelectedSlip(slipUrl);
    setSlipModalVisible(true);
  };

  const handleConfirmSlip = () => {
    console.log("Confirm slip button clicked");
    fetchOrders();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-[#C94C4C]">เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 bg-[#F5F5F5] h-screen-navbar mt-4">
      <div className="bg-white rounded-2xl shadow-md col-span-1 flex flex-col border border-gray-200">
        {!isLoading && orders && orders.length > 0 ? (
          <>
            <div className="bg-white flex flex-col items-center justify-center rounded-2xl pt-2 px-4">
              <h1 className="flex items-center justify-center font-bold w-full rounded-full py-2 px-4 text-3xl">
                ออเดอร์คิวที่ {orders[0]?.queue_number}
              </h1>

              <div className="flex justify-between items-center mt-2">
                <span>
                  <FaRegClock className="text-[#DD9F52]" />
                </span>
                <span className="pl-1">{orders[0]?.order_date} น.</span>
              </div>

              <div className="flex justify-between mt-2">
                <span className="pr-1">ช่องทางการชำระเงิน</span>
                <span className="border border-[#70AB8E] text-[#70AB8E] rounded-full px-5">
                  QR CODE
                </span>
              </div>
            </div>

            <hr className="mt-2 h-0.5 mx-4 bg-[#DD9F52] border-0" />
            <div className="pl-4 pr-4 mt-2 flex flex-col h-full">
              <span className="font-bold flex justify-center mt-4 text-2xl">
                รายการคำสั่งซื้อ
              </span>
              <div className="flex justify-between font-bold text-2xl">
                <div>รายการสินค้า</div>
                <div>จำนวน</div>
              </div>
              <div className="flex-grow">
                {orders[0]?.order_items && orders[0].order_items.length > 0 ? (
                  <div className="h-[250px] overflow-y-auto mt-4">
                    {orders[0].order_items.map(
                      (item, idx) => (
                        console.log("ITEM IN MAP:", item),
                        (
                          <div key={idx} className="mb-4">
                            <div className="flex justify-between text-2xl">
                              <div>
                                {item?.menu_name?.menu_name ||
                                  "ไม่ระบุชื่อเมนู"}
                              </div>
                              <div>{item?.menu_name?.quantity || 0}</div>
                            </div>
                            <span className="text-[#5B5B5B] text-xl">
                              {item.details.length > 0 && (
                                <>
                                  ชนิด: {item.details[2]?.type_name || "-"} |
                                  หวาน: {item.details[0]?.level_name || "-"} |
                                  ขนาด: {item.details[1]?.size_name || "-"}
                                </>
                              )}
                              {item.add_ons.length > 0 && (
                                <>
                                  {" "}
                                  | ท็อปปิ้ง :{" "}
                                  {item.add_ons.map((addOn, index) => (
                                    <span key={index}>
                                      {addOn.ingredient_name}
                                      {index < item.add_ons.length - 1
                                        ? ", "
                                        : ""}
                                    </span>
                                  ))}
                                </>
                              )}
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-center mt-4">ไม่มีสินค้าในคำสั่งซื้อ</p>
                )}
              </div>
              <div className="space-y-2 w-full py-4 mt-auto">
                <DoneOrderButton order={orders[0]} onSuccess={fetchOrders} />
                <CancelOrderButtonEm
                  order={orders[0]}
                  onSuccess={fetchOrders}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-500">ไม่มีออเดอร์ที่รอดำเนินการ</p>
          </div>
        )}
      </div>

      <div className="col-span-2 w-full">
        <div className="grid grid-cols-2 gap-2 my-2 w-full">
          {/* Calendar */}
          <div className="py-2 flex justify-center items-center rounded-full w-full gap-2">
            <CiCalendar className="text-black" size={36} />
            <span className="pl-1 text-black text-2xl">{getTodayDate()}</span>
          </div>

          {/* Button */}
          <button
            onClick={handlePauseSection}
            className="py-2 bg-[#DD9F52] hover:bg-[#C68A47] text-white rounded-full w-full"
          >
            <div className="flex justify-center items-center gap-2 text-2xl">
              <MdOutlinePauseCircleOutline size={36} />
              พักวัตถุดิบ / รายการสินค้า
            </div>
          </button>
        </div>
        {/* <LogoutButton className="w-full" /> */}

        <div className="flex justify-between space-x-4 w-full mb-4 mt-4">
          <div className="flex py-4 px-6 w-full bg-white border rounded-lg">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#DD9F52]">
              <MdOutlineShoppingCart color="white" size={48} />
            </div>
            <div className="ml-4 flex flex-col justify-center">
              <p className="text-gray-600 text-2xl">ออเดอร์วันนี้</p>
              <p className="font-bold text-2xl">
                {orderStats.total_orders} ออเดอร์
              </p>
            </div>
          </div>

          <div className="flex py-4 px-6 w-full bg-white border rounded-lg">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#DD9F52]">
              <IoMdStopwatch color="white" size={48} />
            </div>
            <div className="ml-4 flex flex-col justify-center">
              <p className="text-gray-600 text-2xl">ออเดอร์ที่รอ</p>
              <p className="font-bold text-2xl">
                {orderStats.pending_orders} ออเดอร์
              </p>
            </div>
          </div>

          <div className="flex py-4 px-6 w-full bg-white border rounded-l">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#DD9F52]">
              <MdDone color="white" size={48} />
            </div>
            <div className="ml-4 flex flex-col justify-center">
              <p className="text-gray-600 text-2xl">ออเดอร์ที่เสร็จ</p>
              <p className="font-bold text-2xl">
                {orderStats.completed_orders} ออเดอร์
              </p>
            </div>
          </div>
        </div>

        {/* Order Cards */}
        <div className="overflow-x-auto">
          <div className="flex space-x-8">
            {!isLoading && orders && orders.length > 1
              ? orders
                  .sort((a, b) => a.order_id - b.order_id)
                  .slice(1)
                  .map((order, index) => (
                    <div
                      key={index}
                      className="min-w-[560px] bg-[#FFFFFF] rounded-2xl shadow-md ml-0.5 border border-gray-200"
                    >
                      <div className="bg-[#FFFFFF] flex flex-col items-center justify-center rounded-2xl pt-2 px-4">
                        <h1 className="flex items-center justify-center font-bold w-full py-2 px-4 text-2xl">
                          ออเดอร์คิวที่ {order?.queue_number}
                        </h1>

                        <div className="flex justify-between items-center">
                          <span>
                            <FaRegClock className="text-[#DD9F52]" />
                          </span>
                          <span className="pl-1">{order.order_date} น.</span>
                        </div>
                      </div>
                      <hr className="mt-2 h-0.5 mx-4 bg-[#DD9F52] border-0" />
                      <div className="pl-4 pr-4 pt-2">
                        <span className="font-bold flex justify-center text-2xl">
                          รายการคำสั่งซื้อ
                        </span>
                        <div className="flex justify-between font-bold text-2xl">
                          <div>รายการสินค้า</div>
                          <div>จำนวน</div>
                        </div>

                        <div className="h-[530px] overflow-y-auto">
                          {order?.order_items &&
                          order.order_items.length > 0 ? (
                            order.order_items.map(
                              (item, idx) => (
                                console.log("ITEM DATA IN MAP SLICE:", item),
                                (
                                  <div key={idx} className="mb-2">
                                    <div className="flex justify-between text-2xl">
                                      <div>
                                        {item?.menu_name?.menu_name ||
                                          "ไม่ระบุชื่อเมนู"}
                                      </div>
                                      <div>
                                        {item?.menu_name?.quantity || 0}
                                      </div>
                                    </div>
                                    <span className="text-[#5B5B5B] text-xl">
                                      {item.details.length > 0 && (
                                        <>
                                          ชนิด:{" "}
                                          {item.details[2]?.type_name || "-"} |
                                          หวาน:{" "}
                                          {item.details[0]?.level_name || "-"} |
                                          ขนาด:{" "}
                                          {item.details[1]?.size_name || "-"}
                                        </>
                                      )}
                                      {item.add_ons.length > 0 && (
                                        <>
                                          {" "}
                                          | ท็อปปิ้ง :{" "}
                                          {item.add_ons.map((addOn, index) => (
                                            <span key={index}>
                                              {addOn.ingredient_name}
                                              {index < item.add_ons.length - 1
                                                ? ", "
                                                : ""}
                                            </span>
                                          ))}
                                        </>
                                      )}
                                    </span>
                                  </div>
                                )
                              )
                            )
                          ) : (
                            <p className="text-center mt-4">
                              ไม่มีสินค้าในคำสั่งซื้อ
                            </p>
                          )}
                        </div>
                        <div className="space-y-2 w-full pt-2 pb-2">
                          <CancelOrderButtonEm
                            order={order}
                            onSuccess={fetchOrders}
                          />
                        </div>
                      </div>
                    </div>
                  ))
              : null}
          </div>
        </div>
      </div>
      {checkSlipData && (
        <CheckSlip
          imageUrl={checkSlipData}
          onConfirm={handleConfirmSlip}
          total={totalAmountSlipData}
        />
      )}
      <PayWithCash
        isOpen={showPayWithCash}
        onClose={() => setShowPayWithCash(false)}
        totalAmount={cashPaymentData?.totalAmount || 0}
        onConfirm={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
      <LoadingPopup loading={loading} />
    </div>
  );
};

export default Order;
