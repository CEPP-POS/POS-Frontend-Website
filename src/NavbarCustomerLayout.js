import { Outlet } from "react-router-dom";
import NavbarCustomer from "./Components/Customer/navBarCustomer";

function NavbarCustomerLayout() {
  return (
    <div className="border-[#F5F5F5] w-full">
      <NavbarCustomer />
      <div className="px-10 border-[#F5F5F5]">
        <Outlet />
      </div>
    </div>
  );
}

export default NavbarCustomerLayout;
