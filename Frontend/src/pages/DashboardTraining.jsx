import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  GraduationCap,
  Video,
  HelpCircle,
  MonitorPlay,
} from "lucide-react";

// --- MOCK VIDEO DATA ---
const videos = [
  {
    id: 1,
    title: "Getting Started with ALIFE STABLE",
    duration: "5:30",
    category: "Onboarding",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Mastering the Dashboard",
    duration: "12:15",
    category: "Platform",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Effective Client Communication",
    duration: "8:45",
    category: "Soft Skills",
    thumbnail:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Advanced Order Management",
    duration: "15:20",
    category: "Platform",
    thumbnail:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Upselling Services",
    duration: "10:00",
    category: "Sales",
    thumbnail:
      "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Troubleshooting Common Issues",
    duration: "6:50",
    category: "Support",
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
  },
];

// --- MOCK FAQ DATA ---
const faqs = [
  {
    question: "How do I track my agency's performance?",
    answer:
      "You can track your performance on the main Dashboard page. It shows total orders, revenue trends, and order status breakdowns in real-time.",
  },
  {
    question: "Can I download the training videos?",
    answer:
      "Currently, videos are available for streaming only to ensure you always have the most up-to-date content. However, you can access them anytime from this portal.",
  },
  {
    question: "How often is new training content added?",
    answer:
      "We add new modules every month covering platform updates, marketing strategies, and industry trends.",
  },
  {
    question: "Who do I contact if I'm stuck on a step?",
    answer:
      "If you need help, use the 'Support' link in the footer or the chat widget on the bottom right. Our team usually responds within 2 hours.",
  },
];

const DashboardTraining = () => {
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 font-sans relative overflow-x-hidden pb-20">
      {/* --- Background Ambience --- */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-900 to-slate-50 z-0" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-[#f7650b]/20 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute top-40 right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24">
        {/* --- Header Section --- */}
        <div className="flex flex-col items-center text-center mb-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-lg backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3" /> Knowledge Hub
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Training Center
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg max-w-2xl"
          >
            Master the platform and grow your agency with our curated resources,
            video tutorials, and guides.
          </motion.p>
        </div>

        {/* --- Search Bar --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-2xl mx-auto mb-20"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f7650b] to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
            <div className="relative bg-white rounded-2xl shadow-xl flex items-center overflow-hidden">
              <div className="pl-6 pr-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search tutorials, guides, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 pr-6 text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none text-base"
              />
            </div>
          </div>
        </motion.div>

        {/* --- Video Grid --- */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-[#f7650b] rounded-lg">
                <MonitorPlay className="w-5 h-5" />
              </div>
              Video Tutorials
            </h2>
            <span className="text-sm font-medium text-slate-500">
              {filteredVideos.length} Videos Available
            </span>
          </div>

          {filteredVideos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-orange-200 shadow-lg hover:shadow-2xl hover:shadow-orange-900/5 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Overlay & Play Button */}
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wide border border-white/10">
                        {video.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#f7650b] transition-colors mb-3">
                      {video.title}
                    </h3>

                    <div className="mt-auto flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Clock className="w-4 h-4 text-[#f7650b]" />
                      {video.duration}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No videos found
              </h3>
              <p className="text-slate-500">
                We couldn't find any tutorials matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* --- FAQ Section --- */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Side Info */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Frequently Asked{" "}
                <span className="text-[#f7650b]">Questions</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Can't find the answer you're looking for? Our support team is
                here to help you.
              </p>
              <button className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg">
                Contact Support
              </button>
            </div>
          </div>

          {/* Accordion List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300
                    ${
                      activeFaqIndex === index
                        ? "border-orange-200 shadow-xl shadow-orange-500/5 ring-1 ring-orange-500/10"
                        : "border-slate-100 shadow-sm hover:border-slate-200"
                    }
                 `}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span
                    className={`font-bold text-lg transition-colors ${
                      activeFaqIndex === index
                        ? "text-[#f7650b]"
                        : "text-slate-800"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeFaqIndex === index
                        ? "bg-[#f7650b] text-white rotate-180"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100/50">
                        <div className="pt-4">{faq.answer}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardTraining;
