import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Ticket,
  Wallet,
  Check,
  Clock,
  X,
  Zap,
  Layers,
  Image as ImageIcon,
  Video,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
  RefreshCcw,
  LogOut,
  Briefcase,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  CalendarDays,
  ListTodo,
  DollarSign,
  AlertCircle,
  Filter,
  ChevronDown,
  Search,
  Crown,
  Star,
  TrendingUp,
  CreditCard,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Key,
  Tag,
  Gift,
  Info,
  Settings,
  UserCog,
  Lock,
  Save,
  User,
  FileDown,
  Timer,
  XCircle,
  CheckCircle,
  CalendarClock,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  collectionGroup,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { initializeApp, getApp, deleteApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import * as XLSX from "xlsx";

// --- IMPORT COMPONENTS ---
// Make sure ManagerDashboard.jsx is in the same folder or update the path
import ManagerDashboard from "./ManagerDashboard";
import PaymentVerificationModal from "../components/PaymentVerificationModal";

// ==========================================
// 1. UTILITIES & CONFIG
// ==========================================

const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

const PLAN_PRICES = {
  starter: 999,
  booster: 2499,
  academic: 4999,
};

const useScrollLock = (isLocked) => {
  useEffect(() => {
    document.body.style.overflow = isLocked ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLocked]);
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

// --- AUTH HELPER ---
const createPartnerAuthAccount = async (email, password) => {
  let secondaryApp = null;
  try {
    const currentApp = getApp();
    secondaryApp = initializeApp(currentApp.options, "SecondaryApp");
    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );
    await deleteApp(secondaryApp);
    return userCredential.user;
  } catch (error) {
    if (secondaryApp) await deleteApp(secondaryApp);
    throw error;
  }
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
  mainValue,
  icon: Icon,
  color,
  children,
  className,
  badge,
}) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  const iconBg = colorMap[color] || color || "bg-slate-100 text-slate-600";

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all h-full ${className}`}
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${iconBg} shadow-sm`}>
            {Icon && <Icon size={18} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
            {mainValue && (
              <p className="text-xl font-black text-slate-900 leading-none mt-1">
                {mainValue}
              </p>
            )}
          </div>
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
};

const PaginationControls = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

