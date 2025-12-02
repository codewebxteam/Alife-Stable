import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  UserPlus,
  CalendarClock,
  FileDown,
  Users,
  Layers,
  Zap,
  Briefcase,
  ChevronDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Lock,
  Timer,
  X,
  Copy,
  CheckCircle2,
  Tag,
  AlertCircle,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  Key,
  Calendar,
  ShieldCheck,
  Info,
  Gift, // Added for Referral Icon
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  collectionGroup,
  setDoc,
  addDoc,
  where,
  getDocs,
} from "firebase/firestore";
// We need getApp to duplicate the config for the secondary app
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp, getApp, deleteApp } from "firebase/app";
import { db } from "../firebase";
import * as XLSX from "xlsx";

// IMPORT THE REUSABLE COMPONENT
import PaymentVerificationModal from "../components/PaymentVerificationModal";

// ==========================================
// 1. HELPERS & UTILITIES
// ==========================================

// Get the App ID for Artifacts Path
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// --- ADMIN CREATION HELPER ---
// Creates a user in Firebase Auth without logging out the current Admin
const createPartnerAuthAccount = async (email, password) => {
  let secondaryApp = null;
  try {
    const currentApp = getApp();
    // Initialize a secondary app instance to avoid kicking the admin out
    secondaryApp = initializeApp(currentApp.options, "SecondaryApp");
    const secondaryAuth = getAuth(secondaryApp);

    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );

    // Cleanup the secondary app instance
    await deleteApp(secondaryApp);

    return userCredential.user;
  } catch (error) {
    if (secondaryApp) await deleteApp(secondaryApp);
    throw error;
  }
};

const formatPrice = (value) => {
  if (!value && value !== 0) return "₹0";
  const num = Number(value.toString().replace(/[^0-9.-]+/g, ""));
  return `₹${num.toLocaleString("en-IN")}`;
};

const normalizeStatus = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("progress")) return "In Progress";
  if (s.includes("complete") || s.includes("done")) return "Completed";
  if (s.includes("cancel") || s.includes("reject") || s.includes("decline"))
    return "Cancelled";
  return "Pending";
};

const getMediaType = (name) => {
  const n = (name || "").toLowerCase();
  if (
    n.includes("video") ||
    n.includes("editing") ||
    n.includes("reel") ||
    n.includes("animation")
  ) {
    return "Video";
  }
  return "Image";
};

const hasRole = (user, targetRole) => {
  const roleData = user.role;
  const target = targetRole.toLowerCase();
  if (Array.isArray(roleData)) {
    return roleData.some((r) => (r || "").toLowerCase() === target);
  }
  return (roleData || "").toLowerCase() === target;
};

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

const StatRow = ({
  label,
  value,
  colorClass = "text-slate-900",
  icon: Icon,
}) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors px-1 rounded-md">
    <div className="flex items-center gap-2">
      {Icon && (
        <Icon
          size={12}
          className="text-slate-400 group-hover:text-slate-600 transition-colors"
        />
      )}
      <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
    <span className={`text-xs font-bold ${colorClass}`}>{value}</span>
  </div>
);

const DashboardCard = ({
  title,
  icon: Icon,
  color,
  children,
  className,
  badge,
}) => (
  <div
    className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all h-full ${className}`}
  >
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${color} text-white shadow-sm`}>
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      </div>
      {badge !== undefined && (
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-black border border-slate-200">
          {badge}
        </span>
      )}
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

