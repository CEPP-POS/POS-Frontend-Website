import { Outlet } from "react-router-dom";
import Navbar from "./Components/General/navBar";

function NavbarLayout() {
  return (
    <div className="border-[#F5F5F5] w-full">
      <Navbar />
      <div className="px-10 border-[#F5F5F5]">
        <Outlet />
      </div>
    </div>
  );
}

export default NavbarLayout;
