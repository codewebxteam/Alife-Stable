import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MonitorPlay,
  Building2,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Crown,
  CreditCard,
  Lock,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { getAuth, signOut } from "firebase/auth";

const DashboardNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;

  // Mock User Data
  const userData = {
    name: user?.displayName || "Agency Partner",
    email: user?.email || "partner@socialmitra.com",
    plan: "Supreme Master",
    avatar: `https://ui-avatars.com/api/?name=${
      user?.displayName || "Agency"
    }&background=f7650b&color=fff`,
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

  // Config: 'end: false' ensures Dashboard stays active on sub-pages
  const navLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      end: false,
    },
    {
      name: "Training",
      path: "/dashboard/training",
      icon: MonitorPlay,
      end: true,
    },
    {
      name: "My Agency",
      path: "/dashboard/agency",
      icon: Building2,
      end: true,
    },
  ];

  return (
    <>
      {/* ==============================================================
          TOP HEADER (Visible on Desktop & Mobile)
          - Desktop: Logo + Nav + Profile
          - Mobile: Logo + Profile (Nav moves to bottom)
      ============================================================== */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
        ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-slate-200 shadow-sm py-2 md:py-3"
            : "bg-white py-3 md:py-4 border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* --- LEFT: LOGO (Always Visible) --- */}
          <NavLink to="/dashboard" className="flex items-center gap-2 group">
            <div className="scale-75 md:scale-90 transition-transform group-hover:scale-95 md:group-hover:scale-100">
              <Logo />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-slate-900 leading-none tracking-tight">
                ALIFE STABLE
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                  Partner
                </span>
                {/* Badge */}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f7650b]/10 border border-[#f7650b]/20 text-[#f7650b] text-[9px] font-bold uppercase">
                  <Crown className="w-2 h-2" /> Pro
                </span>
              </div>
            </div>
          </NavLink>

          {/* --- CENTER: DESKTOP NAVIGATION (Hidden on Mobile) --- */}
          <div className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-full border border-slate-200/60 shadow-inner relative">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 z-10
                  ${
                    isActive
                      ? "text-[#f7650b]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-4 h-4 ${
                        isActive ? "stroke-[2.5px]" : "stroke-2"
                      }`}
                    />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200/50 -z-10"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* --- RIGHT: ACTIONS & PROFILE --- */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 md:p-2.5 rounded-full text-slate-400 hover:text-[#f7650b] hover:bg-orange-50 transition-all duration-300">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 md:gap-3 p-1 pl-2 pr-1 rounded-full border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all bg-white group"
              >
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {userData.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {userData.plan}
                  </span>
                </div>
                <div className="relative">
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition-transform object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 hidden md:block ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
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
                      className="absolute right-0 top-full mt-3 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden ring-1 ring-slate-900/5 mr-4 md:mr-0"
                    >
                      {/* Menu Header */}
                      <div className="p-5 bg-slate-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#f7650b] rounded-full blur-3xl opacity-20" />

                        <div className="relative z-10 flex items-center gap-4">
                          <img
                            src={userData.avatar}
                            className="w-14 h-14 rounded-full border-2 border-white/20 shadow-lg"
                          />
                          <div>
                            <h4 className="text-white font-bold text-base md:text-lg leading-tight">
                              {userData.name}
                            </h4>
                            <p className="text-slate-400 text-xs font-medium mt-0.5 truncate max-w-[160px]">
                              {userData.email}
                            </p>
                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f7650b] text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">
                              <Crown className="w-3 h-3" /> {userData.plan}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <div className="grid gap-1">
                          {[
                            {
                              icon: User,
                              label: "My Profile",
                              color: "text-blue-600",
                              bg: "bg-blue-50",
                              onClick: () => navigate("/dashboard/profile"), // Updates Route
                            },
                            {
                              icon: CreditCard,
                              label: "Upgrade Package",
                              color: "text-[#f7650b]",
                              bg: "bg-orange-50",
                              onClick: () => navigate("/dashboard/plans"), // Updates Route
                            },
                            {
                              icon: Lock,
                              label: "Change Password",
                              color: "text-purple-600",
                              bg: "bg-purple-50",
                              onClick: () => navigate("/dashboard/updatepassword"),
                            },
                          ].map((menuItem) => (
                            <button
                              key={menuItem.label}
                              onClick={() => {
                                setIsProfileOpen(false); // Close menu
                                if (menuItem.onClick) menuItem.onClick();
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-left group"
                            >
                              <div
                                className={`w-8 h-8 rounded-lg ${menuItem.bg} ${menuItem.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                              >
                                <menuItem.icon className="w-4 h-4" />
                              </div>
                              {menuItem.label}
                            </button>
                          ))}
                        </div>

                        <div className="h-px bg-slate-100 my-2 mx-3" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LogOut className="w-4 h-4" />
                          </div>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ==============================================================
          MOBILE BOTTOM NAVIGATION (Fixed at bottom)
      ============================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 pb-[env(safe-area-inset-bottom)] px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center h-16 relative">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 relative flex flex-col items-center justify-center h-full transition-all duration-300
                ${
                  isActive
                    ? "text-[#f7650b]"
                    : "text-slate-400 hover:text-slate-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator Pill at Top */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-pill"
                      className="absolute top-0 w-12 h-1 rounded-b-full bg-[#f7650b] shadow-[0_2px_10px_rgba(247,101,11,0.5)]"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative p-1 transition-transform duration-300 ${
                      isActive ? "-translate-y-1" : "translate-y-0"
                    }`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${
                        isActive ? "stroke-[2.5px] drop-shadow-sm" : "stroke-2"
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${
                      isActive
                        ? "opacity-100 translate-y-[-2px]"
                        : "opacity-70 translate-y-0"
                    }`}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Spacer to prevent content hiding behind fixed top navbar */}
      <div className="h-20 md:h-24" />
    </>
  );
};

export default DashboardNavbar;
