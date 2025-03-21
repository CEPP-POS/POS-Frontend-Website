import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Owner/SetupShop/login";
import GuideLine from "./Pages/Owner/SetupShop/guideLine";
import ForgotPassword from "./Pages/Owner/SetupShop/forgotPassword/forgotPassword";
import MainMenu from "./Pages/Owner/SetupShop/mainMenu";
import AddProductForm from "./Pages/Owner/SetupShop/addProduct/addProductForm";
import EnterOTP from "./Pages/Owner/SetupShop/forgotPassword/enterOTP";
import EnterNewPassword from "./Pages/Owner/SetupShop/forgotPassword/enterNewpassword";
import ProductList from "./Pages/Owner/SetupShop/addProduct/productList";
import GroupList from "./Pages/Owner/SetupShop/addGroup/groupList";
import AddGroupForm from "./Pages/Owner/SetupShop/addGroup/addGroupForm";
import GroupMenu from "./Pages/Owner/SetupShop/addGroup/groupMenu";
import ChoiceList from "./Pages/Owner/SetupShop/addChioce/choiceList";
import ChoiceOptions from "./Pages/Owner/SetupShop/addChioce/choiceOption";
import GlassChoice from "./Pages/Owner/SetupShop/addChioce/glassChoice";
import TypeChoice from "./Pages/Owner/SetupShop/addChioce/typeChoice";
import ToppingChoice from "./Pages/Owner/SetupShop/addChioce/toppingChoice";
import SweetLevelChoice from "./Pages/Owner/SetupShop/addChioce/sweetLevelChoice";
import ChoiceMenu from "./Pages/Owner/SetupShop/addChioce/choiceMenu";
import StockList from "./Pages/Owner/SetupShop/addStock/stockList";
import AddStockForm from "./Pages/Owner/SetupShop/addStock/addStockForm";
import Order from "./Pages/Employee/main/order";
import Home from "./Pages/Owner/SaleSummary/OverView/home";
import SaleSummaryGraph from "./Pages/Owner/SaleSummary/SaleSummaryGraph/saleSummaryGraph";
import Stock from "./Pages/Owner/SaleSummary/Stock/stock";
import NotificationSummary from "./Pages/Owner/SaleSummary/NotificationSummary/notificationSummary";
import AddOwnerProduct from "./Pages/Owner/SaleSummary/Stock/addOwnerProduct";
import ProductDetail from "./Pages/Owner/SaleSummary/Stock/productDetail";
import CancelOrderSummary from "./Pages/Owner/SaleSummary/OrderSummary/cancelOrderSummary";
import Menu from "./Pages/Customer/OrderMenu/menu";
import MenuDetail from "./Pages/Customer/OrderMenu/menuDetail";
import OrderSummary from "./Pages/Owner/SaleSummary/OrderSummary/orderSummary";
import PaymentMethod from "./Pages/Customer/OrderSummary/paymentMethod";
import QueueSummary from "./Pages/Customer/OrderSummary/queueSummary";
import UserRole from "./Pages/Owner/SetupShop/userRole";
import OwnerMenu from "./Pages/Owner/SetupShop/ownerMenu";
import PauseSection from "./Pages/Employee/main/pauseSection";
import Summary from "./Pages/Customer/OrderSummary/orderSummary";
import PauseIngredient from "./Pages/Employee/main/pauseIngredient";
import NavbarLayout from "./NavbarLayout";
import PauseMenu from "./Pages/Employee/main/pauseMenu";
import NavbarCustomerLayout from "./NavbarCustomerLayout";
import NavbarEmployeeLayout from "./NavbarEmployeeLayout";
import CreateAccount from "./Pages/Owner/SetupShop/createAccount";
import Branch from "./Pages/Owner/SetupShop/branch";
import WebSocket from "ws";
import { WebSocketProvider } from "./webSocketContext";
import EditOwnerProduct from "./Pages/Owner/SaleSummary/Stock/editOwnerProduct";

function App() {
  return (
    <div style={{ backgroundColor: "#F5F5F5" }}>
      <WebSocketProvider>
        <Router>
          <Routes>
            {/* Routes without Navbar : login flow */}
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/enter-otp" element={<EnterOTP />} />
            <Route path="/enter-new-password" element={<EnterNewPassword />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/branch" element={<Branch />} />

            {/* Sale summary */}
            <Route path="/overview" element={<Home />} />
            <Route path="/order-summary" element={<OrderSummary />} />
            <Route path="/sale-summary-graph" element={<SaleSummaryGraph />} />
            <Route path="/stock" element={<Stock />} />
            <Route
              path="/notification-summary"
              element={<NotificationSummary />}
            />
            <Route path="/add-owner-product" element={<AddOwnerProduct />} />
            <Route path="/product-detail" element={<ProductDetail />} />
            <Route
              path="/cancel-order-summary"
              element={<CancelOrderSummary />}
            />
            <Route path="/edit-owner-product" element={<EditOwnerProduct />} />

            {/* Customer flow */}
            <Route element={<NavbarCustomerLayout />}>
              <Route path="/menu" element={<Menu />} />
              <Route path="/menu-detail" element={<MenuDetail />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/payment-method" element={<PaymentMethod />} />
              <Route path="/queue-summary" element={<QueueSummary />} />
            </Route>

            {/* Employee flow */}
            <Route element={<NavbarEmployeeLayout />}>
              <Route path="/order-list" element={<Order />} />
              <Route path="/pause-section" element={<PauseSection />} />
              <Route path="/pause-ingredient" element={<PauseIngredient />} />
              <Route path="/pause-menu" element={<PauseMenu />} />
            </Route>

            {/* Routes with Navbar : other flow*/}
            <Route element={<NavbarLayout />}>
              <Route path="/main-menu" element={<MainMenu />} />
              <Route path="/role" element={<UserRole />} />
              <Route path="/owner" element={<OwnerMenu />} />

              {/* Add product flow */}
              <Route path="/guideline" element={<GuideLine />} />
              <Route path="/add-product" element={<AddProductForm />} />
              <Route path="/product-list" element={<ProductList />} />

              {/* Add group flow */}
              <Route path="/group-list" element={<GroupList />} />
              <Route path="/add-group" element={<AddGroupForm />} />
              <Route path="/group-menu" element={<GroupMenu />} />

              {/* Add choice flow */}
              <Route path="/choice-list" element={<ChoiceList />} />
              <Route path="/choice-option" element={<ChoiceOptions />} />
              <Route path="/glass-choice" element={<GlassChoice />} />
              <Route path="/topping-choice" element={<ToppingChoice />} />
              <Route path="/type-choice" element={<TypeChoice />} />
              <Route
                path="/sweet-level-choice"
                element={<SweetLevelChoice />}
              />
              <Route path="/choice-menu" element={<ChoiceMenu />} />

              {/* Add stock flow */}
              <Route path="/stock-list" element={<StockList />} />
              <Route path="/add-stock" element={<AddStockForm />} />
            </Route>
          </Routes>
        </Router>
      </WebSocketProvider>
    </div>
  );
}

export default App;
