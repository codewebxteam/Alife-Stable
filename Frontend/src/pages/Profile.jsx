import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Crown,
  Calendar,
  Briefcase,
  Zap,
  Globe,
  CheckCircle2,
  Layout,
  TrendingUp,
  ShieldCheck,
  PenSquare,
  Sparkles,
} from "lucide-react";
import { db } from "../firebase";

const Profile = () => {
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(
            db,
            "artifacts",
            "default-app",
            "users",
            user.uid,
            "profile",
            "account_info"
          );
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData({
              fullName: user.displayName,
              email: user.email,
              plan: "Free Tier",
              role: "Agency Partner", // Professional Role Default
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#f7650b] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Please Log In to view your profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden pb-20 px-4 sm:px-6">
      {/* --- Animated Background Ambiance --- */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-slate-900 to-slate-50 z-0" />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 left-10 w-96 h-96 bg-[#f7650b]/10 rounded-full blur-[100px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute top-40 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none z-0"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-white">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3" /> Personal Dashboard
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Hello, {userData.fullName.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-300 mt-2 text-base max-w-xl">
              Manage your verified professional identity and subscription
              settings.
            </p>
          </div>

          
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* --- LEFT COLUMN: Identity Card (Col-span-4) --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Main Profile Card */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative group">
              {/* Decorative Header/Cover */}
              <div className="h-36 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#f7650b] rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              </div>

              <div className="px-8 pb-8 relative">
                {/* Avatar */}
                <div className="relative -mt-16 mb-6 flex justify-between items-end">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-32 h-32 rounded-[2rem] border-[6px] border-white shadow-2xl overflow-hidden bg-white"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${userData.fullName}&background=1e293b&color=fff&size=128&font-size=0.35`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Badge */}
                  <div className="mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-lg shadow-slate-900/20 border border-slate-700">
                      <Crown className="w-3.5 h-3.5 text-[#f7650b]" />
                      {userData.plan || "Pro Member"}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {userData.fullName}
                  </h2>
                  <p className="text-slate-500 font-medium flex items-center gap-2 mt-1 text-sm">
                    <Briefcase className="w-4 h-4 text-[#f7650b]" />
                    {userData.role || "Senior Partner"}
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="flex justify-center text-[#f7650b] mb-2">
                      <Layout size={20} />
                    </div>
                    <div className="text-xl font-bold text-slate-900">12</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Active Projects
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="flex justify-center text-[#f7650b] mb-2">
                      <TrendingUp size={20} />
                    </div>
                    <div className="text-xl font-bold text-slate-900">1.2k</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Profile Views
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade/Promo Card */}
            <div className="bg-gradient-to-br from-[#f7650b] to-orange-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-orange-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Boost Your Reach</h3>
                <p className="text-orange-100 text-sm mb-6 leading-relaxed opacity-90">
                  Upgrade to the Supreme plan to unlock analytics and priority
                  support.
                </p>
                <button className="w-full py-3.5 bg-white text-[#f7650b] rounded-xl font-bold text-sm shadow-lg hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
                  View Upgrade Options
                </button>
              </div>
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: Details (Col-span-8) --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Personal Information Panel */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Personal Information
                </h3>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-x-10 gap-y-8">
                <InfoField
                  label="Full Name"
                  value={userData.fullName}
                  icon={<User className="w-4 h-4" />}
                />
                <InfoField
                  label="Email Address"
                  value={userData.email}
                  icon={<Mail className="w-4 h-4" />}
                />
                <InfoField
                  label="Phone Number"
                  value={
                    userData.phone ? `+91 ${userData.phone}` : "Not Provided"
                  }
                  icon={<Phone className="w-4 h-4" />}
                />
                <InfoField
                  label="Member Since"
                  value={
                    userData.joinedAt
                      ? new Date(userData.joinedAt).toLocaleDateString()
                      : "N/A"
                  }
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Location & Security Panel */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Regional & Security
                </h3>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-x-10 gap-y-8">
                <InfoField
                  label="City"
                  value={userData.city}
                  icon={<MapPin className="w-4 h-4" />}
                />
                <InfoField
                  label="State / Province"
                  value={userData.state}
                  icon={<MapPin className="w-4 h-4" />}
                />
                <InfoField
                  label="Postal Code"
                  value={userData.pincode}
                  icon={<MapPin className="w-4 h-4" />}
                />

                {/* Status Field */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Account Status
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-green-50/50 border border-green-100 rounded-2xl text-green-700 text-sm font-bold">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                    Verified & Active
                    <ShieldCheck className="w-4 h-4 ml-auto opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Reusable Info Component with Hover Effects
const InfoField = ({ label, value, icon }) => (
  <div className="flex flex-col gap-2 group">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-[#f7650b] transition-colors duration-300">
      {label}
    </label>
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-orange-200 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-orange-500/5 transition-all duration-300">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#f7650b] group-hover:border-orange-100 transition-colors">
        {icon}
      </div>
      <span className="text-slate-700 font-bold text-sm">
        {value || (
          <span className="text-slate-400 italic font-normal">Not set</span>
        )}
      </span>
    </div>
  </div>
);

export default Profile;
