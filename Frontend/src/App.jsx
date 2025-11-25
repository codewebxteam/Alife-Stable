 import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


// Public Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/services";
import ContactUs from "./pages/ContactUs";
import Scroll from "./components/ScrollTop"
<<<<<<< HEAD
import PaymentSuccess from "./components/PaymentSuccess";
=======
import Pricing from "./pages/Pricing";   // <-- NEW IMPORT
>>>>>>> a3098be8fa65e7f58680de51097c0bc4bb64e125


// Dashboard Components
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import DashboardTraining from "./pages/DashboardTraining";
import DashboardAgency from "./pages/DashboardAgency";
import Profile from "./pages/Profile"; 
import UpgradePlan from "./pages/UpgradePlan";
import UpdatePassword from "./pages/UpdatePassword";


const App = () => {
  return (
    <Router>
      <Scroll />
      <Routes>
        {/* PUBLIC ROUTES (With Public Navbar & Footer) */}
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

        {/* DASHBOARD ROUTES (Protected Layout) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="training" element={<DashboardTraining />} />
          <Route path="agency" element={<DashboardAgency />} />
          {/* Added Profile Route: Accessible at /dashboard/profile */}
          <Route path="profile" element={<Profile />} />
          <Route path="plans" element={<UpgradePlan />} />
          <Route path="updatepassword" element={<UpdatePassword />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
