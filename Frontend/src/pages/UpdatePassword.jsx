import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  Lock,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Fingerprint,
} from "lucide-react";

const UpdatePassword = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [strength, setStrength] = useState(0);

  // --- Calculate Password Strength ---
  useEffect(() => {
    let score = 0;
    const pass = formData.newPassword;
    if (!pass) {
      setStrength(0);
      return;
    }
    if (pass.length > 6) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setStrength(score);
  }, [formData.newPassword]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.error) setStatus({ ...status, error: "" });
  };

  const toggleShow = (field) => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({
        loading: false,
        error: "New passwords do not match.",
        success: "",
      });
      return;
    }

    if (strength < 3) {
      setStatus({
        loading: false,
        error: "Password is too weak. Add numbers & symbols.",
        success: "",
      });
      return;
    }

    try {
      // 1. Re-authenticate User (Required for sensitive operations)
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // 2. Update Password
      await updatePassword(user, formData.newPassword);

      setStatus({
        loading: false,
        error: "",
        success:
          "Password updated successfully! You can now use your new password.",
      });

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      let msg = "Failed to update password.";
      if (error.code === "auth/wrong-password")
        msg = "Incorrect current password.";
      if (error.code === "auth/too-many-requests")
        msg = "Too many attempts. Try again later.";
      setStatus({ loading: false, error: msg, success: "" });
    }
  };

  // --- Helper: Strength Color ---
  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden flex items-center justify-center py-20 px-4">
      {/* --- Animated Background --- */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-slate-900 z-0" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 left-1/4 w-96 h-96 bg-[#f7650b]/10 rounded-full blur-[100px] pointer-events-none z-0"
      />

      <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-8 relative z-10">
        {/* --- Left Panel: Context/Info --- */}
        <div className="lg:col-span-2 text-white lg:pt-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Security Center
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Protect Your <br />
            <span className="text-[#f7650b]">Digital Identity.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Regularly updating your password helps keep your account secure.
            Ensure you use a mix of characters, numbers, and symbols.
          </p>

          <div className="hidden lg:block p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Security
              Checklist
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Minimum 8 characters
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Includes a number (0-9)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Includes a symbol (!@#$)
              </li>
            </ul>
          </div>
        </div>

        {/* --- Right Panel: The Form --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            {/* Decorative Header */}
            <div className="h-2 bg-gradient-to-r from-[#f7650b] to-orange-400" />

            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#f7650b] flex items-center justify-center shadow-sm border border-orange-100">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Change Password
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Update your credentials below.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase ml-1">
                    Current Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#f7650b] transition-colors" />
                    <input
                      type={showPass.current ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#f7650b] focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow("current")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass.current ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-2" />

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#f7650b] transition-colors" />
                    <input
                      type={showPass.new ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Create new password"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#f7650b] focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow("new")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Strength Meter */}
                  <div className="pt-1 px-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Strength
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          strength <= 2
                            ? "text-red-500"
                            : strength === 3
                            ? "text-orange-500"
                            : "text-green-500"
                        }`}
                      >
                        {getStrengthLabel()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(strength / 5) * 100}%` }}
                        className={`h-full rounded-full ${getStrengthColor()}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#f7650b] transition-colors" />
                    <input
                      type={showPass.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#f7650b] focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow("confirm")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass.confirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                  {status.error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm font-medium"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />{" "}
                      {status.error}
                    </motion.div>
                  )}
                  {status.success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2 text-green-600 text-sm font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />{" "}
                      {status.success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  disabled={status.loading}
                  className="w-full py-4 bg-[#f7650b] text-white rounded-xl font-bold shadow-lg shadow-orange-500/25 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {status.loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Update Password <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UpdatePassword;
