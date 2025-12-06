import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import Lenis from "@studio-freight/lenis";
import {
  Database,
  FileSpreadsheet,
  FileJson,
  Search,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CreditCard,
  Briefcase,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  X,
  Copy,
  Check,
  Maximize2,
  Activity,
  DollarSign,
  PlayCircle,
  CheckCircle,
  Lock,
  Mail,
  Phone,
  Timer,
  Trash2,
  Edit3,
  Save,
  ArrowUp,
  ArrowDown,
  Download,
  AlertTriangle,
  Users,
  Clock,
  PieChart,
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  collectionGroup,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Added Auth
import { db } from "../firebase";
import PaymentVerificationModal from "../components/PaymentVerificationModal";

// ==========================================
// 1. SYSTEM UTILITIES
// ==========================================

const parseCurrency = (value) => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return parseFloat(value.toString().replace(/[^0-9.-]+/g, "")) || 0;
};

const formatPrice = (value) => {
  const val = parseCurrency(value);
  if (!val && val !== 0) return "₹0";
  return `₹${val.toLocaleString("en-IN")}`;
};

const formatDate = (dateObj) => {
  if (!dateObj) return "N/A";
  const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- Custom Toast Hook ---
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, addToast, removeToast };
};

// ==========================================
// 2. VISUALIZATION (CHARTS)
// ==========================================

const DonutChart = ({
  data,
  title,
  totalLabel,
  size = 140,
  thickness = 15,
}) => {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  // Calculate segments
  let gradientStr = "";
  let currentAngle = 0;

  if (total > 0) {
    data.forEach((item) => {
      const percent = (item.value / total) * 100;
      gradientStr += `${item.color} ${currentAngle}% ${
        currentAngle + percent
      }%, `;
      currentAngle += percent;
    });
    gradientStr = gradientStr.slice(0, -2);
  } else {
    gradientStr = "#e2e8f0 0% 100%"; // Gray if empty
  }

  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between min-h-[160px]">
      <div className="flex-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          {title}
        </h3>
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 font-medium">{item.label}</span>
              </div>
              <span className="font-bold text-slate-900">
                {item.displayValue || item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Graphic */}
      <div
        className="relative flex items-center justify-center ml-4"
        style={{ width: size, height: size }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `conic-gradient(${gradientStr})`,
          }}
        />
        <div
          className="absolute bg-white rounded-full flex flex-col items-center justify-center"
          style={{ width: size - thickness * 2, height: size - thickness * 2 }}
        >
          <span className="text-lg font-black text-slate-800">
            {totalLabel || total}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Total
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. EDITABLE DETAILS DRAWER
// ==========================================

