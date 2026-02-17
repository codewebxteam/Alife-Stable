import React from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Video,
  Palette,
  Mail,
  Smartphone,
  Share2,
  Megaphone,
  Wand2,
} from "lucide-react";

// Icon mapping based on service names (standard fallback)
const ICON_MAP = {
  "Poster Design": Layers,
  "Video Editing": Video,
  "Graphic Assets": Palette,
  "E-Greetings": Mail,
  "Social Media": Share2,
  Marketing: Megaphone,
  Default: Wand2,
};

const Services = ({ data, accentColor }) => {
  // Firestore se services fetch ho rahi hain
  const services = data?.services || [
    {
      title: "Poster Design",
      desc: "Cinematic and branding posters for high-end marketing.",
    },
    {
      title: "Video Editing",
      desc: "Elite storytelling and color grading for modern brands.",
    },
    {
      title: "Graphic Assets",
      desc: "High-end brand marketing graphics and digital assets.",
    },
    {
      title: "E-Greetings",
      desc: "Modern digital cards and invites for every occasion.",
    },
  ];

  return (
    <section id="services" className="py-24 md:py-40 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
            style={{ color: accentColor }}
          >
            Capabilities
          </motion.div>
          <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white">
            Our <span style={{ color: accentColor }}>Premium</span> Services
          </h2>
        </div>

        {/* Smart Grid Management */}
        <div className="flex flex-wrap justify-center gap-6">
          {services.map((service, idx) => {
            const Icon = ICON_MAP[service.title] || ICON_MAP["Default"];

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                // SMART WIDTH LOGIC:
                // Default 3 cards per row.
                // Agar last row mein 1 card bacha, toh wo center mein rahega (flex-grow).
                className="relative group basis-full sm:basis-[calc(50%-1.5rem)] lg:basis-[calc(33.33%-1.5rem)] flex-grow max-w-[500px]"
              >
                <div className="h-full p-8 md:p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/10 flex flex-col items-start overflow-hidden">
                  {/* Subtle Background Icon Decoration */}
                  <Icon
                    size={150}
                    className="absolute -right-10 -bottom-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                    style={{ color: accentColor }}
                  />

                  {/* Icon Box */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Icon size={30} className="text-black" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white mb-4 leading-none">
                    {service.title}
                  </h3>

                  <p className="text-white/40 text-sm md:text-base font-medium leading-relaxed mb-8">
                    {service.desc ||
                      "Engineering excellence into every visual asset we deliver for your brand growth."}
                  </p>

                  {/* Bottom Line Decoration */}
                  <div className="mt-auto flex items-center gap-3">
                    <div
                      className="h-[1px] w-8 bg-white/20 group-hover:w-16 transition-all duration-500"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">
                      Explore More
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
