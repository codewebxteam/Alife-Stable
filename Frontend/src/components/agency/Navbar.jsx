import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle, ArrowUpRight } from "lucide-react";

const Navbar = ({ agencyName, accentColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll logic for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Creativity", href: "#creativity" },
    { name: "Portfolio", href: "#showcase" },
    { name: "Services", href: "#services" },
    { name: "Pricing", href: "#pricing" },
    { name: "Work", href: "#work" },
    { name: "Review", href: "#reviews" },
  ];

  const whatsappNumber = "9955982260";
  const defaultMsg = encodeURIComponent(
    "Hello! I'm interested in your agency services.",
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMsg}`;

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      window.scrollTo({
        top: element.offsetTop - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        scrolled
          ? "py-4 bg-black/40 backdrop-blur-2xl border-b border-white/5"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* LOGO STYLE AGENCY NAME */}
        <div
          className="cursor-pointer group select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent group-hover:to-white transition-all duration-500">
              {agencyName || "AGENCY"}
            </span>
            <div
              className="h-[2px] w-0 group-hover:w-full transition-all duration-500 mt-1"
              style={{ backgroundColor: accentColor || "#3B82F6" }}
            />
          </div>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all relative group"
            >
              {link.name}
              <span
                className="absolute -bottom-2 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: accentColor }}
              />
            </a>
          ))}
        </div>

        {/* WHATSAPP CTA */}
        <div className="hidden lg:flex items-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all duration-500 group"
          >
            <MessageCircle
              size={18}
              className="text-green-500 group-hover:text-black"
              fill="currentColor"
            />
            <span className="text-xs font-black tracking-widest uppercase">
              {whatsappNumber}
            </span>
            <ArrowUpRight
              size={14}
              className="opacity-40 group-hover:opacity-100"
            />
          </a>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[72px] bg-black/95 backdrop-blur-3xl border-b border-white/10 lg:hidden py-10 px-6 flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-2xl font-black uppercase italic tracking-tighter text-white/40 hover:text-white flex justify-between items-center group"
              >
                {link.name}
                <ArrowUpRight
                  size={20}
                  className="opacity-0 group-hover:opacity-100"
                  style={{ color: accentColor }}
                />
              </a>
            ))}

            <div className="h-px bg-white/5 my-4" />

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 py-5 rounded-2xl font-black uppercase tracking-widest text-black"
              style={{ backgroundColor: accentColor || "#fff" }}
            >
              <MessageCircle size={20} fill="black" />
              {whatsappNumber}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
