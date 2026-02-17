import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon,
  Play,
  Save,
  Loader2,
  MonitorPlay,
  Layers,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// --- 1. SENIOR ENGINEER MEDIA LOGIC ---
const parseMedia = (url) => {
  if (!url || typeof url !== "string")
    return { type: "empty", preview: null, src: null };

  // A. YouTube Logic (Extract 11-char ID)
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

  // B. Google Drive Logic (Direct Preview)
  const driveRegex =
    /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const driveMatch = url.match(driveRegex);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    const directLink = `https://lh3.googleusercontent.com/d/${fileId}=w1000?authuser=0`;
    return {
      type: "image",
      id: fileId,
      preview: directLink,
      src: directLink,
    };
  }

  // C. Fallback for direct image links
  return { type: "image", id: "external", preview: url, src: url };
};

const DemoModal = ({ isOpen, onClose, demoData }) => {
  // --- STATE ---
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaList, setMediaList] = useState([]);
  const [parsedMedia, setParsedMedia] = useState([]);

  // Sharing State
  const [isShareMode, setIsShareMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [generatedLink, setGeneratedLink] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Sync with demoData
  useEffect(() => {
    if (demoData && isOpen) {
      const rawMedia = Array.isArray(demoData.media)
        ? demoData.media.filter((url) => url && url.trim() !== "")
        : demoData.url
          ? [demoData.url]
          : [];

      setMediaList(rawMedia);
      const parsed = rawMedia.map((url) => parseMedia(url));
      setParsedMedia(parsed);

      setActiveMediaIndex(0);
      setIsShareMode(false);
      setSelectedIndices(new Set());
      setGeneratedLink(null);
    }
  }, [demoData, isOpen]);

  // Handlers
  const handleItemClick = (index) => {
    if (isShareMode) {
      const newSet = new Set(selectedIndices);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      setSelectedIndices(newSet);
    } else {
      setActiveMediaIndex(index);
    }
  };

  const generateShareLink = async () => {
    if (selectedIndices.size === 0) return;
    setIsGenerating(true);

    try {
      const selectedUrls = mediaList.filter((_, idx) =>
        selectedIndices.has(idx),
      );

      // Save to Firebase to avoid URL Syntax Errors
      const docRef = await addDoc(collection(db, "shared_portfolios"), {
        title: demoData?.title || "Shared Portfolio",
        category: demoData?.name || "Demo",
        media: selectedUrls,
        createdAt: serverTimestamp(),
      });

      const link = `${window.location.origin}/view/${docRef.id}`;
      setGeneratedLink(link);
      setIsShareMode(false);
    } catch (error) {
      console.error("Share Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !demoData) return null;
  const activeItem = parsedMedia[activeMediaIndex] || {
    type: "empty",
    src: "",
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-end lg:items-center justify-center lg:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full lg:max-w-6xl h-[95vh] lg:h-[90vh] rounded-t-[2rem] lg:rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col lg:flex-row overflow-hidden"
      >
        {/* PLAYER SECTION (Desktop Order: 2) */}
        <div className="w-full lg:w-8/12 h-[40vh] lg:h-full bg-slate-950 relative flex flex-col items-center justify-center shrink-0 lg:order-2 group">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-40 p-2 bg-black/50 text-white rounded-full lg:hidden backdrop-blur-md"
          >
            <X size={20} />
          </button>

          <div className="relative w-full h-full lg:max-h-[80vh] lg:w-[90%] flex items-center justify-center bg-black/40 lg:rounded-3xl overflow-hidden lg:border border-white/5 lg:shadow-2xl">
            {activeItem.type === "empty" ? (
              <div className="text-center text-slate-500">
                <Layers size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  No Media Available
                </p>
              </div>
            ) : activeItem.type === "youtube" ? (
              <iframe
                src={activeItem.src}
                className="w-full h-full absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Demo Player"
              />
            ) : (
              <img
                src={activeItem.src}
                className="w-full h-full object-contain bg-black"
                alt="Full Preview"
              />
            )}
          </div>
        </div>

        {/* SIDEBAR SECTION (Desktop Order: 1) */}
        <div className="w-full lg:w-4/12 h-full flex flex-col border-t lg:border-t-0 lg:border-r border-slate-100 bg-white relative z-20 lg:order-1">
          <div className="p-5 lg:p-8 pb-2 lg:pb-4 shrink-0">
            <h4 className="text-[10px] font-black uppercase text-orange-500 tracking-widest mb-1">
              {demoData.name || "Category"}
            </h4>
            <h2 className="text-xl lg:text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter italic truncate">
              {demoData.title}
            </h2>
          </div>

          <div className="px-5 lg:px-8 pb-4 flex justify-between items-center shrink-0 border-b border-slate-50">
            <h3 className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} /> Assets ({mediaList.length})
            </h3>
            {!generatedLink && (
              <button
                onClick={() => {
                  setIsShareMode(!isShareMode);
                  setSelectedIndices(new Set());
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                  isShareMode
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200 hover:border-orange-500 hover:text-orange-500"
                }`}
              >
                {isShareMode ? "Cancel" : "Share"}
              </button>
            )}
          </div>

          {/* Asset List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 lg:pt-2 space-y-3 pb-24 lg:pb-4">
            {parsedMedia.map((item, idx) => {
              const isActive = activeMediaIndex === idx;
              const isSelected = selectedIndices.has(idx);
              return (
                <div
                  key={idx}
                  onClick={() => handleItemClick(idx)}
                  className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all ${
                    isShareMode
                      ? isSelected
                        ? "bg-orange-50 border-orange-500 ring-1 ring-orange-500"
                        : "bg-slate-50 border-transparent opacity-60"
                      : isActive
                        ? "bg-slate-900 text-white shadow-lg"
                        : "bg-slate-50 border-transparent hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <div className="relative w-14 h-10 lg:w-16 lg:h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={item.preview}
                      className="w-full h-full object-cover"
                      alt="thumb"
                    />
                    {item.type === "youtube" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play size={10} className="text-white fill-white" />
                      </div>
                    )}
                    {isShareMode && (
                      <div
                        className={`absolute inset-0 flex items-center justify-center ${isSelected ? "bg-orange-500/80" : "bg-black/10"}`}
                      >
                        {isSelected && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Asset {idx + 1}
                      </span>
                      {item.type === "youtube" ? (
                        <MonitorPlay size={10} />
                      ) : (
                        <ImageIcon size={10} />
                      )}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400">
                      {item.type === "youtube" ? "Video" : "Image"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Share Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 lg:relative bg-white/95 backdrop-blur-sm border-t border-slate-100 z-30">
            <AnimatePresence mode="wait">
              {isShareMode ? (
                <motion.button
                  key="share-btn"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  onClick={generateShareLink}
                  disabled={selectedIndices.size === 0 || isGenerating}
                  className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Share2 size={16} /> Generate Link ({selectedIndices.size}
                      )
                    </>
                  )}
                </motion.button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                >
                  Close Gallery
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SHARE LINK SUCCESS OVERLAY */}
        <AnimatePresence>
          {generatedLink && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl max-w-sm w-full relative">
                <button
                  onClick={() => setGeneratedLink(null)}
                  className="absolute top-5 right-5 text-slate-500 hover:text-white"
                >
                  <X size={20} />
                </button>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                  Link Ready!
                </h3>
                <div className="bg-black/50 p-3 rounded-xl flex items-center gap-2 mb-6 border border-white/10">
                  <input
                    readOnly
                    value={generatedLink}
                    className="flex-1 bg-transparent text-orange-400 text-xs font-mono outline-none truncate"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      alert("Copied!");
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} /> Open
                  </a>
                  <button
                    onClick={() => setGeneratedLink(null)}
                    className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-bold text-xs uppercase"
                  >
                    Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>,
    document.body,
  );
};

export default DemoModal;
