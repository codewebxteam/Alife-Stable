import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  TrendingUp,
  FileText,
  Search,
  Filter,
  Package,
  Calendar,
  MonitorPlay,
  Image as ImageIcon,
  X,
  Lightbulb,
  ChevronDown,
  CreditCard,
  ArrowRight,
  Wallet,
  User,
  Phone,
  Mail,
  Briefcase,
  Copy,
  Loader2,
  Crown,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import CreateOrderModal from "../components/CreateOrderModal";

// --- 1. UTILITIES ---
const checkSubscriptionStatus = (createdAt, duration) => {
  if (!createdAt || !duration)
    return { isActive: true, label: "Lifetime", expiryDate: null };
  const start = new Date(createdAt);
  let expiry = new Date(start);
  let hasDuration = false;
  const d = duration.toLowerCase();
  if (d.includes("year")) {
    expiry.setFullYear(start.getFullYear() + 1);
    hasDuration = true;
  } else if (d.includes("month") || d.includes("6")) {
    expiry.setMonth(start.getMonth() + 1);
    hasDuration = true;
  }

  if (!hasDuration)
    return { isActive: true, label: "Lifetime", expiryDate: null };
  const now = new Date();
  const isActive = now < expiry;
  return {
    isActive,
    label: isActive ? "Active" : "Expired",
    expiryDate: expiry,
  };
};

const getStatusConfig = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("completed") || s.includes("delivered"))
    return {
      icon: CheckCircle2,
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
      label: "Pending Approval",
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
      icon: XCircle,
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Rejected",
    };
  return {
    icon: AlertTriangle,
    text: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: status?.replace(/_/g, " ") || "Unknown",
  };
};

// --- 2. COMPONENTS ---

