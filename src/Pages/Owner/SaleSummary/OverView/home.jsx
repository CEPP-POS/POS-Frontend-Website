import React, { useState, useEffect } from "react";
import CalendarSelect from "../../../../Components/Owner/calendarSelect";
import IncomeOrderCancel from "../../../../Components/Owner/incomeOrderCancel";
import BarChart from "../../../../Components/Owner/barChart";
import PieChart from "../../../../Components/Owner/pieChart";
import SideBar from "../../../../Components/Owner/sideBar";
import fetchApi from "../../../../Config/fetchApi";
import configureAPI from "../../../../Config/configureAPI";

const Home = () => {
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
  const formattedDate = today.toLocaleDateString("en-CA", options);
  const [selectedDate, setSelectedDate] = useState(formattedDate);
  const [data, setData] = useState(null);

  console.log("SELECTED DATE", selectedDate);

  const fetchData = async (selectedDate) => {
    try {
      const response = await fetchApi(
        `${URL}/owner/stock-summary/${selectedDate}`,
        "GET"
      );

      if (response.ok) {
        const result = await response.json();
        setData(result); // Set the fetched data
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    console.log("Fetching data for:", selectedDate);
    fetchData(selectedDate);
  }, [selectedDate]);

  return (
    <div className="h-screen-website bg-[#F5F5F5]">
      <SideBar menuTab={"overview"} />
      <div className="ml-8 mr-8">
        <h1 className="font-bold text-3xl">ภาพรวมการขาย</h1>
        <span className="flex justify-end">
          <CalendarSelect setSelectedDate={setSelectedDate} />
        </span>
        <IncomeOrderCancel data={data} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
          <div className="bg-[#F5F5F5] p-4 border rounded-lg col-span-2">
            <h2 className="text-xl font-semibold mb-2">
              กราฟสรุปรายรับประจำเดือน
            </h2>
            <BarChart monthlyRevenue={data?.monthly_revenue} />
          </div>
          <div className="bg-[#F5F5F5] p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">เมนูขายดีประจำวันนี้</h2>
            <PieChart topThree={data?.top_three} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
