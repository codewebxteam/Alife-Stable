import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  PenSquare,
  Save,
  X,
  Upload,
  Instagram,
  Twitter,
  Linkedin,
  Plus,
  Camera,
  Sparkles,
  Briefcase,
  Star,
  Clock,
  CheckCircle2,
  Layers,
} from "lucide-react";

// --- MOCK INITIAL DATA ---
const initialAgencyData = {
  name: "Creative Spark Studio",
  tagline: "Turning Ideas into Digital Reality",
  description:
    "We are a full-service digital agency specializing in video editing, graphic design, and branding for creators and small businesses. Our mission is to help you tell your story with high-impact visuals and compelling narratives.",
  email: "contact@creativespark.com",
  phone: "+91 98765 43210",
  website: "www.creativespark.com",
  address: "123, Tech Park, Sector 5, Bangalore, India",
  logo: "https://ui-avatars.com/api/?name=Creative+Spark&background=f7650b&color=fff&size=256&font-size=0.33",
  cover:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
  services: [
    "Video Editing",
    "Thumbnail Design",
    "Social Media Management",
    "Reels Production",
  ],
  socials: {
    instagram: "creativespark",
    twitter: "cspark_agency",
    linkedin: "creative-spark-studio",
  },
};

const DashboardAgency = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialAgencyData);
  const [newService, setNewService] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [name]: value },
    }));
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (serviceToRemove) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== serviceToRemove),
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add toast notification logic here
  };

  const handleCancel = () => {
    setFormData(initialAgencyData);
    setIsEditing(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans relative overflow-x-hidden pb-20">
      {/* --- Background Ambience --- */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-slate-900 to-slate-50 z-0" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-[#f7650b]/20 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute top-40 right-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24">
        {/* --- 1. Header & Actions --- */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8 text-white">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg backdrop-blur-md"
            >
              <Building2 className="w-3 h-3" /> Agency Portal
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Agency Profile
            </h1>
            <p className="text-slate-300 mt-2 text-base max-w-xl">
              Manage your public appearance, portfolio details, and service
              offerings.
            </p>
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  <X className="w-4 h-4" /> Cancel
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-[#f7650b] text-white font-bold text-sm shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm shadow-xl hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <PenSquare className="w-4 h-4" /> Edit Agency
              </motion.button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* --- LEFT COLUMN: Identity (Col-span-4) --- */}
          <div className="lg:col-span-4 space-y-6">
            {/* Identity Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative group"
            >
              {/* Cover Image Area */}
              <div className="h-40 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/20 z-10" />
                <img
                  src={formData.cover}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center cursor-pointer backdrop-blur-[2px] transition-all opacity-0 group-hover:opacity-100">
                    <span className="px-4 py-2 bg-white/20 border border-white/30 rounded-full text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md hover:bg-white/30">
                      <Camera className="w-3 h-3" /> Change Cover
                    </span>
                  </div>
                )}
              </div>

              <div className="px-8 pb-8 relative">
                {/* Logo Avatar */}
                <div className="relative -mt-16 mb-6 flex justify-center">
                  <div className="relative group/logo">
                    <div className="w-32 h-32 rounded-[2rem] border-[6px] border-white shadow-2xl overflow-hidden bg-white">
                      <img
                        src={formData.logo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full shadow-lg border-2 border-white hover:bg-[#f7650b] transition-colors">
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Text Details */}
                <div className="text-center mb-6">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full text-center text-xl font-bold text-slate-900 border-b border-slate-200 focus:border-[#f7650b] outline-none bg-transparent py-1"
                        placeholder="Agency Name"
                      />
                      <input
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleInputChange}
                        className="w-full text-center text-sm text-slate-500 border-b border-slate-200 focus:border-[#f7650b] outline-none bg-transparent py-1"
                        placeholder="Tagline / Slogan"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">
                        {formData.name}
                      </h2>
                      <p className="text-slate-500 font-medium text-sm">
                        {formData.tagline}
                      </p>
                    </>
                  )}
                </div>

                {/* Contact List */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <ContactItem
                    icon={<Mail className="w-4 h-4" />}
                    text={formData.email}
                    isEditing={isEditing}
                    name="email"
                    onChange={handleInputChange}
                    label="Email"
                  />
                  <ContactItem
                    icon={<Phone className="w-4 h-4" />}
                    text={formData.phone}
                    isEditing={isEditing}
                    name="phone"
                    onChange={handleInputChange}
                    label="Phone"
                  />
                  <ContactItem
                    icon={<Globe className="w-4 h-4" />}
                    text={formData.website}
                    isEditing={isEditing}
                    name="website"
                    onChange={handleInputChange}
                    label="Website"
                  />
                  <ContactItem
                    icon={<MapPin className="w-4 h-4" />}
                    text={formData.address}
                    isEditing={isEditing}
                    name="address"
                    onChange={handleInputChange}
                    label="Address"
                    isTextarea
                  />
                </div>
              </div>
            </motion.div>

            {/* Socials Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6"
            >
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="w-1.5 h-4 rounded-full bg-[#f7650b]"></span>{" "}
                Connect
              </h3>
              <div className="space-y-3">
                <SocialInput
                  icon={<Instagram className="text-pink-500" />}
                  name="instagram"
                  value={formData.socials.instagram}
                  isEditing={isEditing}
                  onChange={handleSocialChange}
                  prefix="@"
                />
                <SocialInput
                  icon={<Twitter className="text-sky-500" />}
                  name="twitter"
                  value={formData.socials.twitter}
                  isEditing={isEditing}
                  onChange={handleSocialChange}
                  prefix="@"
                />
                <SocialInput
                  icon={<Linkedin className="text-blue-700" />}
                  name="linkedin"
                  value={formData.socials.linkedin}
                  isEditing={isEditing}
                  onChange={handleSocialChange}
                  prefix="/"
                />
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN: Content (Col-span-8) --- */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={<Layers />}
                value="12"
                label="Projects"
                color="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={<Star />}
                value="4.9"
                label="Rating"
                color="bg-orange-50 text-orange-600"
              />
              <StatCard
                icon={<Clock />}
                value="2yr"
                label="Experience"
                color="bg-green-50 text-green-600"
              />
            </div>

            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-50 text-[#f7650b] rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  About Our Agency
                </h3>
              </div>

              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 leading-relaxed focus:outline-none focus:border-[#f7650b] focus:ring-4 focus:ring-[#f7650b]/10 transition-all resize-none"
                />
              ) : (
                <p className="text-slate-600 leading-relaxed text-lg">
                  {formData.description}
                </p>
              )}
            </motion.div>

            {/* Services Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Our Services
                  </h3>
                </div>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                  {formData.services.length} Active
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {formData.services.map((service) => (
                    <motion.div
                      layout
                      key={service}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold border flex items-center gap-2 transition-all
                             ${
                               isEditing
                                 ? "bg-slate-50 border-slate-200 text-slate-700 pr-2 pl-4"
                                 : "bg-white border-slate-100 text-slate-700 shadow-sm hover:border-orange-200 hover:text-[#f7650b] hover:shadow-md"
                             }
                          `}
                    >
                      {service}
                      {isEditing && (
                        <button
                          onClick={() => removeService(service)}
                          className="p-1 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isEditing && (
                  <motion.div layout className="flex items-center gap-2 pl-2">
                    <div className="relative">
                      <input
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addService()}
                        placeholder="Add new service..."
                        className="pl-4 pr-10 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:border-[#f7650b] focus:ring-2 focus:ring-[#f7650b]/10 transition-all w-48"
                      />
                      <button
                        onClick={addService}
                        className="absolute right-1 top-1 bottom-1 w-8 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-[#f7650b] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

// --- SUB COMPONENTS FOR CLEANER CODE ---

const ContactItem = ({
  icon,
  text,
  isEditing,
  name,
  onChange,
  label,
  isTextarea,
}) => (
  <div className="flex items-start gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#f7650b] group-hover:bg-orange-50 group-hover:border-orange-100 transition-all shrink-0">
      {icon}
    </div>
    <div className="flex-grow min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      {isEditing ? (
        isTextarea ? (
          <textarea
            name={name}
            value={text}
            onChange={onChange}
            rows={2}
            className="w-full text-sm font-medium text-slate-900 bg-slate-50 border-b border-slate-200 focus:border-[#f7650b] outline-none resize-none p-1"
          />
        ) : (
          <input
            name={name}
            value={text}
            onChange={onChange}
            className="w-full text-sm font-medium text-slate-900 bg-slate-50 border-b border-slate-200 focus:border-[#f7650b] outline-none p-1"
          />
        )
      ) : (
        <p className="text-sm font-bold text-slate-700 truncate leading-relaxed">
          {text}
        </p>
      )}
    </div>
  </div>
);

const SocialInput = ({ icon, name, value, isEditing, onChange, prefix }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-slate-200 transition-all">
    {icon}
    <div className="flex-grow flex items-center gap-1 text-sm font-medium text-slate-600">
      <span className="text-slate-400">{prefix}</span>
      {isEditing ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent border-b border-transparent focus:border-[#f7650b] outline-none"
        />
      ) : (
        <span>{value}</span>
      )}
    </div>
    {!isEditing && (
      <CheckCircle2 className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    )}
  </div>
);

const StatCard = ({ icon, value, label, color }) => (
  <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
    >
      {React.cloneElement(icon, { className: "w-5 h-5" })}
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export default DashboardAgency;
