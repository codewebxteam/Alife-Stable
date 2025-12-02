import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import "./index.css";

// Public
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/services";
import ContactUs from "./pages/ContactUs";
import Scroll from "./components/ScrollTop";
import Pricing from "./pages/Pricing";

// Partner Dashboard
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import DashboardTraining from "./pages/DashboardTraining";
import DashboardAgency from "./pages/DashboardAgency";
import Profile from "./pages/Profile";
import UpgradePlan from "./pages/UpgradePlan";
import UpdatePassword from "./pages/UpdatePassword";

// Admin Dashboard
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import StaffPerformance from "./pages/StaffPerformance";
import SalesOrders from "./pages/SalesOrders"; // NEW: Create this file
import AdminData from "./pages/AdminData"; // NEW: Create this file

// Staff Portal (NEW)
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";

const App = () => {
  return (
    <ReactLenis root>
      <Router>
        <Scroll />
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <div className="flex-grow">
                  <Home />
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/services"
            element={
              <>
                <Navbar />
                <div className="flex-grow">
                  <Services />
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/pricing"
            element={
              <>
                <Navbar />
                <div className="flex-grow">
                  <Pricing />
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Navbar />
                <div className="flex-grow">
                  <ContactUs />
                </div>
                <Footer />
              </>
            }
          />

          {/* PARTNER DASHBOARD ROUTES */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="training" element={<DashboardTraining />} />
            <Route path="agency" element={<DashboardAgency />} />
            <Route path="profile" element={<Profile />} />
            <Route path="plans" element={<UpgradePlan />} />
            <Route path="updatepassword" element={<UpdatePassword />} />
          </Route>

          {/* ADMIN DASHBOARD ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<SalesOrders />} />{" "}
            {/* Maps to "Sales & Orders" */}
            <Route path="staff" element={<StaffPerformance />} />
            <Route path="data" element={<AdminData />} /> {/* Maps to "Data" */}
          </Route>

          {/* STAFF PORTAL ROUTES */}
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Routes>
      </Router>
    </ReactLenis>
  );
};

export default App;
