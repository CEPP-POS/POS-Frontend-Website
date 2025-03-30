import React, { useState, useEffect } from "react";
import SideBar from "../../../../Components/Owner/sideBar";
import CalendarSelect from "../../../../Components/Owner/calendarSelect";
import IncomeOrderCancel from "../../../../Components/Owner/incomeOrderCancel";
import LineChart from "../../../../Components/Owner/lineChart";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";
import LoadingPopup from "../../../../Components/General/loadingPopup";

const SaleSummaryGraph = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch sales data based on the selected year and month
  const fetchSalesData = async (year, month) => {
    setLoading(true); // Start loading
    try {
      const response = await fetchApi(
        `${URL}/owner/stock-sale/${year}/${month}`,
        "GET"
      );

      if (response.ok) {
        const result = await response.json();
        setData(result); // Set the fetched data
      } else {
        console.error("Failed to fetch sales data");
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false); // Stop loading after fetch
    }
  };

  // Fetch data when the selected date changes
  useEffect(() => {
    const [year, month] = selectedDate.split("-");
    fetchSalesData(year, month);
  }, [selectedDate]);

  return (
    <div className="h-screen-website flex flex-col bg-[#F5F5F5]">
      <SideBar menuTab={"saleSummaryGraph"} />
      <div className="ml-8 mr-8">
        <h1 className="font-bold text-3xl">ภาพรวมยอดขายรายเดือน</h1>
        <span className="flex justify-end">
          <CalendarSelect setSelectedDate={setSelectedDate} />
        </span>
        <IncomeOrderCancel data={data} />
        <div className="mt-3 flex-1">
          {/* Line Chart Section */}
          <div className="bg-[#F5F5F5] p-4 border rounded-lg flex flex-col">
            <h2 className="text-xl text-center font-semibold mb-2 ">
              กราฟสรุปรายรับประจำเดือน
            </h2>
            <div className="flex-1">
              <LineChart dailyStats={data?.daily_stats} />
            </div>
          </div>
        </div>
      </div>
      {loading ? <LoadingPopup /> : null}
    </div>
  );
};

export default SaleSummaryGraph;
