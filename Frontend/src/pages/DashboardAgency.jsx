import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Palette,
  Briefcase,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Plus,
  Trash2,
  Smartphone,
  Mail,
  Instagram,
  PlayCircle,
  Eye,
  Rocket,
  Info,
  Layers,
  Sparkles,
  MousePointer2,
  ShieldCheck,
  Video,
  Type,
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2, // Loader import kiya
  CheckCircle2, // Selection icon ke liye
  Image as ImageIcon, // Thumbnail fallback ke liye
} from "lucide-react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  collection, // Zaroori import 1
  query, // Zaroori import 2
  orderBy, // Zaroori import 3
  onSnapshot, // Zaroori import 4
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// --- PROFESSIONAL DUAL-TONE THEMES (CURATED) ---
const THEMES = [
  {
    id: 1,
    name: "Midnight Onyx",
    primary: "#0F172A", // Slate 900
    secondary: "#f7650b", // Custom Orange
    bg: "bg-slate-950",
    accent: "bg-[#f7650b]",
    border: "border-slate-800",
    description: "Deep corporate look for established agencies.",
  },
  {
    id: 2,
    name: "Royal Obsidian",
    primary: "#000000",
    secondary: "#F59E0B", // Amber 500
    bg: "bg-black",
    accent: "bg-amber-500",
    border: "border-zinc-800",
    description: "Luxury feel with high-contrast gold accents.",
  },
  {
    id: 3,
    name: "Deep Atlantic",
    primary: "#1E3A8A", // Blue 900
    secondary: "#22D3EE", // Cyan 400
    bg: "bg-blue-950",
    accent: "bg-cyan-400",
    border: "border-blue-900",
    description: "Tech-focused palette with ocean vibes.",
  },
  {
    id: 4,
    name: "Emerald Forest",
    primary: "#064E3B", // Emerald 950
    secondary: "#10B981", // Emerald 500
    bg: "bg-emerald-950",
    accent: "bg-emerald-500",
    border: "border-emerald-900",
    description: "Trustworthy and organic professional look.",
  },
  {
    id: 5,
    name: "Pure Minimalist",
    primary: "#FFFFFF",
    secondary: "#0F172A",
    bg: "bg-white",
    accent: "bg-slate-900",
    border: "border-slate-100",
    description: "Clean, whitespace-heavy modern design.",
  },
  {
    id: 6,
    name: "Cyber Neon",
    primary: "#2E1065", // Purple 950
    secondary: "#EC4899", // Pink 500
    bg: "bg-purple-950",
    accent: "bg-pink-500",
    border: "border-purple-900",
    description: "Vibrant and energetic for creative studios.",
  },
  {
    id: 7,
    name: "Solar Flare",
    primary: "#451A03", // Orange 950
    secondary: "#F97316", // Orange 500
    bg: "bg-orange-950",
    accent: "bg-orange-500",
    border: "border-orange-900",
    description: "Warm and aggressive for sales-driven firms.",
  },
  {
    id: 8,
    name: "Crimson Velvet",
    primary: "#4C0519", // Rose 950
    secondary: "#E11D48", // Rose 600
    bg: "bg-rose-950",
    accent: "bg-rose-600",
    border: "border-rose-900",
    description: "Bold and passionate high-end branding.",
  },
  {
    id: 9,
    name: "Indigo Night",
    primary: "#1E1B4B", // Indigo 950
    secondary: "#6366F1", // Indigo 500
    bg: "bg-indigo-950",
    accent: "bg-indigo-500",
    border: "border-indigo-900",
    description: "Modern SaaS-style balanced professional look.",
  },
  {
    id: 10,
    name: "Titanium Grey",
    primary: "#18181B", // Zinc 900
    secondary: "#71717A", // Zinc 500
    bg: "bg-zinc-900",
    accent: "bg-zinc-400",
    border: "border-zinc-800",
    description: "Industrial and serious grayscale identity.",
  },
];

