import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Check,
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { initializeApp, getApp, deleteApp } from "firebase/app"; // Import App utilities
import { db } from "../firebase";

const ROLES = ["Manager", "Sales", "Designer", "Editor"];

const AddStaffModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    roles: [],
  });

  const toggleRole = (role) => {
    setFormData((prev) => {
      if (prev.roles.includes(role)) {
        return { ...prev, roles: prev.roles.filter((r) => r !== role) };
      } else {
        return { ...prev, roles: [...prev.roles, role] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.roles.length === 0) {
      alert("Please select at least one role.");
      return;
    }

    setLoading(true);
    let secondaryApp = null;

    try {
      // 1. GENERATE STAFF ID & REF CODE
      const randId = Math.floor(1000 + Math.random() * 9000);
      const uniqueStaffId = `STF-${randId}`;
      const isSales = formData.roles.includes("Sales");
      const uniqueRefCode = isSales ? `SALE-${randId}` : "";

      // 2. CREATE AUTH USER (Using Secondary App to keep Admin logged in)
      const primaryApp = getApp();
      // Create a temporary app instance with the same config
      secondaryApp = initializeApp(primaryApp.options, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );
      const newUser = userCredential.user;

      // 3. WRITE TO FIRESTORE (Using the REAL UID)
      // Path: users/{REAL_UID}/profile/account_info
      await setDoc(doc(db, "users", newUser.uid, "profile", "account_info"), {
        uid: newUser.uid,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password, // Only strictly necessary if you want admin to see it
        role: formData.roles,
        staffId: uniqueStaffId,
        referralCode: uniqueRefCode,
        joinedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
        status: "active",
      });

      // 4. CLEANUP
      await signOut(secondaryAuth); // Sign out the new user from secondary instance

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        roles: [],
      });
      onClose();
      alert(
        `Staff Created Successfully!\n\nLogin Email: ${formData.email}\nStaff ID: ${uniqueStaffId}`
      );
    } catch (err) {
      console.error("Error adding staff:", err);
      if (err.code === "auth/email-already-in-use") {
        alert("This email is already registered.");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      // Delete the secondary app instance to free memory
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden z-10"
        >
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Add New Staff
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Create login & assign roles
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="staff@ex.com"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Phone
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                Assign Roles
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((role) => {
                  const isSelected = formData.roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected && <Check size={12} />} {role}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Shield size={18} /> Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddStaffModal;
