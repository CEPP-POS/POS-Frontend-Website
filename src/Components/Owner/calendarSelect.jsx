import React, { useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";

const CalendarSelect = ({ setSelectedDate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const options = {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formattedDate = today.toLocaleDateString("en-CA", options);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() + i);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedMonth, selectedYear) },
    (_, i) => i + 1
  );

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleDateSelect = (day) => {
    const formattedDate = `${selectedYear}-${(selectedMonth + 1)
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    console.log("formattedDate:", formattedDate);
    setSelectedDate(formattedDate);
    toggleModal();
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        className="text-[#DD9F52] text-xl bg-[#F5F5F5] border border-[#DD9F52] rounded-full px-4 py-2 flex items-center"
        onClick={toggleModal}
      >
        <div className="flex items-center">
          <CiCalendar size={36} />
          <span className="pl-2">{`${selectedDay} ${
            months[selectedMonth]
          } พ.ศ. ${selectedYear + 543}`}</span>
        </div>
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300"
          onClick={toggleModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-2xl w-[350px] md:w-[400px] transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center border-b border-[#DD9F52] pb-2 mb-4">
                <h2 className="text-xl font-semibold text-black">
                  เลือกวันที่
                </h2>
                <button
                  className="text-black hover:text-[#DD9F52] "
                  onClick={toggleModal}
                >
                  <IoMdClose size={20} />
                </button>
              </div>

              <div className="flex justify-between mb-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="border rounded-full px-2 py-2 text-gray-700"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border rounded-full px-2 py-2 text-gray-700"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year + 543}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  className={`px-2 py-2 text-center rounded-full ${
                    selectedDay === day
                      ? "bg-[#DD9F52] text-white"
                      : "hover:bg-[#F1EBE1]"
                  }`}
                  onClick={() => {
                    setSelectedDay(day);
                    handleDateSelect(day);
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSelect;
