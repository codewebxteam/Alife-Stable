import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Check,
  X,
  Zap,
  Crown,
  Star,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

// --- CONFIGURATION ---
const PLANS = [
  {
    id: "starter",
    name: "Pro Starter",
    priceMonthly: 999,
    priceYearly: 9990, // 2 months free
    description:
      "Essential tools for professionals starting their digital journey.",
    features: [
      "Access to 5 Core Modules",
      "Basic Community Support",
      "Weekly Assignments",
      "Standard Certificate",
    ],
    missing: ["1-on-1 Mentorship", "Job Placement Support"],
    icon: Zap,
    theme: "blue",
  },
  {
    id: "elite",
    name: "Premium Elite",
    priceMonthly: 2499,
    priceYearly: 24990,
    description: "Advanced resources for serious growers and freelancers.",
    features: [
      "12 Advanced Courses",
      "Priority Email Support",
      "Real-world Case Studies",
      "Portfolio Review",
      "Offline Access",
    ],
    missing: ["1-on-1 Mentorship"],
    icon: Star,
    theme: "purple",
    popular: true,
  },
  {
    id: "supreme",
    name: "Supreme Master",
    priceMonthly: 4999,
    priceYearly: 49990,
    description: "The ultimate toolkit for complete career transformation.",
    features: [
      "All Courses & Workshops",
      "1-on-1 Mentorship",
      "Job Placement Assistance",
      "Lifetime Updates",
      "White-label Resources",
      "Agency Kit",
    ],
    missing: [],
    icon: Crown,
    theme: "orange",
  },
];

const UpgradePlan = () => {
  const auth = getAuth();
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'yearly'
  const [currentPlan, setCurrentPlan] = useState("starter"); // Default fallback
  const [loading, setLoading] = useState(true);

  // Fetch User's Current Plan
  useEffect(() => {
    const fetchUserPlan = async () => {
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
          if (docSnap.exists() && docSnap.data().plan) {
            // Normalize plan string to ID (e.g., "Supreme Master" -> "supreme")
            const planName = docSnap.data().plan.toLowerCase();
            if (planName.includes("supreme")) setCurrentPlan("supreme");
            else if (planName.includes("elite") || planName.includes("premium"))
              setCurrentPlan("elite");
            else setCurrentPlan("starter");
          }
        } catch (error) {
          console.error("Error fetching plan", error);
        }
      }
      setLoading(false);
    };
    fetchUserPlan();
  }, [auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#f7650b] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-hidden relative">
      {/* --- Background Ambiance --- */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-900 to-slate-50 z-0" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#f7650b]/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* --- Header Section --- */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-lg"
          >
            <Sparkles className="w-3 h-3" /> Upgrade Your Potential
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Choose the Perfect Plan for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7650b] to-orange-400">
              Professional Growth
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg leading-relaxed"
          >
            Unlock exclusive tools, mentorship, and resources designed to
            accelerate your career. Downgrade or cancel anytime.
          </motion.p>

          {/* --- Toggle Switch --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <span
              className={`text-sm font-bold transition-colors ${
                billingCycle === "monthly" ? "text-white" : "text-slate-400"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              className="w-16 h-8 rounded-full bg-slate-700/50 border border-slate-600 p-1 relative transition-colors hover:border-slate-500"
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-6 h-6 rounded-full shadow-md ${
                  billingCycle === "monthly"
                    ? "bg-slate-400 translate-x-0"
                    : "bg-[#f7650b] translate-x-8"
                }`}
              />
            </button>
            <span
              className={`text-sm font-bold transition-colors flex items-center gap-2 ${
                billingCycle === "yearly" ? "text-white" : "text-slate-400"
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] uppercase tracking-wide">
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>

        {/* --- Plans Grid --- */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, index) => {
            const isCurrent = currentPlan === plan.id;
            const isPopular = plan.popular;
            const price =
              billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className={`relative rounded-[2rem] p-8 flex flex-col h-full transition-all duration-300 group
                  ${
                    isPopular
                      ? "bg-slate-900 border-2 border-[#f7650b] shadow-2xl shadow-orange-500/20 z-10 scale-105"
                      : "bg-white border border-slate-200 shadow-xl hover:shadow-2xl hover:-translate-y-2"
                  }
                `}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#f7650b] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className="mb-8">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg
                    ${
                      plan.theme === "orange"
                        ? "bg-orange-100 text-[#f7650b]"
                        : plan.theme === "purple"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }
                  `}
                  >
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      isPopular ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isPopular ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        isPopular ? "text-white" : "text-slate-900"
                      }`}
                    >
                      ₹{price.toLocaleString()}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isPopular ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-xs text-green-500 font-bold mt-1">
                      Billed ₹{price.toLocaleString()} yearly
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="flex-grow space-y-4 mb-8">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0
                        ${
                          isPopular
                            ? "bg-[#f7650b]/20 text-[#f7650b]"
                            : "bg-slate-100 text-slate-600"
                        }
                      `}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isPopular ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                  {plan.missing.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-50">
                      <div
                        className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0
                        ${
                          isPopular
                            ? "bg-white/5 text-slate-500"
                            : "bg-slate-50 text-slate-400"
                        }
                      `}
                      >
                        <X className="w-3 h-3" />
                      </div>
                      <span
                        className={`text-sm ${
                          isPopular ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  disabled={isCurrent}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                    ${
                      isCurrent
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isPopular
                        ? "bg-[#f7650b] text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }
                  `}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Current Plan
                    </>
                  ) : (
                    <>
                      Upgrade Now <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* --- Trust Footer --- */}
        <div className="mt-20 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-6">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Payment
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Cancel Anytime
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlan;
