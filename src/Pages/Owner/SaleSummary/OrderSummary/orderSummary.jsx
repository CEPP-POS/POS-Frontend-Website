import React, { useState, useEffect } from "react";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import SideBar from "../../../../Components/Owner/sideBar";
import CalendarSelect from "../../../../Components/Owner/calendarSelect";
import OrderAndCancelCard from "../../../../Components/Owner/orderAndCancelCard";
import PaymentMethodFilter from "../../../../Components/Owner/paymentMethodFilter";
import ThaiVirtualKeyboardInput from "../../../../Components/Common/ThaiVirtualKeyboardInput";
import CheckSlip from "../../../../Components/Employee/checkSlip";

const OrderSummary = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const timeRangeFilter = ["ทั้งหมด", "รายปี", "รายเดือน", "รายวัน"];
  const [selectedTimeRange, setSelectedTimeRange] = useState("ทั้งหมด");
  const [orderData, setOrderData] = useState([]);

  // Set default date to today's date in the format YYYY-MM-DD
  const today = new Date();
  const options = {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formattedDate = today.toLocaleDateString("en-CA", options); // Format as YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(formattedDate);

  // Add these state variables
  const [slipModalVisible, setSlipModalVisible] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState("");

  const handleTimeRangeClick = (timeRange) => {
    setSelectedTimeRange(timeRange);
  };

  // Function to fetch order data based on the selected date
  const fetchOrderData = async (selectedDate) => {
    try {
      const response = await fetchApi(
        `${URL}/owner/stock-orders/${selectedDate}`
      );
      const data = await response.json();
      console.log("API Response Data:", data);

      const { total_orders, canceled_orders, order_topic } = data;

      const orders = Array.isArray(order_topic) ? order_topic : [order_topic];

      const formattedData = orders.map((order) => {
        const orderDate = new Date(order.order_date);
        const thaiTime = orderDate.toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
          hour12: false,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          ...order,
          order_date: thaiTime,
        };
      });

      setOrderData({
        total_orders,
        canceled_orders,
        order_topic: formattedData,
      });
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  // Fetch data when the component mounts or when the selected date changes
  useEffect(() => {
    fetchOrderData(selectedDate);
  }, [selectedDate]);

  // Add this function to handle viewing the slip
  const handleViewSlip = (slipUrl) => {
    setSelectedSlip(slipUrl);
    setSlipModalVisible(true);
  };

  const handleConfirmSlip = () => {
    // Fetch order data again after confirming the slip
    fetchOrderData();
  };

  // Add this function to close the slip modal
  const closeSlipModal = () => {
    setSlipModalVisible(false);
    setSelectedSlip(null);
  };

  const [searchQuery, setSearchQuery] = useState("");

  // Filter orders based on payment method
  const filteredOrders = orderData.order_topic
    ? orderData.order_topic.filter((order) => {
        if (!paymentFilter) return true;
        return order.payment_method === paymentFilter;
      })
    : [];

  return (
    <div className="h-screen-website bg-[#F5F5F5]">
      <SideBar menuTab={"orderSummary"} />
      <div className="px-10">
        <h1 className="font-bold text-3xl mt-[40px]">ออเดอร์ทั้งหมด</h1>
        <span className="flex justify-end">
          <CalendarSelect setSelectedDate={setSelectedDate} />
        </span>
        <ThaiVirtualKeyboardInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="ค้นหาออเดอร์..."
          className="w-full border border-[#DD9F52] bg-[#F5F5F5] rounded-full p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brown-400 mb-4"
        />
        <OrderAndCancelCard
          total_orders={orderData.total_orders}
          canceled_orders={orderData.canceled_orders}
        />
        <PaymentMethodFilter
          onFilterChange={(filter) => setPaymentFilter(filter)}
        />

        {/* Table Section */}
        <div className="overflow-x-auto border rounded-lg p-5">
          <div>
            <div className="my-3">
              <div className="flex justify-between items-center space-x-4">
                <div>รายการออเดอร์</div>
                <div>
                  {/* timeRange Section */}
                  {timeRangeFilter.map((timeRange, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeRangeClick(timeRange)}
                      className={`px-4 py-1 ${
                        selectedTimeRange === timeRange
                          ? "bg-[#DD9F52] text-white rounded-full border"
                          : "bg-[#F5F5F5] border-[#DD9F52]"
                      }`}
                    >
                      {timeRange}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <table className="border-collapse table-auto w-full">
            <thead>
              <tr>
                <th className="py-2 pr-5 text-center border-b border-[#000000]">
                  หมายเลขออเดอร์
                </th>
                <th className="py-2 text-center border-b border-[#000000]">
                  เวลาที่สั่งซื้อ
                </th>
                <th className="px-1 py-2 border-b border-[#000000]">จำนวน</th>
                <th className="pl-10 py-2 border-b border-[#000000]">
                  ราคาสุทธิ
                </th>
                <th className="pr-5 py-2 text-center border-b border-[#000000]">
                  ช่องทางการชำระเงิน
                </th>
                <th className="py-2 text-center border-b border-[#000000]">
                  ใบเสร็จ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((item) => (
                  <tr
                    key={item.order_id}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <td className="pr-5 text-center border-b border-[#F1F4F7]">
                      {item.order_id}
                    </td>
                    <td className="py-2 text-center border-b border-[#F1F4F7]">
                      {item.order_date} น.
                    </td>
                    <td className="py-2 text-center border-b border-[#F1F4F7]">
                      {item.quantity}
                    </td>
                    <td className="py-2 pl-10 text-center border-b border-[#F1F4F7]">
                      {item.total_amount}
                    </td>
                    <td className="py-2 flex justify-center text-center border-b border-[#F1F4F7]">
                      <div className="border-x px-2 border border-[#70AB8E] text-[#70AB8E] rounded-full">
                        {item.payment_method === "cash" ? "เงินสด" : "QR Code"}
                      </div>
                    </td>
                    <td className="py-2 text-center border-b border-[#F1F4F7]">
                      {item.image_url ? (
                        <button
                          onClick={() => handleViewSlip(item.image_url)}
                          className="text-[#DD9F52] bg-[#F5F5F5]  focus:outline-none hover:bg-[#DD9F52] hover:text-white focus:ring-4 focus:ring-gray-100 font-medium rounded-full px-4 py-1"
                        >
                          ดูใบเสร็จโอนเงิน
                        </button>
                      ) : (
                        <span className="text-gray-400">ไม่มีใบเสร็จ</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    ยังไม่มีรายการคำสั่งซื้อในขณะนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal */}
      {slipModalVisible && selectedSlip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={closeSlipModal}
              className="absolute top-4 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="mb-10 justify-center">
              <h1 className="text-2xl font-bold text-left">
                ใบเสร็จการโอนเงิน
              </h1>
              <div className="w-20 h-1 bg-[#DD9F52] my-4"></div>
            </div>

            {/* Image Section */}
            <div className="flex justify-center">
              <img
                src={`${URL}/${selectedSlip.replace(/\\/g, "/")}`}
                alt="Payment Slip"
                className="max-h-[70vh] object-contain rounded-md border border-gray-200 shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
