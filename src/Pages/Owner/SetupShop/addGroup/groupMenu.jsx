import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import configureAPI from "../../../../Config/configureAPI";
import fetchApi from "../../../../Config/fetchApi";

const GroupMenu = () => {
  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const location = useLocation();
  const navigate = useNavigate();
  const { groupName, categoryId } = location.state || {};

  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const fetchMenus = async () => {
      if (!categoryId) {
        console.error("No category ID provided");
        return;
      }

      try {
        const ownerId = sessionStorage.getItem("owner_id");
        const branchId = sessionStorage.getItem("branch_id");

        const response = await fetch(
          `${URL}/owner/categories/${categoryId}/menus`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              owner_id: ownerId,
              branch_id: branchId,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMenus(data);
        } else {
          console.error("Failed to fetch menus");
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };

    fetchMenus();
  }, [URL, categoryId]);

  const handleBack = () => {
    navigate("/group-list");
  };

  return (
    <div className="flex flex-col items-center bg-[#F5F5F5] mt-[40px] h-screen-navbar">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">กลุ่มรายการสินค้า</h1>
        <div className="w-20 h-1 bg-[#DD9F52] my-6"></div>
      </div>

      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          สรุปกลุ่มรายการสินค้า
          <span className="text-[#DD9F52] ml-2">{groupName}</span>
        </h1>
      </div>

      <div className="w-full px-16">
        <label className="text-2xl w-full text-start font-bold block mb-4">
          เมนูทั้งหมดในหมวดหมู่
        </label>

        {menus.length > 0 ? (
          <div className="w-full grid grid-cols-3 gap-4 mb-8">
            {menus.map((menuName, index) => (
              <div key={index} className="flex items-center space-x-2 p-2">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="form-checkbox h-5 w-5 accent-[#DD9F52]"
                />
                <span className="text-xl">{menuName}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            ไม่พบรายการเมนูในหมวดหมู่นี้
          </p>
        )}
      </div>

      <div className="flex fixed bottom-4 left-0 px-4 py-4 mt-8 w-full space-x-8 justify-between">
        <button
          className="px-14 py-4 w-[300px] border rounded-full text-[#DD9F52] border-[#DD9F52] hover:bg-[#f5e9dc] transition-colors font-bold"
          onClick={handleBack}
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
};

export default GroupMenu;
