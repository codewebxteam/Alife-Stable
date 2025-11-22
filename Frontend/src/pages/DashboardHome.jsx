import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  MoreHorizontal,
  ArrowUpRight,
  Calendar,
  User,
  Package,
  Sparkles,
  Activity,
  Zap,
  Download,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { getAuth } from "firebase/auth";

// --- MOCK STATS DATA ---
const stats = [
  {
    id: 1,
    title: "Total Revenue",
    value: "₹1.2L",
    sub: "Total Orders: 1,248",
    icon: Sparkles,
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    trend: "+12%",
    positive: true,
  },
  {
    id: 2,
    title: "Completed",
    value: "1,102",
    sub: "Orders Delivered",
    icon: CheckCircle2,
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    trend: "+8%",
    positive: true,
  },
  {
    id: 3,
    title: "In Progress",
    value: "134",
    sub: "Active Projects",
    icon: Clock,
    color: "from-orange-500 to-amber-600",
    bg: "bg-orange-50",
    trend: "-2%",
    positive: false,
  },
  {
    id: 4,
    title: "Cancelled",
    value: "12",
    sub: "Refunded / Void",
    icon: XCircle,
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    trend: "0%",
    positive: true,
  },
];

// --- MOCK RECENT ORDERS ---
const recentOrders = [
  {
    id: "#ORD-7821",
    client: "Rahul Kumar",
    service: "Video Editing",
    date: "22 Nov, 10:30 AM",
    status: "Delivered",
    amount: "₹4,500",
    avatar:
      "https://ui-avatars.com/api/?name=Rahul+Kumar&background=0D8ABC&color=fff",
  },
  {
    id: "#ORD-7820",
    client: "Design Co.",
    service: "Thumbnail Pack",
    date: "21 Nov, 04:15 PM",
    status: "Pending",
    amount: "₹1,200",
    avatar:
      "https://ui-avatars.com/api/?name=Design+Co&background=f7650b&color=fff",
  },
  {
    id: "#ORD-7819",
    client: "Sneha S.",
    service: "Reels Bundle",
    date: "21 Nov, 02:00 PM",
    status: "Processing",
    amount: "₹8,000",
    avatar:
      "https://ui-avatars.com/api/?name=Sneha+S&background=6b21a8&color=fff",
  },
  {
    id: "#ORD-7818",
    client: "Tech Flow",
    service: "Web Audit",
    date: "20 Nov, 11:00 AM",
    status: "Delivered",
    amount: "₹15,000",
    avatar:
      "https://ui-avatars.com/api/?name=Tech+Flow&background=10b981&color=fff",
  },
];

