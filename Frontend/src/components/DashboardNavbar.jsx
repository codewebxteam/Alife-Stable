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
  CheckCircle2,
  MessageSquare,
  Check,
  Hash,
  GraduationCap, // Academy icon
  LayoutGrid, // Services icon
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const DashboardNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [partnerId, setPartnerId] = useState("Loading...");
  const [currentUser, setCurrentUser] = useState(null); // Debug: Auth user state

  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- DEBUGGED AUTH & ID FETCHING ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          // Fixed path to match your Firestore structure
          const docRef = doc(db, "users", user.uid, "profile", "account_info");
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().agencySubdomain) {
            setPartnerId(docSnap.data().agencySubdomain);
          } else if (docSnap.exists() && docSnap.data().referralCode) {
            setPartnerId(docSnap.data().referralCode);
          } else {
            setPartnerId(user.uid.slice(0, 6).toUpperCase());
          }
        } catch (e) {
          console.error("Error fetching ID");
          setPartnerId("Error");
        }
      } else {
        setPartnerId("Guest");
      }
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [auth]);

  // Dynamic User Data
  const userData = {
    name: currentUser?.displayName || "Agency Partner",
    email: currentUser?.email || "partner@socialmitra.com",
    plan: "Starter",
    avatar: `https://ui-avatars.com/api/?name=${
      currentUser?.displayName || "Agency"
    }&background=f7650b&color=fff`,
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "admin",
      title: "Admin Message",
      message: "System maintenance scheduled for tonight at 2 AM.",
      time: "2h ago",
      read: false,
    },
    {
      id: 2,
      type: "order",
      title: "Order Completed",
      message: "Order #ORD-7821 has been successfully delivered.",
      time: "5h ago",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Updated NavLinks - Adding Academy and Services Catalog
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },

    {
      name: "Services Catlog",
      path: "/dashboard/services",
      icon: LayoutGrid,
      end: true,
    },
    {
      name: "Training",
      path: "/dashboard/training",
      icon: MonitorPlay,
      end: true,
    },
    {
      name: "Academy",
      path: "https://www.alifestableacademy.com/",
      icon: GraduationCap,
      external: true,
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
          {/* --- LEFT: LOGO + PARTNER ID --- */}
          <div className="flex items-center gap-4">
            <NavLink to="/dashboard" className="flex items-center gap-2 group">
              <div className="scale-75 md:scale-90 transition-transform group-hover:scale-95">
                <Logo />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-slate-900 leading-none tracking-tight">
                  ALIFE STABLE
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ID: {partnerId}
                  </span>
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
                    title="Active"
                  ></div>
                </div>
              </div>
            </NavLink>
          </div>

          {/* --- CENTER: DESKTOP NAVIGATION --- */}
          <div className="hidden lg:flex items-center bg-slate-50 p-1.5 rounded-full border border-slate-200/60 shadow-inner relative">
            {navLinks.map((item) =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                >
                  <item.icon className="w-4 h-4 stroke-2" />
                  <span>{item.name}</span>
                </a>
              ) : (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 flex items-center gap-2 z-10
                    ${isActive ? "text-[#f7650b]" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`w-4 h-4 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`}
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
              ),
            )}
          </div>

          {/* --- RIGHT: ACTIONS & PROFILE --- */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 md:p-2.5 rounded-full transition-all duration-300 ${
                  isNotifOpen
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-[#f7650b] hover:bg-orange-50"
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsNotifOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">
                          Notifications
                        </h3>
                        <span className="text-[10px] font-black bg-[#f7650b] text-white px-2 py-0.5 rounded-full">
                          {unreadCount} New
                        </span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <div className="flex gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === "admin" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}
                              >
                                {n.type === "admin" ? (
                                  <MessageSquare size={14} />
                                ) : (
                                  <Check size={14} />
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#f7650b]">
                                  {n.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                  {n.message}
                                </p>
                                <span className="text-[9px] text-slate-400 mt-1 block">
                                  {n.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full p-3 text-center text-xs font-bold text-slate-400 hover:text-[#f7650b] hover:bg-slate-50 transition-all">
                        View All Notifications
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* --- PROFILE DROPDOWN --- */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 md:gap-3 p-1 pl-2 pr-1 rounded-full border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all bg-white group"
              >
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {userData.name}
                  </span>
                  <span className="text-[10px] text-[#f7650b] font-bold uppercase tracking-wide">
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
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 hidden md:block ${isProfileOpen ? "rotate-180" : ""}`}
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
                      className="absolute right-0 top-full mt-3 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden ring-1 ring-slate-900/5 mr-4 md:mr-0"
                    >
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
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => navigate("/dashboard/profile")}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>{" "}
                          My Profile
                        </button>
                        <button
                          onClick={() => navigate("/dashboard/plans")}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f7650b] flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                          </div>{" "}
                          Upgrade Package
                        </button>
                        <div className="h-px bg-slate-100 my-2 mx-3" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                            <LogOut className="w-4 h-4" />
                          </div>{" "}
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
      {/* Spacer for Fixed Navbar */}
      <div className="h-20 md:h-24" />
    </>
  );
};

export default DashboardNavbar;
