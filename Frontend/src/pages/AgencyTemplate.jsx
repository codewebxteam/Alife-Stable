import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, useScroll, useSpring } from "framer-motion";
import { Sparkles } from "lucide-react";

// --- IMPORTING COMPONENTS FROM COMPONENTS/AGENCY FOLDER ---
// Bhai, path ../components/Agency/ isliye hai kyunki ye file src/pages mein hai
import Navbar from "../components/agency/Navbar";
import Hero from "../components/agency/Hero";
import DemoStrip from "../components/agency/DemoStrip";
import ValueSection from "../components/agency/ValueSection";
import About from "../components/agency/About";
import Services from "../components/agency/Services";
import Showcase from "../components/agency/Showcase";
import Testimonials from "../components/agency/Testimonials";
import Footer from "../components/agency/Footer";

// --- PROFESSIONAL CREATIVE THEMES ---
const THEME_MAP = {
  1: {
    primary: "#0F172A",
    secondary: "#3B82F6",
    accent: "#60A5FA",
    text: "#FFFFFF",
  },
  2: {
    primary: "#000000",
    secondary: "#F59E0B",
    accent: "#FCD34D",
    text: "#FFFFFF",
  },
  3: {
    primary: "#020617",
    secondary: "#22D3EE",
    accent: "#06B6D4",
    text: "#FFFFFF",
  },
  4: {
    primary: "#022C22",
    secondary: "#10B981",
    accent: "#34D399",
    text: "#FFFFFF",
  },
  5: {
    primary: "#F8FAFC",
    secondary: "#0F172A",
    accent: "#334155",
    text: "#0F172A",
  },
  6: {
    primary: "#1E1B4B",
    secondary: "#EC4899",
    accent: "#F472B6",
    text: "#FFFFFF",
  },
  7: {
    primary: "#2D1B02",
    secondary: "#F97316",
    accent: "#FB923C",
    text: "#FFFFFF",
  },
  8: {
    primary: "#450620",
    secondary: "#E11D48",
    accent: "#FB7185",
    text: "#FFFFFF",
  },
  9: {
    primary: "#0F172A",
    secondary: "#6366F1",
    accent: "#818CF8",
    text: "#FFFFFF",
  },
  10: {
    primary: "#18181B",
    secondary: "#71717A",
    accent: "#A1A1AA",
    text: "#FFFFFF",
  },
};

const AgencyTemplate = ({ forcedSubdomain }) => {
  const { subdomain: paramSubdomain } = useParams();
  const activeSubdomain = forcedSubdomain || paramSubdomain;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const fetchAgencyData = async () => {
      if (!activeSubdomain) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "agencies", activeSubdomain.toLowerCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching agency data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencyData();
  }, [activeSubdomain]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#09090B]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          <Sparkles className="text-blue-500" size={40} />
        </motion.div>
      </div>
    );

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black font-black uppercase tracking-widest">
        Studio Connection Lost
      </div>
    );

  // --- THEME LOGIC ---
  const theme = THEME_MAP[data.themeId] || THEME_MAP[1];
  const accentColor = theme.secondary;

  return (
    <div
      style={{ backgroundColor: theme.primary, color: theme.text }}
      className="min-h-screen selection:bg-white selection:text-black font-sans overflow-x-hidden"
    >
      {/* Global Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-[200]"
        style={{ scaleX, backgroundColor: accentColor }}
      />

      {/* 1. NAVBAR */}
      <Navbar agencyName={data.agencyName} accentColor={accentColor} />

      {/* 2. HERO SECTION */}
      <Hero data={data} accentColor={accentColor} />

      {/* 3. DEMO WHATSAPP STRIP */}
      <DemoStrip data={data} accentColor={accentColor} />

      {/* 4. VALUE STATEMENT / CREATIVITY */}
      <ValueSection accentColor={accentColor} />

      {/* 5. ABOUT US & STATS */}
      <About data={data} accentColor={accentColor} />

      {/* 6. SERVICES GRID */}
      <Services data={data} accentColor={accentColor} />

      {/* 7. SHOWCASE (POSTERS & VIDEOS) */}
      <Showcase data={data} accentColor={accentColor} />

      {/* 8. TESTIMONIALS CAROUSEL */}
      <Testimonials data={data} accentColor={accentColor} />

      {/* 9. FOOTER */}
      <Footer data={data} accentColor={accentColor} />
    </div>
  );
};

export default AgencyTemplate;
