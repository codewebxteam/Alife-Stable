import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ShoppingBag,
  Clock,
  Search,
  AlertCircle,
  Loader2,
  Check,
  X,
  Zap,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Wallet,
  ArrowRight,
  PieChart,
  Calendar,
  DollarSign,
  TrendingDown,
  Plus,
  Briefcase,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Mail,
  Phone,
  Filter,
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  collectionGroup,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

// --- 1. UTILITIES ---
const formatPrice = (value) => {
  if (!value && value !== 0) return "₹0";
  const num = Number(value.toString().replace(/[^0-9.-]+/g, ""));
  return `₹${num.toLocaleString("en-IN")}`;
};

// Scroll Lock Hook
const useScrollLock = () => {
  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalBodyStyle = document.body.style.cssText;
    const originalHtmlStyle = document.documentElement.style.cssText;
    document.body.style.cssText = `overflow: hidden !important; padding-right: ${scrollbarWidth}px;`;
    document.documentElement.style.cssText = `overflow: hidden !important;`;
    return () => {
      document.body.style.cssText = originalBodyStyle;
      document.documentElement.style.cssText = originalHtmlStyle;
    };
  }, []);
};

const PLAN_PRICES = {
  starter: 999,
  booster: 2499,
  academic: 4999,
  "pro starter": 999,
  "premium elite": 2499,
  "supreme master": 4999,
  growth: 2499,
  agency: 4999,
};

// Helper to safely check roles (Handles String OR Array)
const hasRole = (user, targetRole) => {
  const roleData = user.role;
  const target = targetRole.toLowerCase();

  if (Array.isArray(roleData)) {
    return roleData.some((r) => (r || "").toLowerCase() === target);
  }
  return (roleData || "").toLowerCase() === target;
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
    };
  if (s.includes("pending") || s.includes("approval"))
    return {
      icon: Clock,
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      label: "Pending",
    };
  if (s.includes("progress"))
    return {
      icon: Zap,
      text: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "In Progress",
    };
  if (s.includes("reject") || s.includes("cancel"))
    return {
      icon: X,
      text: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200",
      label: "Cancelled",
    };
  return {
    icon: AlertCircle,
    text: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: status?.replace(/_/g, " ") || "Unknown",
  };
};

// --- 2. SUB-COMPONENTS ---

// A. Thin Buildings (Bar Chart)
const RevenueBarChart = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <div className="h-48 flex items-center justify-center text-slate-300 text-xs font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        No Data for Graph
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
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-b border-r border-slate-700"></div>
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

// B. Pie Chart
const OrderPieChart = ({ stats }) => {
  const total =
    stats.completed + stats.pending + stats.cancelled + stats.progress;
  if (total === 0)
    return (
      <div className="h-32 flex items-center justify-center text-slate-300 text-xs border border-slate-100 rounded-xl bg-slate-50/50 border-dashed">
        No Data
      </div>
    );

  const pComp = (stats.completed / total) * 100;
  const pProg = (stats.progress / total) * 100;
  const pPend = (stats.pending / total) * 100;
  const pCanc = (stats.cancelled / total) * 100;

  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
          <circle
            cx="21"
            cy="21"
            r="15.91549430918954"
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="6"
          ></circle>
          {pComp > 0 && (
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
          )}
          {pProg > 0 && (
            <circle
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeDasharray={`${pProg} ${100 - pProg}`}
              strokeDashoffset={`${25 - pComp}`}
            ></circle>
          )}
          {pPend > 0 && (
            <circle
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="6"
              strokeDasharray={`${pPend} ${100 - pPend}`}
              strokeDashoffset={`${25 - pComp - pProg}`}
            ></circle>
          )}
          {pCanc > 0 && (
            <circle
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth="6"
              strokeDasharray={`${pCanc} ${100 - pCanc}`}
              strokeDashoffset={`${25 - pComp - pProg - pPend}`}
            ></circle>
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-slate-800">{total}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase">
            Total
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            {stats.completed} Completed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            {stats.progress} In Progress
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            {stats.pending} Pending
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            {stats.cancelled} Cancelled
          </span>
        </div>
      </div>
    </div>
  );
};

// C. Dashboard Card
const DashboardCard = ({
  title,
  mainValue,
  icon: Icon,
  color,
  children,
  onClick,
  isInteractive,
}) => {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <motion.div
      whileHover={isInteractive ? { y: -2 } : {}}
      onClick={onClick}
      className={`relative p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between h-full overflow-hidden transition-all duration-300 ${
        isInteractive
          ? "cursor-pointer hover:border-blue-300 hover:shadow-blue-200/50"
          : ""
      }`}
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
          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            colorStyles[color] || colorStyles.blue
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="relative z-10 mt-auto pt-3 border-t border-slate-50 text-[10px] sm:text-[11px] font-medium text-slate-500 space-y-1.5">
        {children}
      </div>
    </motion.div>
  );
};

