import { Outlet } from "react-router-dom";
import NavbarCustomer from "./Components/Customer/navBarCustomer";

function NavbarCustomerLayout() {
  return (
    <div className="border-white bg-white w-full">
      <NavbarCustomer />
      <div className="px-10 bg-white">
        <Outlet />
      </div>
    </div>
  );
}

export default NavbarCustomerLayout;
