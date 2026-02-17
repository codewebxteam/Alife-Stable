import React from "react";
import { motion } from "framer-motion";
import { Users, Target, Rocket, Zap } from "lucide-react";

const About = ({ data, accentColor }) => {
  const agencyName = data?.agencyName || "AGENCY";

  const stats = [
    { label: "Projects Done", value: "500+", icon: Rocket },
    { label: "Happy Clients", value: "200+", icon: Users },
    { label: "Success Rate", value: "99%", icon: Target },
    { label: "Fast Delivery", value: "24h", icon: Zap },
  ];

  return (
    <section
      id="about"
      className="py-24 md:py-40 bg-black relative overflow-hidden"
    >
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* LEFT SIDE: IMAGE / VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                alt="Our Creative Team"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

              {/* Floating Badge */}
              <div className="absolute bottom-10 left-10 right-10 p-6 rounded-2xl backdrop-blur-xl border border-white/10 bg-black/40">
                <p className="text-white font-bold italic text-lg leading-tight">
                  "Innovating the digital landscape one pixel at a time."
                </p>
              </div>
            </div>

            {/* Decorative Back Shape */}
            <div
              className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-[80px] opacity-20"
              style={{ backgroundColor: accentColor }}
            />
          </motion.div>

          {/* RIGHT SIDE: CONTENT */}
          <div className="space-y-10">
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-6"
              >
                <div
                  className="h-[1px] w-12"
                  style={{ backgroundColor: accentColor }}
                />
                <span
                  className="text-xs font-black uppercase tracking-[0.4em]"
                  style={{ color: accentColor }}
                >
                  Who We Are
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-[1.1] mb-8">
                Empowering Brands <br /> with{" "}
                <span style={{ color: accentColor }}>Innovation</span>
              </h2>

              <p className="text-white/50 text-lg leading-relaxed font-medium mb-8">
                At <span className="text-white">{agencyName}</span>, we don't
                just create designs; we craft experiences. Our team blends
                creativity with data-driven strategies to help businesses thrive
                in an ever-evolving digital world. We believe in the power of
                visual storytelling to connect, engage, and convert.
              </p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/5 transition-colors"
                >
                  <stat.icon
                    size={24}
                    className="mb-4"
                    style={{ color: accentColor }}
                  />
                  <h4 className="text-2xl font-black text-white mb-1">
                    {stat.value}
                  </h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-2xl"
              style={{ backgroundColor: accentColor, color: "#000" }}
            >
              Learn Our Process
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