// --- GENERATE COUPON MODAL (Responsive & Scrollable) ---
const GenerateCouponModal = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState({
    code: "",
    discount: 10,
    planId: "all",
    maxUses: 1,
  });
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "SAVE";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setConfig((prev) => ({ ...prev, code: result }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!config.code) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "coupons"), {
        code: config.code.toUpperCase(),
        discountPercent: Number(config.discount),
        validPlan: config.planId,
        maxUses: Number(config.maxUses),
        usedCount: 0,
        createdAt: serverTimestamp(),
        status: "Active",
      });
      setCreatedCode(config.code.toUpperCase());
    } catch (error) {
      console.error("Coupon error:", error);
      alert("Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setConfig({ code: "", discount: 10, planId: "all", maxUses: 1 });
    setCreatedCode(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60]"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Ticket className="w-4 h-4" />
                  </div>
                  Create Coupon
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto smooth-scroll">
                {!createdCode ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                        Coupon Code
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            required
                            value={config.code}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                code: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="e.g. WELCOME20"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-wider focus:outline-none focus:border-orange-500 transition-all uppercase"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={generateRandomCode}
                          className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors whitespace-nowrap"
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                          Discount %
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          required
                          value={config.discount}
                          onChange={(e) =>
                            setConfig({ ...config, discount: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                          Max Uses
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={config.maxUses}
                          onChange={(e) =>
                            setConfig({ ...config, maxUses: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                        Valid For Plan
                      </label>
                      <select
                        value={config.planId}
                        onChange={(e) =>
                          setConfig({ ...config, planId: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 transition-all appearance-none"
                      >
                        <option value="all">All Plans</option>
                        <option value="starter">Starter</option>
                        <option value="booster">Booster</option>
                        <option value="academic">Academic</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Create Coupon"
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      Coupon Active!
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Ready to be used.
                    </p>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 mb-6">
                      <div className="text-left">
                        <p className="text-xs text-slate-400 font-bold uppercase">
                          Code
                        </p>
                        <p className="text-xl font-mono font-bold text-slate-900 tracking-wider">
                          {createdCode}
                        </p>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => setCreatedCode(null)}
                      className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                    >
                      Create Another
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- CREATE PARTNER MODAL (Auth & DB Sync & Referral) ---
const CreatePartnerModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [couponStatus, setCouponStatus] = useState("idle"); // idle, success, error
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    state: "",
    city: "",
    pincode: "",
    planType: "Starter",
    couponCode: "",
    referralCode: "", // Added Referral Code State
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    if (e.target.name === "couponCode") {
      setCouponStatus("idle");
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill required fields");
      return;
    }
    setStep(2);
  };

  const handleVerifyCoupon = async () => {
    if (!formData.couponCode) return;
    setVerifying(true);
    setCouponStatus("idle");

    try {
      const q = query(
        collection(db, "coupons"),
        where("code", "==", formData.couponCode.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setCouponStatus("error");
        alert("Invalid Coupon Code");
      } else {
        const couponData = querySnapshot.docs[0].data();

        if (couponData.status !== "Active") {
          setCouponStatus("error");
          alert("This coupon is inactive.");
          setVerifying(false);
          return;
        }

        const requiredPlan = (couponData.validPlan || "all").toLowerCase();
        const selectedPlan = (formData.planType || "").toLowerCase();
        const isPlanValid =
          requiredPlan === "all" || selectedPlan === requiredPlan;

        if (!isPlanValid) {
          setCouponStatus("error");
          alert(
            `This coupon is only valid for ${couponData.validPlan} plans. You selected ${formData.planType}.`
          );
        } else {
          setCouponStatus("success");
        }
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setCouponStatus("error");
      alert("Verification failed. Please check internet.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (couponStatus !== "success") {
      alert("Please enter and verify a valid coupon code to proceed.");
      return;
    }

    setLoading(true);
    try {
      // 1. CREATE AUTH USER (Using secondary app to keep Admin logged in)
      const newUser = await createPartnerAuthAccount(
        formData.email,
        formData.password
      );

      // 2. CREATE FIRESTORE DOCUMENT (Stored in ARTIFACTS to match dashboard logic)
      // Path: /artifacts/{appId}/users/{uid}/profile/account_info
      await setDoc(
        doc(
          db,
          "artifacts",
          appId,
          "users",
          newUser.uid,
          "profile",
          "account_info"
        ),
        {
          uid: newUser.uid,
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
          },
          plan: formData.planType,
          appliedCoupon: formData.couponCode.toUpperCase(),
          appliedReferralCode: formData.referralCode || "", // Save Referral Code
          role: "partner",
          joinedAt: new Date().toISOString(), // Matches 'joinedAt' usage in dashboard
          createdAt: serverTimestamp(),
          status: "active",
        }
      );

      alert("Partner Account Created Successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating partner:", error);
      alert("Error creating partner: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create Partner</h2>
            <div className="flex gap-2 mt-1">
              <div
                className={`h-1 w-8 rounded-full transition-colors ${
                  step === 1 ? "bg-indigo-600" : "bg-emerald-500"
                }`}
              />
              <div
                className={`h-1 w-8 rounded-full transition-colors ${
                  step === 2 ? "bg-indigo-600" : "bg-slate-200"
                }`}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs flex gap-2">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>
                This will create a login account for the partner. They can login
                using the email and password you set here.
              </p>
            </div>
          )}

          <form className="space-y-4">
            {step === 1 ? (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <User size={10} /> Full Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Mail size={10} /> Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Phone size={10} /> Phone
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Key size={10} /> Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MapPin size={10} /> State
                    </label>
                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MapPin size={10} /> City
                    </label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Mumbai"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <MapPin size={10} /> Pin Code
                  </label>
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                    placeholder="400001"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <CreditCard size={10} /> Plan Type
                  </label>
                  <select
                    name="planType"
                    value={formData.planType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Booster">Booster</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Ticket size={10} /> Coupon (Mandatory)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        name="couponCode"
                        value={formData.couponCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none transition-colors uppercase ${
                          couponStatus === "success"
                            ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                            : couponStatus === "error"
                            ? "border-rose-300 text-rose-700 bg-rose-50"
                            : "border-slate-200 focus:border-indigo-500"
                        }`}
                        placeholder="ENTER CODE"
                      />
                      {couponStatus === "success" && (
                        <CheckCircle2
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                          size={18}
                        />
                      )}
                      {couponStatus === "error" && (
                        <AlertCircle
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500"
                          size={18}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyCoupon}
                      disabled={verifying || !formData.couponCode}
                      className="px-4 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {verifying ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                  {couponStatus === "success" && (
                    <p className="text-[10px] text-emerald-600 font-bold ml-1">
                      Coupon verified successfully!
                    </p>
                  )}
                </div>

                {/* ADDED: Referral Code Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Gift size={10} /> Referral Code (Optional)
                  </label>
                  <input
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors uppercase"
                    placeholder="REF12345"
                  />
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={step === 1 ? handleNext : handleSubmit}
                disabled={loading || (step === 2 && couponStatus !== "success")}
                className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : step === 1 ? (
                  <>
                    Next Step <ChevronRight size={16} />
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 3. MAIN COMPONENT: SalesOrders
// ==========================================

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState("service");
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);

  // NEW MODAL STATES
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [serviceCycleFilter, setServiceCycleFilter] = useState("All");

  // --- AUTH CHECK ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    // 1. ORDERS
    const qOrders = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date();

        const durationRaw = (data.Duration || "").toLowerCase();
        const serviceNameLower = (data.service?.name || "").toLowerCase();

        let serviceCycle = "Instant";
        let expiryDate = null;

        if (durationRaw.includes("year") || serviceNameLower.includes("year")) {
          serviceCycle = "Yearly";
          expiryDate = new Date(createdAt);
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else if (
          durationRaw.includes("month") ||
          serviceNameLower.includes("month")
        ) {
          serviceCycle = "Monthly";
          expiryDate = new Date(createdAt);
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        }

        let rawStatus = data.status;
        if (
          serviceCycle !== "Instant" &&
          expiryDate &&
          new Date() > expiryDate
        ) {
          rawStatus = "Completed";
        }
        const normalizedStatus = normalizeStatus(rawStatus);

        let type = "service";
        if (serviceCycle !== "Instant") {
          type = "e-greeting";
        } else if (
          serviceNameLower.includes("correction") ||
          data.isCorrection
        ) {
          type = "correction";
        } else if (serviceNameLower.includes("agency")) {
          type = "agency";
        } else if (
          serviceNameLower.includes("greeting") ||
          serviceNameLower.includes("festival")
        ) {
          type = "e-greeting";
        }

        const total = parseFloat(
          data.pricing?.priceToAdmin || data.amount || 0
        );
        const paid = parseFloat(data.paidAmount || 0);

        return {
          id: doc.id,
          ...data,
          displayId: data.displayId,
          createdAtDate: createdAt,
          expiryDate: expiryDate,
          serviceCycle: serviceCycle,
          mediaType: getMediaType(data.service?.name),
          adminPrice: total,
          paidAmount: paid,
          dueAmount: Math.max(0, total - paid),
          status: normalizedStatus,
          type: type,
          paymentStatus: (data.paymentStatus || "due").toLowerCase(),
        };
      });
      setOrders(ordersData);
    });

    // 2. PARTNERS (UPDATED TO FETCH FROM ARTIFACTS COLLECTION GROUP 'profile')
    // This fetches all 'account_info' docs from any subcollection named 'profile'
    // allowing us to find partners in artifacts structure.
    const qPartners = query(collectionGroup(db, "profile"));

    const unsubscribePartners = onSnapshot(qPartners, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        if (doc.id === "account_info") {
          const d = doc.data();
          list.push({
            // Construct ID from parent structure (usually uid is parent of profile)
            id: doc.ref.parent.parent.id,
            ...d,
            // Fallback for createdAt/joinedAt
            createdAtDate: d.joinedAt
              ? new Date(d.joinedAt)
              : d.createdAt?.toDate
              ? d.createdAt.toDate()
              : new Date(),
          });
        }
      });
      setPartners(list);
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribePartners();
    };
  }, []);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    // Filter partner users
    const partnerUsers = partners.filter(
      (p) => hasRole(p, "partner") || hasRole(p, "member")
    );
    let starter = 0,
      booster = 0,
      academic = 0;
    partnerUsers.forEach((p) => {
      const pl = (p.plan || "").toLowerCase();
      if (pl.includes("starter")) starter++;
      else if (pl.includes("booster") || pl.includes("elite")) booster++;
      else if (pl.includes("academic") || pl.includes("master")) academic++;
      else starter++;
    });

    const partnerStats = { starter, booster, academic };

    const completedOrders = orders.filter((o) => o.status === "Completed");
    const completedStats = {
      eGreetings: completedOrders.filter((o) => o.type === "e-greeting").length,
      serviceOrder: completedOrders.filter((o) => o.type === "service").length,
    };

    const activeSubs = orders.filter(
      (o) =>
        o.type === "e-greeting" &&
        (o.status === "In Progress" || o.status === "Pending") &&
        o.status !== "Cancelled"
    );

    const subStats = {
      yrlyImg: activeSubs.filter(
        (o) => o.serviceCycle === "Yearly" && o.mediaType === "Image"
      ).length,
      yrlyVdo: activeSubs.filter(
        (o) => o.serviceCycle === "Yearly" && o.mediaType === "Video"
      ).length,
      mnthImg: activeSubs.filter(
        (o) => o.serviceCycle === "Monthly" && o.mediaType === "Image"
      ).length,
      mnthVdo: activeSubs.filter(
        (o) => o.serviceCycle === "Monthly" && o.mediaType === "Video"
      ).length,
    };

    const serviceTypes = [
      {
        id: "agency",
        label: "Agency Setup",
        icon: Users,
        color: "bg-blue-600",
      },
      {
        id: "service",
        label: "Service Order",
        icon: Briefcase,
        color: "bg-indigo-600",
      },
      {
        id: "e-greeting",
        label: "E-Greeting",
        icon: Layers,
        color: "bg-purple-600",
      },
    ];

    const serviceBreakdown = serviceTypes.map((service) => {
      const typeOrders = orders.filter((o) => o.type === service.id);
      return {
        ...service,
        completed: typeOrders.filter((o) => o.status === "Completed").length,
        inProgress: typeOrders.filter((o) => o.status === "In Progress").length,
        cancelled: typeOrders.filter((o) => o.status === "Cancelled").length,
        pending: typeOrders.filter((o) => o.status === "Pending").length,
        total: typeOrders.length,
      };
    });

    const correctionOrders = orders.filter((o) => o.type === "correction");
    const correctionStats = {
      waiting: correctionOrders.filter((o) => o.status === "Pending").length,
      inProgress: correctionOrders.filter((o) => o.status === "In Progress")
        .length,
      completed: correctionOrders.filter((o) => o.status === "Completed")
        .length,
      cancelled: correctionOrders.filter((o) => o.status === "Cancelled")
        .length,
    };

    return {
      partnerStats,
      completedStats,
      subStats,
      serviceBreakdown,
      correctionStats,
    };
  }, [orders, partners]);

  // --- FILTER & PAGINATION ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab === "service") {
        if (
          order.type !== "service" &&
          !(order.type === "e-greeting" && order.serviceCycle === "Instant")
        )
          return false;
      } else if (activeTab === "agency" && order.type !== "agency")
        return false;
      else if (activeTab === "egreeting") {
        if (order.type !== "e-greeting") return false;
        if (order.serviceCycle === "Instant") return false;
      } else if (activeTab === "correction" && order.type !== "correction")
        return false;

      if (activeTab === "service" && serviceCycleFilter !== "All") {
        if (order.serviceCycle !== serviceCycleFilter) return false;
      }

      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.displayId || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (order.partnerName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (order.service?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      let checkStatus = order.status;
      if (activeTab === "egreeting") {
        if (checkStatus !== "Completed" && checkStatus !== "Cancelled")
          checkStatus = "Continue";
      }
      const matchesStatus =
        statusFilter === "All" ||
        checkStatus.toLowerCase() === statusFilter.toLowerCase();

      const matchesPayment =
        paymentFilter === "All" ||
        (paymentFilter === "Paid"
          ? order.paymentStatus === "paid"
          : order.paymentStatus !== "paid");

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [
    orders,
    activeTab,
    searchTerm,
    statusFilter,
    paymentFilter,
    serviceCycleFilter,
  ]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredOrders.map((o) => ({
        ID: o.displayId || o.id,
        Service: o.service?.name,
        Type: o.serviceCycle,
        Partner: o.partnerName,
        Date: o.createdAtDate.toLocaleDateString(),
        Expiry: o.expiryDate ? o.expiryDate.toLocaleDateString() : "N/A",
        DueAmount: o.dueAmount,
        Status: o.status,
        AssignedTo:
          typeof o.assignedTo === "object"
            ? o.assignedTo?.name
            : o.assignedTo || "Unassigned",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Sales_Orders_${activeTab}.xlsx`);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const confirmMsg =
      newStatus === "Completed" ? "Are you sure?" : "Start task?";
    if (!window.confirm(confirmMsg)) return;
    try {
      const updateData = { status: newStatus };
      if (newStatus === "In_Progress") {
        updateData.assignedTo = {
          uid: currentUser?.uid,
          name: currentUser?.displayName || "Staff",
          email: currentUser?.email,
          startedAt: new Date().toISOString(),
        };
      } else if (newStatus === "Completed") {
        updateData.completedAt = serverTimestamp();
      }
      await updateDoc(doc(db, "orders", orderId), updateData);
    } catch (e) {
      alert("Error updating status");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-12 space-y-8">
      {/* 1. HEADER & BUTTONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sales & Order
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage subscriptions, partners, and workflows.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* UPDATED: Coupon Code Button opens Modal */}
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Ticket size={16} /> Coupon Code
          </button>

          {/* UPDATED: Create Partner Button opens Modal */}
          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            <UserPlus size={16} /> Create Partner
          </button>

          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-bold text-xs shadow-md shadow-rose-200 transition-all active:scale-95">
            <CalendarClock size={16} /> Schedule Correction
          </button>
        </div>
      </div>

      {/* 2. ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Partner"
          icon={Users}
          color="bg-cyan-500"
          badge={
            stats.partnerStats.starter +
            stats.partnerStats.booster +
            stats.partnerStats.academic
          }
        >
          <StatRow label="Starter Plan" value={stats.partnerStats.starter} />
          <StatRow label="Booster Plan" value={stats.partnerStats.booster} />
          <StatRow label="Academic Plan" value={stats.partnerStats.academic} />
        </DashboardCard>

        <DashboardCard
          title="Completed Orders"
          icon={CheckCircle}
          color="bg-emerald-500"
          badge={
            stats.completedStats.eGreetings + stats.completedStats.serviceOrder
          }
        >
          <StatRow
            label="Total E-Greetings"
            value={stats.completedStats.eGreetings}
          />
          <StatRow
            label="Service Order"
            value={stats.completedStats.serviceOrder}
          />
          <div className="h-6 sm:h-auto"></div>
        </DashboardCard>

        <div className="md:col-span-2">
          <DashboardCard
            title="Active E-Greetings"
            icon={Layers}
            color="bg-violet-500"
            badge={
              stats.subStats.yrlyImg +
              stats.subStats.yrlyVdo +
              stats.subStats.mnthImg +
              stats.subStats.mnthVdo
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <div>
                <StatRow
                  label="Yrly. Img. Pkg"
                  value={stats.subStats.yrlyImg}
                />
                <StatRow
                  label="Yrly. VDO. Pkg"
                  value={stats.subStats.yrlyVdo}
                />
              </div>
              <div>
                <StatRow
                  label="Mnth. Img. Pkg"
                  value={stats.subStats.mnthImg}
                />
                <StatRow
                  label="Mnth. VDO. Pkg"
                  value={stats.subStats.mnthVdo}
                />
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* 3. WORKFLOW STATUS */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={16} className="text-amber-500" /> Workflow Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.serviceBreakdown.map((service) => (
            <DashboardCard
              key={service.id}
              title={service.label}
              icon={service.icon}
              color={service.color}
              badge={service.total}
            >
              <StatRow
                label="In Progress"
                value={service.inProgress}
                colorClass="text-blue-600"
                icon={PlayCircle}
              />
              <StatRow
                label="Completed"
                value={service.completed}
                colorClass="text-emerald-600"
                icon={CheckCircle}
              />
              <StatRow
                label="Cancelled"
                value={service.cancelled}
                colorClass="text-rose-600"
                icon={XCircle}
              />
              <StatRow
                label="Waiting"
                value={service.pending}
                colorClass="text-amber-500"
                icon={Clock}
              />
            </DashboardCard>
          ))}

          <DashboardCard
            title="Correction Status"
            icon={Zap}
            color="bg-orange-500"
            badge={
              stats.correctionStats.inProgress +
              stats.correctionStats.completed +
              stats.correctionStats.cancelled +
              stats.correctionStats.waiting
            }
          >
            <StatRow
              label="In Progress"
              value={stats.correctionStats.inProgress}
              colorClass="text-blue-600"
              icon={PlayCircle}
            />
            <StatRow
              label="Completed"
              value={stats.correctionStats.completed}
              colorClass="text-emerald-600"
              icon={CheckCircle}
            />
            <StatRow
              label="Cancelled"
              value={stats.correctionStats.cancelled}
              colorClass="text-rose-600"
              icon={XCircle}
            />
            <StatRow
              label="Waiting"
              value={stats.correctionStats.waiting}
              colorClass="text-amber-500"
              icon={Clock}
            />
          </DashboardCard>
        </div>
      </div>

      {/* 4. TABLE SECTION */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: "service", label: "Service Orders", icon: Briefcase },
          { id: "agency", label: "Agency Setup", icon: Users },
          { id: "egreeting", label: "E-Greeting Services", icon: Layers },
          { id: "correction", label: "Corrections", icon: CalendarClock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-lg"
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[500px]">
        {/* FILTERS */}
        <div className="p-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2 w-full xl:w-auto">
              {activeTab === "service" && (
                <div className="relative">
                  <select
                    value={serviceCycleFilter}
                    onChange={(e) => setServiceCycleFilter(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-2.5 pl-4 pr-10 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Cycles</option>
                    <option value="Instant">Instant</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={14}
                  />
                </div>
              )}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-2.5 pl-4 pr-10 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Status</option>
                  {activeTab === "egreeting" ? (
                    <>
                      <option value="Continue">Continue (Active)</option>
                      <option value="Completed">Completed (Expired)</option>
                    </>
                  ) : (
                    <>
                      <option value="Pending">Waiting</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  )}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={14}
                />
              </div>
              <div className="relative">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-2.5 pl-4 pr-10 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Payment</option>
                  <option value="Paid">Paid</option>
                  <option value="Due">Due</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={14}
                />
              </div>
            </div>
            <div className="flex gap-3 w-full xl:w-auto">
              <div className="relative flex-1 xl:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-xs shadow-md active:scale-95"
              >
                <FileDown size={16} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Service & Info
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Timeline
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Duration
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                  Paid/Due
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                  Action / Verify
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />{" "}
                    Syncing...
                  </td>
                </tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    key={order.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            order.type === "e-greeting"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {activeTab === "correction" ? (
                            <Zap size={16} />
                          ) : (
                            <Layers size={16} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {order.service?.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            <span className="font-bold text-slate-500">
                              {order.displayId ||
                                `#${order.id.slice(0, 6).toUpperCase()}`}
                            </span>{" "}
                            • {order.partnerName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                          <Calendar size={10} />{" "}
                          {order.createdAtDate.toLocaleDateString()}
                        </div>
                        {order.status === "Completed" &&
                        activeTab !== "egreeting" ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                            <CheckCircle size={10} /> Done
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300">
                            ---
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${
                            order.serviceCycle === "Yearly"
                              ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                              : order.serviceCycle === "Monthly"
                              ? "bg-orange-50 text-orange-600 border-orange-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {order.serviceCycle}
                        </span>
                        {order.expiryDate && (
                          <span
                            className={`text-[9px] font-bold flex items-center gap-1 ${
                              new Date() > order.expiryDate
                                ? "text-rose-500"
                                : "text-slate-400"
                            }`}
                          >
                            <Timer size={10} /> Exp:{" "}
                            {order.expiryDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                            {order.assignedTo.name?.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-slate-600">
                            {order.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === "Cancelled" ? (
                        // If Cancelled, show this instead of due amount
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Cancelled
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-black text-slate-900">
                            {formatPrice(order.adminPrice)}
                          </span>
                          {order.paymentStatus === "paid" ? (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                              Paid
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 whitespace-nowrap">
                              Due: {formatPrice(order.dueAmount)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          order.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : order.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : order.status === "Cancelled"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Only show actions if NOT Cancelled */}
                      {order.status !== "Cancelled" && (
                        <div className="flex justify-end gap-2 items-center">
                          {order.dueAmount > 0 && (
                            <button
                              onClick={() => setPaymentModalOrder(order)}
                              className="flex items-center gap-1 px-2 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors shadow-sm whitespace-nowrap"
                            >
                              Verify <DollarSign size={10} />
                            </button>
                          )}
                          {order.status === "Pending" && (
                            <button
                              onClick={() =>
                                handleStatusChange(order.id, "In_Progress")
                              }
                              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              <PlayCircle size={14} />
                            </button>
                          )}
                          {order.status === "In Progress" && (
                            <button
                              onClick={() =>
                                handleStatusChange(order.id, "Completed")
                              }
                              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {order.status === "Completed" &&
                            order.dueAmount <= 0 && (
                              <Lock size={14} className="text-slate-300" />
                            )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <p className="text-sm font-bold">No orders found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCouponModalOpen && (
          <GenerateCouponModal
            isOpen={isCouponModalOpen}
            onClose={() => setIsCouponModalOpen(false)}
          />
        )}
        {isPartnerModalOpen && (
          <CreatePartnerModal
            isOpen={isPartnerModalOpen}
            onClose={() => setIsPartnerModalOpen(false)}
          />
        )}
        {paymentModalOrder && (
          <PaymentVerificationModal
            isOpen={!!paymentModalOrder}
            onClose={() => setPaymentModalOrder(null)}
            order={paymentModalOrder}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalesOrders;
