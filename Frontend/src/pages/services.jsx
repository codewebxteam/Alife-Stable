 import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  Star,
  ArrowRight,
  Filter,
  Quote,
  CheckCircle,
} from "lucide-react";

// --- Mock Data for Courses ---
const courses = [
  {
    id: 1,
    title: "Digital Marketing Mastery",
    category: "Marketing",
    level: "Beginner",
    duration: "6 Weeks",
    rating: 4.8,
    price: "₹999",
    image:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=800&auto=format&fit=crop",
    description:
      "Master SEO, Social Media, and Paid Ads to grow any business from scratch.",
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    category: "Design",
    level: "Intermediate",
    duration: "8 Weeks",
    rating: 4.9,
    price: "₹1,499",
    image:
      "https://images.unsplash.com/photo-1586717791821-3f44a5638d0f?q=80&w=800&auto=format&fit=crop",
    description:
      "Learn to design stunning user interfaces and user experiences using Figma.",
  },
  {
    id: 3,
    title: "Full Stack Web Development",
    category: "Tech",
    level: "Advanced",
    duration: "12 Weeks",
    rating: 4.7,
    price: "₹2,999",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
    description:
      "Become a full-stack developer with React, Node.js, and modern database skills.",
  },
  {
    id: 4,
    title: "Content Creation Blueprint",
    category: "Content",
    level: "Beginner",
    duration: "4 Weeks",
    rating: 4.6,
    price: "₹799",
    image:
      "https://images.unsplash.com/photo-1499750310159-5420a525a65d?q=80&w=800&auto=format&fit=crop",
    description:
      "Learn how to create viral content for Instagram, YouTube, and LinkedIn.",
  },
  {
    id: 5,
    title: "Data Analytics for Business",
    category: "Business",
    level: "Intermediate",
    duration: "10 Weeks",
    rating: 4.8,
    price: "₹1,999",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    description:
      "Make data-driven decisions with Excel, SQL, and Power BI mastery.",
  },
  {
    id: 6,
    title: "Freelancing 101",
    category: "Business",
    level: "Beginner",
    duration: "2 Weeks",
    rating: 4.9,
    price: "₹499",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    description:
      "Start your freelancing journey, find clients, and manage projects effectively.",
  },
];

