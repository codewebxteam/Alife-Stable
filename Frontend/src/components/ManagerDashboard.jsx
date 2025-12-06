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
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  collectionGroup,
} from "firebase/firestore";
import { db } from "../firebase";

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

  // 1. Fetch Data
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
          if (durationRaw.includes("year") || serviceName.includes("year"))
            serviceCycle = "Yearly";
          else if (
            durationRaw.includes("month") ||
            serviceName.includes("month")
          )
            serviceCycle = "Monthly";

          // Determine Type
          let type = "service";
          if (serviceCycle !== "Instant") type = "e-greeting";
          else if (serviceName.includes("correction") || d.isCorrection)
            type = "correction";
          else if (serviceName.includes("agency")) type = "agency";
          else if (serviceName.includes("greeting")) type = "e-greeting";

          return {
            id: doc.id,
            ...d,
            createdAtDate: createdAt,
            adminPrice: parseFloat(d.pricing?.priceToAdmin || d.amount || 0),
            paidAmount: parseFloat(d.paidAmount || 0),
            dueAmount: Math.max(
              0,
              parseFloat(d.pricing?.priceToAdmin || 0) -
                parseFloat(d.paidAmount || 0)
            ),
            type,
            serviceCycle,
            mediaType: getMediaType(d.service?.name),
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

  // 2. Calculate Stats
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

    // DUE IS OVERALL (As requested)
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
    // Active means: Not Cancelled AND (In Progress OR Pending OR Completed but not expired)
    // For simplicity based on prompt: "Jitna v active hai sbb" usually implies valid running subscriptions
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
          {/* Revenue Card */}
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

          {/* Expenses Card */}
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

          {/* Net P&L Card */}
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
          {/* Active E-Greetings Breakdown */}
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

          {/* Agency Setup */}
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

          {/* Correction Status */}
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

          {/* E-Greeting Overall */}
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
    </div>
  );
};

export default ManagerDashboard;
