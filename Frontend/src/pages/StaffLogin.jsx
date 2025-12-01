import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Logo from "../components/Logo";

const StaffLogin = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/staff/dashboard");
    } catch (err) {
      console.error(err);
      // Detailed Error Handling
      let msg = "Invalid credentials. Access denied.";
      if (err.code === "auth/user-not-found")
        msg = "No staff account found with this email.";
      if (err.code === "auth/wrong-password")
        msg = "Incorrect password. Please try again.";
      if (err.code === "auth/too-many-requests")
        msg = "Too many attempts. Try again later.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10"
      >
        <div className="h-32 bg-slate-50 flex flex-col items-center justify-center border-b border-slate-100 relative">
          <div className="scale-125 mb-2 opacity-90">
            <Logo />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Staff Portal
          </h2>
        </div>

        <div className="p-8 md:p-10">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Secure Access
            </span>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="staff@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Access Dashboard"
              )}{" "}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffLogin;
