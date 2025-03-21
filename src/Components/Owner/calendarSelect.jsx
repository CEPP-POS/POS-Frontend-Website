import React, { useState } from "react";
import { CiCalendar } from "react-icons/ci";
import {
  IoIosArrowDown,
  IoIosArrowBack,
  IoIosArrowForward,
} from "react-icons/io";

const CalendarSelect = ({ setSelectedDate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const options = {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formattedDate = today.toLocaleDateString("en-CA", options); // Format as YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState(
    today.toLocaleString("th-TH", { month: "long", timeZone: "Asia/Bangkok" })
  );

  const [selectedYear, setSelectedYear] = useState(today.getFullYear() + 543);

  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [isYearSelector, setIsYearSelector] = useState(false);

  // List of months
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

  const years = Array.from({ length: 10 }, (_, i) => 2560 + i);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Function to toggle modal visibility
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Function to handle clicks outside the modal
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      setIsModalOpen(false);
    }
  };

  const handleDateSelect = () => {
    const monthIndex = months.indexOf(selectedMonth) + 1; // Get month index (1-12)
    const formattedDate = `${selectedYear}-${monthIndex
      .toString()
      .padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`; // Format date as YYYY-MM-DD
    setSelectedDate(formattedDate); // Set the selected date in parent component
    toggleModal(); // Close the modal
  };

  return (
    <div>
      <button
        type="button"
        className="text-[#DD9F52] bg-white border border-[#DD9F52] focus:outline-none hover:bg-[#f5e9dc] transition-colors font-medium rounded-full text-2xl px-1 py-0.2 mb-2"
        onClick={toggleModal}
      >
        <div className="flex justify-center items-center">
          <CiCalendar size={36} />
          <span className="pl-1 pr-1">{`${selectedDay} ${selectedMonth} พ.ศ. ${selectedYear}`}</span>
          <span className="pt-0.5">
            <IoIosArrowDown size={36} />
          </span>
        </div>
      </button>

      {/* Modal Popup */}
      {isModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOutsideClick} // Close modal when clicking outside
        >
          <div
            className="bg-white p-6 rounded-lg w-[685px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-2xl">เลือกวัน</span>
              </div>
              <ul className="grid grid-cols-7 gap-2">
                {days.map((day) => (
                  <li
                    key={day}
                    className={`px-4 py-1 cursor-pointer text-center ${
                      selectedDay === day
                        ? "bg-[#DD9F52] rounded-full text-white"
                        : "hover:bg-[#F1EBE1] hover:rounded-full"
                    }`}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center mb-4 mt-4">
              <button
                type="button"
                className="font-bold"
                onClick={() => setIsYearSelector(true)}
              >
                <div className="flex">
                  <span className="pl-1 pr-1 text-[#737373] hover:text-gray-700">
                    {selectedYear}
                  </span>
                  <span className="pt-0.5 text-[#CCCCCC] hover:text-gray-700">
                    <IoIosArrowDown size={24} />
                  </span>
                </div>
              </button>
              <div>
                <button
                  className="text-xl font-bold text-[#CCCCCC] hover:text-gray-700"
                  onClick={() => setSelectedYear((prev) => prev - 1)}
                >
                  <IoIosArrowBack />
                </button>
                <button
                  className="text-xl font-bold text-[#CCCCCC] hover:text-gray-700"
                  onClick={() => setSelectedYear((prev) => prev + 1)}
                >
                  <IoIosArrowForward />
                </button>
              </div>
            </div>

            {isYearSelector ? (
              // Year Selector Mode
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-2xl">เลือกปี</span>
                  <button
                    onClick={() => setIsYearSelector(false)}
                    className="text-[#DD9F52] hover:text-gray-700 font-medium"
                  >
                    กลับไปเลือกเดือน
                  </button>
                </div>
                <ul className="grid grid-cols-3 gap-4 max-h-48 overflow-y-auto">
                  {years.map((year) => (
                    <li
                      key={year}
                      className={`px-4 py-1 cursor-pointer text-center ${
                        selectedYear === year
                          ? "bg-[#DD9F52] rounded-full text-white"
                          : "hover:bg-[#F1EBE1] hover:rounded-full"
                      }`}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsYearSelector(false); // Go back to Month Selector Mode after selecting a year
                      }}
                    >
                      {year}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              // Month Selector Mode
              <div>
                <div className="flex justify-between items-center mb-4">
                  <button
                    type="button"
                    className="font-bold"
                    onClick={() => setIsYearSelector(true)}
                  >
                    <div className="flex">
                      <span className="pl-1 pr-1 text-[#737373] hover:text-gray-700">
                        {selectedYear}
                      </span>
                      <span className="pt-0.5 text-[#CCCCCC] hover:text-gray-700">
                        <IoIosArrowDown size={24} />
                      </span>
                    </div>
                  </button>
                  <div>
                    <button
                      className="text-xl font-bold text-[#CCCCCC] hover:text-gray-700"
                      onClick={() => setSelectedYear((prev) => prev - 1)}
                    >
                      <IoIosArrowBack />
                    </button>
                    <button
                      className="text-xl font-bold text-[#CCCCCC] hover:text-gray-700"
                      onClick={() => setSelectedYear((prev) => prev + 1)}
                    >
                      <IoIosArrowForward />
                    </button>
                  </div>
                </div>

                <ul className="grid grid-cols-3 gap-4">
                  {months.map((month) => (
                    <li
                      key={month}
                      className={`px-4 py-1 cursor-pointer text-center ${
                        selectedMonth === month
                          ? "bg-[#DD9F52] rounded-full text-white"
                          : "hover:bg-[#F1EBE1] hover:rounded-full"
                      }`}
                      onClick={() => {
                        setSelectedMonth(month);
                        handleDateSelect(); // Call to set the date
                      }}
                    >
                      {month}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="text-[#DD9F52] mt-6 bg-white border border-[#DD9F52] focus:outline-none hover:bg-[#DD9F52] hover:text-white focus:ring-4 focus:ring-gray-100 font-medium rounded-full px-8 py-2 mb-2"
              onClick={toggleModal}
            >
              <div className="flex items-center justify-center">
                <span className="px-4 font-bold text-2xl">ย้อนกลับ</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSelect;
