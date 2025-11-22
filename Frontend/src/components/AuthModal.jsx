import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  CreditCard,
  Ticket,
  Globe,
  Loader2,
  Smartphone,
  Building2, // Icon for City
} from "lucide-react";

// --- Firebase Imports ---
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  EmailAuthProvider,
  linkWithCredential,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
// ⚠️ IMPORTANT: Yahan apni REAL KEYS dalein ⚠️
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// --- Initialize Firebase ---
let app;
let auth;
let db;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  // Use device language for auth (e.g. SMS templates)
  auth.useDeviceLanguage();
} catch (e) {
  console.error("Firebase init error:", e);
}

// --- Mock Data ---
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Other",
];

const PLANS = [
  { id: "starter", name: "Pro Starter - ₹999" },
  { id: "elite", name: "Premium Elite - ₹2,499" },
  { id: "supreme", name: "Supreme Master - ₹4,999" },
];

const AuthModal = ({ isOpen, onClose }) => {
  // Views: 'login', 'login-otp', 'signup-step-1', 'signup-step-2', 'otp-verify'
  const [view, setView] = useState("login");
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Form States ---
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState(""); // NEW: City State
  const [pincode, setPincode] = useState("");

  const [selectedPlan, setSelectedPlan] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // OTP State (Now 6 Digits)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  // Reset on Close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView("login");
        setLoginIdentifier("");
        setLoginPassword("");
        setLoginPhone("");
        setEmail("");
        setFullName("");
        setPhone("");
        setSelectedState("");
        setCity("");
        setPincode("");
        setSelectedPlan("");
        setPromoCode("");
        setSignupPassword("");
        setStrength(0);
        setOtp(["", "", "", "", "", ""]);
        setError("");
        setLoading(false);
        setConfirmationResult(null);
      }, 300);
    }
  }, [isOpen]);

  // Password Strength Logic
  useEffect(() => {
    let score = 0;
    if (!signupPassword) {
      setStrength(0);
      return;
    }
    if (signupPassword.length > 5) score += 1;
    if (signupPassword.length > 8) score += 1;
    if (/[0-9]/.test(signupPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(signupPassword)) score += 1;
    setStrength(score);
  }, [signupPassword]);

  // --- Recaptcha Setup ---
  const setupRecaptcha = () => {
    // Clear previous instance if any
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn(e);
      }
      window.recaptchaVerifier = null;
    }

    // Initialize new Recaptcha
    // 'recaptcha-container' div must be present in DOM
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha verified");
        },
        "expired-callback": () => {
          setError("Recaptcha expired. Please try again.");
          setLoading(false);
        },
      }
    );
  };

  // --- Helpers ---
  const getAppId = () =>
    typeof __app_id !== "undefined" ? __app_id : "default-app";

  const navigateTo = (newView) => {
    setDirection(1);
    setView(newView);
    setError("");
    setOtp(["", "", "", "", "", ""]); // Reset 6 digit OTP
  };

  // --- 1. Login (Phone/Email + Password) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
      alert(
        "Error: Please replace 'YOUR_API_KEY_HERE' in AuthModal.jsx with your real Firebase Key."
      );
      return;
    }
    setLoading(true);
    setError("");

    try {
      let emailToLogin = loginIdentifier;
      const isPhone = /^\d+$/.test(loginIdentifier);

      if (isPhone) {
        const appId = getAppId();
        const lookupRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "user_lookup",
          loginIdentifier
        );
        const lookupSnap = await getDoc(lookupRef);

        if (lookupSnap.exists()) {
          emailToLogin = lookupSnap.data().email;
        } else {
          throw new Error("Phone number not found. Please Sign Up.");
        }
      }

      await signInWithEmailAndPassword(auth, emailToLogin, loginPassword);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.message === "Phone number not found. Please Sign Up."
          ? err.message
          : "Invalid credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Login via OTP (Request) ---
  const handleLoginOtpRequest = async (e) => {
    e.preventDefault();
    if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
      alert("Please put your Real API Key in AuthModal.jsx code.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = `+91${loginPhone}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      setConfirmationResult(confirmation);
      setLoading(false);
      navigateTo("otp-verify");
    } catch (err) {
      console.error(err);
      setLoading(false);
      if (err.message.includes("auth/invalid-api-key")) {
        setError("Invalid API Key in code.");
      } else if (err.message.includes("auth/unauthorized-domain")) {
        setError("Domain not authorized in Firebase Console.");
      } else {
        setError("Failed to send OTP. Check console for details.");
      }
    }
  };

  // --- 3. Signup Steps ---
  const handleSignupStep1 = (e) => {
    e.preventDefault();
    // Added 'city' to validation
    if (!email || !fullName || !phone || !selectedState || !city || !pincode) {
      setError("Please fill all fields");
      return;
    }
    navigateTo("signup-step-2");
  };

  const handleSignupFinal = async (e) => {
    e.preventDefault();
    if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
      alert("Please put your Real API Key in AuthModal.jsx code.");
      return;
    }
    if (!selectedPlan || !signupPassword) {
      setError("Please select a plan and password");
      return;
    }
    setLoading(true);
    setError("");

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = `+91${phone}`;
      console.log("Sending OTP to:", formattedPhone); // Debug log

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      console.log("OTP Sent!");
      setConfirmationResult(confirmation);
      setLoading(false);
      navigateTo("otp-verify");
    } catch (err) {
      console.error("Signup Error:", err);
      setLoading(false);
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Error: Add this domain to Firebase Authorized Domains.");
      } else {
        setError(err.message || "Failed to send OTP.");
      }
    }
  };

  // --- 4. OTP Verification (6 Digits) ---
  const handleOtpVerify = async () => {
    setLoading(true);
    setError("");
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Enter 6-digit OTP");
      setLoading(false);
      return;
    }

    if (!confirmationResult) {
      setError("Session expired. Please go back and try again.");
      setLoading(false);
      return;
    }

    try {
      // A. Verify OTP
      const result = await confirmationResult.confirm(otpCode);
      const user = result.user;

      // If signing up, link credentials and save profile
      if (signupPassword) {
        // B. Link Email/Password
        const credential = EmailAuthProvider.credential(email, signupPassword);
        await linkWithCredential(user, credential);
        await updateProfile(user, { displayName: fullName });

        // C. Save Data (Added City)
        const appId = getAppId();

        await setDoc(
          doc(
            db,
            "artifacts",
            appId,
            "users",
            user.uid,
            "profile",
            "account_info"
          ),
          {
            fullName,
            email,
            phone,
            state: selectedState,
            city, // Save City
            pincode,
            plan: selectedPlan,
            promoCode,
            joinedAt: new Date().toISOString(),
            role: "student",
          }
        );

        await setDoc(
          doc(db, "artifacts", appId, "public", "user_lookup", phone),
          {
            email: email,
          }
        );
      }

      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      if (err.code === "auth/credential-already-in-use") {
        setError("This email or phone is already registered.");
      } else if (err.code === "auth/invalid-verification-code") {
        setError("Incorrect OTP.");
      } else {
        setError("Verification failed. Please try again.");
      }
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && element.nextSibling) element.nextSibling.focus();
  };

  // Helper for Strength Color
  const getStrengthColor = () => {
    if (strength === 0) return "bg-slate-200";
    if (strength <= 2) return "bg-red-500";
    if (strength === 3) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength === 0) return "Weak";
    if (strength <= 2) return "Weak";
    if (strength === 3) return "Medium";
    return "Strong";
  };

  if (!isOpen) return null;

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 200 : -200, opacity: 0 }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60]"
          />

          {/* Recaptcha Container */}
          <div id="recaptcha-container"></div>

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-[95%] sm:w-full sm:max-w-md bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto relative flex flex-col max-h-[95dvh]"
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors z-30 backdrop-blur-md border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="relative h-28 bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center transition-all duration-300">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#f7650b] rounded-full blur-[60px]"
                />

                <div className="relative z-10 text-center px-4 mt-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                    {view.includes("login") && "Welcome Back"}
                    {view.includes("signup") && "Create Account"}
                    {view === "otp-verify" && "Verification"}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium">
                    {view === "login" && "Login with Phone or Email"}
                    {view === "login-otp" && "Login without password"}
                    {view.includes("signup") && "Join our community today"}
                    {view === "otp-verify" && "Enter 6-digit OTP"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide p-6 sm:p-8 relative bg-slate-50/50">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold text-center">
                    {error}
                  </div>
                )}

                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  {/* --- VIEW: LOGIN --- */}
                  {view === "login" && (
                    <motion.div
                      key="login"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full"
                    >
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Email OR Phone
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="text"
                              value={loginIdentifier}
                              onChange={(e) =>
                                setLoginIdentifier(e.target.value)
                              }
                              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#f7650b] transition-all font-medium text-slate-800 text-sm"
                              placeholder="98765XXXXX or email@site.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="w-full pl-12 pr-12 py-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#f7650b] transition-all font-medium text-slate-800 text-sm"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <button
                            type="button"
                            onClick={() => navigateTo("login-otp")}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800"
                          >
                            Login via OTP instead
                          </button>
                          <a
                            href="#"
                            className="text-xs font-bold text-[#f7650b] hover:underline"
                          >
                            Forgot Password?
                          </a>
                        </div>

                        <button
                          disabled={loading}
                          className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-base shadow-lg hover:bg-[#f7650b] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            "Login Now"
                          )}{" "}
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </form>
                      <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                          Don't have an account?{" "}
                          <button
                            onClick={() => navigateTo("signup-step-1")}
                            className="text-slate-900 font-bold hover:text-[#f7650b]"
                          >
                            Sign Up
                          </button>
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* --- VIEW: LOGIN OTP (Alternative) --- */}
                  {view === "login-otp" && (
                    <motion.div
                      key="login-otp"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full"
                    >
                      <form
                        onSubmit={handleLoginOtpRequest}
                        className="space-y-4"
                      >
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="tel"
                              value={loginPhone}
                              onChange={(e) =>
                                setLoginPhone(
                                  e.target.value.replace(/\D/g, "").slice(0, 10)
                                )
                              }
                              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#f7650b] transition-all font-medium text-slate-800 text-sm"
                              placeholder="Enter 10 digit number"
                            />
                          </div>
                        </div>
                        <button
                          disabled={loading}
                          className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-base shadow-lg hover:bg-[#f7650b] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            "Get OTP"
                          )}{" "}
                          <Smartphone className="w-5 h-5" />
                        </button>
                      </form>
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => navigateTo("login")}
                          className="text-sm text-slate-500 hover:text-slate-900 font-bold"
                        >
                          Back to Password Login
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* --- VIEW: SIGNUP STEP 1 --- */}
                  {view === "signup-step-1" && (
                    <motion.div
                      key="signup-step-1"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full"
                    >
                      <form onSubmit={handleSignupStep1} className="space-y-3">
                        {/* Email & Name */}
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#f7650b] transition-all text-sm font-medium outline-none"
                          />
                        </div>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#f7650b] transition-all text-sm font-medium outline-none"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="tel"
                            placeholder="Contact Number"
                            required
                            value={phone}
                            onChange={(e) =>
                              setPhone(
                                e.target.value.replace(/\D/g, "").slice(0, 10)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#f7650b] transition-all text-sm font-medium outline-none"
                          />
                        </div>

                        {/* State & City Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                              required
                              value={selectedState}
                              onChange={(e) => setSelectedState(e.target.value)}
                              className="w-full pl-10 pr-2 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#f7650b] transition-all text-sm font-medium text-slate-600 outline-none appearance-none"
                            >
                              <option value="" disabled>
                                State
                              </option>
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="City"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full pl-10 pr-2 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#f7650b] transition-all text-sm font-medium outline-none"
                            />
                          </div>
                        </div>

                        {/* Pincode */}
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Enter Pin Code"
                            required
                            maxLength={6}
                            value={pincode}
                            onChange={(e) =>
                              setPincode(e.target.value.replace(/\D/g, ""))
                            }
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#f7650b] transition-all text-sm font-medium outline-none"
                          />
                        </div>

                        <button className="w-full mt-2 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-[#f7650b] transition-all flex items-center justify-center gap-2">
                          Next Page <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => navigateTo("login")}
                          className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                        >
                          Already have an account? Login
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* --- VIEW: SIGNUP STEP 2 --- */}
                  {view === "signup-step-2" && (
                    <motion.div
                      key="signup-step-2"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full"
                    >
                      <form onSubmit={handleSignupFinal} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Select Your Plan
                          </label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                              required
                              value={selectedPlan}
                              onChange={(e) => setSelectedPlan(e.target.value)}
                              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#f7650b] transition-all text-sm font-medium text-slate-600 outline-none appearance-none"
                            >
                              <option value="" disabled>
                                Choose a plan...
                              </option>
                              {PLANS.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Promo Code
                          </label>
                          <div className="relative">
                            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Optional"
                              value={promoCode}
                              onChange={(e) =>
                                setPromoCode(e.target.value.toUpperCase())
                              }
                              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#f7650b] transition-all text-sm font-medium outline-none"
                            />
                          </div>
                        </div>

                        {/* Password Field with Strength Bar */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Secure Account
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create Password"
                              required
                              value={signupPassword}
                              onChange={(e) =>
                                setSignupPassword(e.target.value)
                              }
                              className="w-full pl-10 pr-12 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#f7650b] transition-all text-sm font-medium outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* UPDATED: Animated Strength Bar */}
                          {signupPassword && (
                            <div className="mt-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                                <span>Strength</span>
                                <span
                                  className={
                                    strength <= 2
                                      ? "text-red-500"
                                      : strength === 3
                                      ? "text-orange-500"
                                      : "text-green-500"
                                  }
                                >
                                  {getStrengthLabel()}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(strength / 4) * 100}%`,
                                  }}
                                  className={`h-full rounded-full ${getStrengthColor()}`}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex gap-3">
                          <button
                            type="button"
                            onClick={() => navigateTo("signup-step-1")}
                            className="px-4 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 rounded-xl bg-[#f7650b] text-white font-bold text-base hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                          >
                            {loading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                Send OTP <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* --- VIEW: OTP VERIFY (6 DIGIT) --- */}
                  {view === "otp-verify" && (
                    <motion.div
                      key="otp-verify"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full flex flex-col items-center text-center"
                    >
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-inner border border-green-100">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        Verification Code
                      </h3>
                      <p className="text-sm text-slate-500 mb-8">
                        Enter 6-digit code sent to +91 {phone || loginPhone}
                      </p>

                      {/* 6 Digit Input Grid */}
                      <div className="flex gap-2 mb-8">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target, index)}
                            className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 border-slate-200 text-center text-lg sm:text-xl font-bold text-slate-900 focus:border-[#f7650b] focus:outline-none transition-all bg-white shadow-sm"
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleOtpVerify}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-base shadow-xl hover:bg-[#f7650b] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Verify & Proceed"
                        )}
                      </button>
                      <button
                        onClick={() => navigateTo("login")}
                        className="mt-6 text-xs text-slate-400 font-bold hover:text-slate-800"
                      >
                        Cancel Verification
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