// --- 3. MODALS ---

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
      <span className="text-[10px] font-bold text-slate-400 uppercase">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

// 1. ADD EXPENSE FORM
const AddExpenseForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "Expenses",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "expenses"), {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold text-slate-800">New Entry</h4>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:border-rose-500 outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              Type
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none"
            >
              <option value="Expenses">Expenses</option>
              <option value="Purchase Bill">Purchase Bill</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
            Description
          </label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none"
            placeholder="Details..."
          />
        </div>
        <button
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            "Save Record"
          )}
        </button>
      </form>
    </div>
  );
};

// 2. EXPENSES LIST MODAL
const ExpensesListModal = ({ isOpen, onClose, expenses }) => {
  useScrollLock();
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const displayItems = expenses.slice(0, 5);

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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] z-10 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Recent Expenses
            </h3>
            <p className="text-[10px] text-slate-500">Last 5 records</p>
          </div>
          <div className="flex gap-2">
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors font-bold text-xs flex items-center gap-1"
              >
                <Plus size={14} /> Add New
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {showAddForm && (
            <AddExpenseForm onClose={() => setShowAddForm(false)} />
          )}

          {displayItems.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-10">
              No expenses recorded.
            </div>
          ) : (
            <div className="space-y-2">
              {displayItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <CreditCard size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.dateFormatted}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      {formatPrice(item.amount)}
                    </p>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        item.category === "Purchase Bill"
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// 3. MEMBERS / PARTNERS MODAL
const MembersListModal = ({ isOpen, onClose, partners }) => {
  useScrollLock();
  if (!isOpen) return null;

  // FIXED: Robust check using hasRole helper + sort + limit
  const displayItems = partners
    .filter((p) => hasRole(p, "partner") || hasRole(p, "member"))
    .sort((a, b) => b.createdAtDate - a.createdAtDate)
    .slice(0, 5);

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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] z-10 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">New Partners</h3>
            <p className="text-[10px] text-slate-500">Last 5 Registered</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {displayItems.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-10">
              No partners found.
            </div>
          ) : (
            <div className="space-y-3">
              {displayItems.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 flex items-center gap-3 group transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    {p.fullName ? p.fullName.charAt(0) : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {p.fullName || "Unknown User"}
                      </h4>
                      {/* --- FIXED: SHOWING PLAN NAME INSTEAD OF ROLE --- */}
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 uppercase">
                        {p.plan || "Starter"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                        <Mail size={10} /> {p.email}
                      </span>
                      {p.phone && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Phone size={10} /> {p.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// 4. NET P&L DETAILS MODAL
const PnLDetailsModal = ({ isOpen, onClose, revenueData, expenseData }) => {
  useScrollLock();
  const [activeTab, setActiveTab] = useState("credit");

  if (!isOpen) return null;

  const fullList = activeTab === "credit" ? revenueData : expenseData;
  const displayItems = fullList.slice(0, 5);

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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] z-10 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("credit")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "credit"
                  ? "bg-white shadow-md text-emerald-600"
                  : "text-slate-400 hover:bg-white/50"
              }`}
            >
              <ArrowDownRight size={14} /> Credit (Income)
            </button>
            <button
              onClick={() => setActiveTab("debit")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "debit"
                  ? "bg-white shadow-md text-rose-600"
                  : "text-slate-400 hover:bg-white/50"
              }`}
            >
              <ArrowUpRight size={14} /> Debit (Expense)
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-300 text-xs font-bold">
              No records found.
            </div>
          ) : (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 text-center">
                Showing Last 5 Transactions
              </p>
              <div className="space-y-2">
                {displayItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activeTab === "credit"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {activeTab === "credit" ? (
                          <Wallet size={14} />
                        ) : (
                          <CreditCard size={14} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {item.description ||
                            item.serviceName ||
                            "Transaction"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.dateFormatted}{" "}
                          {item.subText ? `• ${item.subText}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-black ${
                          activeTab === "credit"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {activeTab === "credit" ? "+" : "-"}
                        {formatPrice(item.amount)}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {item.category || "Service"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// 5. PAYMENT VERIFICATION MODAL
const PaymentVerificationModal = ({ isOpen, onClose, order }) => {
  useScrollLock();
  const [amount, setAmount] = useState(order?.paymentRequestAmount || "");
  const [loading, setLoading] = useState(false);
  if (!isOpen || !order) return null;
  const totalCost = parseFloat(order.pricing?.priceToAdmin || 0);
  const currentlyPaid = parseFloat(order.paidAmount || 0);

  // --- FIX: DUE AMOUNT IS 0 IF CANCELLED ---
  const s = (order.status || "").toLowerCase();
  const isCancelled = s.includes("cancel") || s.includes("reject");
  const remainingDue = isCancelled ? 0 : totalCost - currentlyPaid;

  const isProgress = order.status === "In_Progress";
  const handleVerifyPayment = async () => {
    setLoading(true);
    const newPaid = currentlyPaid + parseFloat(amount || 0);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        paidAmount: newPaid,
        paymentStatus: newPaid >= totalCost ? "Paid" : "Partial",
        paymentRequestAmount: 0,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden z-10"
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manage Order</h2>
            <p className="text-[10px] text-slate-500 font-mono">
              {order.displayId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-500 font-medium">Total Cost</span>
              <span className="font-bold text-slate-900">
                {formatPrice(totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-xs mb-3">
              <span className="text-slate-500 font-medium">Due</span>
              <span className="font-bold text-rose-600 bg-rose-50 px-1.5 rounded">
                {formatPrice(remainingDue)}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-5 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleVerifyPayment}
                disabled={loading || !amount}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-[10px] font-bold shadow-md transition-all flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}{" "}
                Verify
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Zap size={12} className="text-amber-500" /> Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatus("In_Progress")}
                className="py-2.5 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 font-bold text-[10px] hover:bg-blue-100 transition-all"
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatus("Completed")}
                disabled={!isProgress}
                className={`py-2.5 rounded-lg border font-bold text-[10px] transition-all flex items-center justify-center gap-1 ${
                  isProgress
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                }`}
              >
                {!isProgress && <ShieldCheck size={10} />} Completed
              </button>
              <button
                onClick={() => handleStatus("Rejected")}
                className="col-span-2 py-2.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-700 font-bold text-[10px] hover:bg-rose-100 transition-all"
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- 4. MAIN DASHBOARD ---
const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [chartFilter, setChartFilter] = useState("Weekly");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [actionOrder, setActionOrder] = useState(null);
  const [isExpensesViewModalOpen, setIsExpensesViewModalOpen] = useState(false);
  const [isPnLModalOpen, setIsPnLModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Date Filter State
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Fetch Data
  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((doc) => {
          const d = doc.data();
          const dateObj = d.createdAt?.toDate
            ? d.createdAt.toDate()
            : new Date();

          // --- FIX: DUE AMOUNT IS 0 IF CANCELLED ---
          const s = (d.status || "").toLowerCase();
          const isCancelled = s.includes("cancel") || s.includes("reject");

          return {
            id: doc.id,
            ...d,
            adminPrice: parseFloat(d.pricing?.priceToAdmin || 0),
            paidAmount: parseFloat(d.paidAmount || 0),
            dueAmount: isCancelled
              ? 0
              : Math.max(
                  0,
                  parseFloat(d.pricing?.priceToAdmin || 0) -
                    parseFloat(d.paidAmount || 0)
                ),
            createdAtDate: dateObj,
            dateFormatted: dateObj.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
          };
        });
        setOrders(list);
      }
    );

    const unsubPartners = onSnapshot(
      query(collectionGroup(db, "profile")),
      (snap) => {
        const list = [];
        snap.forEach((doc) => {
          if (doc.id === "account_info") {
            const d = doc.data();
            list.push({
              id: doc.ref.parent.parent.id,
              ...d,
              createdAtDate: d.joinedAt ? new Date(d.joinedAt) : new Date(),
            });
          }
        });
        setPartners(list);
      }
    );

    const unsubExpenses = onSnapshot(
      query(collection(db, "expenses"), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAtDate: doc.data().createdAt?.toDate() || new Date(),
          dateFormatted: (
            doc.data().createdAt?.toDate() || new Date()
          ).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        }));
        setExpenses(list);
      }
    );

    return () => {
      unsubOrders();
      unsubPartners();
      unsubExpenses();
    };
  }, []);

  useEffect(() => {
    if (orders.length || partners.length) setLoading(false);
  }, [orders, partners]);

  // STATS CALCULATION
  const stats = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59);

    const isInRange = (date) => date >= start && date <= end;

    const filteredOrders = orders.filter((o) => isInRange(o.createdAtDate));
    const filteredExpenses = expenses.filter((e) => isInRange(e.createdAtDate));
    const filteredPartners = partners.filter((p) => isInRange(p.createdAtDate));

    // Revenue
    const serviceRevenue = filteredOrders.reduce(
      (sum, o) => sum + o.paidAmount,
      0
    );
    const partnershipRevenue = filteredPartners.reduce(
      (sum, p) => sum + (PLAN_PRICES[(p.plan || "").toLowerCase()] || 0),
      0
    );
    const totalDue = filteredOrders.reduce((sum, o) => sum + o.dueAmount, 0);
    const totalRevenue = serviceRevenue + partnershipRevenue;
    const totalExpenses = filteredExpenses.reduce(
      (sum, e) => sum + (e.amount || 0),
      0
    );
    const netProfit = totalRevenue - totalExpenses;

    // Orders Count
    let completed = 0,
      pending = 0,
      progress = 0,
      cancelled = 0;
    filteredOrders.forEach((o) => {
      const s = (o.status || "").toLowerCase();
      if (s.includes("complet") || s.includes("deliver")) completed++;
      else if (s.includes("progress")) progress++;
      else if (s.includes("reject") || s.includes("cancel")) cancelled++;
      else pending++;
    });

    // Partners
    const partnerUsers = filteredPartners.filter(
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

    return {
      revenue: {
        total: totalRevenue,
        partnership: partnershipRevenue,
        service: serviceRevenue,
        due: totalDue,
      },
      expenses: { total: totalExpenses },
      pnl: { value: netProfit, isLoss: netProfit < 0 },
      orders: {
        total: filteredOrders.length,
        completed,
        pending,
        progress,
        cancelled,
      },
      partners: { total: partnerUsers.length, starter, booster, academic },
    };
  }, [orders, partners, expenses, dateRange]);

  // Data for Modals
  const pnlModalData = useMemo(() => {
    const credit = orders
      .filter((o) => o.paidAmount > 0)
      .map((o) => ({
        amount: o.paidAmount,
        description: `Order: ${o.displayId}`,
        serviceName: o.service?.name,
        subText: o.partnerName,
        category: "Service Revenue",
        dateFormatted: o.dateFormatted,
      }))
      .sort((a, b) => b.amount - a.amount);
    const debit = expenses
      .map((e) => ({
        amount: e.amount,
        description: e.description,
        category: e.category,
        dateFormatted: e.dateFormatted,
      }))
      .sort((a, b) => b.amount - a.amount);
    return { credit, debit };
  }, [orders, expenses]);

  // Chart Data (Bar Chart)
  const { chartData, pieData } = useMemo(() => {
    const now = new Date();
    let revenuePoints = [];
    let comp = 0,
      pend = 0,
      canc = 0,
      prog = 0;

    const filteredForCharts = orders.filter((o) => {
      const diffDays = Math.floor(
        (now - o.createdAtDate) / (1000 * 60 * 60 * 24)
      );
      return chartFilter === "Weekly" ? diffDays <= 7 : diffDays <= 30;
    });

    filteredForCharts.forEach((o) => {
      const s = o.status?.toLowerCase() || "";
      if (s.includes("completed")) comp++;
      else if (s.includes("progress")) prog++;
      else if (s.includes("reject") || s.includes("cancel")) canc++;
      else pend++;
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
        const day = o.createdAtDate.getDate();
        if (day <= 7) weeksMap["Wk 1"] += o.paidAmount;
        else if (day <= 14) weeksMap["Wk 2"] += o.paidAmount;
        else if (day <= 21) weeksMap["Wk 3"] += o.paidAmount;
        else weeksMap["Wk 4"] += o.paidAmount;
      });
      revenuePoints = Object.entries(weeksMap).map(([label, value]) => ({
        label,
        value,
      }));
    }
    return {
      chartData: revenuePoints,
      pieData: {
        completed: comp,
        pending: pend,
        cancelled: canc,
        progress: prog,
      },
    };
  }, [orders, chartFilter]);

  // Filtered & Paginated Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const term = searchTerm.toLowerCase();
      const statusMatch =
        statusFilter === "All" ||
        (item.status || "").toLowerCase().includes(statusFilter.toLowerCase());
      const searchMatch =
        item.partnerName?.toLowerCase().includes(term) ||
        item.displayId?.toLowerCase().includes(term) ||
        item.service?.name?.toLowerCase().includes(term);
      return statusMatch && searchMatch;
    });
  }, [orders, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12 overflow-x-hidden text-slate-900">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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

          <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-3 flex items-center gap-2 text-slate-400">
              <Calendar size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Filter
              </span>
            </div>
            <div className="h-6 w-px bg-slate-100 mx-1" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="bg-transparent text-xs font-bold text-slate-700 outline-none p-2 cursor-pointer hover:bg-slate-50 rounded-lg"
            />
            <span className="text-slate-300 mx-1">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="bg-transparent text-xs font-bold text-slate-700 outline-none p-2 cursor-pointer hover:bg-slate-50 rounded-lg"
            />
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <DashboardCard
            title="Total Revenue"
            mainValue={formatPrice(stats.revenue.total)}
            icon={Wallet}
            color="emerald"
          >
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-400">Partnership</span>
              <span className="text-slate-700 font-bold">
                {formatPrice(stats.revenue.partnership)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Services</span>
              <span className="text-slate-700 font-bold">
                {formatPrice(stats.revenue.service)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-50 mt-1 pt-1">
              <span className="text-red-400 font-semibold">Due Amount</span>
              <span className="text-red-500 font-bold">
                {formatPrice(stats.revenue.due)}
              </span>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Total Expenses"
            mainValue={formatPrice(stats.expenses.total)}
            icon={DollarSign}
            color="rose"
            isInteractive
            onClick={() => setIsExpensesViewModalOpen(true)}
          >
            <div className="flex items-center gap-1 text-rose-500 font-bold mb-2">
              <Plus size={12} strokeWidth={3} /> Add / View All
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Bills & Expenses
            </p>
          </DashboardCard>

          <DashboardCard
            title="Net P&L"
            mainValue={
              <span
                className={
                  stats.pnl.isLoss ? "text-rose-500" : "text-emerald-600"
                }
              >
                {stats.pnl.isLoss ? "-" : "+"}
                {formatPrice(Math.abs(stats.pnl.value))}
              </span>
            }
            icon={stats.pnl.isLoss ? TrendingDown : TrendingUp}
            color={stats.pnl.isLoss ? "rose" : "indigo"}
            isInteractive
            onClick={() => setIsPnLModalOpen(true)}
          >
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-400">Total Rev</span>
              <span className="text-emerald-600 font-bold">
                {formatPrice(stats.revenue.total)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Exp</span>
              <span className="text-rose-500 font-bold">
                {formatPrice(stats.expenses.total)}
              </span>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Service Orders"
            mainValue={stats.orders.total}
            icon={ShoppingBag}
            color="blue"
          >
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-emerald-500">Completed</span>{" "}
                <b>{stats.orders.completed}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-500">In Progress</span>{" "}
                <b>{stats.orders.progress}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-500">Pending</span>{" "}
                <b>{stats.orders.pending}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-500">Cancelled</span>{" "}
                <b>{stats.orders.cancelled}</b>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="New Partners"
            mainValue={stats.partners.total}
            icon={Users}
            color="amber"
            isInteractive
            onClick={() => setIsMembersModalOpen(true)}
          >
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Starter</span>
                <div className="h-1.5 flex-1 mx-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400"
                    style={{
                      width: `${
                        (stats.partners.starter /
                          Math.max(stats.partners.total, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <b className="text-slate-700">{stats.partners.starter}</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Booster</span>
                <div className="h-1.5 flex-1 mx-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400"
                    style={{
                      width: `${
                        (stats.partners.booster /
                          Math.max(stats.partners.total, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <b className="text-slate-700">{stats.partners.booster}</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Academic</span>
                <div className="h-1.5 flex-1 mx-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400"
                    style={{
                      width: `${
                        (stats.partners.academic /
                          Math.max(stats.partners.total, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <b className="text-slate-700">{stats.partners.academic}</b>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* GRAPHS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" /> Revenue
                  Graph
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Performance over time
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
            <RevenueBarChart data={chartData} />
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col justify-center">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <PieChart size={20} className="text-blue-500" /> Order Status
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Current distribution
                </p>
              </div>
            </div>
            <OrderPieChart stats={pieData} />
          </div>
        </div>

        {/* MAIN ORDERS TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase size={20} className="text-slate-400" /> Recent Orders
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] ml-1">
                (Total: {filteredOrders.length})
              </span>
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Status Filter Dropdown */}
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

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
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
            {loading ? (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm font-bold">
                <Loader2 className="animate-spin mr-2" /> Loading...
              </div>
            ) : currentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 opacity-50">
                <p className="text-sm font-bold text-slate-400">
                  No orders found.
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
                      Partner
                    </th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Financials
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
                  {currentOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
                              {order.service?.name?.charAt(0) || "S"}
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
                            {order.partnerName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.dateFormatted}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between w-24 text-[10px]">
                              <span className="text-slate-400">Cost:</span>
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
                            {React.createElement(statusConfig.icon, {
                              size: 10,
                            })}{" "}
                            {statusConfig.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setActionOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
                          >
                            Verify <ArrowRight size={10} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isExpensesViewModalOpen && (
          <ExpensesListModal
            isOpen={isExpensesViewModalOpen}
            onClose={() => setIsExpensesViewModalOpen(false)}
            expenses={expenses}
          />
        )}
        {isPnLModalOpen && (
          <PnLDetailsModal
            isOpen={isPnLModalOpen}
            onClose={() => setIsPnLModalOpen(false)}
            revenueData={pnlModalData.credit}
            expenseData={pnlModalData.debit}
          />
        )}
        {isMembersModalOpen && (
          <MembersListModal
            isOpen={isMembersModalOpen}
            onClose={() => setIsMembersModalOpen(false)}
            partners={partners}
          />
        )}
        {actionOrder && (
          <PaymentVerificationModal
            isOpen={!!actionOrder}
            onClose={() => setActionOrder(null)}
            order={actionOrder}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