const SalesTrendChart = ({ data, type }) => {
  if (!data || data.length === 0)
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-slate-100">
        No sales data
      </div>
    );
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPath = `M0,100 ${points
    .split(" ")
    .map((p) => `L${p}`)
    .join(" ")} L100,100 Z`;
  return (
    <div className="relative h-48 w-full mt-4 select-none group">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7650b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f7650b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chartGradient)" />
        <polyline
          fill="none"
          stroke="#f7650b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * 100}
            cy={100 - (d.value / maxValue) * 100}
            r="2"
            fill="#fff"
            stroke="#f7650b"
            strokeWidth="1.5"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2 px-1 border-t border-slate-100 pt-2">
        {data.map((d, i) => (
          <span
            key={i}
            className="text-[9px] font-bold text-slate-400 uppercase tracking-wider"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const PackageCountCard = ({ title, count, type, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="cursor-pointer group p-3 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
          type === "video"
            ? "bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white"
            : "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
        }`}
      >
        {type === "video" ? <MonitorPlay size={18} /> : <ImageIcon size={18} />}
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-700 group-hover:text-slate-900 uppercase tracking-wider transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <p className="text-[9px] font-medium text-slate-400 group-hover:text-[#f7650b]">
            View details
          </p>
        </div>
      </div>
    </div>
    <div className="text-xl font-black text-slate-800 group-hover:text-[#f7650b] transition-colors">
      {count}
    </div>
  </motion.div>
);

// --- 3. MODALS ---

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  const [copied, setCopied] = useState("");
  if (!order) return null;
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const isCompleted = order.status.toLowerCase().includes("completed");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      Order Details
                    </h2>
                    <div
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      <StatusIcon size={10} /> {statusConfig.label}
                    </div>
                  </div>
                  <p
                    className="text-xs text-slate-400 mt-1 font-mono cursor-pointer"
                    onClick={() => copyToClipboard(order.displayId, "ID")}
                  >
                    {order.displayId}{" "}
                    {copied === "ID" && (
                      <span className="text-emerald-500 font-bold ml-2">
                        Copied!
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div
                className="p-6 overflow-y-auto custom-scrollbar space-y-6"
                data-lenis-prevent
              >
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Client Profile
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={order.avatar}
                      alt=""
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {order.client?.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Registered Client
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between group">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail size={14} />{" "}
                        <span className="text-xs font-medium truncate max-w-[150px]">
                          {order.client?.email || "N/A"}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(order.client?.email, "Email")
                        }
                      >
                        <Copy size={12} className="text-slate-400" />
                      </button>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between group">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone size={14} />{" "}
                        <span className="text-xs font-medium">
                          {order.client?.phone || "N/A"}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(order.client?.phone, "Phone")
                        }
                      >
                        <Copy size={12} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Project
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-xs text-slate-500">Service</span>
                        <span className="text-xs font-bold text-slate-900">
                          {order.service?.name}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-xs text-slate-500">Plan</span>
                        <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md border border-orange-100">
                          {order.planLabel || "Standard"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-xs text-slate-500">Duration</span>
                        <span className="text-xs font-bold text-slate-900">
                          {order.Duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Timeline
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-xs text-slate-500">Created</span>
                        <span className="text-xs font-bold text-slate-900">
                          {order.dateFormatted}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-xs text-slate-500">Time</span>
                        <span className="text-xs font-bold text-slate-900">
                          {order.timeFormatted}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-xs text-slate-500">
                          Completed
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isCompleted
                              ? "text-emerald-600"
                              : "text-slate-400 italic"
                          }`}
                        >
                          {isCompleted ? order.dateFormatted : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Buy Price
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      ₹{order.pricing?.priceToAdmin}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Sell Price
                    </p>
                    <p className="text-lg font-black text-emerald-600">
                      ₹{order.pricing?.priceFromClient}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Profit
                    </p>
                    <p
                      className={`text-lg font-black ${
                        order.pricing?.profit >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {order.pricing?.profit >= 0 ? "+" : ""}₹
                      {order.pricing?.profit}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Status
                    </p>
                    {order.paymentStatus === "Verification_Pending" ? (
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <AlertTriangle size={14} /> Verifying...
                      </div>
                    ) : order.payment?.due <= 0 ? (
                      <div className="flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 size={14} /> Paid
                      </div>
                    ) : (
                      <p className="text-lg font-black text-red-500">
                        Due: ₹{order.payment?.due}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const PaymentUpdateModal = ({ isOpen, onClose, order }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!order) return null;
  const totalBuyPrice = parseFloat(order.pricing?.priceToAdmin || 0);
  const paidAlready = parseFloat(order.payment?.paid || 0);
  const due = totalBuyPrice - paidAlready;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        paymentStatus: "Verification_Pending",
        paymentRequestAmount: parseFloat(amount),
        lastPaymentRequestDate: serverTimestamp(),
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setAmount("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Failed to submit payment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    Update Payment
                  </h3>
                  <p className="text-xs text-slate-500">
                    Order:{" "}
                    <span className="font-mono text-slate-700">
                      {order.displayId}
                    </span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">
                      Request Sent!
                    </h4>
                    <p className="text-sm text-slate-500 mt-2">
                      Admin will verify your payment of ₹{amount}.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          Total
                        </div>
                        <div className="text-sm font-black text-slate-800">
                          ₹{totalBuyPrice}
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-center">
                        <div className="text-[10px] text-green-600 font-bold uppercase">
                          Paid
                        </div>
                        <div className="text-sm font-black text-green-700">
                          ₹{paidAlready}
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-center">
                        <div className="text-[10px] text-red-600 font-bold uppercase">
                          Due
                        </div>
                        <div className="text-sm font-black text-red-700">
                          ₹{due}
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Amount Paid
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            max={due}
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#f7650b]"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-xl flex gap-2 items-start border border-blue-100">
                        <ShieldCheck
                          size={16}
                          className="text-blue-600 mt-0.5"
                        />
                        <p className="text-xs text-blue-700">
                          This request will be sent to the Admin. Once verified,
                          your Due amount will be updated.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={loading || due <= 0}
                        className="w-full py-3.5 rounded-xl bg-[#f7650b] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Submit Payment Request"
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const MemberDetailsModal = ({ isOpen, onClose, title, members }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] pointer-events-auto"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Subscription Status
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div
              className="overflow-y-auto p-4 custom-scrollbar"
              data-lenis-prevent
            >
              {members.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm">
                  No members found.
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((m, i) => {
                    const status = checkSubscriptionStatus(
                      m.createdAtDate,
                      m.Duration,
                    );
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-4 rounded-2xl border bg-white transition-all ${
                          status.isActive
                            ? "border-slate-100 hover:border-orange-100"
                            : "border-red-100 bg-red-50/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar}
                            alt=""
                            className={`w-10 h-10 rounded-full object-cover ${
                              !status.isActive && "grayscale opacity-70"
                            }`}
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-sm">
                              {m.client?.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded w-fit mt-1">
                              {m.displayId}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                              status.isActive
                                ? "text-green-600 bg-green-50 border-green-100"
                                : "text-red-600 bg-red-50 border-red-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                status.isActive ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></span>{" "}
                            {status.label}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-1 font-medium">
                            {status.expiryDate
                              ? status.isActive
                                ? `Expires: ${status.expiryDate.toLocaleDateString()}`
                                : `Expired: ${status.expiryDate.toLocaleDateString()}`
                              : `Joined: ${m.dateFormatted}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

// --- MAIN DASHBOARD ---
const DashboardHome = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const agencyName = user?.displayName || "Partner";

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [memberModal, setMemberModal] = useState({
    isOpen: false,
    title: "",
    members: [],
  });
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    order: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    order: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reportType, setReportType] = useState("Monthly");

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const greeting = useMemo(() => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, [time]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"),
      where("partnerId", "==", user.uid),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => {
        const d = doc.data();
        const dateObj = d.createdAt?.toDate
          ? d.createdAt.toDate()
          : new Date(d.createdAt || Date.now());
        const buyPrice = parseFloat(d.pricing?.priceToAdmin || 0);
        const paidAmount = parseFloat(d.paidAmount || 0);
        const dueAmount = Math.max(0, buyPrice - paidAmount);
        return {
          id: doc.id,
          ...d,
          createdAtDate: dateObj,
          dateFormatted: dateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "2-digit",
          }),
          timeFormatted: dateObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          payment: {
            total: buyPrice,
            paid: paidAmount,
            due: dueAmount,
            status:
              dueAmount <= 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Due",
          },
        };
      });
      list.sort((a, b) => b.createdAtDate - a.createdAtDate);
      setOrders(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const {
    overallStats,
    timeBasedStats,
    filteredTableOrders,
    packageData,
    financialStats,
  } = useMemo(() => {
    let totalRev = 0,
      completed = 0,
      inProgress = 0,
      inWaiting = 0,
      cancelled = 0;
    let totalLifetimePaid = 0,
      totalLifetimeDue = 0;
    const pkgLists = {
      yearlyVideo: [],
      yearlyImage: [],
      monthlyVideo: [],
      monthlyImage: [],
    };

    orders.forEach((o) => {
      const val = parseFloat(
        o.pricing?.priceFromClient || o.amount?.replace(/[^0-9.]/g, "") || 0,
      );
      const status = (o.status || "").toLowerCase();

      if (status.includes("delivered") || status.includes("completed")) {
        completed++;
        totalRev += val;
      } else if (status.includes("cancel") || status.includes("reject")) {
        cancelled++;
      } else if (status.includes("progress")) {
        inProgress++;
      } else {
        inWaiting++;
      }

      totalLifetimePaid += o.payment.paid;
      totalLifetimeDue += o.payment.due;

      if (!status.includes("cancel") && !status.includes("reject")) {
        const sName = (o.service?.name || o.service || "").toLowerCase();
        const dur = (o.Duration || "").toLowerCase();
        const isVideo = sName.includes("video") || sName.includes("reel");
        const isImage = sName.includes("poster") || sName.includes("design");
        const isYearly = dur.includes("year");
        const isMonthly = dur.includes("month") || dur.includes("6");

        if (isYearly && isVideo) pkgLists.yearlyVideo.push(o);
        else if (isYearly && isImage) pkgLists.yearlyImage.push(o);
        else if (isMonthly && isVideo) pkgLists.monthlyVideo.push(o);
        else if (isMonthly && isImage) pkgLists.monthlyImage.push(o);
      }
    });

    const now = new Date();
    const cutoff = new Date();
    if (reportType === "Weekly") cutoff.setDate(now.getDate() - 7);
    else cutoff.setMonth(now.getMonth() - 1);
    const timeFiltered = orders.filter((o) => o.createdAtDate >= cutoff);
    const chartMap = new Map();
    if (reportType === "Weekly") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        chartMap.set(d.toLocaleDateString("en-IN", { weekday: "short" }), 0);
      }
    } else {
      ["Wk 1", "Wk 2", "Wk 3", "Wk 4"].forEach((k) => chartMap.set(k, 0));
    }
    const serviceCounts = {};
    timeFiltered.forEach((o) => {
      const val = parseFloat(
        o.pricing?.priceFromClient || o.amount?.replace(/[^0-9.]/g, "") || 0,
      );
      serviceCounts[o.service?.name || "Unknown"] =
        (serviceCounts[o.service?.name || "Unknown"] || 0) + 1;
      if (reportType === "Weekly") {
        const label = o.createdAtDate.toLocaleDateString("en-IN", {
          weekday: "short",
        });
        if (chartMap.has(label)) chartMap.set(label, chartMap.get(label) + val);
      } else {
        const diff = Math.floor(
          (now - o.createdAtDate) / (1000 * 60 * 60 * 24),
        );
        let wLabel = "Wk 4";
        if (diff > 21) wLabel = "Wk 1";
        else if (diff > 14) wLabel = "Wk 2";
        else if (diff > 7) wLabel = "Wk 3";
        if (chartMap.has(wLabel))
          chartMap.set(wLabel, chartMap.get(wLabel) + val);
      }
    });

    const tableData = orders.filter((o) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        (o.client?.name || "").toLowerCase().includes(search) ||
        (o.displayId || "").toLowerCase().includes(search);
      let matchesStatus = true;
      if (statusFilter !== "All") {
        const s = (o.status || "").toLowerCase();
        const f = statusFilter.toLowerCase();
        if (f === "pending")
          matchesStatus = s.includes("pending") || s.includes("approval");
        else if (f === "completed")
          matchesStatus = s.includes("completed") || s.includes("delivered");
        else if (f === "progress") matchesStatus = s.includes("progress");
        else if (f === "cancelled") matchesStatus = s.includes("cancel");
      }
      return matchesSearch && matchesStatus;
    });

    return {
      overallStats: {
        revenue: totalRev,
        completed,
        inWaiting,
        inProgress,
        cancelled,
      },
      financialStats: {
        totalPaid: totalLifetimePaid,
        totalDue: totalLifetimeDue,
      },
      timeBasedStats: {
        chart: Array.from(chartMap, ([label, value]) => ({ label, value })),
        hotSelling: Object.entries(serviceCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      },
      filteredTableOrders: tableData,
      packageData: pkgLists,
    };
  }, [orders, reportType, searchTerm, statusFilter]);

  // Logic for Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTableOrders = filteredTableOrders.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredTableOrders.length / itemsPerPage);

  const handleCreateOrder = async (payload) => {
    try {
      const data = {
        ...payload,
        partnerId: user.uid,
        partnerName: agencyName,
        partnerEmail: user.email,
        displayId: `#ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: serverTimestamp(),
        status: payload.status || "PENDING_APPROVAL_FROM_ADMIN",
        amount: `₹${payload.pricing?.priceFromClient}`,
        buyAmount: `₹${payload.pricing?.priceToAdmin}`,
        paidAmount: 0,
        avatar: `https://ui-avatars.com/api/?name=${payload.client?.name}&background=random&color=fff`,
      };
      await addDoc(collection(db, "orders"), data);
      setIsOrderModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const statsUI = [
    {
      title: "Revenue",
      value: `₹${overallStats.revenue.toLocaleString()}`,
      sub: "Total",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Completed",
      value: overallStats.completed,
      sub: "Delivered",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending",
      value: overallStats.inWaiting,
      sub: "Waiting",
      icon: Lightbulb,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Processing",
      value: overallStats.inProgress,
      sub: "Active",
      icon: Zap,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Cancelled",
      value: overallStats.cancelled,
      sub: "Void",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] font-sans pb-10 overflow-x-hidden pt-4 sm:pt-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
                Live Dashboard
              </span>
              <span className="text-xs font-mono font-medium text-slate-400">
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {greeting},{" "}
              <span className="text-[#f7650b]">{agencyName.split(" ")[0]}</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">
              Glad to have you—your growth starts here.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
              {["Weekly", "Monthly"].map((t) => (
                <button
                  key={t}
                  onClick={() => setReportType(t)}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    reportType === t
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#f7650b] text-white font-bold text-xs shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            >
              <Zap size={16} /> New Order
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {statsUI.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-3">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon size={18} className="sm:w-5 sm:h-5" />
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-lg ${stat.bg} ${stat.color} uppercase tracking-wider`}
                >
                  {stat.sub}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-800">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1">
                {stat.title}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 mb-12 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-5 w-full">
            {/* 1. FINANCIAL BAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-auto sm:h-40 gap-4 sm:gap-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Wallet className="text-orange-400" size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold leading-none text-sm">
                      Partner Wallet
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wide">
                      Lifetime Financials
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 relative z-10">
                  <div className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">
                      Paid
                    </div>
                    <div className="text-lg font-black text-emerald-400">
                      ₹{financialStats.totalPaid.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">
                      Due
                    </div>
                    <div className="text-lg font-black text-red-400">
                      ₹{financialStats.totalDue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-600 rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-auto sm:h-40 gap-4 sm:gap-0">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Crown className="text-white" size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold leading-none text-sm">
                      Upgrade Partner Plan
                    </h3>
                    <p className="text-[10px] text-indigo-200 mt-0.5 font-medium">
                      Unlock lower commissions & tools.
                    </p>
                  </div>
                </div>
                <div className="relative z-10">
                  <button
                    onClick={() => navigate("/dashboard/plans")}
                    className="w-full py-2.5 rounded-xl bg-white text-indigo-600 font-bold text-xs hover:bg-indigo-50 shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    View Upgrade Plans <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. ORDER TABLE */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col h-[650px] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <FileText size={20} className="text-slate-400" /> Order
                    History
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Tracking all client orders
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative group flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#f7650b] transition-colors" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full sm:w-40 pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#f7650b] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-[#f7650b] appearance-none cursor-pointer focus:bg-white transition-all"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* FIXED SCROLL AREA FOR TABLE */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        Client
                      </th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden md:table-cell">
                        Admin Payment
                      </th>
                      <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-24 text-slate-400 font-medium"
                        >
                          Loading records...
                        </td>
                      </tr>
                    ) : currentTableOrders.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-24">
                          <div className="flex flex-col items-center opacity-50">
                            <Search size={32} className="text-slate-300 mb-2" />
                            <span className="text-slate-400 font-bold text-xs">
                              No orders found
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentTableOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;
                        const isCompleted =
                          order.status.toLowerCase().includes("completed") ||
                          order.status.toLowerCase().includes("delivered");
                        return (
                          <tr
                            key={order.id}
                            onClick={() =>
                              setDetailsModal({ isOpen: true, order: order })
                            }
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          >
                            <td className="px-6 py-3.5 align-top">
                              <div className="flex items-center gap-3">
                                <img
                                  src={order.avatar}
                                  className="w-9 h-9 rounded-full border border-slate-100 shadow-sm bg-white"
                                  alt=""
                                />
                                <div>
                                  <div className="font-bold text-sm text-slate-900 group-hover:text-[#f7650b] transition-colors">
                                    {order.client?.name}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400">
                                    {order.displayId}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-500 mt-0.5 sm:hidden">
                                    {order.service?.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 align-top hidden sm:table-cell">
                              <div
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                              >
                                <StatusIcon size={12} /> {statusConfig.label}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1.5 pl-2 font-medium flex items-center gap-1">
                                {isCompleted ? (
                                  <>
                                    <CheckCircle2
                                      size={10}
                                      className="text-green-500"
                                    />{" "}
                                    Done: {order.dateFormatted}
                                  </>
                                ) : (
                                  <>
                                    <Clock size={10} /> Started:{" "}
                                    {order.dateFormatted}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3.5 align-top hidden md:table-cell">
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between w-28 text-[10px]">
                                  <span className="text-slate-500 font-bold">
                                    Total:
                                  </span>
                                  <span className="font-bold text-slate-900">
                                    ₹{order.payment.total}
                                  </span>
                                </div>
                                <div className="flex justify-between w-28 text-[10px]">
                                  <span className="text-slate-400">Paid:</span>
                                  <span className="font-bold text-emerald-600">
                                    ₹{order.payment.paid}
                                  </span>
                                </div>
                                <div className="flex justify-between w-28 text-[10px]">
                                  <span className="text-slate-400">Due:</span>
                                  <span className="font-bold text-red-500">
                                    ₹{order.payment.due}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 align-top text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPaymentModal({
                                    isOpen: true,
                                    order: order,
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold hover:bg-[#f7650b] shadow-md transition-all"
                              >
                                Pay{" "}
                                <ArrowRight
                                  size={10}
                                  className="hidden sm:block"
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <span className="text-xs font-bold text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-5 w-full lg:max-h-[850px] lg:overflow-y-auto lg:custom-scrollbar lg:pr-1">
            {/* SALES ANALYSIS */}
            <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-xl shadow-slate-200/20 shrink-0">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Sales Analysis
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Revenue Trend
                  </p>
                </div>
                <span className="text-[9px] font-bold bg-slate-900 text-white px-2 py-1 rounded-full uppercase tracking-wider">
                  {reportType}
                </span>
              </div>
              <SalesTrendChart data={timeBasedStats.chart} type={reportType} />
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                  Top Selling ({reportType})
                </h4>
                <div className="space-y-2">
                  {timeBasedStats.hotSelling.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-xs group cursor-default"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${i === 0 ? "bg-orange-100 text-[#f7650b]" : i === 1 ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-400"}`}
                        >
                          {i + 1}
                        </span>
                        <span className="font-bold text-slate-600 group-hover:text-slate-900 text-[11px]">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 text-[10px]">
                        {item.count} orders
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PACKAGES */}
            <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-xl shadow-slate-200/20 shrink-0">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-none text-sm">
                    Packages
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
                    Client Subscriptions
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <PackageCountCard
                  title="Yearly Video"
                  type="video"
                  count={packageData.yearlyVideo.length}
                  onClick={() =>
                    setMemberModal({
                      isOpen: true,
                      title: "Yearly Video Plan",
                      members: packageData.yearlyVideo,
                    })
                  }
                />
                <PackageCountCard
                  title="Yearly Image"
                  type="image"
                  count={packageData.yearlyImage.length}
                  onClick={() =>
                    setMemberModal({
                      isOpen: true,
                      title: "Yearly Image Plan",
                      members: packageData.yearlyImage,
                    })
                  }
                />
                <PackageCountCard
                  title="Monthly Video"
                  type="video"
                  count={packageData.monthlyVideo.length}
                  onClick={() =>
                    setMemberModal({
                      isOpen: true,
                      title: "Monthly Video Plan",
                      members: packageData.monthlyVideo,
                    })
                  }
                />
                <PackageCountCard
                  title="Monthly Image"
                  type="image"
                  count={packageData.monthlyImage.length}
                  onClick={() =>
                    setMemberModal({
                      isOpen: true,
                      title: "Monthly Image Plan",
                      members: packageData.monthlyImage,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CreateOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSubmit={handleCreateOrder}
        partnerName={agencyName}
      />
      <MemberDetailsModal
        isOpen={memberModal.isOpen}
        onClose={() => setMemberModal({ ...memberModal, isOpen: false })}
        title={memberModal.title}
        members={memberModal.members}
      />
      <PaymentUpdateModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, order: null })}
        order={paymentModal.order}
      />
      <OrderDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, order: null })}
        order={detailsModal.order}
      />
    </main>
  );
};

export default DashboardHome;
