import React from "react";
import { motion } from "framer-motion";
import {
  Database,
  Download,
  FileJson,
  FileText,
  Users,
  ShoppingBag,
  CreditCard,
  HardDrive,
  RefreshCw,
  Server,
} from "lucide-react";

const DataCard = ({ title, desc, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group"
  >
    <div
      className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}
    >
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed mb-6 h-10">{desc}</p>

    <div className="flex gap-2">
      <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
        <FileText size={14} /> CSV
      </button>
      <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
        <FileJson size={14} /> JSON
      </button>
    </div>
  </motion.div>
);

const AdminData = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Data Management</h1>
        <p className="text-slate-500 mt-1">
          Export system data and monitor database status.
        </p>
      </div>

      {/* Database Status Banner */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 mb-10 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center relative">
            <Server className="w-8 h-8 text-blue-400" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-800 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Firestore Database</h2>
            <p className="text-slate-400 text-sm mt-1">
              Status:{" "}
              <span className="text-emerald-400 font-bold">Operational</span> •
              Region: <span className="text-white">asia-south1</span>
            </p>
          </div>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
          <RefreshCw size={16} className="animate-pulse" /> Sync Now
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Database size={18} className="text-slate-400" />
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Export Collections
        </h2>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DataCard
          title="Transactions & Orders"
          desc="Full history of payments, order IDs, amounts, and statuses."
          icon={CreditCard}
          color="bg-emerald-50 text-emerald-600"
          delay={0.1}
        />
        <DataCard
          title="Partner Users"
          desc="Registered partners, contact details, and referral codes."
          icon={Users}
          color="bg-blue-50 text-blue-600"
          delay={0.2}
        />
        <DataCard
          title="Staff Performance"
          desc="Work logs, sales metrics, and creative project completions."
          icon={HardDrive}
          color="bg-purple-50 text-purple-600"
          delay={0.3}
        />
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-amber-50 border border-amber-100 rounded-[2rem] p-6 text-center">
        <p className="text-amber-800 text-sm font-medium">
          ⚠️ <span className="font-bold">Note:</span> Sensitive user data
          (passwords, auth tokens) is automatically excluded from exports.
        </p>
      </div>
    </div>
  );
};

export default AdminData;
