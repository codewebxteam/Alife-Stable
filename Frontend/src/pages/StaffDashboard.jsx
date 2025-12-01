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
  PieChart,
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
  Coins,
  Filter,
  ChevronDown,
  Search,
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
  arrayUnion,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

// --- 1. UTILITIES & HOOKS ---

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

const calculateExpiry = (createdAt, duration) => {
  if (!createdAt) return "N/A";
  const date = new Date(createdAt);
  if (duration?.toLowerCase().includes("year")) {
    date.setFullYear(date.getFullYear() + 1);
  } else if (duration?.toLowerCase().includes("month")) {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusConfig = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("completed"))
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: Check,
      label: "Completed",
    };
  if (s.includes("progress"))
    return {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: Zap,
      label: "In Progress",
    };
  if (s.includes("pending"))
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
      label: "Pending",
    };
  if (s.includes("cancel") || s.includes("reject"))
    return {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: X,
      label: "Cancelled",
    };
  return {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: AlertCircle,
    label: status || "Unknown",
  };
};

// --- 2. SUB-COMPONENTS ---

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

// --- MODAL: RECORD PAYMENT ---
const PaymentActionModal = ({ isOpen, onClose, order, currentUser }) => {
  useScrollLock(isOpen);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const total = order.adminPrice || 0;
  const paid = order.paidAmount || 0;
  const due = Math.max(0, total - paid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) return alert("Enter valid amount");

    setLoading(true);
    try {
      const newPaidTotal = paid + payAmount;
      const newStatus = newPaidTotal >= total ? "Paid" : "Partial";

      await updateDoc(doc(db, "orders", order.id), {
        paidAmount: newPaidTotal,
        paymentStatus: newStatus,
        paymentHistory: arrayUnion({
          amount: payAmount,
          date: new Date().toISOString(),
          staffId: currentUser.uid,
          staffName: currentUser.displayName || "Staff",
          type: "Credit",
        }),
      });
      onClose();
      alert(
        `Payment of ${formatPrice(payAmount)} Recorded! Status: ${newStatus}`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to record payment.");
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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden z-10"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <div className="flex justify-between text-xs text-blue-600 font-medium mb-1">
              <span>Total Cost</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-blue-600 font-medium mb-3">
              <span>Paid So Far</span>
              <span>{formatPrice(paid)}</span>
            </div>
            <div className="flex justify-between text-sm text-blue-800 font-bold border-t border-blue-200 pt-2">
              <span>Remaining Due</span>
              <span>{formatPrice(due)}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Amount Received (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 5000"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1 ml-1">
              * Enter any amount. System will auto-set "Partial" or "Paid".
            </p>
          </div>
          <button
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Verify & Save <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- MODAL: SUBSCRIPTION DETAILS ---
const SubscriptionDetailsModal = ({ title, orders, onClose }) => {
  useScrollLock(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const currentOrders = orders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="text-blue-500" size={20} /> {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {currentOrders.length === 0 ? (
            <p className="text-center text-slate-400 text-sm">
              No active subscriptions.
            </p>
          ) : (
            <div className="space-y-3">
              {currentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">
                        #{order.displayId}
                      </span>
                      <h4 className="font-bold text-slate-800 mt-1">
                        {order.service?.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Expiry
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {calculateExpiry(order.createdAtDate, order.Duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-50 mt-2">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600">
                      {order.partnerName?.charAt(0) || "C"}
                    </div>
                    <span className="text-xs text-slate-600">
                      {order.partnerName || "Client"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <PaginationControls
          currentPage={page}
          totalItems={orders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
        />
      </motion.div>
    </div>
  );
};

// --- MODAL: TO DO LIST ---
const TodoListModal = ({ orders, onClose, onComplete, onVerify }) => {
  useScrollLock(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const currentOrders = orders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ListTodo className="text-violet-500" size={20} /> My To-Do List
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {currentOrders.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-12 h-12 text-emerald-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">
                All caught up! No pending tasks.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {order.service?.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {order.displayId}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-violet-50 text-violet-700 rounded-lg text-[10px] font-bold uppercase">
                      {order.Duration || "ASAP"}
                    </span>
                  </div>
                  <div className="flex gap-2 border-t border-slate-50 pt-3">
                    <button
                      onClick={() => onComplete(order.id)}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check size={14} /> Mark Done
                    </button>
                    {order.paymentStatus !== "Paid" && (
                      <button
                        onClick={() => onVerify(order.id)}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <DollarSign size={14} /> Verify Pay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <PaginationControls
          currentPage={page}
          totalItems={orders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
        />
      </motion.div>
    </div>
  );
};

// --- UTILS: GRAPH & COUPON & CARD ---

const RevenueBarChart = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <div className="h-48 flex items-center justify-center text-slate-300 text-xs font-bold border-dashed border border-slate-200 rounded-xl">
        No Data
      </div>
    );
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full h-48 mt-4 flex items-end justify-between gap-1 sm:gap-2 px-2 pb-2">
      {data.map((d, i) => {
        const heightPercent = Math.max((d.value / maxVal) * 100, 2);
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-2 flex-1 group h-full justify-end"
          >
            <div className="w-full relative flex items-end justify-center h-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                className="w-2 sm:w-3 bg-slate-800 rounded-t-sm relative min-h-[4px] group-hover:bg-blue-600 transition-colors shadow-sm"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl border border-slate-700">
                  {formatPrice(d.value)}
                </div>
              </motion.div>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors truncate w-full text-center">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const GenerateCouponModal = ({ isOpen, onClose, user }) => {
  useScrollLock(isOpen);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = () =>
    setCode(`OFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "coupons"), {
        code: code.toUpperCase(),
        discountPercent: Number(discount), // Using Percent
        createdBy: user.uid,
        creatorName: user.displayName,
        createdAt: serverTimestamp(),
        status: "Active",
      });
      onClose();
      setCode("");
      setDiscount("");
      alert("Coupon Created!");
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
        exit={{ scale: 0.95 }}
        className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 z-10"
      >
        <h3 className="text-lg font-bold mb-4">Create Discount Coupon</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 border border-slate-200 bg-slate-50 p-3 rounded-xl font-mono text-sm"
              placeholder="Code"
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
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm"
            placeholder="Discount Percentage (%)"
            max="100"
            required
          />
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition-colors"
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const DashboardCard = ({
  title,
  mainValue,
  icon: Icon,
  color,
  children,
  onClick,
  className,
}) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <motion.div
      onClick={onClick}
      className={`relative p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        onClick
          ? "cursor-pointer hover:border-blue-300 hover:shadow-blue-200/50"
          : ""
      } ${className}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {mainValue}
          </h3>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {children && (
        <div className="relative z-10 mt-auto pt-3 border-t border-slate-50 text-[10px] sm:text-[11px] font-medium text-slate-500 space-y-1.5">
          {children}
        </div>
      )}
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
const StaffDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [roles, setRoles] = useState([]);

  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [partners, setPartners] = useState([]);
  const [myReferralCode, setMyReferralCode] = useState(null);
  const [myStaffName, setMyStaffName] = useState("Staff");

  const [loading, setLoading] = useState(true);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [managerTimeFilter, setManagerTimeFilter] = useState("Weekly");

  // Filters for Table
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedSubscriptionType, setSelectedSubscriptionType] =
    useState(null);
  const [subscriptionModalData, setSubscriptionModalData] = useState([]);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);

  const [partnerPage, setPartnerPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);

  const navigate = useNavigate();
  const isManager = roles.includes("Manager");
  const isSales = roles.includes("Sales");
  const isCreative = roles.includes("Designer") || roles.includes("Editor");

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate("/staff/login");
  };

  // --- AUTH & PROFILE FETCH ---
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
            setRoles(Array.isArray(data.role) ? data.role : [data.role]);
            setMyReferralCode(data.referralCode);
            setMyStaffName(data.fullName || user.displayName);
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

  // --- DATA LISTENERS ---
  useEffect(() => {
    if (roles.length === 0 || !currentUser) return;
    const unsubscribers = [];

    // 1. ORDERS: Everyone needs orders, but filtering happens in render or stats
    const qOrders = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    unsubscribers.push(
      onSnapshot(qOrders, (snap) => {
        setOrders(
          snap.docs.map((doc) => {
            const data = doc.data();
            const dateObj = data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date();

            // Calculate Due
            const total = parseFloat(data.pricing?.priceToAdmin || 0);
            const paid = parseFloat(data.paidAmount || 0);
            const s = (data.status || "").toLowerCase();
            const isCancelled = s.includes("cancel") || s.includes("reject");
            const due = isCancelled ? 0 : Math.max(0, total - paid);

            return {
              id: doc.id,
              ...data,
              parsedAmount: parseFloat(
                data.amount?.toString().replace(/[₹,]/g, "") || 0
              ),
              adminPrice: total,
              paidAmount: paid,
              dueAmount: due,
              createdAtDate: dateObj,
              displayId: doc.id.substring(0, 6).toUpperCase(),
              dateFormatted: dateObj.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric", // Full date as requested
              }),
            };
          })
        );
      })
    );

    // 2. SALES DATA: Only if Sales role
    if (isSales) {
      const qCoupons = query(
        collection(db, "coupons"),
        where("createdBy", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      unsubscribers.push(
        onSnapshot(qCoupons, (snap) =>
          setCoupons(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        )
      );

      if (myReferralCode) {
        const qPartners = query(
          collectionGroup(db, "profile"),
          where("referralCode", "==", myReferralCode)
        );
        unsubscribers.push(
          onSnapshot(qPartners, (snap) => {
            const pts = [];
            snap.forEach((doc) => {
              const d = doc.data();
              // *** FIX: Exclude self from referral list ***
              if (doc.ref.parent.parent.id !== currentUser.uid) {
                pts.push({ id: doc.id, ...d });
              }
            });
            setPartners(pts);
          })
        );
      }
    }
    return () => unsubscribers.forEach((u) => u());
  }, [roles, currentUser, myReferralCode, isSales]);

  // --- ACTIONS ---
  const handleAcceptTask = async (orderId) => {
    if (!window.confirm("Accept this task?")) return;
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "In_Progress",
        assignedTo: {
          uid: currentUser.uid,
          name: myStaffName,
          role: roles.join(", "),
          acceptedAt: new Date().toISOString(),
        },
      });
    } catch (e) {
      alert("Error accepting task");
    }
  };

  const handleMarkComplete = async (orderId) => {
    if (!window.confirm("Mark as Completed?")) return;
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Completed",
        completedAt: serverTimestamp(),
      });
    } catch (e) {
      alert("Error marking complete");
    }
  };

  // --- STATISTICS CALCULATION ---
  const stats = useMemo(() => {
    let relevantOrders = orders;

    // SALES Filter
    if (!isManager && isSales) {
      const myPartnerIds = partners.map((p) => p.id);
      relevantOrders = orders.filter(
        (o) =>
          myPartnerIds.includes(o.partnerId) ||
          o.referralCode === myReferralCode
      );
    }

    // MANAGER Time Filter
    if (isManager) {
      const now = new Date();
      if (managerTimeFilter === "Weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        relevantOrders = relevantOrders.filter(
          (o) => o.createdAtDate >= startOfWeek
        );
      } else {
        relevantOrders = relevantOrders.filter(
          (o) =>
            o.createdAtDate.getMonth() === now.getMonth() &&
            o.createdAtDate.getFullYear() === now.getFullYear()
        );
      }
    }

    const revenue = relevantOrders.reduce(
      (acc, o) => acc + (o.parsedAmount || 0),
      0
    );
    const completed = relevantOrders.filter((o) =>
      (o.status || "").toLowerCase().includes("completed")
    ).length;

    const graphData = [
      { label: "Wk 1", value: revenue * 0.15 },
      { label: "Wk 2", value: revenue * 0.25 },
      { label: "Wk 3", value: revenue * 0.35 },
      { label: "Wk 4", value: revenue * 0.25 },
    ];
    return { revenue, completed, graphData };
  }, [
    orders,
    isManager,
    isSales,
    partners,
    currentUser,
    managerTimeFilter,
    myReferralCode,
  ]);

  // --- RENDERERS ---

  const renderManagerView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Manager Overview</h2>
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm">
          {["Weekly", "Monthly"].map((t) => (
            <button
              key={t}
              onClick={() => setManagerTimeFilter(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                managerTimeFilter === t
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title={`Revenue (${managerTimeFilter})`}
          mainValue={formatPrice(stats.revenue)}
          icon={Wallet}
          color="emerald"
        />
        <DashboardCard
          title="Completed"
          mainValue={stats.completed}
          icon={Check}
          color="blue"
        />
        <DashboardCard
          title="Total Pending"
          mainValue={
            orders.filter((o) => o.status?.toLowerCase().includes("pending"))
              .length
          }
          icon={Clock}
          color="amber"
        />
        <DashboardCard
          title="Active Users"
          mainValue={partners.length || "N/A"}
          icon={Users}
          color="purple"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">
            Revenue Trend
          </h3>
          <RevenueBarChart data={stats.graphData} />
        </div>
      </div>
    </div>
  );

  const renderSalesView = () => {
    const myPartnerIds = partners.map((p) => p.id);
    const myRevenue = orders
      .filter((o) => myPartnerIds.includes(o.partnerId))
      .reduce((acc, o) => acc + (o.parsedAmount || 0), 0);

    const paginatedPartners = partners.slice(
      (partnerPage - 1) * 5,
      partnerPage * 5
    );
    const paginatedCoupons = coupons.slice(
      (couponPage - 1) * 5,
      couponPage * 5
    );

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-xl font-bold text-slate-800">Sales Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard
            title="My Generated Revenue"
            mainValue={formatPrice(myRevenue)}
            icon={Wallet}
            color="emerald"
          >
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 transition-colors flex items-center gap-1"
              >
                <Ticket size={12} /> Create Coupon
              </button>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Partners Referred"
            mainValue={partners.length}
            icon={Users}
            color="blue"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden h-fit flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  My Partners
                </h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase">
                      Name & Plan
                    </th>
                    <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase text-right">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedPartners.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3">
                        <p className="text-xs font-bold text-slate-900">
                          {p.fullName}
                        </p>
                        <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase font-bold">
                          {p.plan || "Starter"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-[10px] text-slate-500 font-mono">
                        {p.joinedAt
                          ? new Date(p.joinedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={partnerPage}
              totalItems={partners.length}
              itemsPerPage={5}
              onPageChange={setPartnerPage}
            />
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden h-fit flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Coupon History
                </h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {coupons.length}
                </span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase">
                      Code
                    </th>
                    <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase">
                      Disc.
                    </th>
                    <th className="px-6 py-3 text-[9px] font-bold text-slate-500 uppercase text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedCoupons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {c.code}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(c.code)
                            }
                            className="text-slate-300 hover:text-blue-500"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-900">
                        {c.discountPercent}%
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            c.status === "Active"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

  const renderCreativeView = () => {
    // 1. My assigned Orders
    const myOrders = orders.filter(
      (o) => o.assignedTo?.uid === currentUser.uid
    );

    // 2. Active Packages (Yearly/Monthly) filtering
    const activePackages = orders.filter(
      (o) =>
        (o.status.toLowerCase().includes("progress") ||
          o.status.toLowerCase().includes("completed")) &&
        !o.status.toLowerCase().includes("cancel") &&
        (o.Duration?.toLowerCase().includes("year") ||
          o.Duration?.toLowerCase().includes("month"))
    );

    const getSubs = (type, duration) =>
      activePackages.filter(
        (o) =>
          o.service?.name?.toLowerCase().includes(type) &&
          o.Duration?.toLowerCase().includes(duration)
      );

    // 3. Live Feed Logic
    const pendingOrders = orders.filter((o) =>
      (o.status || "").toLowerCase().includes("pending")
    );

    // Combine My Orders + Pending Orders for the Table
    let displayOrders = [...myOrders, ...pendingOrders];

    // FILTER: Differentiate Editor vs Designer
    if (roles.includes("Editor") && !roles.includes("Designer")) {
      displayOrders = displayOrders.filter(
        (o) =>
          o.service?.name?.toLowerCase().includes("video") ||
          o.service?.name?.toLowerCase().includes("edit") ||
          o.service?.name?.toLowerCase().includes("reel")
      );
    } else if (roles.includes("Designer") && !roles.includes("Editor")) {
      displayOrders = displayOrders.filter(
        (o) =>
          o.service?.name?.toLowerCase().includes("design") ||
          o.service?.name?.toLowerCase().includes("graphic") ||
          o.service?.name?.toLowerCase().includes("logo")
      );
    }

    // Sort by recent first
    displayOrders.sort((a, b) => b.createdAtDate - a.createdAtDate);

    // *** APPLY SEARCH & STATUS FILTER ***
    const filteredDisplayOrders = displayOrders.filter((order) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        order.service?.name?.toLowerCase().includes(term) ||
        order.partnerName?.toLowerCase().includes(term) ||
        order.displayId?.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "All" ||
        (order.status || "").toLowerCase().includes(statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    });

    const handleOpenSubModal = (title, data) => {
      setSubscriptionModalData(data);
      setSelectedSubscriptionType(title);
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-xl font-bold text-slate-800">Creative Workspace</h2>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  All Time Tasks
                </p>
                <h3 className="text-3xl font-black text-slate-900">
                  {myOrders.length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Briefcase size={20} />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 p-2 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <p className="text-[9px] font-bold text-blue-400 uppercase">
                  In Progress
                </p>
                <p className="text-lg font-bold text-blue-700">
                  {
                    myOrders.filter((o) =>
                      o.status.toLowerCase().includes("progress")
                    ).length
                  }
                </p>
              </div>
              <div className="flex-1 p-2 bg-rose-50 rounded-xl border border-rose-100 text-center">
                <p className="text-[9px] font-bold text-rose-400 uppercase">
                  Cancelled
                </p>
                <p className="text-lg font-bold text-rose-700">
                  {
                    myOrders.filter((o) =>
                      o.status.toLowerCase().includes("cancel")
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Active Packages
                </p>
                <h3 className="text-3xl font-black text-slate-900">
                  {activePackages.length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Layers size={20} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500">
                Live monthly/yearly subscriptions across all clients.
              </p>
            </div>
          </div>
        </div>

        {/* Client Subscriptions */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Client Subscriptions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Yearly Video",
                data: getSubs("video", "year"),
                color: "bg-indigo-50 border-indigo-100 text-indigo-700",
              },
              {
                label: "Yearly Image",
                data: getSubs("design", "year"),
                color: "bg-orange-50 border-orange-100 text-orange-700",
              },
              {
                label: "Monthly Video",
                data: getSubs("video", "month"),
                color: "bg-blue-50 border-blue-100 text-blue-700",
              },
              {
                label: "Monthly Image",
                data: getSubs("design", "month"),
                color: "bg-pink-50 border-pink-100 text-pink-700",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-[1.5rem] border ${item.color} flex flex-col justify-between h-32`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase opacity-70">
                    {item.label}
                  </span>
                  <h4 className="text-2xl font-black">{item.data.length}</h4>
                </div>
                <button
                  onClick={() => handleOpenSubModal(item.label, item.data)}
                  className="text-[10px] font-bold bg-white/60 px-3 py-1.5 rounded-lg w-fit hover:bg-white transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* To Do List Trigger */}
        <div
          onClick={() => setIsTodoModalOpen(true)}
          className="group relative p-6 rounded-[2rem] cursor-pointer overflow-hidden shadow-2xl shadow-indigo-500/20 hover:scale-[1.01] transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex justify-between items-center text-white">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-3">
                <ListTodo className="text-indigo-200" /> My To-Do List
              </h3>
              <p className="text-sm text-indigo-100 mt-1 opacity-90">
                View accepted tasks waiting for completion.
              </p>
            </div>
            <ArrowRight size={24} />
          </div>
        </div>

        {/* Live Feed Table */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase size={20} className="text-slate-400" /> Recent Orders{" "}
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] ml-1">
                Live Feed
              </span>
            </h3>

            {/* Admin-Style Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="In_Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative w-full sm:w-48 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            {filteredDisplayOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 opacity-50">
                <p className="text-sm font-bold text-slate-400">
                  No active tasks found matching criteria.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Service
                    </th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Client
                    </th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Financials (Due / Paid)
                    </th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDisplayOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const isMine = order.assignedTo?.uid === currentUser.uid;
                    const isPending = (order.status || "")
                      .toLowerCase()
                      .includes("pending");

                    return (
                      <tr
                        key={order.id}
                        className={`transition-colors ${
                          isMine
                            ? "bg-blue-50/30 hover:bg-blue-50/50"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                                order.service?.name
                                  ?.toLowerCase()
                                  .includes("video")
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {order.service?.name
                                ?.toLowerCase()
                                .includes("video") ? (
                                <Video size={14} />
                              ) : (
                                <ImageIcon size={14} />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                {order.service?.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {order.displayId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-xs">
                            {order.partnerName || "Direct Client"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.dateFormatted}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between w-24 text-[10px]">
                              <span className="text-slate-400">Total:</span>
                              <span className="font-bold text-slate-900">
                                {formatPrice(order.adminPrice)}
                              </span>
                            </div>
                            <div className="flex justify-between w-24 text-[10px]">
                              <span className="text-slate-400">Due:</span>
                              <span
                                className={`font-bold px-1 rounded ${
                                  order.dueAmount > 0
                                    ? "bg-red-50 text-red-600"
                                    : "bg-emerald-50 text-emerald-600"
                                }`}
                              >
                                {formatPrice(order.dueAmount)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <statusConfig.icon size={10} /> {statusConfig.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPending ? (
                            <button
                              onClick={() => handleAcceptTask(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg hover:bg-slate-800 transition-all"
                            >
                              Accept Task <PlayCircle size={10} />
                            </button>
                          ) : isMine ? (
                            <div className="flex gap-2 justify-end">
                              {/* SHOW VERIFY BUTTON IF: Due Amount > 0 AND Not Cancelled */}
                              {order.dueAmount > 0 &&
                                !order.status
                                  .toLowerCase()
                                  .includes("cancel") && (
                                  <button
                                    onClick={() => setPaymentModalOrder(order)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
                                    title="Record Payment"
                                  >
                                    Verify <ArrowRight size={10} />
                                  </button>
                                )}

                              {/* SHOW DONE BUTTON IF: Status is In Progress */}
                              {order.status
                                .toLowerCase()
                                .includes("progress") && (
                                <button
                                  onClick={() => handleMarkComplete(order.id)}
                                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 flex items-center gap-1 shadow-md"
                                >
                                  <Check size={12} /> Done
                                </button>
                              )}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Staff Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">Overview</h1>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              {currentUser?.displayName?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900">
                {myStaffName}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">
                {roles.join(" & ")}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors ml-4"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* View Routing */}
        {isManager && renderManagerView()}

        {!isManager && (
          <div className="space-y-12">
            {isSales && renderSalesView()}
            {isCreative && renderCreativeView()}
          </div>
        )}
      </div>

      {/* Modals */}
      <GenerateCouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        user={currentUser}
      />

      <AnimatePresence>
        {selectedSubscriptionType && (
          <SubscriptionDetailsModal
            title={selectedSubscriptionType}
            orders={subscriptionModalData}
            onClose={() => setSelectedSubscriptionType(null)}
          />
        )}
        {isTodoModalOpen && (
          <TodoListModal
            orders={orders.filter(
              (o) =>
                o.assignedTo?.uid === currentUser.uid &&
                o.status.toLowerCase().includes("progress")
            )}
            onClose={() => setIsTodoModalOpen(false)}
            onComplete={handleMarkComplete}
            onVerify={(id) =>
              setPaymentModalOrder(orders.find((o) => o.id === id))
            }
          />
        )}
        {paymentModalOrder && (
          <PaymentActionModal
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

export default StaffDashboard;
