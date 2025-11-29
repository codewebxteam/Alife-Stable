import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import AdminFooter from "../components/AdminFooter";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminNavbar />
      <div className="flex-grow pt-2 md:pt-2 pb-20 md:pb-8">
        <Outlet />
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;
