import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Check,
  Loader2,
  Trash2,
  Edit3,
  X,
  Clock,
  Save,
  Play,
  ChevronDown,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import AuthModal from "../components/AuthModal";
import DemoModal from "../components/DemoModal"; // Import DemoModal
import { useAuth } from "../context/AuthContext"; // Import useAuth to check login status

// --- ROBUST MEDIA UTILS ---
const getDriveId = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const parseMedia = (url) => {
  if (!url)
    return {
      type: "image",
      preview: "https://placehold.co/600x400?text=No+Link",
    };

  const ytRegex =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[2].length === 11) {
    return {
      type: "youtube",
      preview: `https://img.youtube.com/vi/${ytMatch[2]}/maxresdefault.jpg`,
      src: url,
    };
  }

  const driveId = getDriveId(url);
  if (driveId) {
    return {
      type: "drive",
      preview: `https://lh3.googleusercontent.com/d/${driveId}=w1000?authuser=0`,
      src: url,
    };
  }

  return { type: "image", preview: url, src: url };
};

// --- HOOKS ---
const useClickOutside = (handler) => {
  const domNode = useRef();
  useEffect(() => {
    const listener = (event) => {
      if (!domNode.current || domNode.current.contains(event.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler]);
  return domNode;
};

// --- MODAL WRAPPER ---
const ModalPortal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
      >
        {children}
      </motion.div>
    </div>,
    document.body,
  );
};

const ServicesPage = () => {
  const { userRole, currentUser } = useAuth(); // Get user role from context
  const [services, setServices] = useState([]);
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("service");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    customId: "",
    description: "",
    price: "",
    deliveryTime: "",
    title: "",
    media: [""],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useClickOutside(() => setShowDropdown(false));

  useEffect(() => {
    const unsubS = onSnapshot(
      query(collection(db, "services"), orderBy("createdAt", "desc")),
      (snap) => {
        setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
    );
    const unsubD = onSnapshot(
      query(collection(db, "demos"), orderBy("createdAt", "desc")),
      (snap) => {
        setDemos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    return () => {
      unsubS();
      unsubD();
    };
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      id: null,
      name: "",
      customId: "",
      description: "",
      price: "",
      deliveryTime: "",
      title: "",
      media: [""],
    });
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleServiceSelect = (name) => {
    const instances = services.filter(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    );
    let nextId = "";

    if (instances.length > 0) {
      const ids = instances.map((s) => {
        const parts = s.customId.split("-");
        const num = parseInt(parts[parts.length - 1]);
        return isNaN(num) ? 0 : num;
      });
      const maxNum = Math.max(...ids);
      const prefix =
        instances[0].customId.split("-").slice(0, -1).join("-") ||
        name.toLowerCase().replace(/\s+/g, "");
      nextId = `${prefix}-${maxNum + 1}`;
    }

    setFormData((prev) => ({ ...prev, name, customId: nextId }));
    setSearchTerm(name);
    setShowDropdown(false);
  };

  const handleMediaChange = (index, value) => {
    const newMedia = [...formData.media];
    newMedia[index] = value;
    setFormData({ ...formData, media: newMedia });
  };

  const addMediaField = () => {
    setFormData({ ...formData, media: [...formData.media, ""] });
  };

  const removeMediaField = (index) => {
    const newMedia = formData.media.filter((_, i) => i !== index);
    setFormData({ ...formData, media: newMedia });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const col = modalType === "service" ? "services" : "demos";
      let cleanMedia = formData.media;
      if (modalType === "demo") {
        cleanMedia = formData.media.filter((url) => url.trim() !== "");
        if (cleanMedia.length === 0) cleanMedia = [""];
      }

      const payload = {
        ...formData,
        media: cleanMedia,
        url: cleanMedia[0] || "",
        createdAt: serverTimestamp(),
      };

      const docId = payload.id;
      delete payload.id;

      if (docId) {
        await updateDoc(doc(db, col, docId), payload);
      } else {
        await addDoc(collection(db, col), payload);
      }
      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCategories = useMemo(
    () => Array.from(new Set(services.map((s) => s.name))),
    [services],
  );
  const filteredCategories = uniqueCategories.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Alife <span className="text-orange-500">Catalog</span> Admin
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2 ml-1">
            Service & Portfolio Management
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-xl border border-slate-100">
          <button
            onClick={() => setActiveTab("services")}
            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "services"
                ? "bg-slate-900 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Services List
          </button>
          <button
            onClick={() => setActiveTab("demos")}
            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "demos"
                ? "bg-orange-500 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Demos / Showcase
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {activeTab === "services" ? "Manage Services" : "Manage Portfolio"}
          </h2>
          <button
            onClick={() => {
              setModalType(activeTab === "services" ? "service" : "demo");
              setFormData({ ...formData, media: [""] });
              setIsModalOpen(true);
            }}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-lg hover:bg-orange-500 transition-all"
          >
            <Plus size={16} /> Add{" "}
            {activeTab === "services" ? "Service" : "Demo"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === "services" &&
            services.map((s) => (
              <div
                key={s.id}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:shadow-2xl transition-all"
              >
                <div className="absolute top-6 right-6 flex gap-2">
                  <button
                    onClick={() => {
                      setFormData(s);
                      setModalType("service");
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-200 hover:text-blue-500 transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteDoc(doc(db, "services", s.id))}
                    className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 italic">
                  #{s.customId}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">
                  {s.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed line-clamp-3">
                  {s.description}
                </p>
                <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                  <div>
                    <span className="text-[9px] font-black text-slate-300 uppercase block">
                      Rate
                    </span>
                    <span className="text-xl font-black">₹{s.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-300 uppercase block">
                      Delivery
                    </span>
                    <span className="text-xs font-black flex items-center gap-1 text-slate-600">
                      <Clock size={12} className="text-orange-500" />{" "}
                      {s.deliveryTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}

          {activeTab === "demos" &&
            demos.map((d) => {
              const mediaList =
                d.media && d.media.length > 0 ? d.media : [d.url];
              const firstMedia = parseMedia(mediaList[0]);

              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDemo(d);
                    // Check user role: If admin, open DemoModal; else, open AuthModal
                    if (userRole === "admin") {
                      setIsDemoModalOpen(true);
                    } else {
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className="bg-white p-4 pb-6 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="absolute top-4 right-4 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const loadedMedia = d.media ? d.media : [d.url];
                        setFormData({ ...d, media: loadedMedia });
                        setModalType("demo");
                        setIsModalOpen(true);
                      }}
                      className="p-2 bg-white rounded-lg shadow-lg text-blue-500 hover:bg-blue-50"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDoc(doc(db, "demos", d.id));
                      }}
                      className="p-2 bg-white rounded-lg shadow-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="aspect-video bg-slate-100 rounded-2xl mb-4 overflow-hidden relative group-hover:bg-slate-900/5 transition-all">
                    <img
                      src={firstMedia.preview}
                      className="w-full h-full object-cover"
                      alt="preview"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/600x400?text=Error")
                      }
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all">
                      {firstMedia.type === "youtube" ? (
                        <Play size={32} className="text-white drop-shadow-lg" />
                      ) : (
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                          <ImageIcon size={20} className="text-white" />
                        </div>
                      )}
                    </div>

                    {mediaList.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-bold px-2 py-1 rounded-md backdrop-blur-md">
                        +{mediaList.length - 1} More
                      </div>
                    )}
                  </div>

                  <div className="px-2">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-1 truncate">
                      {d.title}
                    </h4>
                    <div className="text-[9px] font-black text-orange-500 uppercase tracking-widest italic truncate">
                      {d.name} <span className="text-slate-300 mx-1">|</span>{" "}
                      {mediaList.length} Items
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <AnimatePresence>
        <ModalPortal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">
              {formData.id ? "Edit" : "New"}{" "}
              <span className="text-orange-500">{modalType}</span>
            </h2>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X />
            </button>
          </div>

          <form
            onSubmit={handleSave}
            className="p-10 overflow-y-auto space-y-6 custom-scrollbar h-full"
          >
            <div className="relative" ref={dropdownRef}>
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4 mb-2 block">
                Related Category
              </label>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Type 3 chars to search..."
                  value={searchTerm || formData.name}
                  onFocus={() => setShowDropdown(searchTerm.length >= 3)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    setFormData({ ...formData, name: val });
                    setShowDropdown(val.length >= 3);
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-slate-900 transition-all"
                />
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={16}
                />
              </div>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin">
                      {filteredCategories.map((cat, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleServiceSelect(cat)}
                          className="w-full text-left px-4 py-3 hover:bg-orange-50 rounded-xl font-bold text-xs flex items-center justify-between group"
                        >
                          {cat}{" "}
                          <Check
                            size={14}
                            className="opacity-0 group-hover:opacity-100 text-orange-500"
                          />
                        </button>
                      ))}
                      {searchTerm.length >= 3 &&
                        !uniqueCategories.find(
                          (c) => c.toLowerCase() === searchTerm.toLowerCase(),
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleServiceSelect(searchTerm)}
                            className="w-full text-left px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2"
                          >
                            <Plus size={14} /> Create new: "{searchTerm}"
                          </button>
                        )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {modalType === "service" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">
                      Identifier ID
                    </label>
                    <input
                      placeholder="e.g. LOGO-1001"
                      value={formData.customId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customId: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl font-bold text-sm text-orange-600 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">
                      Price (₹)
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">
                    Description
                  </label>
                  <textarea
                    required
                    placeholder="Service offering description..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">
                    Delivery Estimate
                  </label>
                  <input
                    required
                    placeholder="Delivery Time (e.g. 48 Hours)"
                    value={formData.deliveryTime}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryTime: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">
                    Project Title
                  </label>
                  <input
                    required
                    placeholder="e.g. Modern Gym Website"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 flex justify-between items-center">
                    <span>Media Links (Images/Videos)</span>
                    <span className="text-orange-500">
                      {formData.media.length} Items
                    </span>
                  </label>

                  {formData.media.map((url, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="relative w-full">
                        <LinkIcon
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                          size={14}
                        />
                        <input
                          required
                          placeholder="Paste Google Drive or YouTube Link"
                          value={url}
                          onChange={(e) =>
                            handleMediaChange(index, e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none focus:bg-white focus:ring-2 ring-orange-100 transition-all"
                        />
                      </div>
                      {formData.media.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMediaField(index)}
                          className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addMediaField}
                    className="w-full py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add Another Media
                  </button>
                </div>
              </div>
            )}

            <button
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-orange-500 disabled:opacity-50 transition-all flex items-center justify-center gap-3 text-[10px]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Save size={16} /> {formData.id ? "Update" : "Save"}{" "}
                  {modalType === "service" ? "Service" : "Showcase"}
                </>
              )}
            </button>
          </form>
        </ModalPortal>
      </AnimatePresence>

      {/* AuthModal opens for guests/users */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setSelectedDemo(null);
        }}
        demoData={selectedDemo}
      />

      {/* DemoModal opens directly for Admin */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => {
          setIsDemoModalOpen(false);
          setSelectedDemo(null);
        }}
        demoData={selectedDemo}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ServicesPage;
