import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";

const Hero = ({ data, accentColor }) => {
  // Fallback values agar data na mile
  const slogan =
    data?.agencySlogan ||
    "We provide affordable and creative social media Posts.";
  const description =
    "Get social media festival post/design for your business and products for one year ( 365 days).";

  const handleScrollToPlans = () => {
    const element = document.querySelector("#pricing");
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden bg-[#050505] pt-20"
    >
      {/* --- BACKGROUND ELEMENTS (For "Bhara-Bhara" Look) --- */}
      <div className="absolute inset-0 z-0">
        {/* Main Gradient Splash */}
        <div
          className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: accentColor || "#3B82F6" }}
        />
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

        {/* Overlay Image/Pattern (Screenshot style) */}
        <div className="absolute right-0 top-0 w-full md:w-[60%] h-full opacity-20 md:opacity-40">
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            alt="Design Pattern"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl">
          {/* SMALL TOP MESSAGE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="w-8 h-[1px] bg-white/30" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/60">
              Need Any Help?
            </span>
          </motion.div>

          {/* MAIN SLOGAN */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tighter mb-8"
          >
            {slogan.split(" ").map((word, i) => (
              <span key={i} className="inline-block mr-3">
                {word === "creative" || word === "Posts." ? (
                  <span style={{ color: accentColor || "#3B82F6" }}>
                    {word}
                  </span>
                ) : (
                  word
                )}
              </span>
            ))}
          </motion.h1>

          {/* DESCRIPTION (Small Font Fix) */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-lg text-white/50 max-w-xl mb-12 leading-relaxed font-medium"
          >
            {description}
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <button
              onClick={handleScrollToPlans}
              style={{ backgroundColor: accentColor || "#3B82F6" }}
              className="w-full sm:w-auto px-8 py-4 rounded-lg text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all group"
            >
              View Plans{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <div className="flex items-center gap-4 px-4 py-2 border border-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#050505] bg-gray-800"
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                Joined by 500+ Businesses
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FLOATING SPARKLE ICON */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-10 right-10 hidden lg:block opacity-20"
      >
        <Sparkles size={100} style={{ color: accentColor }} />
      </motion.div>
    </section>
  );
};

export default Hero;
