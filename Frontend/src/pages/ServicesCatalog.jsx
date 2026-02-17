import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Video,
  Layers,
  Play,
  Clock,
  Zap,
  Tag,
  Filter,
} from "lucide-react";
import DemoModal from "../components/DemoModal"; // Importing your Pro Modal

const ServicesCatalog = () => {
  const [services, setServices] = useState([]);
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("services");

  // Changed from selectedVideo to selectedDemo to pass full object to DemoModal
  const [selectedDemo, setSelectedDemo] = useState(null);

  const [demoFilter, setDemoFilter] = useState("All");

  // --- ENHANCED PRO IMAGE ENGINE FOR GOOGLE DRIVE ---
  const getPreviewUrl = (url) => {
    if (!url)
      return "https://placehold.co/600x400/f8fafc/cbd5e1?text=No+Preview";

    if (url.includes("drive.google.com")) {
      const regex = /\/d\/([^/]+)|id=([^&]+)/;
      const match = url.match(regex);
      const fileId = match?.[1] || match?.[2];

      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
      }
    }

    const ytRegExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(ytRegExp);
    return match && match[2].length === 11
      ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`
      : url;
  };

  useEffect(() => {
    const unsubServices = onSnapshot(
      query(collection(db, "services"), orderBy("createdAt", "desc")),
      (snap) => {
        setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
    );
    const unsubDemos = onSnapshot(
      query(collection(db, "demos"), orderBy("createdAt", "desc")),
      (snap) => {
        setDemos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    return () => {
      unsubServices();
      unsubDemos();
    };
  }, []);

  const filteredServices = services.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredDemos = demos.filter((d) => {
    const matchesSearch = d.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = demoFilter === "All" || d.serviceName === demoFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="text-orange-500" size={32} />
        </motion.div>
      </div>
    );

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      {/* Premium Glassmorphic Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-10">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 flex items-center gap-2">
              <Zap className="fill-orange-500 text-orange-500" size={20} />
              ALIFE STABLE{" "}
              <span className="text-orange-500 font-light ml-1">HUB</span>
            </h1>

            <nav className="hidden md:flex bg-slate-100 p-1 rounded-xl">
              {["services", "demos"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === t
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </nav>
          </div>

          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border-none pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
            />
          </div>

          <div className="md:hidden flex bg-slate-100 p-1 rounded-xl w-full">
            {["services", "demos"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === t
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        {/* --- SERVICES TAB --- */}
        {activeTab === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((s, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={s.id}
                  className="group bg-white border border-slate-200 rounded-[2.5rem] p-7 md:p-8 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-300 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-orange-500 transition-all duration-500">
                      {s.name?.toLowerCase().includes("video") ? (
                        <Video
                          className="text-slate-400 group-hover:text-white"
                          size={24}
                        />
                      ) : (
                        <Layers
                          className="text-slate-400 group-hover:text-white"
                          size={24}
                        />
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                      <Tag size={10} /> ID: {s.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>

                  {/* HIGHLY HIGHLIGHTED SERVICE NAME */}
                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                    {s.name}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-3 font-medium">
                    {s.description ||
                      "Premium bespoke service offering meticulously crafted to elevate your brand's digital presence."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 mt-auto">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                        Pricing
                      </p>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">
                        <span className="text-orange-500 mr-0.5">₹</span>
                        {s.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                        Delivery
                      </p>
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                        <Clock size={14} className="text-orange-400" />
                        {s.deliveryTime || "Fast-Track"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* --- DEMOS TAB --- */}
        {activeTab === "demos" && (
          <>
            <div className="flex items-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-slate-500">
                <Filter size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Filter
                </span>
              </div>
              {["All", ...new Set(services.map((s) => s.name))].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDemoFilter(cat)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    demoFilter === cat
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-white border border-slate-200 text-slate-400 hover:border-orange-300 hover:text-orange-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredDemos.map((d) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={d.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedDemo(d)} // Triggering the Pro DemoModal
                >
                  <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden relative bg-slate-200 border-4 border-white shadow-xl mb-5">
                    <img
                      src={getPreviewUrl(d.url)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                      alt={d.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/400x500/f8fafc/cbd5e1?text=Preview+Error";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                      <div className="w-16 h-16 bg-orange-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform mb-4 mx-auto">
                        <Play size={28} fill="currentColor" />
                      </div>
                      <p className="text-white text-center text-[10px] font-black uppercase tracking-[0.3em]">
                        View Details
                      </p>
                    </div>
                  </div>
                  <div className="px-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1 group-hover:text-orange-500 transition-colors">
                      {d.name}
                    </h4>
                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest opacity-80">
                      {d.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- PRO DEMO MODAL (REPLACES OLD VIDEO MODAL) --- */}
      <DemoModal
        isOpen={!!selectedDemo}
        onClose={() => setSelectedDemo(null)}
        demoData={selectedDemo}
      />
    </main>
  );
};

export default ServicesCatalog;
