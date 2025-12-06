import React, { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Users,
  Layers,
  Zap,
  CalendarClock,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Video,
  FileDown,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Lock,
  Timer,
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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";

// Import Payment Modal
import PaymentVerificationModal from "../components/PaymentVerificationModal";

// --- CONFIGURATION ---
const PLAN_PRICES = {
  starter: 999,
  booster: 2499,
  academic: 4999,
  "pro starter": 999,
  "premium elite": 2499,
  "supreme master": 4999,
};

// --- UTILITIES ---
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

const isToday = (dateObj) => {
  if (!dateObj) return false;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
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

// --- SUB-COMPONENTS ---

const StatRow = ({
  label,
  value,
  colorClass = "text-slate-700",
  icon: Icon,
}) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors px-1 rounded-md">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={12} className="text-slate-400" />}
      <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
    <span className={`text-xs font-bold ${colorClass}`}>{value}</span>
  </div>
);

const ManagerCard = ({
  title,
  mainValue,
  subtitle,
  icon: Icon,
  color,
  children,
}) => {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {mainValue}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            colorStyles[color] || "bg-slate-50 text-slate-600"
          }`}
        >
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-auto space-y-1">{children}</div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const ManagerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Table UI State (From SalesOrders)
  const [activeTab, setActiveTab] = useState("service");
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters (From SalesOrders)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [serviceCycleFilter, setServiceCycleFilter] = useState("All");

  // 1. Auth Check
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((doc) => {
          const d = doc.data();
          // Normalize Data
          const createdAt = d.createdAt?.toDate
            ? d.createdAt.toDate()
            : new Date();
          const serviceName = (d.service?.name || "").toLowerCase();
          const durationRaw = (d.Duration || "").toLowerCase();

          // Determine Cycle
          let serviceCycle = "Instant";
          let expiryDate = null;

          if (durationRaw.includes("year") || serviceName.includes("year")) {
            serviceCycle = "Yearly";
            expiryDate = new Date(createdAt);
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          } else if (
            durationRaw.includes("month") ||
            serviceName.includes("month")
          ) {
            serviceCycle = "Monthly";
            expiryDate = new Date(createdAt);
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          }

          let rawStatus = d.status;
          if (
            serviceCycle !== "Instant" &&
            expiryDate &&
            new Date() > expiryDate
          ) {
            rawStatus = "Completed";
          }
          const normalizedStatus = normalizeStatus(rawStatus);

          // Determine Type
          let type = "service";
          if (serviceCycle !== "Instant") {
            type = "e-greeting";
          } else if (serviceName.includes("correction") || d.isCorrection) {
            type = "correction";
          } else if (serviceName.includes("agency")) {
            type = "agency";
          } else if (
            serviceName.includes("greeting") ||
            serviceName.includes("festival")
          ) {
            type = "e-greeting";
          }

          const total = parseFloat(d.pricing?.priceToAdmin || d.amount || 0);
          const paid = parseFloat(d.paidAmount || 0);

          return {
            id: doc.id,
            ...d,
            displayId: d.displayId,
            createdAtDate: createdAt,
            expiryDate: expiryDate,
            adminPrice: total,
            paidAmount: paid,
            dueAmount: Math.max(0, total - paid),
            status: normalizedStatus,
            type,
            serviceCycle,
            mediaType: getMediaType(d.service?.name),
            paymentStatus: (d.paymentStatus || "due").toLowerCase(),
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

  // 3. Calculate Stats (Existing Logic)
  const stats = useMemo(() => {
    // --- FINANCIALS (TODAY) ---
    const todayOrders = orders.filter((o) => isToday(o.createdAtDate));
    const todayPartners = partners.filter((p) => isToday(p.createdAtDate));
    const todayExpenses = expenses.filter((e) => isToday(e.createdAtDate));

    const todayServiceRevenue = todayOrders.reduce(
      (sum, o) => sum + o.paidAmount,
      0
    );
    const todayPartnerRevenue = todayPartners.reduce(
      (sum, p) => sum + (PLAN_PRICES[(p.plan || "").toLowerCase()] || 0),
      0
    );

    // DUE IS OVERALL
    const totalDueOverall = orders
      .filter((o) => !o.status?.toLowerCase().includes("cancel"))
      .reduce((sum, o) => sum + o.dueAmount, 0);

    const todayTotalRevenue = todayServiceRevenue + todayPartnerRevenue;
    const todayTotalExpense = todayExpenses.reduce(
      (sum, e) => sum + parseFloat(e.amount || 0),
      0
    );
    const todayNetPnL = todayTotalRevenue - todayTotalExpense;

    // --- SERVICE ORDERS (TODAY) ---
    const todayServices = todayOrders.filter((o) => o.type === "service");
    const serviceStats = {
      progress: todayServices.filter((o) => o.status === "In Progress").length,
      pending: todayServices.filter((o) => o.status === "Pending").length,
      cancelled: todayServices.filter(
        (o) => o.status === "Cancelled" || o.status === "Rejected"
      ).length,
      total: todayServices.length,
    };

    // --- PARTNERS (TODAY) ---
    const newPartners = {
      starter: todayPartners.filter((p) =>
        (p.plan || "").toLowerCase().includes("starter")
      ).length,
      booster: todayPartners.filter((p) =>
        (p.plan || "").toLowerCase().includes("booster")
      ).length,
      academic: todayPartners.filter((p) =>
        (p.plan || "").toLowerCase().includes("academic")
      ).length,
      total: todayPartners.length,
    };

    // --- ACTIVE E-GREETINGS (OVERALL) ---
    const activeSubs = orders.filter(
      (o) =>
        o.type === "e-greeting" &&
        !o.status?.toLowerCase().includes("cancel") &&
        !o.status?.toLowerCase().includes("reject")
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
      total: activeSubs.length,
    };

    // --- WORKFLOW STATUSES (OVERALL) ---
    const getStatusCounts = (type) => {
      const typeOrders = orders.filter((o) => o.type === type);
      return {
        total: typeOrders.length,
        progress: typeOrders.filter((o) => o.status === "In Progress").length,
        cancelled: typeOrders.filter(
          (o) => o.status === "Cancelled" || o.status === "Rejected"
        ).length,
        waiting: typeOrders.filter((o) => o.status === "Pending").length,
        completed: typeOrders.filter((o) => o.status === "Completed").length,
      };
    };

    const agencyStats = getStatusCounts("agency");
    const correctionStats = getStatusCounts("correction");
    const greetingStats = getStatusCounts("e-greeting");

    return {
      financials: {
        todayRevenue: todayTotalRevenue,
        todayServiceRev: todayServiceRevenue,
        todayPartnerRev: todayPartnerRevenue,
        totalDue: totalDueOverall,
        todayExpenses: todayTotalExpense,
        todayPnL: todayNetPnL,
      },
      todayActivity: {
        service: serviceStats,
        partners: newPartners,
      },
      overall: {
        subscriptions: subStats,
        agency: agencyStats,
        correction: correctionStats,
        greeting: greetingStats,
      },
    };
  }, [orders, partners, expenses]);

  // --- FILTER & PAGINATION LOGIC (From SalesOrders) ---
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

  // --- ACTION HANDLERS ---
  const handleStatusChange = async (orderId, newStatus) => {
    const confirmMsg =
      newStatus === "Completed" ? "Are you sure?" : "Start task?";
    if (!window.confirm(confirmMsg)) return;
    try {
      const updateData = { status: newStatus };
      if (newStatus === "In_Progress") {
        updateData.assignedTo = {
          uid: currentUser?.uid,
          name: currentUser?.displayName || "Manager",
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
    XLSX.writeFile(wb, `Manager_Orders_${activeTab}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* SECTION 1: TODAY'S FINANCIALS */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Wallet size={16} className="text-emerald-500" /> Today's Financial
          Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ManagerCard
            title="Today Revenue"
            mainValue={formatPrice(stats.financials.todayRevenue)}
            icon={TrendingUp}
            color="emerald"
          >
            <StatRow
              label="Partnership"
              value={formatPrice(stats.financials.todayPartnerRev)}
            />
            <StatRow
              label="Services"
              value={formatPrice(stats.financials.todayServiceRev)}
            />
            <div className="mt-1 pt-1 border-t border-dashed border-slate-200">
              <div className="flex justify-between items-center py-1">
                <span className="text-[11px] font-bold text-rose-500 uppercase">
                  Total Due (Overall)
                </span>
                <span className="text-xs font-black text-rose-600 bg-rose-50 px-1.5 rounded">
                  {formatPrice(stats.financials.totalDue)}
                </span>
              </div>
            </div>
          </ManagerCard>

          <ManagerCard
            title="Today Expenses"
            mainValue={formatPrice(stats.financials.todayExpenses)}
            icon={DollarSign}
            color="rose"
          >
            <div className="h-full flex flex-col justify-center py-2">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Includes all bills, salaries, and operational costs recorded
                today.
              </p>
            </div>
          </ManagerCard>

          <ManagerCard
            title="Net P&L (Today)"
            mainValue={
              <span
                className={
                  stats.financials.todayPnL >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              >
                {stats.financials.todayPnL >= 0 ? "+" : ""}
                {formatPrice(stats.financials.todayPnL)}
              </span>
            }
            icon={stats.financials.todayPnL >= 0 ? TrendingUp : TrendingDown}
            color={stats.financials.todayPnL >= 0 ? "indigo" : "rose"}
          >
            <StatRow
              label="Total Revenue"
              value={formatPrice(stats.financials.todayRevenue)}
              colorClass="text-emerald-600"
            />
            <StatRow
              label="Total Expenses"
              value={formatPrice(stats.financials.todayExpenses)}
              colorClass="text-rose-600"
            />
          </ManagerCard>
        </div>
      </div>

      {/* SECTION 2: TODAY'S ACTIVITY */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock size={16} className="text-blue-500" /> Today's Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <ManagerCard
            title="Service Orders (Today)"
            mainValue={stats.todayActivity.service.total}
            icon={Briefcase}
            color="blue"
          >
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <span className="block text-lg font-bold text-blue-700">
                  {stats.todayActivity.service.progress}
                </span>
                <span className="text-[9px] font-bold text-blue-400 uppercase">
                  In Progress
                </span>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 text-center">
                <span className="block text-lg font-bold text-amber-700">
                  {stats.todayActivity.service.pending}
                </span>
                <span className="text-[9px] font-bold text-amber-400 uppercase">
                  Pending
                </span>
              </div>
              <div className="bg-rose-50 rounded-lg p-2 text-center">
                <span className="block text-lg font-bold text-rose-700">
                  {stats.todayActivity.service.cancelled}
                </span>
                <span className="text-[9px] font-bold text-rose-400 uppercase">
                  Cancelled
                </span>
              </div>
            </div>
          </ManagerCard>

          <ManagerCard
            title="New Partners (Today)"
            mainValue={stats.todayActivity.partners.total}
            icon={Users}
            color="amber"
          >
            <StatRow
              label="Starter Plan"
              value={stats.todayActivity.partners.starter}
            />
            <StatRow
              label="Booster Plan"
              value={stats.todayActivity.partners.booster}
            />
            <StatRow
              label="Academic Plan"
              value={stats.todayActivity.partners.academic}
            />
          </ManagerCard>
        </div>
      </div>

      {/* SECTION 3: OVERALL SERVICES OVERVIEW */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers size={16} className="text-violet-500" /> Overall Services
          Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <ManagerCard
            title="Active E-Greetings"
            mainValue={stats.overall.subscriptions.total}
            subtitle="Overall Active Subscriptions"
            icon={Layers}
            color="violet"
          >
            <StatRow
              label="Yrly. Img. Pkg"
              value={stats.overall.subscriptions.yrlyImg}
              icon={ImageIcon}
            />
            <StatRow
              label="Yrly. VDO. Pkg"
              value={stats.overall.subscriptions.yrlyVdo}
              icon={Video}
            />
            <StatRow
              label="Mnth. Img. Pkg"
              value={stats.overall.subscriptions.mnthImg}
              icon={ImageIcon}
            />
            <StatRow
              label="Mnth. VDO. Pkg"
              value={stats.overall.subscriptions.mnthVdo}
              icon={Video}
            />
          </ManagerCard>

          <ManagerCard
            title="Agency Setup"
            mainValue={stats.overall.agency.total}
            subtitle="Overall Status"
            icon={Users}
            color="blue"
          >
            <StatRow
              label="In Progress"
              value={stats.overall.agency.progress}
              colorClass="text-blue-600"
              icon={PlayCircle}
            />
            <StatRow
              label="Waiting"
              value={stats.overall.agency.waiting}
              colorClass="text-amber-500"
              icon={Clock}
            />
            <StatRow
              label="Cancelled"
              value={stats.overall.agency.cancelled}
              colorClass="text-rose-600"
              icon={XCircle}
            />
          </ManagerCard>

          <ManagerCard
            title="Correction Status"
            mainValue={stats.overall.correction.total}
            subtitle="Overall Requests"
            icon={Zap}
            color="amber"
          >
            <StatRow
              label="In Progress"
              value={stats.overall.correction.progress}
              colorClass="text-blue-600"
              icon={PlayCircle}
            />
            <StatRow
              label="Waiting"
              value={stats.overall.correction.waiting}
              colorClass="text-amber-500"
              icon={Clock}
            />
            <StatRow
              label="Cancelled"
              value={stats.overall.correction.cancelled}
              colorClass="text-rose-600"
              icon={XCircle}
            />
          </ManagerCard>

          <ManagerCard
            title="E-Greeting Orders"
            mainValue={stats.overall.greeting.total}
            subtitle="Overall Orders (All Time)"
            icon={CalendarClock}
            color="emerald"
          >
            <StatRow
              label="In Progress"
              value={stats.overall.greeting.progress}
              colorClass="text-blue-600"
              icon={PlayCircle}
            />
            <StatRow
              label="Completed"
              value={stats.overall.greeting.completed}
              colorClass="text-emerald-600"
              icon={CheckCircle}
            />
            <StatRow
              label="Waiting"
              value={stats.overall.greeting.waiting}
              colorClass="text-amber-500"
              icon={Clock}
            />
            <StatRow
              label="Cancelled"
              value={stats.overall.greeting.cancelled}
              colorClass="text-rose-600"
              icon={XCircle}
            />
          </ManagerCard>
        </div>
      </div>

      {/* SECTION 4: TABLE SECTION (COPIED FROM SalesOrders) */}
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

export default ManagerDashboard;
