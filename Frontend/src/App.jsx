import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


// Public Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import ContactUs from "./pages/ContactUs";
import Scroll from "./components/ScrollTop"


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
     <Scroll/>
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
          path="/courses"
          element={
            <>
              <Navbar />
              <div className="flex-grow">
                <Courses />
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
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
