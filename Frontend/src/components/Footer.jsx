import React from "react";
import { motion } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Instagram,
  Github,
  ArrowRight,
  Send,
  Heart,
} from "lucide-react";

const footerLinks = {
  Product: [
    { name: "Services", href: "#" },
    { name: "Mentorship", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Certificates", href: "#" },
  ],
  Company: [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Contact", href: "#" },
  ],
  Resources: [
    { name: "Blog", href: "#" },
    { name: "Community", href: "#" },
    { name: "Events", href: "#" },
    { name: "Help Center", href: "#" },
  ],
  Legal: [
    { name: "Terms", href: "#" },
    { name: "Privacy", href: "#" },
    { name: "Cookies", href: "#" },
  ],
};

const SocialIcon = ({ Icon, href }) => (
  <motion.a
    href={href}
    whileHover={{
      scale: 1.1,
      y: -3,
      backgroundColor: "#f7650b",
      color: "#fff",
    }}
    whileTap={{ scale: 0.9 }}
    className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 transition-colors duration-300 hover:border-orange-500/50"
  >
    <Icon className="w-5 h-5" />
  </motion.a>
);

const Footer = () => {
  return (
    <footer className="relative bg-slate-950 pt-24 pb-12 overflow-hidden font-sans">
      {/* --- Background Effects --- */}
      {/* Glowing Blob (Top Left) */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      {/* Glowing Blob (Bottom Right) */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* --- Top Section: CTA & Newsletter --- */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20 pb-12 border-b border-slate-800/50">
          {/* Brand & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              {/* Simple Logo Placeholder (Replace with your Logo component if you want) */}
              <div className="w-8 h-8 bg-gradient-to-br from-[#f7650b] to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Alife Stable
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4 leading-tight">
              Start your journey <br /> to{" "}
              <span className="text-[#f7650b]">financial freedom</span>.
            </h3>
            <p className="text-slate-400 text-lg max-w-md">
              Join 25,000+ students mastering the skills of tomorrow. No credit
              card required for the demo.
            </p>
          </motion.div>

          {/* Newsletter Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
              <h4 className="text-white font-semibold text-xl mb-2">
                Subscribe to our newsletter
              </h4>
              <p className="text-slate-400 mb-6 text-sm">
                Get the latest trends, tips, and free resources weekly.
              </p>

              <form className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-full py-4 pl-6 pr-16 focus:outline-none focus:border-[#f7650b] focus:ring-1 focus:ring-[#f7650b] transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  className="absolute right-2 w-10 h-10 bg-[#f7650b] rounded-full flex items-center justify-center text-white hover:bg-orange-600 hover:scale-105 transition-all shadow-lg shadow-orange-500/25"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* --- Middle Section: Links Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-20">
          {Object.entries(footerLinks).map(([title, links], categoryIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <h4 className="text-white font-bold mb-6">{title}</h4>
              <ul className="space-y-4">
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="group flex items-center gap-2 text-slate-400 hover:text-[#f7650b] transition-colors text-sm font-medium"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#f7650b] transition-all group-hover:w-full"></span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* --- Bottom Section: Copyright & Socials --- */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800/50 gap-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>© 2025 Alife Stable. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://www.codewebx.in" /* Add your actual link here */
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f7650b] underline decoration-[#f7650b] hover:text-orange-400 transition-colors font-medium"
            >
              CodeWebX
            </a>
          </div>

          <div className="flex items-center gap-4">
            <SocialIcon Icon={Twitter} href="#" />
            <SocialIcon Icon={Linkedin} href="#" />
            <SocialIcon Icon={Instagram} href="#" />
            <SocialIcon Icon={Github} href="#" />
          </div>
        </div>
      </div>

      {/* --- Giant Background Watermark (Animation) --- */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-full text-center pointer-events-none select-none overflow-hidden">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.08 }}
          transition={{ duration: 2 }}
          className="text-[12vw] md:text-[15vw] font-bold text-white leading-none tracking-tighter whitespace-nowrap"
        >
          Alife Stable
        </motion.h1>
      </div>
    </footer>
  );
};

export default Footer;
