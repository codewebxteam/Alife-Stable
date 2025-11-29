import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ShoppingBag,
  Clock,
  Search,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  Check,
  X,
  UserPlus,
  Ticket,
  Briefcase,
  Eye,
  Calendar,
  Zap,
  TrendingUp,
  Filter,
  ChevronDown,
  CreditCard,
  ShieldCheck,
  Wallet,
  ArrowRight,
  BellRing,
  PieChart,
  BarChart3,
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import AddStaffModal from "../components/AddStaffModal";
import GenerateCouponModal from "../components/GenerateCouponModal";

// --- 1. UTILITIES ---
const formatPrice = (value) => {
  if (!value) return "₹0";
  const num = Number(value.toString().replace(/[^0-9.-]+/g, ""));
  return `₹${num.toLocaleString("en-IN")}`;
};

const getStatusConfig = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("completed") || s.includes("delivered"))
    return {
      icon: Check,
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      label: "Completed",
      badge: "bg-emerald-500",
    };
  if (s.includes("pending") || s.includes("approval"))
    return {
      icon: Clock,
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      label: "Approval Req",
      badge: "bg-amber-500",
    };
  if (s.includes("progress"))
    return {
      icon: Zap,
      text: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "In Progress",
      badge: "bg-blue-500",
    };
  if (s.includes("reject") || s.includes("cancel"))
    return {
      icon: X,
      text: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200",
      label: "Rejected",
      badge: "bg-rose-500",
    };
  return {
    icon: AlertCircle,
    text: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: status?.replace(/_/g, " ") || "Unknown",
    badge: "bg-slate-500",
  };
};

// --- 2. COMPONENTS ---

