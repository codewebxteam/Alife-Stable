import React from "react";
import { motion } from "framer-motion";
import { Heart, Github, Twitter, Linkedin, ExternalLink } from "lucide-react";

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Copyright & Brand */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-500">
          <div className="font-bold text-slate-900 tracking-tight">
            ALIFE STABLE <span className="text-[#f7650b]">Dashboard</span>
          </div>
          <span className="hidden md:inline text-slate-300">|</span>
          <span>&copy; {currentYear} Alife Stable. All rights reserved.</span>
        </div>

        {/* Center: Built With CodeWebX */}
        <div className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          <span>Built with</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
          >
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </motion.div>
          <span>by</span>
          <a
            href="https://codewebx.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f7650b] font-bold hover:text-orange-600 transition-colors underline decoration-[#f7650b]/30 hover:decoration-[#f7650b] underline-offset-2 flex items-center gap-1"
          >
            CodeWebX
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Right Side: Links & Socials */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-[#f7650b] transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-[#f7650b] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[#f7650b] transition-colors">
              Privacy
            </a>
          </div>

          <div className="h-4 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3">
            <a
              href="#"
              className="text-slate-400 hover:text-[#f7650b] transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-[#f7650b] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
