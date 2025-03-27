import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineHome } from "react-icons/hi";
import { TbLogout } from "react-icons/tb";
import configureAPI from "../../Config/configureAPI";
import fetchApi from "../../Config/fetchApi";
import { useEffect } from "react";

const NavbarCustomer = () => {
  const navigate = useNavigate();

  const environment = process.env.NODE_ENV || "development";
  const URL = configureAPI[environment].URL;

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const ownerId = sessionStorage.getItem("owner_id");
  const branchId = sessionStorage.getItem("branch_id");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetchApi(`${URL}/branches/owner/${ownerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch branches");
        }
        const data = await response.json();
        setBranches(data);

        const matchedBranch = data.find(
          (branch) => branch.branch_id === Number(branchId)
        );

        if (matchedBranch) {
          setSelectedBranch(matchedBranch);
        } else {
          console.log("No matching branch found.");
        }
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranches();
  }, [URL, branchId, ownerId]);

  console.log("SELECT BRANCH", selectedBranch);

  return (
    <nav className="border-b border-[#2C586E] mb-4 dark:bg-[#2C586E] shadow-md w-full">
      <div className="flex items-center justify-between mx-auto p-4 bg-[#2C586E]">
        {/* Shop logo */}
        <a className="flex items-center space-y-2 ml-8">
          <svg
            width="60"
            height="48"
            viewBox="0 0 60 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex items-center"
          >
            <path
              d="M46 1.5C46 7.46737 44 13.5 41 17.4099C37 21.5 37 24 25.5222 24C14.0444 24 14 22.1151 9.61232 17.4099C5.22463 12.7047 5 7.96737 5 2H9C9 10.5 12.4388 14.5834 12.4388 14.5834C12.4388 14.5834 15.5222 20.0027 25.5222 20.0027C35.5222 20.0027 38 14.5834 38 14.5834C38 14.5834 41.4321 8.5 41.4321 1.5H46Z"
              fill="#2F2105"
            />
            <path
              d="M41.4596 9.5273C41.8656 10.8568 42.6895 12.02 43.8091 12.8441C44.9286 13.6682 46.2841 14.1094 47.6742 14.102C49.0643 14.0946 50.415 13.6391 51.5258 12.8032C52.6365 11.9673 53.4481 10.7954 53.84 9.46164C54.2319 8.12786 54.1832 6.70326 53.7012 5.39934C53.2192 4.09542 52.3296 2.98169 51.1643 2.2235C49.9991 1.46532 48.6205 1.1031 47.2331 1.19061C45.8457 1.27813 44.5235 1.81072 43.4628 2.70932L45.6146 5.24923C46.1289 4.81352 46.77 4.55529 47.4427 4.51285C48.1154 4.47042 48.7838 4.64605 49.3488 5.01367C49.9138 5.38129 50.3452 5.9213 50.5789 6.55354C50.8126 7.18577 50.8362 7.87651 50.6462 8.52322C50.4561 9.16993 50.0626 9.73813 49.5241 10.1434C48.9855 10.5488 48.3306 10.7696 47.6566 10.7732C46.9825 10.7768 46.3253 10.5629 45.7825 10.1633C45.2396 9.7637 44.8401 9.19972 44.6433 8.55506L41.4596 9.5273Z"
              fill="#2F2105"
            />
            <path
              d="M39 1.59495C39 5.94584 37.525 10.1185 34.8995 13.1951C32.274 16.2716 28.713 18 25 18C21.287 18 17.726 16.2716 15.1005 13.1951C12.475 10.1185 11 5.94584 11 1.59495C11 1.59495 19 5.18358 25 1.59495C31 -1.99369 39 1.59495 39 1.59495Z"
              fill="#F4AE26"
            />
            <rect x="6" y="27" width="47" height="3" rx="1.5" fill="#2F2105" />
          </svg>
          <span class="self-center text-3xl font-semibold whitespace-nowrap text-white">
            {" "}
            {selectedBranch ? (
              <p>
                {selectedBranch.branch_name} {selectedBranch.branch_address}
              </p>
            ) : (
              <p>สุขเสมอคาเฟ่</p>
            )}
          </span>
        </a>

        {/* menu list
        <div className="flex items-center space-x-6 w-auto">
          <button
            onClick={() => navigate("/role")}
            className="flex p-2 text-black hover:text-[#C68A47] transition-all duration-300"
          >
            <HiOutlineHome size={24} />
            <span className="text-xl font-bold">หน้าหลัก</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex p-2 text-black hover:text-red-600 transition-all duration-300"
          >
            <TbLogout size={24} />
            <span className="text-xl font-bold">ออกจากระบบ</span>
          </button>
        </div> */}
      </div>
    </nav>
  );
};

export default NavbarCustomer;