// --- Mock Data for Reviews ---
const reviews = [
  {
    id: 1,
    name: "Aarav Patel",
    role: "Marketing Intern",
    text: "The Digital Marketing course changed my career. I landed an internship within weeks!",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Freelance Designer",
    text: "UI/UX Fundamentals was exactly what I needed. The Figma tutorials are top-notch.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Rohan Gupta",
    role: "Web Developer",
    text: "I built my entire portfolio using the Full Stack projects. Highly recommended!",
    image: "https://randomuser.me/api/portraits/men/86.jpg",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    role: "Content Creator",
    text: "Finally, a course that teaches practical content strategy, not just theory.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

const categories = [
  "All",
  "Marketing",
  "Design",
  "Tech",
  "Content",
  "Business",
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const Services = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      activeCategory === "All" || course.category === activeCategory;
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      {/* =========================================
          1. COURSES HERO SECTION (Animated)
      ========================================= */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-white via-white via-75% to-[#f7650b] pt-20 pb-20 lg:pt-28 lg:pb-28">
        {/* --- Animated Background Elements --- */}
        <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none border-slate-200/60 z-0">
          <div className="absolute left-1/2 top-0 bottom-0 w-px border-slate-200/60 -translate-x-1/2 hidden lg:block"></div>
        </div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -right-[5%] w-[70vw] h-[70vw] bg-gradient-to-t from-[#f7650b] via-[#fa8b3e] to-transparent opacity-20 blur-[130px] rounded-full pointer-events-none z-0"
        />

        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] bg-orange-200 opacity-20 blur-[100px] rounded-full pointer-events-none z-0"
        />

        {/* --- Content --- */}
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 items-center gap-12 lg:gap-0">
          {/* Left Side: Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center lg:items-start gap-6 max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
          >
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[#f7650b] text-xs font-bold tracking-widest uppercase shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f7650b]"></span>
              </span>
              Learning Hub
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]"
            >
              Master Skills That{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-[#f7650b]">
                Define The Future.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg"
            >
              Browse our comprehensive library of courses. From coding to
              content creation, find the perfect path to upgrade your career.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2 w-full"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-[#f7650b] text-white font-semibold text-lg hover:bg-[#e65a0a] transition-all shadow-xl shadow-orange-500/20"
              >
                View All Courses
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Side: 3D Rotating Sphere with Float Animation */}
          <div className="relative w-full h-[350px] lg:h-[600px] flex items-center justify-center lg:justify-end perspective-1000">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative w-[280px] h-[280px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] lg:-mr-10 flex items-center justify-center"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: -360,
                }}
                transition={{
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                }}
                className="w-full h-full flex items-center justify-center relative"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-200/40 to-transparent blur-3xl -z-10"></div>

                {/* BALL 2 IMAGE */}
                <img
                  src="/assets/ball2.webp"
                  alt="AI Sphere 2"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />

                {/* Fallback */}
                <div className="hidden w-full h-full rounded-full border border-slate-200 bg-white/10 backdrop-blur-sm items-center justify-center text-slate-500 text-center p-10 shadow-inner">
                  <div>
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-medium">Image Missing</p>
                    <p className="text-xs mt-1 text-slate-400">
                      Add ball2.webp to assets
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* =========================================
          2. COURSE LISTING SECTION
      ========================================= */}
      <div className="max-w-7xl mx-auto px-6 pb-24 -mt-20 relative z-20">
        {/* Search & Filters Card */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Categories */}
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-2">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border relative overflow-hidden
                         ${
                           activeCategory === cat
                             ? "bg-[#f7650b] text-white border-[#f7650b] shadow-md shadow-orange-500/20"
                             : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:border-orange-200 hover:text-[#f7650b]"
                         }`}
                  >
                    {cat}
                    {activeCategory === cat && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-[#f7650b] rounded-full -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for a course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#f7650b] focus:ring-2 focus:ring-[#f7650b]/10 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Course Grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <motion.div
                  layout
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.7 }}
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-900 shadow-sm uppercase tracking-wide">
                      {course.category}
                    </div>
                    <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {course.rating}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 sm:p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-[#f7650b] transition-colors">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-4">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                        <BookOpen className="w-3.5 h-3.5 text-[#f7650b]" />{" "}
                        {course.level}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-[#f7650b]" />{" "}
                        {course.duration}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow border-t border-slate-100 pt-4">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Course Fee
                        </span>
                        <div className="text-2xl font-bold text-slate-900">
                          {course.price}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ rotate: -45 }}
                        className="w-12 h-12 rounded-full bg-slate-50 text-slate-900 flex items-center justify-center group-hover:bg-[#f7650b] group-hover:text-white transition-colors duration-300 shadow-sm group-hover:shadow-orange-500/30"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-24 text-center"
              >
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Filter className="w-8 h-8 text-[#f7650b]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  No courses found
                </h3>
                <p className="text-slate-500 mt-2">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                  }}
                  className="mt-6 px-6 py-2.5 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* =========================================
          3. ANIMATED STUDENTS REVIEW SECTION
      ========================================= */}
      <div className="bg-[#fff4eb] py-24 relative overflow-hidden">
        {/* Decorative Background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#f7650b]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f7650b]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-100 text-[#f7650b] text-xs font-bold uppercase tracking-wider shadow-sm mb-4"
            >
              <Star className="w-3 h-3 fill-orange-500" />
              Student Success Stories
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-slate-900"
            >
              Loved by <span className="text-[#f7650b]">Learners.</span>
            </motion.h2>
          </div>

          {/* Reviews Grid with Staggered Animation */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[2rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 relative group"
              >
                <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-12 h-12 text-[#f7650b]" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border-2 border-white">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">
                      {review.name}
                    </h4>
                    <p className="text-[#f7650b] text-xs font-bold uppercase tracking-wide">
                      {review.role}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 text-lg italic leading-relaxed relative z-10">
                  "{review.text}"
                </p>

                <div className="flex gap-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-slate-900/20"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            {/* Orange glow blob for theme consistency */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#f7650b] opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#f7650b] opacity-10 rounded-full blur-3xl"></div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to start your journey?
              </h3>
              <p className="text-slate-300 mb-8 text-lg">
                Join thousands of students who are already learning and growing
                with us.
              </p>
              <button className="px-8 py-3.5 bg-[#f7650b] text-white rounded-full font-bold text-lg hover:bg-[#e65a0a] hover:scale-105 transition-all shadow-lg shadow-orange-500/25">
                Get Started Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Services;
