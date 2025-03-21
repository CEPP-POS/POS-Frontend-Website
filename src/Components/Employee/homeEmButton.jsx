import React from "react";
import { IoMdHome } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const HomeEmButton = () => {
  const navigate = useNavigate();
  const handleHomeButton = () => {
    navigate("/order-list");
  };
  return (
    <>
      <button
        onClick={handleHomeButton}
        className="bg-[#EFEFEF] text-[#AD8B73] hover:bg-[#AD8B73] hover:text-[#EFEFEF] rounded-md p-1 shadow-md"
      >
        <IoMdHome size={32} />
      </button>
    </>
  );
};

export default HomeEmButton;
