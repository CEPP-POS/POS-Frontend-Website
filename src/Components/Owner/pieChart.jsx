import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ topThree }) => {
  // Check if topThree is defined and has data

  console.log("TOP THREE", topThree);

  const data = {
    labels: topThree ? topThree.map((item) => item.menu_name) : [],
    datasets: [
      {
        data: topThree ? topThree.map((item) => item.quantity) : [],
        backgroundColor: ["#D49148", "#A3C4DC", "#E4D5A6"],
        hoverOffset: 4,
      },
    ],
  };

  console.log("DATA", data);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.label}: ${tooltipItem.raw} แก้ว`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full" style={{ height: "180px" }}>
      {" "}
      {/* Adjust the height here */}
      <Pie data={data} options={options} />
      <CustomLegend data={data} />
    </div>
  );
};

const CustomLegend = ({ data }) => {
  return (
    <div
      style={{
        display: "inline",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0px",
      }}
    >
      {data.labels.map((label, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "15px",
              height: "15px",
              backgroundColor: data.datasets[0].backgroundColor[i],
              borderRadius: "4px",
              marginRight: "8px",
            }}
          />
          <span style={{ marginRight: "auto" }}>{label}</span>
          <span style={{ fontWeight: "bold", textAlign: "right" }}>
            {data.datasets[0].data[i]} แก้ว
          </span>
        </div>
      ))}
    </div>
  );
};

export default PieChart;
