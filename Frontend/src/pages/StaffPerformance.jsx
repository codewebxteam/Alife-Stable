import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLenis } from "lenis/react"; // Using Lenis for scroll control
import {
  TrendingUp,
  Users,
  Search,
  Plus,
  PenTool,
  Video,
  Briefcase,
  Layers,
  CheckCircle,
  Loader2,
  ChevronRight,
  Star,
  X,
  Trash2,
  Hash,
  Ticket,
  ArrowRight,
  Activity,
  Calendar,
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  collectionGroup,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import AddStaffModal from "../components/AddStaffModal";

// --- UTILITIES ---
const formatPrice = (value) => {
  if (!value && value !== 0) return "₹0";
  const num = Number(value.toString().replace(/[^0-9.-]+/g, ""));
  return `₹${num.toLocaleString("en-IN")}`;
};

// --- COMPONENT: STAFF DETAIL MODAL (With Proper Scrolling) ---
const StaffDetailModal = ({ member, onClose }) => {
  const navigate = useNavigate();
  const lenis = useLenis();

  // Scroll Lock similar to CreateOrderModal
  useEffect(() => {
    if (lenis) {
      lenis.stop();
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (lenis) {
        lenis.start();
        document.body.style.overflow = "unset";
      }
    };
  }, [lenis]);

  if (!member) return null;

  const isSales = member.roles.includes("Sales");
  const isCreative =
    member.roles.includes("Designer") || member.roles.includes("Editor");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-slate-900/20">
              {member.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {member.fullName}
              </h2>
              <div className="flex flex-wrap gap-2 mt-1 items-center">
                {member.staffId && (
                  <span className="bg-white px-2.5 py-0.5 rounded border border-slate-200 text-xs font-mono text-slate-500 font-bold">
                    {member.staffId}
                  </span>
                )}
                {member.roles.map((r) => (
                  <span
                    key={r}
                    className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8"
          data-lenis-prevent // Prevents parent scroll interference
        >
          {/* SALES WORK DONE */}
          {isSales && (
            <section>
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="text-emerald-500" /> Sales
                    Performance
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Total Work Done:{" "}
                    <span className="text-slate-900 font-bold">
                      {member.metrics.sales.count} Orders
                    </span>{" "}
                    from {member.metrics.sales.partnersRecruited} Partners
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Total Revenue
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    {formatPrice(member.metrics.sales.revenue)}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">
                          Partner Name
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">
                          Orders Closed
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {member.metrics.sales.detailedReferrals.length > 0 ? (
                        member.metrics.sales.detailedReferrals.map((ref) => (
                          <tr
                            key={ref.uid}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-3">
                              <p className="text-sm font-bold text-slate-900">
                                {ref.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {ref.email}
                              </p>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border border-blue-100">
                                {ref.totalOrders}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right text-sm font-bold text-emerald-700">
                              {formatPrice(ref.totalRevenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-8 text-center text-slate-400 text-xs"
                          >
                            No sales activity recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* CREATIVE WORK DONE */}
          {isCreative && (
            <section>
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="text-purple-500" /> Creative Work Log
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Total Completed Projects:{" "}
                    <span className="text-slate-900 font-bold">
                      {member.metrics.creative.completedProjects}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">
                          Project / Task
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">
                          Client
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {member.metrics.creative.recentProjects.length > 0 ? (
                        member.metrics.creative.recentProjects.map((proj) => (
                          <tr
                            key={proj.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-3">
                              <p className="text-sm font-bold text-slate-900">
                                {proj.serviceName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                #{proj.displayId}
                              </p>
                            </td>
                            <td className="px-6 py-3 text-xs font-medium text-slate-600">
                              {proj.clientName}
                            </td>
                            <td className="px-6 py-3 text-xs text-slate-500 flex items-center gap-1">
                              <Calendar size={10} /> {proj.date}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 text-[10px] font-bold uppercase">
                                <CheckCircle size={10} /> Done
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-8 text-center text-slate-400 text-xs"
                          >
                            No completed projects found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center shrink-0">
          <p className="text-[10px] text-slate-400 italic">
            Showing full history from database
          </p>
          <button
            onClick={() => navigate("/admin/data")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            Go to Database <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN DASHBOARD ---
const StaffPerformance = () => {
  const [activeStaff, setActiveStaff] = useState([]);
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  const handleRemoveStaff = async (member) => {
    if (
      window.confirm(
        `PERMANENT ACTION:\n\nAre you sure you want to remove ${member.fullName}?\nThis will delete their profile from the dashboard.`
      )
    ) {
      try {
        await deleteDoc(doc(db, "users", member.id, "profile", "account_info"));
        alert("Staff member removed successfully.");
      } catch (err) {
        console.error("Error removing staff:", err);
        alert("Error: Could not remove staff.");
      }
    }
  };

  useEffect(() => {
    // 1. Fetch Active Profiles
    const qProfiles = query(collectionGroup(db, "profile"));
    const unsubProfiles = onSnapshot(qProfiles, (snapshot) => {
      const staff = [];
      const allPartners = [];
      snapshot.docs.forEach((doc) => {
        if (doc.id === "account_info") {
          const data = doc.data();
          const uid = doc.ref.parent.parent?.id;

          let roles = [];
          if (Array.isArray(data.role)) roles = data.role;
          else if (data.role && data.role !== "Partner")
            roles = data.role.includes(",")
              ? data.role.split(",").map((r) => r.trim())
              : [data.role];

          const validRoles = [
            "Manager",
            "Designer",
            "Editor",
            "Sales",
            "Staff",
          ];
          const hasStaffRole = roles.some((r) => validRoles.includes(r));

          if (hasStaffRole) {
            staff.push({ id: uid, ...data, roles: roles });
          } else if (data.referralCode) {
            allPartners.push({
              uid: uid,
              referralCode: data.referralCode.toUpperCase(),
              name: data.fullName || "Unknown",
              email: data.email || "N/A",
              joinedAt: data.joinedAt || new Date().toISOString(),
            });
          }
        }
      });
      setActiveStaff(staff);
      setPartners(allPartners);
      setLoading(false);
    });

    // 2. Fetch Orders
    const qOrders = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        parsedAmount: parseFloat(
          (doc.data().amount || "0").toString().replace(/[₹,]/g, "")
        ),
        status: (doc.data().status || "").toLowerCase(),
        createdAtDate: doc.data().createdAt?.toDate
          ? doc.data().createdAt.toDate()
          : new Date(),
        displayId: doc.id.substring(0, 6).toUpperCase(),
      }));
      setOrders(ordersData);
    });

    return () => {
      unsubProfiles();
      unsubOrders();
    };
  }, []);

  const processedStaff = useMemo(() => {
    return activeStaff.map((member) => {
      // 1. SALES METRICS
      let salesMetrics = {
        count: 0,
        revenue: 0,
        partnersRecruited: 0,
        detailedReferrals: [],
      };
      if (member.roles.includes("Sales")) {
        const myRefCode = member.referralCode?.toUpperCase();
        if (myRefCode) {
          const myReferredPartners = partners.filter(
            (p) => p.referralCode === myRefCode
          );
          salesMetrics.partnersRecruited = myReferredPartners.length;
          salesMetrics.detailedReferrals = myReferredPartners
            .map((partner) => {
              const partnerOrders = orders.filter(
                (o) =>
                  o.partnerId === partner.uid &&
                  (o.status.includes("completed") ||
                    o.status.includes("delivered"))
              );
              const totalRevenue = partnerOrders.reduce(
                (sum, o) => sum + o.parsedAmount,
                0
              );
              return {
                ...partner,
                totalOrders: partnerOrders.length,
                totalRevenue: totalRevenue,
              };
            })
            .sort((a, b) => b.totalRevenue - a.totalRevenue);
          salesMetrics.count = salesMetrics.detailedReferrals.reduce(
            (sum, p) => sum + p.totalOrders,
            0
          );
          salesMetrics.revenue = salesMetrics.detailedReferrals.reduce(
            (sum, p) => sum + p.totalRevenue,
            0
          );
        }
      }

      // 2. CREATIVE METRICS
      let creativeMetrics = {
        activeProjects: 0,
        completedProjects: 0,
        recentProjects: [],
      };
      if (
        member.roles.includes("Designer") ||
        member.roles.includes("Editor")
      ) {
        // Filter ONLY completed orders for "Work Done" list
        // Note: In real app, match 'assignedTo' with member.id. Here we simulate for demo purposes using all completed orders.
        const allCompletedProjects = orders.filter(
          (o) =>
            o.status.includes("completed") || o.status.includes("delivered")
        );

        // Simulating that they worked on a subset of projects if no explicit assignment exists
        // In production, change this line to: orders.filter(o => o.assignedTo === member.id && o.status === 'completed')
        const myWork = allCompletedProjects;

        creativeMetrics.recentProjects = myWork.map((o) => ({
          id: o.id,
          displayId: o.displayId,
          serviceName: o.service?.name || "Service",
          clientName: o.partnerName || "Client",
          date: o.createdAtDate.toLocaleDateString(),
        }));

        creativeMetrics.completedProjects =
          creativeMetrics.recentProjects.length;
        creativeMetrics.activeProjects = Math.floor(Math.random() * 4); // Placeholder for "In Progress"
      }

      // 3. EFFICIENCY SCORE
      let score = 75;
      if (salesMetrics.count > 5) score += 10;
      if (salesMetrics.revenue > 10000) score += 10;
      if (creativeMetrics.completedProjects > 5) score += 15;
      score = Math.min(100, score);

      return {
        ...member,
        metrics: {
          sales: salesMetrics,
          creative: creativeMetrics,
          efficiency: score,
        },
      };
    });
  }, [activeStaff, orders, partners]);

  const filteredStaff = processedStaff.filter((s) => {
    const matchesSearch = (s.fullName?.toLowerCase() || "").includes(
      searchTerm.toLowerCase()
    );
    const matchesRole = roleFilter === "All" || s.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case "Sales":
        return <TrendingUp size={10} />;
      case "Designer":
        return <PenTool size={10} />;
      case "Editor":
        return <Video size={10} />;
      case "Manager":
        return <Briefcase size={10} />;
      default:
        return <Users size={10} />;
    }
  };
  const getRoleColor = (role) => {
    switch (role) {
      case "Sales":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Designer":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Editor":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Manager":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Team Performance
          </h1>
          <p className="text-slate-500">
            Track work done, revenue generated, and team efficiency.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {["All", "Manager", "Sales", "Designer", "Editor"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  roleFilter === role
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 w-full sm:w-48 shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-[2rem] border border-slate-100 border-dashed">
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
          ) : (
            <Users className="w-12 h-12 mb-4 opacity-20" />
          )}
          <p className="font-medium">
            {loading ? "Loading metrics..." : "No staff found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredStaff.map((member, idx) => (
              <motion.div
                layout
                key={member.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group hover:border-blue-200 transition-all flex flex-col h-full min-h-[340px]"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveStaff(member);
                  }}
                  className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100%] opacity-50 bg-gradient-to-bl from-slate-100 to-transparent`}
                />

                <div className="relative z-10 flex-1">
                  <div className="flex flex-col gap-3 mb-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl border shadow-sm flex items-center justify-center text-xl font-black bg-white border-slate-100 text-slate-700 relative">
                        {member.fullName?.charAt(0)}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-sm text-[8px] font-bold text-slate-900">
                          {member.metrics.efficiency}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">
                          {member.fullName}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                          <Hash size={10} /> {member.staffId || "N/A"}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {member.roles.map((role) => (
                            <span
                              key={role}
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${getRoleColor(
                                role
                              )}`}
                            >
                              {getRoleIcon(role)} {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SALES REF ID DISPLAY */}
                    {member.referralCode && member.roles.includes("Sales") && (
                      <div className="w-full bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                          Ref Code
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-700 flex items-center gap-1">
                          <Ticket size={10} /> {member.referralCode}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {member.roles.includes("Sales") && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                            Total Rev
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {formatPrice(member.metrics.sales.revenue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                            Partners
                          </p>
                          <button
                            onClick={() => setSelectedStaff(member)}
                            className="text-sm font-black text-blue-600 hover:underline decoration-2 underline-offset-2"
                          >
                            {member.metrics.sales.partnersRecruited}
                          </button>
                        </div>
                      </div>
                    )}
                    {(member.roles.includes("Designer") ||
                      member.roles.includes("Editor")) && (
                      <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-bold text-purple-600 uppercase mb-0.5">
                            Work Done
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-900">
                              {member.metrics.creative.completedProjects}{" "}
                              Projects
                            </p>
                            <span className="px-1.5 py-0.5 bg-white rounded text-[9px] font-bold text-purple-700 shadow-sm">
                              Completed
                            </span>
                          </div>
                        </div>
                        <CheckCircle className="text-purple-400" size={20} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      Contact
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate w-24">
                      {member.email}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedStaff(member)}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    View Performance <ChevronRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
      />
      <AnimatePresence>
        {selectedStaff && (
          <StaffDetailModal
            member={selectedStaff}
            onClose={() => setSelectedStaff(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffPerformance;
