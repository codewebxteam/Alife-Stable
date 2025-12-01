import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Ticket,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Lock,
  Menu,
  X,
  GraduationCap, // Added for Academy
  Database, // Added for Data
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import Logo from "./Logo";

const AdminNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const adminData = {
    name: user?.displayName || "Admin",
    email: user?.email || "admin@socialmitra.com",
    role: "Super Admin",
    avatar: `https://ui-avatars.com/api/?name=${
      user?.displayName || "Admin"
    }&background=0f172a&color=fff`,
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
    {
      name: "Staff Performance",
      path: "/admin/staff",
      icon: Users,
      end: false,
    },
    {
      name: "Academy",
      path: "/admin/academy",
      icon: GraduationCap,
      end: false,
    },
    {
      name: "Data",
      path: "/admin/data",
      icon: Database,
      end: false,
    },
  ];

  return (
    <>
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-slate-200 shadow-sm py-2"
            : "bg-white py-3 border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="scale-90">
              <Logo />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 leading-none tracking-tight">
                ALIFE STABLE
              </span>
              <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-0.5">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center bg-slate-50 p-1 rounded-full border border-slate-200">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="admin-nav-pill"
                        className="absolute inset-0 bg-slate-900 rounded-full shadow-sm"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <item.icon className="w-4 h-4" /> {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 hover:border-slate-300 transition-all bg-white"
              >
                <img
                  src={adminData.avatar}
                  alt="Admin"
                  className="w-8 h-8 rounded-full border border-slate-100"
                />
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-xs font-bold text-slate-900 leading-none">
                    {adminData.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium uppercase">
                    {adminData.role}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden p-1"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900">
                          Signed in as
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {adminData.email}
                        </p>
                      </div>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <Lock className="w-3.5 h-3.5" /> Change Password
                      </button>
                      <div className="h-px bg-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Bottom Tabs for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] px-6">
        <div className="flex justify-around items-center h-16">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-slate-900" : "text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-6 h-6 ${isActive ? "fill-slate-900" : ""}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="text-[10px] font-bold">
                    {item.name.split(" ")[0]}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="h-16 md:h-20" />
    </>
  );
};

export default AdminNavbar;
