import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Target, Lightbulb, Star } from "lucide-react";

const ValueSection = ({ accentColor }) => {
  const points = [
    { text: "Welcome", icon: Star },
    { text: "Trust", icon: ShieldCheck },
    { text: "Value", icon: Target },
    { text: "Creativity", icon: Lightbulb },
  ];

  return (
    <section
      id="creativity"
      className="relative py-24 md:py-40 px-6 bg-[#050505] overflow-hidden"
    >
      {/* Background Subtle Gradient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 blur-[150px] pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE: THE BIG HIGHLIGHTS */}
          <div className="space-y-6">
            {points.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-6 group"
              >
                <span
                  className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter transition-all duration-500 group-hover:pl-4"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: `1px ${idx === 3 ? accentColor : "rgba(255,255,255,0.2)"}`,
                  }}
                >
                  {item.text}.
                </span>
                <item.icon
                  size={32}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-20px] group-hover:translate-x-0"
                  style={{ color: accentColor }}
                />
              </motion.div>
            ))}
          </div>

          {/* RIGHT SIDE: THE CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Decorative Quote Mark */}
            <span
              className="absolute -top-10 -left-6 text-9xl opacity-10 font-serif"
              style={{ color: accentColor }}
            >
              “
            </span>

            <h2 className="text-2xl md:text-4xl font-bold text-white leading-snug mb-8">
              We help you to do{" "}
              <span style={{ color: accentColor }}>better</span> with our
              creative and innovative marketing strategies...
            </h2>

            <p className="text-lg md:text-xl text-white/50 font-medium leading-relaxed italic">
              "...so you can grow your business and successfully navigate the
              digital world."
            </p>

            <div className="mt-12 flex items-center gap-4">
              <div
                className="h-[2px] w-20"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Our Mission Statement
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ValueSection;
