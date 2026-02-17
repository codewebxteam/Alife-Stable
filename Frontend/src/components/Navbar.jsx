import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  CreditCard,
  Mail,
  LogIn,
  User,
  LayoutDashboard,
  Zap,
  LogOut,
  ChevronDown,
  AlertTriangle, // <--- Added for warning icon
} from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false); // <--- New State
  const profileRef = useRef(null);

  // Scroll effect logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleLogoutClick = () => {
    setIsProfileOpen(false); // Close dropdown
    setIsLogoutDialogOpen(true); // Open Confirmation
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Services", path: "/services", icon: BookOpen },
    { name: "Pricing", path: "/pricing", icon: CreditCard },
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  return (
    <>
      {/* =======================================
          1. DESKTOP & MOBILE TOP BAR
      ======================================= */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-slate-200/60 py-3 shadow-sm"
            : "bg-transparent py-4 md:py-6 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* --- Brand Logo --- */}
          <NavLink
            to="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="transition-transform duration-300 group-hover:scale-105">
              <Logo />
            </div>
            <span className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
              Alife Stable
            </span>
          </NavLink>

          {/* --- Desktop Navigation Links --- */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative text-[15px] font-medium transition-colors py-1 group
                  ${isActive ? "text-[#f7650b]" : "text-slate-600 hover:text-[#f7650b]"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-[#f7650b] transition-all duration-300 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* --- Action Buttons (Auth Logic) --- */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              // === LOGGED IN STATE ===
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 overflow-hidden border border-orange-200">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-xs">
                        {currentUser.displayName
                          ? currentUser.displayName[0]
                          : "U"}
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {currentUser.displayName || "User"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        {/* UPDATE: Link points to /dashboard/profile */}
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <User size={16} /> My Profile
                        </Link>
                        <Link
                          to="/pricing"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                        >
                          <Zap size={16} /> Upgrade Package
                        </Link>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-50">
                        <button
                          onClick={handleLogoutClick} // UPDATE: Trigger confirmation
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut size={16} /> Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // === GUEST STATE ===
              <>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden md:block px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Log in
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-6 py-2.5 rounded-full bg-[#f7650b] text-white text-sm font-semibold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                >
                  <span>Sign up</span>
                  <LogIn className="w-4 h-4 md:hidden" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* =======================================
          2. MOBILE BOTTOM TAB BAR (Fixed)
      ======================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200 md:hidden pb-4 pt-2 px-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center h-14">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 relative
                ${isActive ? "text-[#f7650b]" : "text-slate-400 hover:text-slate-600"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute -top-2 w-10 h-1 rounded-b-full bg-[#f7650b] shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <div
                    className={`relative ${isActive ? "-translate-y-0.5" : "translate-y-0"} transition-transform duration-300`}
                  >
                    <item.icon
                      className="w-6 h-6"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-wide transition-colors ${isActive ? "text-[#f7650b]" : "text-slate-500"}`}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* =======================================
          3. AUTH MODAL
      ======================================= */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* =======================================
          4. LOGOUT CONFIRMATION MODAL
      ======================================= */}
      <AnimatePresence>
        {isLogoutDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsLogoutDialogOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative z-10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Are you sure you want to sign out of your account? You will
                  need to log in again to access your dashboard.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsLogoutDialogOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Yes, Log Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