// --- PIE CHART ---
const SimplePieChart = () => {
  const segments = [
    { color: "#22c55e", percent: 75, label: "Delivered" },
    { color: "#f97316", percent: 20, label: "Pending" },
    { color: "#ef4444", percent: 5, label: "Cancelled" },
  ];

  let currentAngle = 0;
  const gradientParts = segments.map((seg) => {
    const start = currentAngle;
    const end = currentAngle + seg.percent;
    currentAngle = end;
    return `${seg.color} ${start}% ${end}%`;
  });
  const gradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-full">
      <div
        className="relative w-48 h-48 rounded-full shrink-0 p-4 bg-slate-50 shadow-inner"
        style={{ background: gradient }}
      >
        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
          <span className="text-3xl font-bold text-slate-900">95%</span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Success Rate
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full sm:w-auto">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center gap-3 group cursor-default"
          >
            <span
              className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors flex-1">
              {seg.label}
            </span>
            <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
              {seg.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- BAR CHART ---
const SimpleBarChart = ({ view }) => {
  const dataMap = {
    Weekly: {
      values: [40, 65, 30, 85, 55, 95, 70],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    Monthly: {
      values: [60, 45, 80, 50],
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    },
  };
  const currentData = dataMap[view];

  return (
    <div className="h-64 flex items-end justify-between gap-3 pt-8 w-full px-2">
      {currentData.values.map((h, i) => (
        <div
          key={`${view}-${i}`}
          className="group flex flex-col items-center gap-3 w-full h-full justify-end relative"
        >
          {/* Floating Tooltip */}
          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl z-20 whitespace-nowrap">
            {h} Orders
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
          </div>

          {/* The Bar */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${h}%`, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: i * 0.05,
              type: "spring",
              stiffness: 100,
            }}
            className="w-full max-w-[40px] rounded-t-xl relative overflow-hidden"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-t ${
                h > 80
                  ? "from-[#f7650b] to-orange-400"
                  : "from-slate-300 to-slate-200 group-hover:from-orange-300 group-hover:to-orange-200"
              } transition-colors duration-300`}
            ></div>
            {/* Shine Effect */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/50"></div>
          </motion.div>

          {/* Label */}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-[#f7650b] transition-colors">
            {currentData.labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
};

const DashboardHome = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const agencyName = user?.displayName || "Partner";
  const [performanceView, setPerformanceView] = useState("Weekly");
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] font-sans relative overflow-x-hidden pb-24">
      {/* --- AMBIENT BACKGROUND LAYERS --- */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        {/* Soft Gradient Mesh */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white via-slate-50 to-transparent" />

        {/* Animated Blobs */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-40 -left-20 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px]"
        />
      </div>

      {/* REDUCED TOP PADDING HERE (pt-6 instead of pt-24) */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 pt-6">
        {/* --- 1. HERO & WELCOME --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#f7650b] animate-pulse"></span>
              Live Dashboard
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight"
            >
              {greeting},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7650b] to-orange-600">
                {agencyName.split(" ")[0]}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 mt-2 text-lg"
            >
              You have{" "}
              <span className="font-bold text-slate-900">12 pending tasks</span>{" "}
              requiring your attention today.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 p-1.5 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/60 backdrop-blur-xl"
          >
            <button className="px-5 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Report
            </button>
            <div className="w-px h-8 bg-slate-200 mx-1"></div>
            <button className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-[#f7650b] transition-all shadow-lg hover:shadow-orange-500/25 flex items-center gap-2">
              <Zap className="w-4 h-4 fill-current" /> Create Order
            </button>
          </motion.div>
        </div>

        {/* --- 2. STATS BENTO GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group cursor-default"
            >
              {/* Background Glow on Hover */}
              <div
                className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`}
              ></div>

              <div className="flex justify-between items-start mb-8">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white shadow-lg`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    stat.positive
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {stat.trend}
                  {stat.positive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3 rotate-180" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                  {stat.title}
                </h3>
                <div className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </div>
                <p className="text-slate-400 text-xs mt-2 font-medium">
                  {stat.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- 3. MAIN CONTENT GRID --- */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          {/* ANALYTICS CHART (Col-span-8) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/30 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Sales Analytics
                </h3>
                <p className="text-slate-500 text-sm">Performance overview</p>
              </div>
              <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                {["Weekly", "Monthly"].map((view) => (
                  <button
                    key={view}
                    onClick={() => setPerformanceView(view)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      performanceView === view
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            <SimpleBarChart view={performanceView} />
          </motion.div>

          {/* ORDER STATUS (Col-span-4) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/30 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Status</h3>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow flex items-center justify-center">
              <SimplePieChart />
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50">
              <p className="text-center text-sm text-slate-500">
                Your delivery rate is{" "}
                <span className="text-green-500 font-bold">Top 5%</span> of all
                agencies.
              </p>
            </div>
          </motion.div>
        </div>

        {/* --- 4. BOTTOM GRID --- */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* RECENT ORDERS TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden flex flex-col"
          >
            <div className="p-8 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Recent Orders
                </h3>
                <p className="text-slate-500 text-sm">
                  Latest transaction history
                </p>
              </div>
              <button className="text-xs font-bold text-[#f7650b] hover:text-orange-700 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={order.avatar}
                            alt={order.client}
                            className="w-10 h-10 rounded-xl shadow-sm"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {order.client}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                              {order.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Package className="w-4 h-4 text-slate-400" />{" "}
                          {order.service}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                                   ${
                                     order.status === "Delivered"
                                       ? "bg-green-50 text-green-600 border-green-100"
                                       : order.status === "Pending"
                                       ? "bg-orange-50 text-orange-600 border-orange-100"
                                       : "bg-blue-50 text-blue-600 border-blue-100"
                                   }
                                `}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {order.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg text-slate-300 hover:bg-white hover:text-[#f7650b] hover:shadow-md transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* PREMIUM PLAN CARD ("BLACK CARD") */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-4 group perspective-1000"
          >
            <div className="relative h-full bg-slate-900 rounded-[2.5rem] p-8 overflow-hidden text-white flex flex-col shadow-2xl shadow-slate-900/40 transition-transform duration-500 hover:scale-[1.02]">
              {/* Holographic / Mesh Background */}
              <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-[#f7650b] to-purple-600 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>

              {/* Card Content */}
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                    <Activity className="w-6 h-6 text-[#f7650b]" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#f7650b] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-900/40">
                    Pro Plan
                  </span>
                </div>

                <div className="mt-auto">
                  <h3 className="text-3xl font-bold mb-2 tracking-tight">
                    Supreme Master
                  </h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Unlocking full potential with priority support & AI tools.
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-400">Storage Used</span>
                      <span className="text-white">78%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "78%" }}
                        transition={{ duration: 1.5, delay: 1 }}
                        className="h-full bg-gradient-to-r from-[#f7650b] to-orange-500 rounded-full shadow-[0_0_15px_rgba(247,101,11,0.5)]"
                      />
                    </div>
                  </div>

                  <button className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-lg">
                    Upgrade Plan <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default DashboardHome;