const DashboardAgency = () => {
  // --- CORE STATE ---
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState("");
  const [hasExistingAgency, setHasExistingAgency] = useState(false);
  const testimonialEndRef = useRef(null);
  const auth = getAuth();

  // --- FORM DATA ---
  const [formData, setFormData] = useState({
    subdomain: "",
    agencyName: "",
    agencySlogan: "",
    heroHeading: "",
    themeId: 1,
    services: [],
    demoVideos: [],
    testimonials: [{ name: "", stars: 5, comment: "" }],
    contact: { whatsapp: "", email: "", insta: "" },
  });

  // --- MASTER DATA FETCHING ---
  const [adminServices, setAdminServices] = useState([]);
  const [adminDemos, setAdminDemos] = useState([]);

  // Fetching Dynamic Services
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(
      query(collection(db, "services"), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((doc) => doc.data().name);
        setAdminServices(list);
      },
      (err) => console.error("Services Fetch Error:", err),
    );
    return () => unsub();
  }, []);

  // Fetching Dynamic Demos
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "demos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const fetchedDemos = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAdminDemos(fetchedDemos);
      },
      (error) => console.error("Demos Fetch error:", error),
    );
    return () => unsub();
  }, []);

  // YouTube ID helper
  const getYTId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // --- FETCH EXISTING AGENCY DATA ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profileRef = doc(
            db,
            "users",
            user.uid,
            "profile",
            "account_info",
          );
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists() && profileSnap.data().hasAgency) {
            const subdomain = profileSnap.data().agencySubdomain;
            const agencyRef = doc(db, "agencies", subdomain);
            const agencySnap = await getDoc(agencyRef);

            if (agencySnap.exists()) {
              setFormData(agencySnap.data());
              setHasExistingAgency(true);
            }
          }
        } catch (err) {
          console.error("Fetch Error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (step === 5) {
      testimonialEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [formData.testimonials.length, step]);

  const checkSubdomain = async (val) => {
    if (val.length < 3) {
      setAvailability(null);
      return;
    }
    setAvailability("checking");
    try {
      const docRef = doc(db, "agencies", val.toLowerCase());
      const docSnap = await getDoc(docRef);
      setAvailability(docSnap.exists() ? "taken" : "available");
    } catch (err) {
      console.error(err);
      setAvailability(null);
    }
  };

  const handleDeploy = async () => {
    if (!auth.currentUser) {
      alert("Please login to deploy your agency.");
      return;
    }
    setIsDeploying(true);
    try {
      const agencyRef = doc(db, "agencies", formData.subdomain.toLowerCase());

      // Clean data to ensure no field is 'undefined'
      const agencyData = {
        subdomain: formData.subdomain || "",
        agencyName: formData.agencyName || "",
        agencySlogan: formData.agencySlogan || "",
        heroHeading: formData.heroHeading || "",
        themeId: formData.themeId || 1,
        services: formData.services || [],
        demoVideos: formData.demoVideos || [],
        testimonials: formData.testimonials || [],
        contact: {
          whatsapp: formData.contact?.whatsapp || "",
          email: formData.contact?.email || "",
          insta: formData.contact?.insta || "",
        },
        ownerId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
        status: "active",
      };

      // 1. Save or Update the Agency Document using sanitized data
      await setDoc(agencyRef, agencyData, { merge: true });

      // 2. Save or Update the User Profile
      const userProfileRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "profile",
        "account_info",
      );

      await setDoc(
        userProfileRef,
        {
          hasAgency: true,
          agencySubdomain: formData.subdomain.toLowerCase(),
        },
        { merge: true },
      );

      setStep(7); // Redirect to success screen
    } catch (err) {
      console.error("Deploy Error:", err);
      alert("Failed to deploy: " + err.message);
    } finally {
      setIsDeploying(false);
    }
  };
  const nextStep = () => {
    if (step === 1) {
      // 1. Validate required fields
      if (
        !formData.subdomain ||
        !formData.agencyName ||
        !formData.agencySlogan
      ) {
        setError(
          "Branding Error: Agency Name, Slogan, and Subdomain are all required.",
        );
        return;
      }

      // 2. Minimum length check for subdomain
      if (formData.subdomain.length < 3) {
        setError("Subdomain Error: Must be at least 3 characters long.");
        return;
      }

      // 3. Availability logic for new agencies
      if (!hasExistingAgency) {
        if (availability === "checking") {
          setError("Please wait, checking subdomain availability...");
          return;
        }
        if (availability === "taken") {
          setError(
            "Subdomain Error: This name is already taken. Please choose another.",
          );
          return;
        }
        if (availability === null) {
          setError(
            "Validation Error: Subdomain status unknown. Please re-type.",
          );
          return;
        }
      }
    }

    // Clear errors and proceed if all checks pass
    setError("");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => setStep((s) => s - 1);

  const updateContact = (key, val) =>
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [key]: val },
    }));

  const addTestimonial = () =>
    setFormData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, { name: "", stars: 5, comment: "" }],
    }));

  const removeTestimonial = (index) => {
    if (formData.testimonials.length === 1) return;
    const newT = [...formData.testimonials];
    newT.splice(index, 1);
    setFormData((prev) => ({ ...prev, testimonials: newT }));
  };

  const toggleSelection = (listName, item) => {
    const currentList = formData[listName] || [];

    if (listName === "demoVideos") {
      // Check selection using title instead of the whole object
      const exists = currentList.some((v) => v.title === item.title);

      setFormData({
        ...formData,
        demoVideos: exists
          ? currentList.filter((v) => v.title !== item.title)
          : [
              ...currentList,
              {
                title: item.title,
                url: item.url,
                serviceName: item.serviceName || "Digital Asset",
              },
            ],
      });
    } else {
      // Standard logic for services
      const exists = currentList.includes(item);
      setFormData({
        ...formData,
        [listName]: exists
          ? currentList.filter((i) => i !== item)
          : [...currentList, item],
      });
    }
  };

  const copyToClipboard = () => {
    const url = `http://${formData.subdomain}.localhost:5173/`;
    navigator.clipboard.writeText(url);
    alert("Agency Link copied!");
  };

  const renderStepHeader = (icon, title, desc) => (
    <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
      <div className="w-12 h-12 bg-[#f7650b]/10 text-[#f7650b] rounded-2xl flex items-center justify-center shadow-sm">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-slate-400 text-sm font-medium">{desc}</p>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#f7650b]" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FBFDFF] p-4 md:p-8 font-sans selection:bg-[#f7650b]/10 selection:text-[#f7650b]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .mac-scroll::-webkit-scrollbar { width: 6px; }
            .mac-scroll::-webkit-scrollbar-track { background: transparent; }
            .mac-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            .mac-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        `,
        }}
      />

      <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col min-h-[800px]">
        {/* Navigation Sidebar / Header */}
        <div className="bg-slate-900 px-8 py-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f7650b] rounded-xl flex items-center justify-center shadow-lg shadow-[#f7650b]/20">
              <Rocket size={18} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter italic">
                Studio <span className="text-[#f7650b]">Builder</span>
              </h1>
              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={10} className="text-emerald-500" />{" "}
                Professional Setup v2.0
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= i ? "bg-[#f7650b]" : "bg-slate-700"}`}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <span className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-full border border-white/5 uppercase tracking-widest">
              Stage {step} / 7
            </span>
          </div>
        </div>

        <div className="p-6 md:p-12 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {/* STEP 0: WELCOME */}
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-8 py-10"
              >
                {!hasExistingAgency ? (
                  <div className="max-w-2xl bg-gradient-to-br from-[#f7650b]/5 to-orange-50 p-10 rounded-[3rem] border-2 border-dashed border-[#f7650b]/20 shadow-xl">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Sparkles className="text-[#f7650b]" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                      Your Agency is Waiting!
                    </h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                      Showcase your work to the world with a professional
                      landing page in just 5 minutes.
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="px-10 py-5 bg-[#f7650b] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#f7650b]/20"
                    >
                      Start Setup Now
                    </button>
                  </div>
                ) : (
                  <div className="max-w-2xl bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">
                      {formData.agencyName}
                    </h2>
                    <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-6">
                      Status: Live & Running
                    </p>

                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between mb-8 group border border-slate-100">
                      <span className="text-xs font-bold text-slate-400 truncate mr-4">
                        {formData.subdomain}.localhost:5173
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={copyToClipboard}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() =>
                            window.open(
                              `http://${formData.subdomain}.localhost:5173/`,
                              "_blank",
                            )
                          }
                          className="p-2 hover:bg-white rounded-lg transition-colors text-[#f7650b]"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all"
                      >
                        Edit Configuration
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                {renderStepHeader(
                  <Globe />,
                  "Digital Identity",
                  "Select your agency's unique subdomain, name and slogan.",
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MousePointer2 size={12} /> Custom Subdomain
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. creative-flow"
                        disabled={hasExistingAgency}
                        className={`w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold outline-none focus:border-[#f7650b] focus:bg-white transition-all ${hasExistingAgency ? "opacity-50 cursor-not-allowed" : ""}`}
                        value={formData.subdomain}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/[^a-zA-Z0-9-]/g, "")
                            .toLowerCase();
                          setFormData({ ...formData, subdomain: val });
                          checkSubdomain(val);
                        }}
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        {availability === "checking" && (
                          <Loader2
                            className="animate-spin text-[#f7650b]"
                            size={20}
                          />
                        )}
                        {(availability === "available" ||
                          hasExistingAgency) && (
                          <CheckCircle className="text-emerald-500" size={20} />
                        )}
                        {availability === "taken" && !hasExistingAgency && (
                          <Trash2 className="text-rose-500" size={20} />
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 px-2">
                      Preview:{" "}
                      <span className="text-[#f7650b]">
                        {formData.subdomain || "..."}.localhost:5173
                      </span>
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={12} /> Agency Brand Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alife Digital Solutions"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold outline-none focus:border-[#f7650b] focus:bg-white transition-all"
                        value={formData.agencyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agencyName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Type size={12} /> Agency Slogan
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Your Growth, Our Passion"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-md font-bold outline-none focus:border-[#f7650b] focus:bg-white transition-all"
                        value={formData.agencySlogan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agencySlogan: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: THEMES */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                {renderStepHeader(
                  <Palette />,
                  "Visual Language",
                  "Choose a curated dual-tone palette.",
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() =>
                        setFormData({ ...formData, themeId: t.id })
                      }
                      className={`group relative p-5 rounded-[2rem] border-2 transition-all ${formData.themeId === t.id ? "border-[#f7650b] bg-[#f7650b]/5 shadow-xl" : "border-slate-100 bg-white hover:border-slate-200"}`}
                    >
                      <div className="flex -space-x-4 mb-4 justify-center">
                        <div
                          className="w-12 h-12 rounded-2xl border-4 border-white shadow-lg"
                          style={{ backgroundColor: t.primary }}
                        />
                        <div
                          className="w-12 h-12 rounded-2xl border-4 border-white shadow-lg"
                          style={{ backgroundColor: t.secondary }}
                        />
                      </div>
                      <p className="text-[10px] font-black uppercase text-slate-800 tracking-tighter text-center">
                        {t.name}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: SERVICES (DYNAMIC) */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {renderStepHeader(
                  <Briefcase />,
                  "Solution Stack",
                  "Select the services your agency offers.",
                )}
                {adminServices.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {adminServices.map((serviceName) => (
                      <button
                        key={serviceName}
                        onClick={() => toggleSelection("services", serviceName)}
                        className={`relative p-5 rounded-[1.5rem] border-2 font-bold text-[13px] transition-all ${formData.services.includes(serviceName) ? "border-slate-900 bg-slate-900 text-white shadow-xl" : "border-slate-100 bg-white text-slate-500 hover:border-slate-300"}`}
                      >
                        {formData.services.includes(serviceName) && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#f7650b] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        )}
                        {serviceName}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <Loader2 className="animate-spin mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      Fetching Services...
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: VIDEO DEMOS (DYNAMIC) */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {renderStepHeader(
                  <Video className="text-[#f7650b]" />,
                  "Portfolio Assets",
                  "Select templates to showcase.",
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adminDemos && adminDemos.length > 0 ? (
                    adminDemos.map((demo) => {
                      const demoTitle = demo.title || "Untitled Demo";
                      const ytId = getYTId(demo.url);

                      // FIX: Use .some() to check if this demo object is in the list
                      const isSelected =
                        formData.demoVideos?.some(
                          (v) => v.title === demoTitle,
                        ) || false;

                      return (
                        <motion.button
                          key={demo.id}
                          type="button"
                          whileHover={{ y: -5 }}
                          onClick={() => toggleSelection("demoVideos", demo)} // Pass full demo object
                          className={`relative overflow-hidden rounded-[2rem] border-2 transition-all duration-300 flex flex-col ${
                            isSelected
                              ? "border-[#f7650b] bg-[#f7650b]/5 shadow-xl"
                              : "border-slate-100 bg-white"
                          }`}
                        >
                          <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                            {ytId ? (
                              <img
                                src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                className="w-full h-full object-cover"
                                alt="Preview"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon size={32} />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-4 right-4 bg-[#f7650b] text-white p-1 rounded-full shadow-lg">
                                <CheckCircle size={14} />
                              </div>
                            )}
                          </div>
                          <div className="p-5 text-left">
                            <p className="text-sm font-black text-slate-900 truncate">
                              {demoTitle}
                            </p>
                            <p className="text-[10px] font-bold text-[#f7650b] uppercase mt-1">
                              {demo.serviceName || "Global Asset"}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-slate-300 mb-2" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {/* STEP 5: TESTIMONIALS */}
            {step === 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 flex flex-col h-full overflow-hidden"
              >
                <div className="flex justify-between items-center bg-white sticky top-0 z-10 pb-4 border-b border-slate-50">
                  {renderStepHeader(
                    <MessageSquare />,
                    "Client Proof",
                    "Add real testimonials.",
                  )}
                  <button
                    onClick={addTestimonial}
                    className="mb-6 p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-105 transition-transform"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-4 space-y-4 max-h-[400px] mac-scroll pb-10">
                  {formData.testimonials.map((t, idx) => (
                    <motion.div
                      layout
                      key={idx}
                      className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100"
                    >
                      <button
                        onClick={() => removeTestimonial(idx)}
                        className="absolute -top-2 -right-2 bg-white text-rose-500 p-2 rounded-xl shadow-xl border border-rose-50 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          placeholder="Client Name"
                          className="p-3 bg-white rounded-xl border border-slate-100 text-sm font-bold outline-none"
                          value={t.name}
                          onChange={(e) => {
                            const newT = [...formData.testimonials];
                            newT[idx].name = e.target.value;
                            setFormData({ ...formData, testimonials: newT });
                          }}
                        />
                        <div className="flex items-center gap-2 bg-white px-4 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-black text-slate-300 mr-2 uppercase">
                            Rating
                          </span>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={t.stars >= s ? "#f7650b" : "none"}
                              className={
                                t.stars >= s
                                  ? "text-[#f7650b]"
                                  : "text-slate-200"
                              }
                              onClick={() => {
                                const newT = [...formData.testimonials];
                                newT[idx].stars = s;
                                setFormData({
                                  ...formData,
                                  testimonials: newT,
                                });
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <textarea
                        placeholder="Detailed Feedback..."
                        className="w-full p-4 bg-white rounded-xl border border-slate-100 text-xs h-24 resize-none outline-none focus:border-[#f7650b]"
                        value={t.comment}
                        onChange={(e) => {
                          const newT = [...formData.testimonials];
                          newT[idx].comment = e.target.value;
                          setFormData({ ...formData, testimonials: newT });
                        }}
                      />
                    </motion.div>
                  ))}
                  <div ref={testimonialEndRef} />
                </div>
              </motion.div>
            )}

            {/* STEP 6: CONTACT & DEPLOY */}
            {step === 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                {renderStepHeader(
                  <Smartphone />,
                  "Lead Channels",
                  "Where should clients reach out?",
                )}
                <div className="space-y-4 max-w-xl mx-auto">
                  {[
                    {
                      key: "whatsapp",
                      icon: Smartphone,
                      label: "WhatsApp",
                      color: "bg-emerald-500",
                    },
                    {
                      key: "email",
                      icon: Mail,
                      label: "Business Email",
                      color: "bg-[#f7650b]",
                    },
                    {
                      key: "insta",
                      icon: Instagram,
                      label: "Instagram",
                      color: "bg-pink-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white transition-all"
                    >
                      <div
                        className={`w-10 h-10 ${item.color} text-white rounded-xl flex items-center justify-center shadow-md`}
                      >
                        <item.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                          {item.label}
                        </label>
                        <input
                          className="w-full bg-transparent font-bold outline-none text-slate-800"
                          placeholder={`Enter ${item.label}...`}
                          value={formData.contact[item.key]}
                          onChange={(e) =>
                            updateContact(item.key, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 7: SUCCESS SCREEN */}
            {step === 7 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 space-y-6"
              >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                  MISSION ACCOMPLISHED!
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Your agency "
                  <span className="text-[#f7650b] font-black">
                    {formData.agencyName}
                  </span>
                  " is live.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-slate-800 shadow-xl"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `http://${formData.subdomain}.localhost:5173/`,
                        "_blank",
                      )
                    }
                    className="px-8 py-4 bg-[#f7650b] text-white rounded-2xl font-black text-xs uppercase hover:bg-orange-500 shadow-xl"
                  >
                    Visit Site
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent Footer Navigation */}
          {step > 0 && step < 7 && (
            <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-10 bg-white">
              <button
                onClick={prevStep}
                disabled={isDeploying}
                className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all text-slate-400 hover:text-slate-900"
              >
                <ChevronLeft size={16} strokeWidth={3} /> Previous Stage
              </button>
              {error && (
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse px-4 text-center">
                  {error}
                </p>
              )}
              <button
                onClick={step === 6 ? handleDeploy : nextStep}
                disabled={isDeploying}
                className="group relative bg-slate-950 text-white font-black px-12 py-5 rounded-[1.8rem] shadow-2xl hover:bg-[#f7650b] transition-all flex items-center gap-3 overflow-hidden"
              >
                {isDeploying ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />{" "}
                    DEPLOYING...
                  </span>
                ) : (
                  <>
                    <span className="relative z-10 uppercase text-[10px] tracking-widest">
                      {step === 6
                        ? hasExistingAgency
                          ? "Update Agency"
                          : "Finalize & Launch"
                        : "Proceed Further"}
                    </span>
                    <ChevronRight
                      size={18}
                      strokeWidth={3}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAgency;