const DetailsDrawer = ({ isOpen, onClose, data, onUpdate, onToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    if (data) setFormData({ ...data });
  }, [data]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (scrollContainerRef.current) {
        lenisRef.current = new Lenis({
          wrapper: scrollContainerRef.current,
          content: scrollContainerRef.current.children[0],
          duration: 1.2,
          smooth: true,
        });
        function raf(time) {
          lenisRef.current?.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      lenisRef.current?.destroy();
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      if (data.service) await updateDoc(doc(db, "orders", data.id), formData);
      onToast("Record updated!", "success");
      setIsEditing(false);
      onUpdate(formData);
    } catch (error) {
      onToast("Update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (key, value) => {
    if (
      [
        "id",
        "password",
        "uid",
        "confirmPassword",
        "created_at_timestamp",
        "ref",
        "paymentHistory",
        "normalizedDate",
        "serviceCycle",
        "expiryDate",
        "adminPrice",
        "dueAmount",
      ].some((k) => key.toLowerCase().includes(k))
    )
      return null;
    const isEditable =
      isEditing && typeof value !== "object" && typeof value !== "boolean";
    return (
      <div
        className="flex flex-col py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded transition-colors"
        key={key}
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {key.replace(/_/g, " ")}
        </span>
        {isEditable ? (
          <input
            value={formData[key] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [key]: e.target.value })
            }
            className="w-full bg-white border border-indigo-200 rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <span className="text-sm font-medium text-slate-800 break-words">
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col z-10"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-white flex justify-between items-center shrink-0 z-20">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Database size={20} className="text-indigo-600" /> Inspector
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              ID: {data.id.slice(0, 8)}...
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {isEditing ? <X size={16} /> : <Edit3 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 text-rose-500"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar"
        >
          <div>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Metadata
                </h4>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                  {data.status || "Active"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400">
                    Created
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {formatDate(data.normalizedDate)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400">
                    Type
                  </span>
                  <span className="text-xs font-bold text-slate-900 capitalize">
                    {data.type || data.role || "Record"}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1 pb-20">
              {Object.keys(formData).map((key) =>
                renderField(key, formData[key])
              )}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="p-4 border-t border-slate-100 bg-white shrink-0 absolute bottom-0 w-full z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]"
            >
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// --- C. PAGINATION ---
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems }) => {
  if (totalItems === 0) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 gap-4">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Showing page {currentPage} of {totalPages} ({totalItems} records)
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN SYSTEM COMPONENT
// ==========================================

const AdminData = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Data Stores
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Filters
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const { toasts, addToast } = useToast();

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const auth = getAuth();
    const unsubAuth = auth.onAuthStateChanged((user) => setCurrentUser(user)); // FIX: Capture logged-in admin

    setLoading(true);

    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => {
        setOrders(
          snap.docs.map((d) => {
            const data = d.data();
            const created = data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date();
            const durationRaw = (data.Duration || "").toLowerCase();
            let cycle = "Instant",
              expiry = null;
            if (durationRaw.includes("year")) {
              cycle = "Yearly";
              expiry = new Date(created);
              expiry.setFullYear(expiry.getFullYear() + 1);
            } else if (durationRaw.includes("month")) {
              cycle = "Monthly";
              expiry = new Date(created);
              expiry.setMonth(expiry.getMonth() + 1);
            }

            // Financials Logic
            const totalCost = data.pricing?.priceToAdmin
              ? parseCurrency(data.pricing.priceToAdmin)
              : parseCurrency(data.amount);
            const paid = parseCurrency(data.paidAmount);
            const due = Math.max(0, totalCost - paid);

            return {
              id: d.id,
              ...data,
              normalizedDate: created,
              serviceCycle: cycle,
              expiryDate: expiry,
              adminPrice: totalCost,
              paidAmount: paid,
              dueAmount: due,
            };
          })
        );
      }
    );

    const unsubUsers = onSnapshot(
      query(collectionGroup(db, "profile")),
      (snap) => {
        const list = [];
        snap.forEach((doc) => {
          if (doc.id === "account_info")
            list.push({
              id: doc.ref.parent.parent.id,
              ...doc.data(),
              normalizedDate: doc.data().joinedAt
                ? new Date(doc.data().joinedAt)
                : new Date(),
            });
        });
        setUsers(list.sort((a, b) => b.normalizedDate - a.normalizedDate));
      }
    );

    const unsubExpenses = onSnapshot(
      query(collection(db, "expenses"), orderBy("createdAt", "desc")),
      (snap) =>
        setExpenses(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            normalizedDate: d.data().createdAt?.toDate() || new Date(),
          }))
        )
    );
    const unsubCoupons = onSnapshot(
      query(collection(db, "coupons"), orderBy("createdAt", "desc")),
      (snap) =>
        setCoupons(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            normalizedDate: d.data().createdAt?.toDate() || new Date(),
          }))
        )
    );

    const t = setTimeout(() => setLoading(false), 800);
    return () => {
      unsubAuth();
      unsubOrders();
      unsubUsers();
      unsubExpenses();
      unsubCoupons();
      clearTimeout(t);
    };
  }, []);

  const { partners, staff } = useMemo(() => {
    const p = [],
      s = [];
    users.forEach((u) => {
      const roles = Array.isArray(u.role) ? u.role : (u.role || "").split(",");
      const isStaff = roles.some((r) =>
        ["manager", "sales", "designer", "editor", "staff", "admin"].includes(
          r.trim().toLowerCase()
        )
      );
      if (isStaff) s.push(u);
      else p.push(u);
    });
    return { partners: p, staff: s };
  }, [users]);

  // --- 2. STATS CALCULATION ---
  const stats = useMemo(() => {
    // Partner Plans
    const plans = { starter: 0, booster: 0, academic: 0 };
    partners.forEach((p) => {
      const pl = (p.plan || "").toLowerCase();
      if (pl.includes("starter")) plans.starter++;
      else if (pl.includes("booster")) plans.booster++;
      else if (pl.includes("academic")) plans.academic++;
    });

    // Order Status
    const ordStatus = { completed: 0, pending: 0, inProgress: 0, cancelled: 0 };
    // Revenue
    let totalPaid = 0,
      totalDue = 0;

    orders.forEach((o) => {
      // Status
      const s = (o.status || "").toLowerCase();
      if (s.includes("complet")) ordStatus.completed++;
      else if (s.includes("progress")) ordStatus.inProgress++;
      else if (s.includes("cancel")) ordStatus.cancelled++;
      else ordStatus.pending++;

      // Revenue
      if (s !== "cancelled") {
        totalPaid += o.paidAmount;
        totalDue += o.dueAmount;
      }
    });

    return { plans, ordStatus, revenue: { paid: totalPaid, due: totalDue } };
  }, [partners, orders]);

  // --- 3. FILTERING ---
  const filteredData = useMemo(() => {
    let data = [];
    if (activeTab === "orders") data = orders;
    else if (activeTab === "partners") data = partners;
    else if (activeTab === "staff") data = staff;
    else if (activeTab === "expenses") data = expenses;
    else if (activeTab === "coupons") data = coupons;

    let result = data.filter((item) => {
      const deepSearch = (obj) =>
        Object.values(obj).some((val) =>
          val && typeof val === "object"
            ? deepSearch(val)
            : String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesSearch = !searchTerm || deepSearch(item);

      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const itemDate = new Date(item.normalizedDate);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59);
        matchesDate = itemDate >= start && itemDate <= end;
      }

      let matchesCategory = true;
      if (categoryFilter !== "All") {
        const status = (item.status || item.category || "").toLowerCase();
        matchesCategory = status === categoryFilter.toLowerCase();
      }

      let matchesPlan =
        activeTab === "partners" && planFilter !== "All"
          ? (item.plan || "").toLowerCase() === planFilter.toLowerCase()
          : true;
      let matchesDuration =
        activeTab === "orders" && durationFilter !== "All"
          ? (item.serviceCycle || "").toLowerCase() ===
            durationFilter.toLowerCase()
          : true;

      return (
        matchesSearch &&
        matchesDate &&
        matchesCategory &&
        matchesPlan &&
        matchesDuration
      );
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key] || "";
        let valB = b[sortConfig.key] || "";
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [
    activeTab,
    orders,
    partners,
    staff,
    expenses,
    coupons,
    searchTerm,
    dateRange,
    categoryFilter,
    planFilter,
    durationFilter,
    sortConfig,
  ]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // --- ACTIONS ---
  const handleSelectAll = (e) => {
    if (e.target.checked)
      setSelectedIds(new Set(paginatedData.map((d) => d.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} records?`)) return;
    try {
      addToast(`Deleted ${selectedIds.size} records`, "success");
      setSelectedIds(new Set());
    } catch (e) {
      addToast("Bulk delete failed", "error");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status,
        lastUpdated: serverTimestamp(),
      });
      addToast("Status updated");
    } catch (e) {
      addToast("Error updating", "error");
    }
  };

  const handleUserStatusToggle = async (id, currentStatus) => {
    alert("Toggle Status: Need backend logic for correct path.");
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey)
      return (
        <div className="w-3 h-3 ml-1 opacity-20">
          <ArrowUp size={10} />
          <ArrowDown size={10} />
        </div>
      );
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={12} className="ml-1 text-indigo-600" />
    ) : (
      <ArrowDown size={12} className="ml-1 text-indigo-600" />
    );
  };

  // --- EXPORT ---
  const handleExport = (type) => {
    const exportData = filteredData.map((item) => {
      const flat = {};
      // Explicitly extract important calculated fields
      if (activeTab === "orders") {
        flat.OrderId = item.displayId;
        flat.Service = item.service?.name;
        flat.Partner = item.partnerName;
        flat.Date = item.normalizedDate.toLocaleDateString();
        flat.TotalAmount = item.adminPrice;
        flat.Paid = item.paidAmount;
        flat.Due = item.dueAmount;
        flat.Duration = item.serviceCycle;
        flat.Status = item.status;
      } else {
        // Flatten generic object
        const rawFlat = flattenObject(item);
        Object.assign(flat, rawFlat);
      }
      return flat;
    });

    const timestamp = new Date().toISOString().split("T")[0];
    if (type === "json") {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 2)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `Export_${activeTab}_${timestamp}.json`;
      link.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab);
      XLSX.writeFile(wb, `Export_${activeTab}_${timestamp}.xlsx`);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-12 font-sans text-slate-900 bg-[#f8fafc] min-h-screen relative">
      {/* TOASTS */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
                t.type === "success"
                  ? "bg-white border-emerald-100 text-emerald-700"
                  : "bg-white border-rose-100 text-rose-700"
              }`}
            >
              {t.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
              <span className="text-sm font-bold">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEADER */}
      <div className="py-8 flex flex-col xl:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">
            Admin<span className="text-indigo-600">OS</span> Data.
          </h1>
          <p className="text-slate-500 font-medium">
            Enterprise Grade Data Management System.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500 shadow-sm"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95"
          >
            <Download size={16} /> Export Filtered
          </button>
        </div>
      </div>

      {/* PIE CHART ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DonutChart
          title="Revenue Breakdown"
          totalLabel={formatPrice(stats.revenue.paid + stats.revenue.due)}
          data={[
            {
              label: "Paid",
              value: stats.revenue.paid,
              displayValue: formatPrice(stats.revenue.paid),
              color: "#10b981",
            },
            {
              label: "Due",
              value: stats.revenue.due,
              displayValue: formatPrice(stats.revenue.due),
              color: "#f43f5e",
            },
          ]}
        />
        <DonutChart
          title="Partner Plans"
          totalLabel={partners.length}
          data={[
            { label: "Starter", value: stats.plans.starter, color: "#94a3b8" },
            { label: "Booster", value: stats.plans.booster, color: "#6366f1" },
            {
              label: "Academic",
              value: stats.plans.academic,
              color: "#ec4899",
            },
          ]}
        />
        <DonutChart
          title="Order Status"
          totalLabel={orders.length}
          data={[
            {
              label: "Completed",
              value: stats.ordStatus.completed,
              color: "#10b981",
            },
            {
              label: "Progress",
              value: stats.ordStatus.inProgress,
              color: "#3b82f6",
            },
            {
              label: "Pending",
              value: stats.ordStatus.pending,
              color: "#f59e0b",
            },
            {
              label: "Cancelled",
              value: stats.ordStatus.cancelled,
              color: "#f43f5e",
            },
          ]}
        />
      </div>

      {/* MAIN CONSOLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col min-h-[700px] overflow-hidden">
        <div className="px-6 pt-4 pb-0 border-b border-slate-100 flex gap-6 overflow-x-auto scrollbar-hide">
          {[
            {
              id: "orders",
              label: "Orders",
              icon: ShoppingBag,
              count: orders.length,
            },
            {
              id: "partners",
              label: "Partners",
              icon: Briefcase,
              count: partners.length,
            },
            {
              id: "staff",
              label: "Staff",
              icon: ShieldCheck,
              count: staff.length,
            },
            {
              id: "expenses",
              label: "Expenses",
              icon: CreditCard,
              count: expenses.length,
            },
            {
              id: "coupons",
              label: "Coupons",
              icon: Ticket,
              count: coupons.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
                setSelectedIds(new Set());
              }}
              className={`flex items-center gap-2 pb-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon size={16} /> {tab.label}{" "}
              <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-500">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* FILTERS & TOOLBAR */}
        <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col xl:flex-row gap-4 justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative w-full xl:w-80 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                size={16}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search (Cmd+K)"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              />
            </div>
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex gap-2"
                >
                  <button
                    onClick={handleBulkDelete}
                    className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="flex items-center px-3 text-xs font-bold text-slate-500 bg-white border rounded-xl">
                    {selectedIds.size} Selected
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
              <div className="px-3 text-slate-400">
                <Calendar size={14} />
              </div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full sm:w-28"
              />
              <span className="text-slate-300 mx-1">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full sm:w-28"
              />
            </div>
            {activeTab === "orders" && (
              <>
                <div className="relative w-full sm:w-40">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-3 pl-4 pr-10 focus:outline-none shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={14}
                  />
                </div>
                <div className="relative w-full sm:w-40">
                  <select
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-3 pl-4 pr-10 focus:outline-none shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="All">All Duration</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Instant">Instant</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={14}
                  />
                </div>
              </>
            )}
            {activeTab === "partners" && (
              <div className="relative w-full sm:w-40">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-3 pl-4 pr-10 focus:outline-none shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="All">All Plans</option>
                  <option value="Starter">Starter</option>
                  <option value="Booster">Booster</option>
                  <option value="Academic">Academic</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={14}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto bg-white relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2
                className="animate-spin text-indigo-600 mb-2"
                size={32}
              />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Processing Data...
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Database
                size={48}
                strokeWidth={1}
                className="mb-4 text-slate-200"
              />
              <p className="text-sm font-bold">
                No records found matching filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                }}
                className="mt-2 text-xs text-indigo-600 font-bold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-5 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  {activeTab === "orders" ? (
                    <>
                      <th
                        className="p-5 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort("service.name")}
                      >
                        Service & Info <SortIcon colKey="service.name" />
                      </th>
                      <th
                        className="p-5 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort("normalizedDate")}
                      >
                        Timeline <SortIcon colKey="normalizedDate" />
                      </th>
                      <th className="p-5">Duration</th>
                      <th className="p-5">Assigned To</th>
                      <th className="p-5 text-right">Paid / Due</th>
                      <th className="p-5 text-right">Status</th>
                      <th className="p-5 text-center">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="p-5">Primary Info</th>
                      <th className="p-5">Details / Contact</th>
                      <th className="p-5 text-right">Metrics / Amount</th>
                      {activeTab !== "expenses" && (
                        <th className="p-5 text-right">Status</th>
                      )}
                      <th className="p-5 text-center">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((row, idx) => (
                  <motion.tr
                    key={row.id || idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-indigo-50/20 transition-colors group cursor-pointer ${
                      selectedIds.has(row.id) ? "bg-indigo-50/40" : ""
                    }`}
                    onClick={() => setSelectedRecord(row)}
                  >
                    <td className="p-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    {activeTab === "orders" ? (
                      <>
                        <td className="p-5">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {row.service?.name}
                          </p>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex gap-1">
                            <span>{row.displayId}</span> •{" "}
                            <span>{row.partnerName}</span>
                          </div>
                        </td>
                        <td className="p-5 text-xs text-slate-500 font-medium">
                          {formatDate(row.normalizedDate)}
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase w-fit ${
                                row.serviceCycle === "Yearly"
                                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                  : row.serviceCycle === "Monthly"
                                  ? "bg-orange-50 text-orange-600 border-orange-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              {row.serviceCycle}
                            </span>
                            {row.expiryDate && (
                              <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                <Timer size={10} /> Exp:{" "}
                                {row.expiryDate.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-5">
                          {row.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700 border border-indigo-200">
                                {row.assignedTo.name?.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-indigo-900">
                                {row.assignedTo.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-slate-900">
                              {formatPrice(row.adminPrice)}
                            </span>
                            {row.dueAmount > 0 ? (
                              <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle size={10} /> Due:{" "}
                                {formatPrice(row.dueAmount)}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600">
                                Paid
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              row.status === "Completed"
                                ? "bg-emerald-50 text-emerald-600"
                                : row.status === "In Progress"
                                ? "bg-blue-50 text-blue-600"
                                : row.status === "Cancelled"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td
                          className="p-5 text-center flex justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedRecord(row)}
                            className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                          >
                            <Maximize2 size={14} />
                          </button>
                          {row.dueAmount > 0 && row.status !== "Cancelled" && (
                            <button
                              onClick={() => setPaymentModalOrder(row)}
                              className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <DollarSign size={14} />
                            </button>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                                activeTab === "staff"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {row.fullName?.charAt(0) ||
                                row.code?.charAt(0) ||
                                "U"}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {row.fullName || row.code || row.description}
                              </p>
                              {activeTab === "staff" && (
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  ID: {row.staffId || "N/A"}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          {activeTab === "coupons" ? (
                            <p className="text-xs font-medium text-slate-600">
                              Created By: {row.createdBy || "Admin"}
                            </p>
                          ) : (
                            <div className="text-xs text-slate-500">
                              {row.email && (
                                <div className="flex items-center gap-1">
                                  <Mail size={12} /> {row.email}
                                </div>
                              )}
                              {row.phone && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone size={12} /> {row.phone}
                                </div>
                              )}
                              {row.category && (
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold">
                                  {row.category}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          {activeTab === "expenses" ? (
                            <p className="text-xs font-black text-slate-900">
                              {formatPrice(row.amount)}
                            </p>
                          ) : activeTab === "coupons" ? (
                            <p className="text-xs font-bold text-purple-600">
                              {row.discountPercent}% Off
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-slate-600">
                              {row.plan || row.role || "N/A"}
                            </p>
                          )}
                        </td>
                        {activeTab !== "expenses" && (
                          <td className="p-5 text-right">
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                (row.status || "")
                                  .toLowerCase()
                                  .includes("active")
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {row.status || "N/A"}
                            </span>
                          </td>
                        )}
                        <td
                          className="p-5 text-center flex justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedRecord(row)}
                            className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                          >
                            <Maximize2 size={14} />
                          </button>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
        />
      </div>
      <AnimatePresence>
        {selectedRecord && (
          <DetailsDrawer
            isOpen={true}
            onClose={() => setSelectedRecord(null)}
            data={selectedRecord}
            onToast={addToast}
            onUpdate={() => {}}
          />
        )}
        {paymentModalOrder && (
          <PaymentVerificationModal
            isOpen={true}
            onClose={() => setPaymentModalOrder(null)}
            order={paymentModalOrder}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminData;
