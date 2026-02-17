import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, Heart, ShieldCheck, Trophy } from "lucide-react";

const Testimonials = ({ data, accentColor }) => {
  // 10 DUMMY REVIEWS (Check karne ke liye)
  const dummyReviews = [
    {
      name: "Rahul Sharma",
      role: "Business Owner",
      comment:
        "The poster designs are next level! My sales increased by 40% after using their visuals.",
    },
    {
      name: "Anjali Verma",
      role: "Content Creator",
      comment:
        "Best video editing agency. They understand the vibe and deliver exactly what I need.",
    },
    {
      name: "Vikram Singh",
      role: "Marketing Head",
      comment:
        "Professional, fast, and extremely creative. Their 365 days plan is a lifesaver for our brand.",
    },
    {
      name: "Sneha Kapoor",
      role: "E-commerce Founder",
      comment:
        "The quality of graphics is top-notch. Highly recommended for premium branding.",
    },
    {
      name: "Deepak Raj",
      role: "Influencer",
      comment:
        "Amazing work on my YouTube intros. The cinematic feel is just mind-blowing!",
    },
    {
      name: "Priya Mehta",
      role: "Startup Lead",
      comment:
        "Value for money and great support. They literally brought my vision to life.",
    },
    {
      name: "Amit Patel",
      role: "Digital Marketer",
      comment:
        "Creative strategies that actually work. My clients are very happy with the new posters.",
    },
    {
      name: "Riya Roy",
      role: "Event Manager",
      comment:
        "E-greetings and invites were beautiful. Everyone in the event was asking about the designer.",
    },
    {
      name: "Suresh Das",
      role: "Local Business",
      comment:
        "Social media management is now easy. Their festival posts are very high quality.",
    },
    {
      name: "Karan Johar",
      role: "Agency Owner",
      comment:
        "Trustworthy and creative partners. We outsource all our premium editing to them.",
    },
  ];

  const finalReviews =
    data?.testimonials?.length > 0 ? data.testimonials : dummyReviews;

  return (
    <section
      id="reviews"
      className="py-24 md:py-40 bg-[#050505] overflow-hidden relative"
    >
      {/* Background Glow */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-10 blur-[120px] pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Heart
              size={14}
              style={{ color: accentColor }}
              fill="currentColor"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
              Testimonials
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
            Why people <span style={{ color: accentColor }}>love us</span>{" "}
            <br /> over others
          </h2>
        </div>

        {/* INFINITE HORIZONTAL SCROLL CAROUSEL */}
        <div className="relative flex overflow-hidden py-10">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 whitespace-nowrap"
          >
            {[...finalReviews, ...finalReviews].map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] md:w-[450px] p-8 md:p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl shrink-0 flex flex-col justify-between group transition-all duration-500 hover:border-white/20"
              >
                <div>
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        style={{ color: accentColor }}
                        fill="currentColor"
                      />
                    ))}
                  </div>

                  <Quote
                    size={40}
                    className="mb-4 opacity-10"
                    style={{ color: accentColor }}
                  />

                  <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed whitespace-normal italic tracking-tight">
                    "{item.comment}"
                  </p>
                </div>

                <div className="mt-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-white uppercase">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-white">
                      {item.name}
                    </h4>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest text-white/30"
                      style={{ color: accentColor }}
                    >
                      {item.role || "Verified Client"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* TRUST BADGES */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-30">
          <div className="flex items-center gap-3 font-black uppercase tracking-widest text-xs">
            <ShieldCheck size={20} /> 100% Secure
          </div>
          <div className="flex items-center gap-3 font-black uppercase tracking-widest text-xs">
            <Trophy size={20} /> Award Winning
          </div>
          <div className="flex items-center gap-3 font-black uppercase tracking-widest text-xs">
            <Star size={20} /> 5-Star Rated
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
