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
import ServicesCatalog from "./pages/ServicesCatalog";

// Admin Dashboard
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import StaffPerformance from "./pages/StaffPerformance";
import SalesOrders from "./pages/SalesOrders";
import AdminData from "./pages/AdminData";
import ServicesPage from "./pages/ServicesPage";

// Staff Portal
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";

// --- FIXED IMPORT PATH ---
import AgencyTemplate from "./pages/AgencyTemplate";

// --- NEW: Sharing Functionality ---
// Updated to use the new Database-backed viewer
import SharedPortfolio from "./pages/SharedPortfolio";

const App = () => {
  // --- SUBDOMAIN DETECTION LOGIC (Internal) ---
  const getDetectedSubdomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    const isLocalhost = hostname.includes("localhost");

    if (isLocalhost && parts.length > 1) {
      return parts[0];
    } else if (!isLocalhost && parts.length > 2) {
      return parts[0];
    }
    return null;
  };

  const subdomain = getDetectedSubdomain();

  // --- FIXED: Subdomain view wrapped in Router to prevent Link errors ---
  if (subdomain && subdomain !== "www") {
    return (
      <ReactLenis root>
        <Router>
          <AgencyTemplate forcedSubdomain={subdomain} />
        </Router>
      </ReactLenis>
    );
  }

  // Normal flow (Dashboard & Main Website)
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

          {/* Path-based testing */}
          <Route path="/agency/:subdomain" element={<AgencyTemplate />} />

          {/* --- NEW: SHARE VIEW ROUTE --- */}
          {/* Updated to use :id to match Firestore Document ID */}
          <Route path="/view/:id" element={<SharedPortfolio />} />

          {/* PARTNER DASHBOARD ROUTES */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="training" element={<DashboardTraining />} />
            <Route path="agency" element={<DashboardAgency />} />
            <Route path="profile" element={<Profile />} />
            <Route path="plans" element={<UpgradePlan />} />
            <Route path="updatepassword" element={<UpdatePassword />} />
            <Route path="services" element={<ServicesCatalog />} />
          </Route>

          {/* ADMIN DASHBOARD ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<SalesOrders />} />
            <Route path="staff" element={<StaffPerformance />} />
            <Route path="data" element={<AdminData />} />
            <Route path="services" element={<ServicesPage />} />
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
