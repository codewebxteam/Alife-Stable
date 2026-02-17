import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Globe,
  Mail,
  Phone,
  ArrowUpRight,
  Camera,
  MapPin,
  MessageCircle,
} from "lucide-react";

const Footer = ({ data, accentColor }) => {
  const agencyName = data?.agencyName || "AGENCY";
  const whatsappNumber = "9955982260";

  return (
    <footer className="bg-[#050505] pt-24 pb-12 px-6 border-t border-white/5 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] opacity-20"
        style={{ backgroundColor: accentColor }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          {/* --- COLUMN 1: ABOUT US & LOGO --- */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-6">
                {agencyName}
              </h2>
              <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-md font-medium">
                We are a premier creative agency dedicated to elevating brands
                through high-end visual storytelling. From cinematic video
                editing to premium poster designs, we navigate the digital world
                to ensure your business stands out with innovation and trust.
              </p>
            </div>

            <div className="flex gap-4">
              {[
                { icon: Instagram, link: "#" },
                { icon: Globe, link: "#" },
                {
                  icon: MessageCircle,
                  link: `https://wa.me/${whatsappNumber}`,
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.link}
                  className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* --- COLUMN 2: QUICK LINKS --- */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 mb-8">
              Navigation
            </h4>
            <ul className="space-y-4">
              {[
                "Creativity",
                "Portfolio",
                "Services",
                "Pricing",
                "Reviews",
              ].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-sm font-bold text-white/60 hover:text-white flex items-center gap-2 group transition-colors"
                  >
                    <span
                      className="w-0 h-[1px] group-hover:w-4 transition-all"
                      style={{ backgroundColor: accentColor }}
                    />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* --- COLUMN 3: CONTACT INFO --- */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 mb-8">
              Get In Touch
            </h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg bg-white/5"
                  style={{ color: accentColor }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                    Email Us
                  </p>
                  <p className="text-sm font-bold text-white">
                    hello@{agencyName.toLowerCase()}.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg bg-white/5"
                  style={{ color: accentColor }}
                >
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                    Call Support
                  </p>
                  <p className="text-sm font-bold text-white">
                    +91 {whatsappNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            <Camera size={14} style={{ color: accentColor }} />© 2026{" "}
            {agencyName} Visual Ops.
          </div>

          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/20">
            <Link
              to="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

          <div
            className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 cursor-pointer hover:opacity-100 transition-opacity"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to Top <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