// --- PASSWORD RESET MODAL ---
const PasswordResetModal = ({ status, onClose, email }) => {
  if (status === "idle") return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={status === "success" ? onClose : undefined}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center z-10"
      >
        {status === "sending" && (
          <div className="flex flex-col items-center gap-6 py-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Sending Reset Link
              </h3>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2 shadow-sm border border-green-100">
              <Mail size={36} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Link Sent!</h3>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                Check your inbox for a password reset link sent to{" "}
                <span className="font-bold">{email}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              Okay
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- MY ACCOUNT MODAL ---
const MyAccountModal = ({ isOpen, onClose, userData }) => {
  useScrollLock(isOpen);
  const [formData, setFormData] = useState({ fullName: "", phone: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        phone: userData.phone || "",
      });
    }
  }, [userData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;
      if (uid) {
        await updateDoc(doc(db, "users", uid, "profile", "account_info"), {
          fullName: formData.fullName,
          phone: formData.phone,
        });
        alert("Profile Updated!");
        onClose();
      }
    } catch (e) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden z-10"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="text-blue-600" size={20} /> My Account
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
              Full Name
            </label>
            <input
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
              Phone
            </label>
            <input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium"
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-slate-800 transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- GENERATE COUPON MODAL ---
const GenerateCouponModal = ({ isOpen, onClose, user }) => {
  useScrollLock(isOpen);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [loading, setLoading] = useState(false);
  const [planId, setPlanId] = useState("all");

  const handleGenerate = () =>
    setCode(`OFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "coupons"), {
        code: code.toUpperCase(),
        discountPercent: Number(discount),
        validPlan: planId,
        maxUses: 1,
        usedCount: 0,
        createdBy: user.uid,
        creatorName: user.displayName || "Sales Staff",
        createdAt: serverTimestamp(),
        status: "Active",
      });
      onClose();
      setCode("");
      setDiscount("");
      alert("Coupon Created (Max Uses: 1)!");
    } catch (e) {
      alert("Error creating coupon");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 z-10"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Ticket className="text-orange-500" size={20} /> Create Coupon
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 border border-slate-200 bg-slate-50 p-3 rounded-xl font-mono text-sm uppercase"
              placeholder="CODE"
              required
            />
            <button
              type="button"
              onClick={handleGenerate}
              className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm"
              placeholder="Discount %"
              max="100"
              required
            />
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="booster">Booster</option>
              <option value="academic">Academic</option>
            </select>
          </div>
          <button
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Create Coupon"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- CREATE PARTNER MODAL (Mandatory Fields) ---
const CreatePartnerModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [couponStatus, setCouponStatus] = useState("idle");
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
    referralCode: "", // Optional
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    if (e.target.name === "couponCode") setCouponStatus("idle");
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const snap = await getDocs(q);
      if (snap.empty) {
        setCouponStatus("error");
        alert("Invalid Code");
      } else {
        const data = snap.docs[0].data();
        if (data.status !== "Active" || data.usedCount >= data.maxUses) {
          setCouponStatus("error");
          alert("Coupon Expired/Inactive");
        } else {
          setCouponStatus("success");
        }
      }
    } catch {
      setCouponStatus("error");
    } finally {
      setVerifying(false);
    }
  };

  const validateStep1 = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      alert("All fields are mandatory.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // STRICT VALIDATION
    if (!formData.state || !formData.city || !formData.pincode) {
      alert("Address fields (State, City, Pincode) are mandatory.");
      return;
    }
    if (!formData.couponCode || couponStatus !== "success") {
      alert("Please enter and verify a valid Coupon Code.");
      return;
    }

    setLoading(true);
    try {
      const newUser = await createPartnerAuthAccount(
        formData.email,
        formData.password
      );
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
          appliedReferralCode: formData.referralCode || "", // Optional
          role: "partner",
          joinedAt: new Date().toISOString(),
          createdAt: serverTimestamp(),
          status: "active",
          paymentStatus: "completed",
        }
      );
      alert("Partner Created Successfully!");
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Create Partner</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form className="space-y-4">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                      Phone *
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                      placeholder="Phone"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Password *
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                      State *
                    </label>
                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                      placeholder="State"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                      City *
                    </label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                      placeholder="City"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                    placeholder="Pincode"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Plan Type *
                  </label>
                  <select
                    name="planType"
                    value={formData.planType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                  >
                    <option>Starter</option>
                    <option>Booster</option>
                    <option>Academic</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Coupon (Mandatory) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 bg-slate-50 border rounded-xl text-sm uppercase"
                      placeholder="CODE"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCoupon}
                      disabled={verifying}
                      className="px-4 bg-slate-800 text-white rounded-xl text-xs font-bold"
                    >
                      {verifying ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                  {couponStatus === "success" && (
                    <span className="text-green-600 text-[10px] font-bold">
                      Verified!
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Referral Code (Optional)
                  </label>
                  <input
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm uppercase"
                    placeholder="REF123"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border rounded-xl text-sm font-bold"
                >
                  Back
                </button>
              )}
              <button
                onClick={
                  step === 1
                    ? (e) => {
                        e.preventDefault();
                        if (validateStep1()) setStep(2);
                      }
                    : handleSubmit
                }
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : step === 1 ? (
                  "Next"
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
// 3. CREATOR DASHBOARD COMPONENT
// ==========================================

const CreatorDashboardView = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState("service");
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [serviceCycleFilter, setServiceCycleFilter] = useState("All");
  const [assignedToFilter, setAssignedToFilter] = useState("All");

  useEffect(() => {
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
      setLoading(false);
    });

    return () => unsubscribeOrders();
  }, []);

  const stats = useMemo(() => {
    const serviceTypes = [
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
      {
        id: "agency",
        label: "Agency Setup",
        icon: Users,
        color: "bg-blue-600",
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

    return { serviceBreakdown, correctionStats };
  }, [orders]);

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

      const matchesAssignment =
        assignedToFilter === "All" ||
        (assignedToFilter === "Me" &&
          order.assignedTo?.uid === currentUser?.uid);

      return (
        matchesSearch && matchesStatus && matchesPayment && matchesAssignment
      );
    });
  }, [
    orders,
    activeTab,
    searchTerm,
    statusFilter,
    paymentFilter,
    serviceCycleFilter,
    assignedToFilter,
    currentUser,
  ]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredOrders.map((o) => ({
        ID: o.displayId || o.id,
        Service: o.service?.name,
        Type: o.serviceCycle,
        Partner: o.partnerName,
        Date: o.createdAtDate.toLocaleDateString(),
        Status: o.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Orders_${activeTab}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* 1. CARDS: Service, Greeting, Agency, Correction */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={16} className="text-amber-500" /> Workflow Overview
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
                label="Waiting"
                value={service.pending}
                colorClass="text-amber-500"
                icon={Clock}
              />
              <StatRow
                label="Completed"
                value={service.completed}
                colorClass="text-emerald-600"
                icon={CheckCircle}
              />
            </DashboardCard>
          ))}

          <DashboardCard
            title="Correction Schedule"
            icon={CalendarClock}
            color="bg-orange-500"
            badge={
              stats.correctionStats.inProgress + stats.correctionStats.waiting
            }
          >
            <StatRow
              label="In Progress"
              value={stats.correctionStats.inProgress}
              colorClass="text-blue-600"
              icon={PlayCircle}
            />
            <StatRow
              label="Waiting"
              value={stats.correctionStats.waiting}
              colorClass="text-amber-500"
              icon={Clock}
            />
            <StatRow
              label="Completed"
              value={stats.correctionStats.completed}
              colorClass="text-emerald-600"
              icon={CheckCircle}
            />
          </DashboardCard>
        </div>
      </div>

      {/* 2. TABLE SECTION */}
      <div>
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
                    value={assignedToFilter}
                    onChange={(e) => setAssignedToFilter(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-2.5 pl-4 pr-10 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Orders</option>
                    <option value="Me">My Work</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={14}
                  />
                </div>
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
                            <CalendarDays size={10} />{" "}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
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

// --- MAIN STAFF DASHBOARD ---
const StaffDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [partners, setPartners] = useState([]);

  const [loading, setLoading] = useState(true);

  // UI State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState("idle"); // idle, sending, success

  // Pagination
  const [partnerPage, setPartnerPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);

  const navigate = useNavigate();
  const isManager = roles.includes("Manager");
  const isSales = roles.includes("Sales");
  const isCreative = roles.includes("Designer") || roles.includes("Editor");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const docRef = doc(db, "users", user.uid, "profile", "account_info");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setRoles(Array.isArray(data.role) ? data.role : [data.role]);
          }
        } catch (e) {
          console.error("Profile Fetch Error", e);
        }
      } else {
        navigate("/staff/login");
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (roles.length === 0 || !currentUser) return;
    const unsubscribers = [];

    // 1. COUPONS (Only for Sales)
    if (isSales) {
      const qCoupons = query(
        collection(db, "coupons"),
        where("createdBy", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      unsubscribers.push(
        onSnapshot(qCoupons, (snap) =>
          setCoupons(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        )
      );

      // 2. PARTNERS (Filtered by Referral Code)
      if (userData?.referralCode) {
        const qPartners = query(collectionGroup(db, "profile"));
        unsubscribers.push(
          onSnapshot(qPartners, (snap) => {
            const pts = [];
            snap.forEach((doc) => {
              if (doc.id === "account_info") {
                const d = doc.data();
                // IMPORTANT: Filter partners referred by this staff member
                if (
                  d.appliedReferralCode === userData.referralCode &&
                  doc.ref.parent.parent.id !== currentUser.uid
                ) {
                  pts.push({
                    id: doc.id,
                    ...d,
                    joinedAt: d.joinedAt || new Date().toISOString(),
                  });
                }
              }
            });
            setPartners(pts);
          })
        );
      }
    }

    return () => unsubscribers.forEach((u) => u());
  }, [roles, currentUser, userData, isSales]);

  // --- PASSWORD RESET HANDLER ---
  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    setIsProfileOpen(false);
    setResetStatus("sending");

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setTimeout(() => setResetStatus("success"), 1500);
    } catch (error) {
      console.error("Error sending reset email:", error);
      alert("Failed to send reset email. Please try again.");
      setResetStatus("idle");
    }
  };

  const renderSalesView = () => {
    // --- METRICS CALCULATION BASED ON PARTNERS RECRUITED ---

    // Helper to get price of a partner's plan
    const getPartnerRevenue = (p) => {
      const plan = (p.plan || "").toLowerCase();
      if (plan.includes("starter")) return PLAN_PRICES.starter;
      if (plan.includes("booster")) return PLAN_PRICES.booster;
      if (plan.includes("academic")) return PLAN_PRICES.academic;
      return 0;
    };

    const today = new Date();

    // Filter Partners joined TODAY
    const todaysPartners = partners.filter((p) => {
      const d = new Date(p.joinedAt);
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    });

    // 1. TODAY SALES
    const todaysRevenue = todaysPartners.reduce(
      (sum, p) => sum + getPartnerRevenue(p),
      0
    );
    const tStart = todaysPartners.filter((p) =>
      (p.plan || "").toLowerCase().includes("starter")
    ).length;
    const tBoost = todaysPartners.filter((p) =>
      (p.plan || "").toLowerCase().includes("booster")
    ).length;
    const tAcad = todaysPartners.filter((p) =>
      (p.plan || "").toLowerCase().includes("academic")
    ).length;

    // 2. TOTAL SALES
    const totalRevenue = partners.reduce(
      (sum, p) => sum + getPartnerRevenue(p),
      0
    );
    const pStart = partners.filter((p) =>
      (p.plan || "").toLowerCase().includes("starter")
    ).length;
    const pBoost = partners.filter((p) =>
      (p.plan || "").toLowerCase().includes("booster")
    ).length;
    const pAcad = partners.filter((p) =>
      (p.plan || "").toLowerCase().includes("academic")
    ).length;

    // 3. INCENTIVE WALLET (10% of Plan Price)
    const paidPartners = partners.filter(
      (p) => p.paymentStatus === "completed" || p.paymentStatus === "paid"
    );
    const pendingPartners = partners.filter(
      (p) => p.paymentStatus !== "completed" && p.paymentStatus !== "paid"
    );

    const receivedIncentive =
      paidPartners.reduce((sum, p) => sum + getPartnerRevenue(p), 0) * 0.1;
    const pendingIncentive =
      pendingPartners.reduce((sum, p) => sum + getPartnerRevenue(p), 0) * 0.1;

    // Pagination
    const pagedPartners = partners.slice(
      (partnerPage - 1) * 5,
      partnerPage * 5
    );
    const pagedCoupons = coupons.slice((couponPage - 1) * 5, couponPage * 5);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Today Sales"
            mainValue={formatPrice(todaysRevenue)}
            icon={CalendarDays}
            color="purple"
          >
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-1">
              <span>Start: {tStart}</span>
              <span>Boost: {tBoost}</span>
              <span>Acad: {tAcad}</span>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Total Sales"
            mainValue={formatPrice(totalRevenue)}
            icon={TrendingUp}
            color="blue"
          >
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-1">
              <span>Start: {pStart}</span>
              <span>Boost: {pBoost}</span>
              <span>Acad: {pAcad}</span>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Incentive Wallet"
            mainValue={formatPrice(receivedIncentive + pendingIncentive)}
            icon={Wallet}
            color="emerald"
          >
            <div className="flex justify-between text-[10px] font-bold uppercase mt-1">
              <span className="text-emerald-600">
                Rec: {formatPrice(receivedIncentive)}
              </span>
              <span className="text-amber-600">
                Pen: {formatPrice(pendingIncentive)}
              </span>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Active Partners"
            mainValue={partners.length}
            icon={Users}
            color="amber"
          >
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-1">
              <span>Start: {pStart}</span>
              <span>Boost: {pBoost}</span>
              <span>Acad: {pAcad}</span>
            </div>
          </DashboardCard>
        </div>

        {/* ACTIONS ROW */}
        <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Briefcase size={16} className="text-indigo-600" /> Actions
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <UserPlus size={14} /> Create Partner
            </button>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Ticket size={14} /> Create Coupon
            </button>
          </div>
        </div>

        {/* TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm uppercase">
                Referred Partners
              </h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[9px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {pagedPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-bold text-slate-800">
                      {p.fullName}
                    </td>
                    <td className="px-6 py-3">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-bold text-[10px]">
                        {p.plan}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-slate-500">
                      {new Date(p.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {pagedPartners.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-slate-400">
                      No partners yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationControls
              currentPage={partnerPage}
              totalItems={partners.length}
              itemsPerPage={5}
              onPageChange={setPartnerPage}
            />
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm uppercase">
                Coupon History
              </h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[9px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Disc.</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {pagedCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono font-bold text-slate-700">
                      {c.code}
                    </td>
                    <td className="px-6 py-3 font-bold">
                      {c.discountPercent}%
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          c.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {pagedCoupons.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-slate-400">
                      No coupons created.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationControls
              currentPage={couponPage}
              totalItems={coupons.length}
              itemsPerPage={5}
              onPageChange={setCouponPage}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderManagerView = () => <ManagerDashboard />;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      {/* HEADER */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              {userData?.fullName?.charAt(0) || "S"}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">
                Staff Dashboard
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Welcome back, {userData?.fullName}
              </p>
            </div>
          </div>

          {/* PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all"
            >
              <User size={20} className="text-slate-600" />
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
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden p-1.5"
                  >
                    <div className="px-3 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs font-bold text-slate-900">
                        Account Settings
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsAccountModalOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <UserCog size={14} /> My Account
                    </button>
                    <button
                      onClick={handleResetPassword}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Lock size={14} /> Update Password
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={() => {
                        signOut(getAuth());
                        navigate("/staff/login");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* View Routing */}
        {isSales && renderSalesView()}
        {isCreative && <CreatorDashboardView currentUser={currentUser} />}
        {isManager && renderManagerView()}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <GenerateCouponModal
            isOpen={isCouponModalOpen}
            onClose={() => setIsCouponModalOpen(false)}
            user={currentUser}
          />
        )}
        {isPartnerModalOpen && (
          <CreatePartnerModal
            isOpen={isPartnerModalOpen}
            onClose={() => setIsPartnerModalOpen(false)}
          />
        )}
        {isAccountModalOpen && (
          <MyAccountModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            userData={userData}
          />
        )}
        {resetStatus !== "idle" && (
          <PasswordResetModal
            status={resetStatus}
            onClose={() => setResetStatus("idle")}
            email={currentUser?.email}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffDashboard;
