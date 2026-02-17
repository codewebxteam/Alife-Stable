import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Image as ImageIcon, Video } from "lucide-react";

const Showcase = ({ data, accentColor }) => {
  const [activeVideo, setActiveVideo] = useState(null);

  // --- 10 DUMMY POSTERS (Insta Size 1:1) ---
  const dummyPosters = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80",
    "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
    "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=800&q=80",
    "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
    "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
    "https://images.unsplash.com/photo-1614851012101-84323a0ae633?w=800&q=80",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
  ];

  // --- 10 DUMMY YT VIDEOS ---
  const dummyVideos = [
    {
      title: "Cinematic Branding",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      service: "Motion Graphics",
    },
    {
      title: "Product Promo",
      url: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
      service: "Video Editing",
    },
    {
      title: "Business Story",
      url: "https://www.youtube.com/watch?v=3JZ_D3i301s",
      service: "Ads Production",
    },
    {
      title: "Social Media Reel",
      url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      service: "Short Form",
    },
    {
      title: "Brand Documentary",
      url: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
      service: "Video Editing",
    },
    {
      title: "Creative Ad 01",
      url: "https://www.youtube.com/watch?v=3JZ_D3i301s",
      service: "Commercial",
    },
    {
      title: "Dynamic Intro",
      url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      service: "VFX",
    },
    {
      title: "Corporate Video",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      service: "Professional",
    },
    {
      title: "Fashion Film",
      url: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
      service: "Styling",
    },
    {
      title: "Tech Showcase",
      url: "https://www.youtube.com/watch?v=3JZ_D3i301s",
      service: "Modern UI",
    },
  ];

  // Use Firestore data if available, else use dummy
  const finalPosters =
    data?.demoPosters?.length > 0 ? data.demoPosters : dummyPosters;
  const finalVideos =
    data?.demoVideos?.length > 0 ? data.demoVideos : dummyVideos;

  const getYTId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <section id="showcase" className="py-24 bg-[#080808] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* --- POSTERS SECTION --- */}
        <div className="mb-32">
          <div className="mb-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white tracking-tighter">
              Demo <span style={{ color: accentColor }}>Posters</span>
            </h2>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mt-2">
              10 Premium Visuals
            </p>
          </div>

          <div className="relative flex overflow-hidden group">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="flex gap-6 whitespace-nowrap"
            >
              {[...finalPosters, ...finalPosters].map((img, i) => (
                <div
                  key={i}
                  className="w-[280px] md:w-[350px] aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 shrink-0 relative group/item"
                >
                  <img
                    src={img}
                    alt="Work"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <ImageIcon className="text-white" size={30} />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* --- VIDEOS SECTION --- */}
        <div id="work">
          <div className="mb-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white tracking-tighter">
              Demo <span style={{ color: accentColor }}>Videos</span>
            </h2>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mt-2">
              10 Cinematic Edits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {finalVideos.map((video, idx) => {
              const videoId = getYTId(video.url);
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                  onClick={() => videoId && setActiveVideo(videoId)}
                >
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                      alt={video.title}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Play fill="black" size={20} className="ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <h4 className="text-lg font-black uppercase italic text-white tracking-tighter">
                      {video.title}
                    </h4>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      {video.service || "Premium Motion"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- VIDEO MODAL --- */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/90"
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X size={35} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-4xl aspect-video rounded-[2rem] overflow-hidden border border-white/10"
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Showcase;
