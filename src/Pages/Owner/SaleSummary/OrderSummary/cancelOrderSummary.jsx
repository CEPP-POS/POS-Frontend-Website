import React, { useState } from "react";
import { useEffect } from "react";
import SideBar from "../../../../Components/Owner/sideBar";
import CalendarSelect from "../../../../Components/Owner/calendarSelect";
import PaymentMethodFilter from "../../../../Components/Owner/paymentMethodFilter";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const CancelOrderSummary = () => {
  const navigate = useNavigate();
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;
  const MySwal = withReactContent(Swal);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [cancelOrderData, setCancelOrderData] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("");

  const today = new Date();
  const options = {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formattedDate = today.toLocaleDateString("en-CA", options);
  const [selectedDate, setSelectedDate] = useState(formattedDate);
  useEffect(() => {
    const fetchOrderData = async (selectedDate) => {
      try {
        const response = await fetchApi(
          `${URL}/owner/stock-cancel-orders`,
          "GET"
        );
        const data = await response.json();

        const formattedData = data.map((order) => {
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

        setCancelOrderData(formattedData);
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    fetchOrderData(selectedDate);
  }, [selectedDate]);

  // fetch select order
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await fetchApi(
          `${URL}/owner/orders/${selectedOrder}`,
          "GET"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setSelectedOrderData(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };
    fetchOrderDetail();
  }, [selectedOrder, isEditModalOpen]);

  useEffect(() => {
    if (selectedOrderData && isEditModalOpen) {
      setSelectedStatus(selectedOrderData.cancel_status || "");
    }
  }, [selectedOrderData, isEditModalOpen]);

  console.log("CANCEL ORDER DATA:", cancelOrderData);
  console.log("SELECT ORDER DATA:", selectedOrderData);
  console.log("SELECT ORDER:", selectedOrder);

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrderData(null);
    setIsEditModalOpen(false);
    setSelectedStatus(false);
  };

  const openEditModal = (e) => {
    e.stopPropagation();
    setSelectedStatus(selectedOrder.status);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async () => {
    const url = `${URL}/owner/orders/${selectedOrder}`;
    const data = {
      cancel_status: selectedStatus,
    };

    try {
      const response = await fetchApi(url, "PATCH", data);

      console.log("SEND DATA:", data);

      if (response.ok) {
        setIsEditModalOpen(false);
        MySwal.fire({
          icon: "success",
          title: "แก้ไขสถานะสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        });
        console.log("Order status updated successfully");
      } else {
        console.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBack = () => {
    navigate("/order-summary");
  };

  // Filter orders based on payment method
  const filteredOrders = cancelOrderData
    ? cancelOrderData.filter((order) => {
        if (!paymentFilter) return true;
        return order.payment_method === paymentFilter;
      })
    : [];

  return (
    <div className="h-screen-website bg-[#F5F5F5]">
      <SideBar menuTab={"orderSummary"} />
      <div className="px-10 bg-[#F5F5F5] mb-40">
        <h1 className="font-bold text-3xl mt-[40px]">ออเดอร์ทั้งหมด</h1>
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <span className="font-bold text-xl mt-4">ออเดอร์ที่ถูกยกเลิก</span>
          </span>
        </div>

        <PaymentMethodFilter
          onFilterChange={(filter) => setPaymentFilter(filter)}
        />

        {/* Table Section */}
        <div className="overflow-x-auto border rounded-lg p-5 pb-24">
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
                  ราคาทั้งหมด
                </th>
                <th className="pr-5 py-2 text-center border-b border-[#000000]">
                  ช่องทางการชำระเงิน
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((item) => (
                <tr
                  key={item.order_id}
                  onClick={() => handleRowClick(item.order_id)}
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
                    {item.amount} บาท
                  </td>
                  <td className="py-3 flex justify-center text-center border-b border-[#F1F4F7]">
                    <div className="border-x px-2 border border-[#70AB8E] text-[#70AB8E] rounded-full">
                      {item.payment_method === "cash" ? "เงินสด" : "QR Code"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        {selectedOrderData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
            <div className="bg-[#F5F5F5] p-10 rounded-lg shadow-lg w-[1024px] overflow-y-auto">
              <div className="flex justify-end items-center">
                <button
                  className="text-gray-500 hover:text-[#DD9F52] "
                  onClick={closeModal}
                >
                  <IoMdClose size={28} />
                </button>
              </div>
              <div className="flex justify-center">
                <h2 className="text-3xl font-bold mb-4">ออเดอร์ที่ถูกยกเลิก</h2>
              </div>
              <p>
                <strong>หมายเลขออเดอร์ {selectedOrder}</strong>
              </p>
              {/* Table Section */}
              <div className="overflow-x-auto border rounded-lg p-2 mt-2">
                <table className="border-collapse table-auto w-full">
                  <thead>
                    <tr>
                      <th className="py-2 text-center border-b border-[#000000]">
                        รายการสินค้า
                      </th>
                      <th className="py-2 text-center border-b border-[#000000]">
                        จำนวน
                      </th>
                      <th className="px-1 py-2 border-b border-[#000000]">
                        ราคา
                      </th>
                      <th className="pr-5 py-2 text-center border-b border-[#000000]">
                        หมวดหมู่
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderData &&
                    Array.isArray(selectedOrderData.order_table) ? (
                      selectedOrderData.order_table.map((item, index) => (
                        <tr
                          key={index}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          <td className="text-center border-b border-[#F1F4F7]">
                            {item.menu_name}
                          </td>
                          <td className="py-2 text-center border-b border-[#F1F4F7]">
                            {item.quantity}
                          </td>
                          <td className="py-2 text-center border-b border-[#F1F4F7]">
                            {item.amount} บาท
                          </td>
                          <td className="py-2 flex justify-center text-center border-b border-[#F1F4F7]">
                            <div className="border border-[#70AB8E] text-[#70AB8E] rounded-full w-24">
                              {item.category_name === "null"
                                ? item.category_name
                                : "ไม่มีกลุ่ม"}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-4 text-gray-500"
                        >
                          ไม่มีข้อมูล
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-6">
                <p className="col-span-1 font-bold">เวลาที่สั่งซื้อ </p>
                <p className="col-span-3">
                  {" "}
                  {new Intl.DateTimeFormat("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "Asia/Bangkok",
                  }).format(new Date(selectedOrderData.order_date))}{" "}
                  น.
                </p>
                <p className="col-span-1 font-bold">ราคาทั้งหมด</p>
                <p className="col-span-3">
                  {selectedOrderData.total_amount} บาท
                </p>
                <p className="col-span-1 font-bold">ช่องทางการชำระเงิน </p>
                <p className="col-span-3">
                  {selectedOrderData.payment_method === "cash"
                    ? "เงินสด"
                    : "QR Code"}
                </p>
                <div className="col-span-1 flex">
                  <p className="font-bold">สถานะ </p>
                  <div className="px-2">
                    <button
                      className="border border-[#DD9F52] text-[#DD9F52] rounded-full px-2 hover:bg-[#DD9F52] hover:text-white"
                      onClick={openEditModal}
                    >
                      แก้ไข
                    </button>
                  </div>
                </div>
                <p className="col-span-3 border-x px-2 w-[160px] border border-[#70AB8E] text-[#70AB8E] rounded-full flex items-center justify-center">
                  {selectedOrderData.cancel_status}
                </p>
                <p className="col-span-1 font-bold">ช่องทางการติดต่อลูกค้า </p>
                <p className="col-span-3">
                  <td>
                    {selectedOrderData.customer_contact
                      ? selectedOrderData.customer_contact
                      : "-"}
                  </td>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Status Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#F5F5F5] p-10 rounded-lg shadow-lg w-[600px]">
              <h2 className="text-3xl font-bold mb-4 text-center">สถานะ</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pending"
                    name="status"
                    value="ยังไม่คืนเงิน"
                    checked={selectedStatus === "ยังไม่คืนเงิน"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="pending">ยังไม่คืนเงิน</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="completed"
                    name="status"
                    value="คืนเงินเสร็จสิ้น"
                    checked={selectedStatus === "คืนเงินเสร็จสิ้น"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="completed">คืนเงินเสร็จสิ้น</label>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  className="w-32 py-1 border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  ย้อนกลับ
                </button>
                <button
                  className="w-32 py-1 bg-[#DD9F52] text-white rounded-full hover:bg-[#c4a27c] transition-colors"
                  onClick={handleStatusChange}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex fixed bottom-0 left-0 px-4 py-4 pb-4 w-full space-x-8 justify-between bg-[#F5F5F5]">
        <button
          className="px-14 py-4 w-[300px] border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
          onClick={handleBack}
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
    // </div>
  );
};

export default CancelOrderSummary;