// Stat Card
const StatCard = ({ title, value, icon, subLabel, theme, trend }) => {
  const themes = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
    amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/20",
    rose: "from-rose-500 to-rose-600 shadow-rose-500/20",
  };
  const bgGradient = themes[theme] || themes.blue;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative p-5 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col justify-between h-full"
    >
      <div
        className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${bgGradient} opacity-10 rounded-bl-[4rem] -mr-4 -mt-4`}
      />
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div
          className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white shadow-lg`}
        >
          {React.cloneElement(icon, { size: 18 })}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500">
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
          {title}
        </p>
        {subLabel && (
          <p className="text-[9px] text-slate-400 mt-1 font-medium bg-slate-50 w-fit px-1.5 py-0.5 rounded-md">
            {subLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// --- CHARTS ---
const RevenueChart = ({ data, range }) => {
  if (!data || data.length === 0)
    return (
      <div className="h-40 flex items-center justify-center text-slate-300 text-xs">
        No Data
      </div>
    );
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxVal) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-40 relative group mt-4">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M0,100 ${points
            .split(" ")
            .map((p) => `L${p}`)
            .join(" ")} L100,100 Z`}
          fill="url(#revGradient)"
        />
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * 100}
            cy={100 - (d.value / maxVal) * 100}
            r="2"
            fill="#fff"
            stroke="#10b981"
            strokeWidth="1.5"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-[9px] text-slate-400 font-bold uppercase">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

const OrderPieChart = ({ stats }) => {
  const total = stats.completed + stats.pending + stats.cancelled;
  if (total === 0)
    return (
      <div className="h-32 flex items-center justify-center text-slate-300 text-xs">
        No Orders
      </div>
    );

  const pComp = (stats.completed / total) * 100;
  const pPend = (stats.pending / total) * 100;
  const pCanc = (stats.cancelled / total) * 100;

  return (
    <div className="flex items-center gap-6 mt-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
          <circle
            cx="21"
            cy="21"
            r="15.91549430918954"
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="6"
          ></circle>
          <circle
            cx="21"
            cy="21"
            r="15.91549430918954"
            fill="transparent"
            stroke="#10b981"
            strokeWidth="6"
            strokeDasharray={`${pComp} ${100 - pComp}`}
            strokeDashoffset="25"
          ></circle>
          <circle
            cx="21"
            cy="21"
            r="15.91549430918954"
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="6"
            strokeDasharray={`${pPend} ${100 - pPend}`}
            strokeDashoffset={`${25 - pComp}`}
          ></circle>
          <circle
            cx="21"
            cy="21"
            r="15.91549430918954"
            fill="transparent"
            stroke="#f43f5e"
            strokeWidth="6"
            strokeDasharray={`${pCanc} ${100 - pCanc}`}
            strokeDashoffset={`${25 - pComp - pPend}`}
          ></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-slate-800">{total}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase">
            Total
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            {stats.completed} Completed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            {stats.pending} Pending
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            {stats.cancelled} Void
          </span>
        </div>
      </div>
    </div>
  );
};

// --- MODALS ---
const PartnerLedgerModal = ({ isOpen, onClose, partner }) => {
  if (!isOpen || !partner) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] pointer-events-auto"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {partner.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Financial History
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4 bg-white shrink-0">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
              <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">
                Total Orders
              </p>
              <p className="text-2xl font-black text-blue-700">
                {partner.history.length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-600 mb-1">
                Total Paid
              </p>
              <p className="text-2xl font-black text-emerald-700">
                {formatPrice(partner.totalPaid)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
              <p className="text-[10px] uppercase font-bold text-rose-600 mb-1">
                Current Due
              </p>
              <p className="text-2xl font-black text-rose-700">
                {formatPrice(partner.currentDue)}
              </p>
            </div>
          </div>
          <div
            className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0"
            data-lenis-prevent
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-6">
              Transactions
            </h3>
            <div className="space-y-3">
              {partner.history.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {order.service?.name}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">
                        {order.Duration}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      {order.displayId} • {order.dateFormatted}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {formatPrice(order.adminPrice)}
                    </div>
                    {order.dueAmount > 0 ? (
                      <p className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full mt-1">
                        Due: {formatPrice(order.dueAmount)}
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Paid
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const PaymentVerificationModal = ({ isOpen, onClose, order }) => {
  const [amount, setAmount] = useState(order?.paymentRequestAmount || "");
  const [loading, setLoading] = useState(false);
  if (!isOpen || !order) return null;
  const totalCost = parseFloat(order.pricing?.priceToAdmin || 0);
  const currentlyPaid = parseFloat(order.paidAmount || 0);
  const remainingDue = totalCost - currentlyPaid;
  const handleVerifyPayment = async () => {
    setLoading(true);
    const newPaid = currentlyPaid + parseFloat(amount || 0);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        paidAmount: newPaid,
        paymentStatus: newPaid >= totalCost ? "Paid" : "Partial",
        paymentRequestAmount: 0, // Clear Request
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const handleStatus = async (newStatus) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Verify Payment
                </h2>
                <p className="text-xs text-slate-500">
                  Partner:{" "}
                  <span className="font-bold text-slate-700">
                    {order.partnerName}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Order ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-600">
                  {order.displayId}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 font-medium">Total Cost</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(totalCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-500 font-medium">Due</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {formatPrice(remainingDue)}
                </span>
              </div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Add Verified Amount
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-6 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <button
                  onClick={handleVerifyPayment}
                  disabled={loading || !amount || parseFloat(amount) <= 0}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}{" "}
                  Confirm
                </button>
              </div>
              {order.paymentRequestAmount > 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-700 text-[10px] font-bold flex items-center gap-2">
                  <BellRing size={12} /> Partner claims payment: ₹
                  {order.paymentRequestAmount}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Update Status
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStatus("In_Progress")}
                  className="py-3 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 hover:shadow-md transition-all"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatus("Completed")}
                  className="py-3 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 hover:shadow-md transition-all"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => handleStatus("Rejected")}
                  className="col-span-2 py-3 rounded-xl border border-rose-100 bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 hover:shadow-md transition-all"
                >
                  Reject Order
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- MAIN DASHBOARD ---
const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all_orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [chartFilter, setChartFilter] = useState("Weekly"); // TOGGLE STATE

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [actionOrder, setActionOrder] = useState(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  const [financials, setFinancials] = useState({
    totalRevenue: 0,
    totalDue: 0,
    partnerCount: 0,
    pendingCount: 0,
  });
  const [pieData, setPieData] = useState({
    completed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [revenueData, setRevenueData] = useState([]);

  // Time
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = [];
      const partnerMap = {};
      let totalRev = 0,
        totalDue = 0,
        pendingReqs = 0;
      let comp = 0,
        pend = 0,
        canc = 0;

      // Mock daily revenue buckets
      const days = {};
      [...Array(7)].forEach((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days[d.toLocaleDateString("en-IN", { weekday: "short" })] = 0;
      });

      snapshot.docs.forEach((doc) => {
        const d = doc.data();
        const dateObj = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
        const adminCost = parseFloat(d.pricing?.priceToAdmin || 0);
        const paid = parseFloat(d.paidAmount || 0);
        const due = Math.max(0, adminCost - paid);

        totalRev += paid;
        totalDue += due;
        if (d.status === "PENDING_APPROVAL_FROM_ADMIN") pendingReqs++;

        // Status Counts for Pie
        if (d.status?.toLowerCase().includes("completed")) comp++;
        else if (
          d.status?.toLowerCase().includes("pending") ||
          d.status?.includes("APPROVAL")
        )
          pend++;
        else if (
          d.status?.toLowerCase().includes("reject") ||
          d.status?.toLowerCase().includes("cancel")
        )
          canc++;

        // Revenue Chart (Distribution based on createdAt - Simple Logic)
        const dayKey = dateObj.toLocaleDateString("en-IN", {
          weekday: "short",
        });
        if (days[dayKey] !== undefined) days[dayKey] += paid;

        const orderObj = {
          id: doc.id,
          ...d,
          adminPrice: adminCost,
          paidAmount: paid,
          dueAmount: due,
          dateFormatted: dateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          createdAtDate: dateObj,
        };
        fetchedOrders.push(orderObj);

        if (d.partnerId) {
          if (!partnerMap[d.partnerId])
            partnerMap[d.partnerId] = {
              id: d.partnerId,
              name: d.partnerName || "Unknown",
              totalPaid: 0,
              currentDue: 0,
              history: [],
            };
          partnerMap[d.partnerId].totalPaid += paid;
          partnerMap[d.partnerId].currentDue += due;
          partnerMap[d.partnerId].history.push(orderObj);
        }
      });

      const revChart = Object.entries(days)
        .map(([label, value]) => ({ label, value }))
        .reverse();

      setOrders(fetchedOrders);
      setPartners(
        Object.values(partnerMap).sort((a, b) => b.currentDue - a.currentDue)
      );
      setFinancials({
        totalRevenue: totalRev,
        totalDue: totalDue,
        partnerCount: Object.keys(partnerMap).length,
        pendingCount: pendingReqs,
      });
      setPieData({ completed: comp, pending: pend, cancelled: canc });
      setRevenueData(revChart);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- DYNAMIC CHART DATA LOGIC ---
  const { chartData, pieData: activePieData } = useMemo(() => {
    const now = new Date();
    let revenuePoints = [];
    let comp = 0,
      pend = 0,
      canc = 0;

    // Filter orders based on Toggle
    const filteredForCharts = orders.filter((o) => {
      const diffDays = Math.floor(
        (now - o.createdAtDate) / (1000 * 60 * 60 * 24)
      );
      return chartFilter === "Weekly" ? diffDays <= 7 : diffDays <= 30;
    });

    filteredForCharts.forEach((o) => {
      if (o.status?.toLowerCase().includes("completed")) comp++;
      else if (o.status?.toLowerCase().includes("pending")) pend++;
      else if (
        o.status?.toLowerCase().includes("reject") ||
        o.status?.toLowerCase().includes("cancel")
      )
        canc++;
    });

    if (chartFilter === "Weekly") {
      const daysMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        daysMap[d.toLocaleDateString("en-IN", { weekday: "short" })] = 0;
      }
      filteredForCharts.forEach((o) => {
        const key = o.createdAtDate.toLocaleDateString("en-IN", {
          weekday: "short",
        });
        if (daysMap[key] !== undefined) daysMap[key] += o.paidAmount;
      });
      revenuePoints = Object.entries(daysMap).map(([label, value]) => ({
        label,
        value,
      }));
    } else {
      const weeksMap = { "Wk 1": 0, "Wk 2": 0, "Wk 3": 0, "Wk 4": 0 };
      filteredForCharts.forEach((o) => {
        const diffDays = Math.floor(
          (now - o.createdAtDate) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 7) weeksMap["Wk 4"] += o.paidAmount;
        else if (diffDays <= 14) weeksMap["Wk 3"] += o.paidAmount;
        else if (diffDays <= 21) weeksMap["Wk 2"] += o.paidAmount;
        else weeksMap["Wk 1"] += o.paidAmount;
      });
      revenuePoints = Object.entries(weeksMap).map(([label, value]) => ({
        label,
        value,
      }));
    }

    return {
      chartData: revenuePoints,
      pieData: { completed: comp, pending: pend, cancelled: canc },
    };
  }, [orders, chartFilter]);

  const filteredData = (() => {
    let data = orders;
    if (activeTab === "payment_requests")
      data = orders.filter((o) => o.paymentStatus === "Verification_Pending");
    return data.filter(
      (o) =>
        o.partnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.displayId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12 overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-2">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-6 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                Admin Console
              </span>
              <span className="text-xs font-mono font-medium text-slate-400">
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Overview
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <UserPlus size={16} /> Add Staff
            </button>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Ticket size={16} /> New Coupon
            </button>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            title="Total Revenue"
            value={formatPrice(financials.totalRevenue)}
            icon={<Wallet />}
            subLabel="Verified"
            theme="emerald"
            trend="+12%"
          />
          <StatCard
            title="Total Market Due"
            value={formatPrice(financials.totalDue)}
            icon={<AlertCircle />}
            subLabel="Outstanding"
            theme="rose"
            trend="High"
          />
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={<ShoppingBag />}
            subLabel="+ New"
            theme="blue"
            trend="Live"
          />
          <StatCard
            title="Pending Approvals"
            value={financials.pendingCount}
            icon={<BellRing />}
            subLabel="Needs Action"
            theme="amber"
            trend={financials.pendingCount > 0 ? "Req" : "Clear"}
          />
          <StatCard
            title="Active Partners"
            value={financials.partnerCount}
            icon={<Users />}
            subLabel="Stable"
            theme="indigo"
            trend="Stable"
          />
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" /> Revenue
                  Trend
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Performance Analytics
                </p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {["Weekly", "Monthly"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartFilter(t)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                      chartFilter === t
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <RevenueChart data={chartData} range={chartFilter} />
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col justify-center">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <PieChart size={20} className="text-blue-500" /> Order Status
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Distribution ({chartFilter})
                </p>
              </div>
            </div>
            <OrderPieChart stats={activePieData} />
          </div>
        </div>

        {/* MAIN SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-[750px]">
          <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("all_orders")}
                className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === "all_orders"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Briefcase size={14} /> All Orders
              </button>
              <button
                onClick={() => setActiveTab("payment_requests")}
                className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === "payment_requests"
                    ? "bg-white text-amber-600 shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BellRing size={14} /> Payment Requests{" "}
                {financials.pendingCount > 0 && (
                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">
                    {financials.pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("ledger")}
                className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === "ledger"
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Wallet size={14} /> Partner Ledger
              </button>
            </div>
            <div className="relative w-full xl:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search orders, partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto custom-scrollbar bg-white p-0"
            data-lenis-prevent
          >
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm font-bold">
                <Loader2 className="animate-spin mr-2" /> Loading Dashboard...
              </div>
            ) : (
              <>
                {(activeTab === "payment_requests" ||
                  activeTab === "all_orders") && (
                  <>
                    {filteredData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-96 opacity-50">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">
                          No orders found.
                        </p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-100">
                          <tr>
                            <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Order Info
                            </th>
                            <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden md:table-cell">
                              Partner
                            </th>
                            <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Financials
                            </th>
                            <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden lg:table-cell">
                              Status
                            </th>
                            <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredData.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            return (
                              <tr
                                key={order.id}
                                className="group hover:bg-slate-50/60 transition-colors cursor-default"
                              >
                                <td className="px-8 py-5 align-top">
                                  <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                      {order.service?.name?.charAt(0) || "S"}
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 text-sm">
                                        {order.service?.name}
                                      </div>
                                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                        {order.displayId} • {order.Duration}
                                      </div>
                                      <div className="mt-2 md:hidden">
                                        <span
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                        >
                                          {statusConfig.label}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5 align-top hidden md:table-cell">
                                  <div className="font-bold text-slate-800 text-sm">
                                    {order.partnerName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1">
                                    Submitted: {order.dateFormatted}
                                  </div>
                                </td>
                                <td className="px-8 py-5 align-top">
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between w-32 text-[10px]">
                                      <span className="text-slate-400 font-medium">
                                        Cost:
                                      </span>
                                      <span className="font-bold text-slate-900">
                                        {formatPrice(order.adminPrice)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between w-32 text-[10px]">
                                      <span className="text-slate-400 font-medium">
                                        Due:
                                      </span>
                                      <span
                                        className={`font-bold px-1.5 rounded ${
                                          order.dueAmount > 0
                                            ? "bg-red-50 text-red-600"
                                            : "bg-emerald-50 text-emerald-600"
                                        }`}
                                      >
                                        {formatPrice(order.dueAmount)}
                                      </span>
                                    </div>
                                    {order.paymentStatus ===
                                      "Verification_Pending" && (
                                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded w-fit">
                                        Request: ₹{order.paymentRequestAmount}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-8 py-5 align-top hidden lg:table-cell">
                                  <div
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                  >
                                    {React.createElement(statusConfig.icon, {
                                      size: 12,
                                    })}{" "}
                                    {statusConfig.label}
                                  </div>
                                </td>
                                <td className="px-8 py-5 align-top text-right">
                                  <button
                                    onClick={() => setActionOrder(order)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
                                  >
                                    Verify / Actions <ArrowRight size={12} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
                {activeTab === "ledger" && (
                  <div className="p-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {partners
                      .filter((p) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((partner) => (
                        <motion.div
                          key={partner.id}
                          onClick={() => setSelectedPartner(partner)}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="cursor-pointer group p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-[4rem] -mr-4 -mt-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg shadow-inner">
                                {partner.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-lg leading-tight">
                                  {partner.name}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium mt-1 bg-slate-50 px-2 py-0.5 rounded-md w-fit">
                                  {partner.history.length} Total Orders
                                </p>
                              </div>
                            </div>
                            <div className="p-2 rounded-full bg-slate-50 text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                              <ArrowUpRight size={16} />
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-50 flex justify-between items-end relative z-10">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                Total Due
                              </p>
                              <p
                                className={`text-xl font-black ${
                                  partner.currentDue > 0
                                    ? "text-rose-600"
                                    : "text-emerald-500"
                                }`}
                              >
                                {formatPrice(partner.currentDue)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                Paid
                              </p>
                              <p className="text-sm font-bold text-emerald-600">
                                {formatPrice(partner.totalPaid)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* MODALS */}
        <AddStaffModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
        />
        <GenerateCouponModal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
        />
        <PartnerLedgerModal
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
          partner={selectedPartner}
        />
        <PaymentVerificationModal
          isOpen={!!actionOrder}
          onClose={() => setActionOrder(null)}
          order={actionOrder}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
