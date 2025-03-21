import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
ChartJS.defaults.font.family = "Noto Sans Thai";
ChartJS.defaults.font.size = 16;
ChartJS.defaults.color = "black";

const BarChart = ({ monthlyRevenue }) => {
  const data = {
    labels: [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ],
    datasets: [
      {
        label: "รายรับทั้งหมด",
        data: monthlyRevenue, // Monthly data
        backgroundColor: "#A3C4DC", // Light blue color
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom", // Move the legend to the bottom
        labels: {
          usePointStyle: true, // Makes the marker a square or circle
          pointStyle: "rectRounded", // Use a square-like style
          padding: 5, // Padding around the legend items
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Turn off the grid on the x-axis
        },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 100 },
        grid: {
          display: false, // Turn off the grid on the x-axis
        },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
