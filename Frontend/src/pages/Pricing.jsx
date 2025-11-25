 // src/pages/Pricing.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Zap,
  Shield,
  ArrowRight,
  Star,
  Sparkles,
  HelpCircle,
} from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for beginners",
    price: "₹499",
    period: "/month",
    highlight: false,
    badge: "Best for Trying",
    description: "Get started with Alife Stable and explore core features.",
    features: [
      "Access to basic tools & templates",
      "Up to 3 active projects",
      "Email support",
      "Community group access",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For serious creators",
    price: "₹999",
    period: "/month",
    highlight: true,
    badge: "Most Popular",
    description: "Powerful tools to grow your personal brand or agency.",
    features: [
      "Everything in Starter",
      "Unlimited projects & workspaces",
      "Advanced content workflows",
      "Priority support on WhatsApp",
      "Access to premium training sessions",
    ],
  },
  {
    id: "pro",
    name: "Pro Agency",
    tagline: "For teams & agencies",
    price: "₹1,999",
    period: "/month",
    highlight: false,
    badge: "For Agencies",
    description: "Built for agencies handling multiple clients and brands.",
    features: [
      "Everything in Growth",
      "Multi-member collaboration",
      "Client-ready reports & exports",
      "Dedicated success manager",
      "Custom onboarding session",
    ],
  },
];

const guarantees = [
  {
    icon: Shield,
    title: "7-day refund policy",
    text: "If you don't feel the value, you can request a refund within 7 days.",
  },
  {
    icon: Zap,
    title: "Fast onboarding",
    text: "Your account will be fully set up within 24 hours, with step-by-step guidance.",
  },
  {
    icon: Star,
    title: "Value first",
    text: "These plans are designed so that both students and founders can easily afford them.",
  },
];

const FAQs = [
  {
    question: "Can I pause or cancel my subscription monthly?",
    answer:
      "Yes, you can cancel or downgrade your plan anytime. There is no long-term contract.",
  },
  {
    question: "Is this also useful for students?",
    answer:
      "Absolutely. If you're freelancing, running an agency, or building a personal brand, this can make your workflows 10x faster.",
  },
  {
    question: "How will the payment work?",
    answer:
      "We support UPI, cards, and net banking for a smooth, India-first payment experience.",
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      {/* ===========================
          1. HERO SECTION
      ============================ */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-white via-white via-75% to-[#f7650b]/10 pt-20 pb-20 lg:pt-28 lg:pb-24">
        {/* Background blobs */}
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-20 w-[60vw] h-[60vw] bg-[#f7650b]/25 blur-[130px] rounded-full pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-40 h-40 bg-orange-200/40 blur-3xl rounded-full pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[#f7650b] text-xs font-bold tracking-[0.22em] uppercase shadow-sm mb-4"
            >
              <Sparkles className="w-3 h-3" />
              Pricing Plans
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-4"
            >
              Simple pricing for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-[#f7650b]">
                serious growth.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Whether you're a student, freelancer, or running an agency, Alife
              Stable&apos;s plans are designed for your stage of growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f7650b]" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f7650b]" />
                <span>UPI-friendly plans</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f7650b]" />
                <span>Made for Indian creators</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===========================
          2. PRICING CARDS
      ============================ */}
      <div className="max-w-7xl mx-auto px-6 pb-24 -mt-12 relative z-20">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => {
            const PlanIcon = plan.highlight ? Zap : Star;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className={`relative rounded-[2rem] border overflow-hidden flex flex-col h-full
                  ${
                    plan.highlight
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-900/40 scale-[1.02]"
                      : "bg-white text-slate-900 border-slate-200 shadow-xl shadow-slate-200/60"
                  }`}
              >
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                    ${
                      plan.highlight
                        ? "bg-[#f7650b] text-white"
                        : "bg-orange-50 text-[#f7650b] border border-orange-100"
                    }`}
                  >
                    <PlanIcon className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-7 sm:p-8 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {plan.name}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        plan.highlight ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl sm:text-4xl font-extrabold">
                      {plan.price}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        plan.highlight ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>

                  <p
                    className={`text-sm mb-6 ${
                      plan.highlight ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2
                          className={`mt-0.5 w-4 h-4 ${
                            plan.highlight
                              ? "text-[#f7650b]"
                              : "text-[#f7650b]"
                          }`}
                        />
                        <span
                          className={
                            plan.highlight ? "text-slate-100" : "text-slate-600"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97, y: 0 }}
                    className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold mt-auto
                      ${
                        plan.highlight
                          ? "bg-[#f7650b] text-white hover:bg-[#e65a0a] shadow-lg shadow-orange-500/40"
                          : "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20"
                      }`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Small note under cards */}
        <p className="mt-6 text-xs text-slate-500 text-center max-w-xl mx-auto">
          Prices are kept student- and founder-friendly. Enterprise pricing is
          available on request if you are handling large teams or multiple
          brands.
        </p>
      </div>

      {/* ===========================
          3. GUARANTEES SECTION
      ============================ */}
      <div className="bg-[#fff4eb] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-10 items-center">
            <div className="lg:col-span-1">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Built for{" "}
                <span className="text-[#f7650b]">trust & clarity.</span>
              </h2>
              <p className="text-sm text-slate-600">
                It&apos;s normal to have doubts before choosing any online tool.
                That&apos;s why each plan comes with clear, transparent
                guarantees.
              </p>
            </div>

            <div className="lg:col-span-3 grid md:grid-cols-3 gap-6">
              {guarantees.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm shadow-orange-100/60"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#f7650b]" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===========================
          4. FAQ + CTA
      ============================ */}
      <div className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#f7650b]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#f7650b]/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          {/* FAQ */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#f7650b] text-xs font-bold uppercase tracking-widest mb-4">
              <HelpCircle className="w-3 h-3" />
              FAQs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Still{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-orange-300">
                confused
              </span>
              ? Let&apos;s clear it.
            </h2>

            <div className="space-y-4">
              {FAQs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4"
                >
                  <p className="text-sm font-semibold text-white mb-1">
                    {faq.question}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white/5 rounded-[2rem] border border-white/10 p-8 md:p-10 backdrop-blur-lg shadow-2xl shadow-black/40">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-[10px] text-slate-200 font-semibold mb-4">
              <Sparkles className="w-3 h-3 text-[#f7650b]" />
              Special note for Alife Stable users
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Start small,{" "}
              <span className="text-[#f7650b]">grow consistently.</span>
            </h3>
            <p className="text-sm text-slate-200 mb-6">
              Whether you start with the Starter plan or jump straight to Pro,
              what matters most is that you take action. We&apos;ll handle the
              growth journey together.
            </p>

            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97, y: 0 }}
              className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold bg-[#f7650b] text-white hover:bg-[#e65a0a] transition-all shadow-xl shadow-orange-500/40"
            >
              Talk to our team
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <p className="mt-3 text-[11px] text-slate-400 text-center">
              Prefer WhatsApp or a direct call? You can still use your existing
              Alife Stable contact points – we&apos;ll guide you through pricing
              on the call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
