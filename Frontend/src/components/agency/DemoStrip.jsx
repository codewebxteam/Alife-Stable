import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";

const DemoStrip = ({ data, accentColor }) => {
  const whatsappNumber = "9955982260";
  const demoMsg = encodeURIComponent(
    "Hello! I want to see a live demo of your creative services.",
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${demoMsg}`;

  return (
    <section className="relative py-8 md:py-12 px-6 overflow-hidden bg-black">
      {/* Background Glow */}
      <div
        className="absolute inset-0 opacity-10 blur-[50px]"
        style={{ backgroundColor: accentColor || "#3B82F6" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="group relative flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-10 rounded-[2rem] md:rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden"
        >
          {/* Shimmer Effect Animation */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
          />

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shrink-0"
              style={{ backgroundColor: accentColor || "#3B82F6" }}
            >
              <Sparkles className="text-black" size={28} />
            </div>

            <div>
              <h3 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                Experience the{" "}
                <span style={{ color: accentColor || "#3B82F6" }}>Magic</span>{" "}
                Live
              </h3>
              <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1">
                Get demo at your whatsapp Number:{" "}
                <span className="text-white/70">{whatsappNumber}</span>
              </p>
            </div>
          </div>

          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl transition-all group/btn"
            style={{ backgroundColor: accentColor || "#3B82F6", color: "#000" }}
          >
            <MessageCircle size={20} fill="currentColor" />
            Get Demo
            <ArrowRight
              size={18}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoStrip;
