import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Loader2, History, ShieldCheck } from "lucide-react";
import {
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// --- Utility: Format Price ---
const formatPrice = (value) => {
  if (!value && value !== 0) return "₹0";
  const num = Number(value.toString().replace(/[^0-9.-]+/g, ""));
  return `₹${num.toLocaleString("en-IN")}`;
};

// --- Utility: Scroll Lock Hook ---
const useScrollLock = (isLocked) => {
  useEffect(() => {
    document.body.style.overflow = isLocked ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLocked]);
};

const PaymentVerificationModal = ({ isOpen, onClose, order, currentUser }) => {
  useScrollLock(isOpen);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // --- SECURITY: Determine Verifier Identity ---
  // Updated to use 'fullName' based on your database structure
  const verifierIdentity =
    currentUser?.fullName ||
    currentUser?.displayName ||
    currentUser?.email ||
    `Staff ID: ${currentUser?.staffId || currentUser?.uid?.slice(0, 6)}`;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) setAmount("");
  }, [isOpen]);

  if (!isOpen || !order) return null;

  // Financial Calculations
  const total = parseFloat(order.adminPrice || order.amount || 0);
  const paid = parseFloat(order.paidAmount || 0);
  const due = Math.max(0, total - paid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);

    if (!currentUser) {
      return alert("Security Error: No logged-in user found. Cannot verify.");
    }

    if (!payAmount || payAmount <= 0) {
      return alert("Please enter a valid amount greater than 0.");
    }
    if (payAmount > due) {
      return alert(`Amount exceeds the remaining due of ${formatPrice(due)}`);
    }

    setLoading(true);
    try {
      const newPaidTotal = paid + payAmount;
      const newStatus = newPaidTotal >= total ? "Paid" : "Partial";

      // The Transaction Record Object
      const transactionRecord = {
        type: "CREDIT_VERIFICATION",
        amount: payAmount,
        date: new Date().toISOString(),
        // STRICTLY use the identity derived from the logged-in user
        verifiedBy: verifierIdentity,
        verifiedById: currentUser.uid,
        verifiedByEmail: currentUser.email || "N/A",
        staffId: currentUser.staffId || "N/A", // Added staffId for extra tracking
        previousPaid: paid,
        newPaid: newPaidTotal,
        orderId: order.id,
        partnerName: order.partnerName || "Unknown",
      };

      await updateDoc(doc(db, "orders", order.id), {
        paidAmount: newPaidTotal,
        paymentStatus: newStatus,
        paymentHistory: arrayUnion(transactionRecord),
        lastUpdated: serverTimestamp(),
      });

      alert(`Success! Payment verified by ${verifierIdentity}.`);
      onClose();
    } catch (err) {
      console.error("Payment Verification Error:", err);
      alert("Failed to verify payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={20} /> Verify
                Payment
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Financial Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>Total Order Cost</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-medium mb-3">
                  <span>Already Paid</span>
                  <span>{formatPrice(paid)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-900 font-bold border-t border-slate-200 pt-2">
                  <span>Remaining Due</span>
                  <span className="text-rose-600">{formatPrice(due)}</span>
                </div>
              </div>

              {/* READ ONLY Verifier Info */}
              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <History size={16} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                    Verifying As
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {verifierIdentity}
                  </p>
                  {/* Optional: Show Staff ID if available */}
                  {currentUser?.staffId && (
                    <p className="text-[10px] text-slate-500 font-medium">
                      ID: {currentUser.staffId}
                    </p>
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Enter Amount Received
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={due}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Confirm Verification"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentVerificationModal;
