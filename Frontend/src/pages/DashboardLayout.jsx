import React from "react";
import { Outlet } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import DashboardFooter from "../components/DashboardFooter";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar at the top */}
      <DashboardNavbar />

      {/* Main Content grows to fill space */}
      <div className="flex-grow">
        <Outlet />
      </div>

      {/* Footer at the bottom */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardLayout;
