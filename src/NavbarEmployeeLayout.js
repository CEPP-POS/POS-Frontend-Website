import { Outlet } from "react-router-dom";
import Navbar from "./Components/General/navBar";

function NavbarEmployeeLayout() {
  return (
    <div className="w-full">
      <Navbar />
      <div className="px-4 bg-[#F5F5F5]">
        <Outlet />
      </div>
    </div>
  );
}

export default NavbarEmployeeLayout;
