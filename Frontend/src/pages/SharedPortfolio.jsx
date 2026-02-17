import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Play,
  Layers,
  MonitorPlay,
  Image as ImageIcon,
  AlertCircle,
  Zap,
  CheckCircle2,
  Share2,
  ArrowLeft,
} from "lucide-react";

// --- MEDIA PARSER (Same as Modal) ---
const parseMedia = (url) => {
  if (!url || typeof url !== "string")
    return { type: "empty", preview: null, src: null };

  const ytRegex =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[2].length === 11) {
    const videoId = ytMatch[2];
    return {
      type: "youtube",
      id: videoId,
      preview: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`,
    };
  }

  const driveRegex =
    /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    const directLink = `https://lh3.googleusercontent.com/d/${fileId}=w1000?authuser=0`;
    return { type: "image", id: fileId, preview: directLink, src: directLink };
  }

  return { type: "image", id: "external", preview: url, src: url };
};

const SharedPortfolio = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [parsedMedia, setParsedMedia] = useState([]);

  // --- FETCH DATA FROM FIRESTORE ---
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const docRef = doc(db, "shared_portfolios", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const portfolioData = docSnap.data();
          setData(portfolioData);

          // Parse Media
          const media = portfolioData.media || [];
          setParsedMedia(media.map((url) => parseMedia(url)));
        } else {
          setError("Portfolio not found or has expired.");
        }
      } catch (err) {
        console.error("Error fetching portfolio:", err);
        setError("Unable to load portfolio. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPortfolio();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Loading Showcase...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Unavailable
          </h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link
            to="/"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back Home
          </Link>
        </div>
      </div>
    );
  }

  const activeItem = parsedMedia[activeMediaIndex] || {
    type: "empty",
    src: "",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="fill-orange-500 text-orange-500" size={24} />
            <div>
              <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">
                ALIFE STABLE{" "}
                <span className="text-orange-500 font-light">VIEW</span>
              </h1>
            </div>
          </div>
          <Link
            to="/"
            className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
          >
            Create Your Own <ArrowLeft size={12} className="rotate-180" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col lg:flex-row min-h-[85vh]">
          {/* --- RIGHT SIDE (PLAYER) - TOP ON MOBILE --- */}
          <div className="w-full lg:w-8/12 h-[45vh] lg:h-auto bg-slate-950 relative flex flex-col items-center justify-center lg:order-2">
            {/* Ambient BG */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

            {/* Media Container */}
            <div className="relative w-full h-full lg:h-[85%] lg:w-[90%] bg-black/40 flex items-center justify-center lg:rounded-3xl overflow-hidden border-y lg:border border-white/5 shadow-2xl">
              {activeItem.type === "youtube" ? (
                <iframe
                  src={activeItem.src}
                  className="w-full h-full absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Portfolio Viewer"
                />
              ) : (
                <img
                  src={activeItem.src}
                  className="w-full h-full object-contain bg-black"
                  alt="Full View"
                />
              )}
            </div>

            {/* Info Badge (Desktop) */}
            <div className="hidden lg:flex absolute bottom-8 left-12 right-12 justify-between items-end pointer-events-none">
              <div>
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full inline-flex items-center gap-2 border border-white/10 mb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    Live Preview
                  </span>
                </div>
                <h2 className="text-white font-black text-2xl uppercase tracking-tighter drop-shadow-xl">
                  {activeItem.type === "youtube"
                    ? "Video Playback"
                    : "Image Viewer"}
                </h2>
              </div>
            </div>
          </div>

          {/* --- LEFT SIDE (LIST) - BOTTOM ON MOBILE --- */}
          <div className="w-full lg:w-4/12 flex flex-col border-t lg:border-t-0 lg:border-r border-slate-100 bg-white relative z-10 lg:order-1">
            <div className="p-6 lg:p-10 pb-4 shrink-0">
              <div className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                {data.category}
              </div>
              <h1 className="text-2xl lg:text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter italic">
                {data.title}
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-wide">
                Shared via Alife Stable Hub
              </p>
            </div>

            <div className="px-6 lg:px-10 pb-2 flex justify-between items-center border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} /> Playlist ({parsedMedia.length})
              </h3>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-3">
              {parsedMedia.map((item, idx) => {
                const isActive = activeMediaIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer border transition-all duration-300 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xl scale-[1.02] border-slate-900"
                        : "bg-slate-50 border-transparent hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-12 lg:w-20 lg:h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={item.preview}
                        className="w-full h-full object-cover"
                        alt="thumb"
                      />
                      {item.type === "youtube" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                          <Play size={12} className="text-white fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider truncate ${isActive ? "text-orange-500" : "text-slate-400"}`}
                        >
                          Asset {idx + 1}
                        </span>
                        {item.type === "youtube" ? (
                          <MonitorPlay
                            size={12}
                            className={
                              isActive ? "text-white" : "text-slate-400"
                            }
                          />
                        ) : (
                          <ImageIcon
                            size={12}
                            className={
                              isActive ? "text-white" : "text-slate-400"
                            }
                          />
                        )}
                      </div>
                      <div
                        className={`text-xs font-bold truncate ${isActive ? "text-slate-300" : "text-slate-900"}`}
                      >
                        {item.type === "youtube"
                          ? "Video Demonstration"
                          : "High-Res Preview"}
                      </div>
                    </div>

                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mr-2"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-50 bg-slate-50/50">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link Copied!");
                }}
                className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Share2 size={14} /> Share this Portfolio
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default SharedPortfolio;
