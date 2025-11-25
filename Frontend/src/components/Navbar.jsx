import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  CreditCard,
  Mail,
  LogIn,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import AuthModal from "./AuthModal"; // Ensure you have this component created

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false); // Auth Modal State

  // Scroll effect logic
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation Links Configuration
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Services", path: "/services", icon: BookOpen }, // Courses -> Services
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

          {/* --- Desktop Navigation Links (Hidden on Mobile) --- */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative text-[15px] font-medium transition-colors group py-1
                  ${
                    isActive
                      ? "text-[#f7650b]"
                      : "text-slate-600 hover:text-[#f7650b]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-[#f7650b] transition-all duration-300 ease-out
                      ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex items-center gap-4">
            {/* Login Button (Trigger Modal) */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200 md:border-transparent flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 md:hidden" />
              <span>Log in</span>
            </button>

            {/* "Get Demo" (Hidden on Mobile Top Bar) */}
            <button className="hidden md:block px-6 py-2.5 rounded-full bg-[#f7650b] text-white text-sm font-semibold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95">
              Get a demo
            </button>
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
                ${
                  isActive
                    ? "text-[#f7650b]"
                    : "text-slate-400 hover:text-slate-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator Line (Top) */}
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

                  {/* Icon */}
                  <div
                    className={`relative ${
                      isActive ? "-translate-y-0.5" : "translate-y-0"
                    } transition-transform duration-300`}
                  >
                    <item.icon
                      className="w-6 h-6"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-medium tracking-wide transition-colors ${
                      isActive ? "text-[#f7650b]" : "text-slate-500"
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

      {/* =======================================
          3. AUTH MODAL (RENDERED HERE)
      ======================================= */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Navbar;
