"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Lock, 
  Mail, 
  User, 
  ArrowRight,
  CheckCircle,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { loginUser, registerUser } from "../services/authService";
import "../sass/fonts.scss";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  // Password validation
  const isPasswordValid = password.length >= 8;

  // Check if we're on client side and determine device type
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    
    // Password validation
    if (!isLogin && !isPasswordValid) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        // Login
        await loginUser({ email, password });
        // Redirect to dashboard on successful login
        router.push("/dashboard");
      } else {
        // Register
        await registerUser({ username, email, password, role: "teacher" });
        // Show success message and switch to login
        setSuccessMessage("Account created successfully! You can now sign in.");
        // Clear form fields
        setUsername("");
        setEmail("");
        setPassword("");
        // Switch to login mode after a delay
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage("");
        }, 5000);
      }
    } catch (error) {
      setError(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(""); // Clear any errors when switching modes
    setSuccessMessage(""); // Clear any success messages
    setPassword(""); // Clear password when switching modes
  };

  // Don't render anything until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Left Side - Image/Content (switches sides based on mode) */}
        <motion.div 
          key={`image-${isLogin ? "left" : "right"}`}
          initial={{ opacity: 0, x: isLogin ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? -50 : 50 }}
          transition={{ duration: 0.5 }}
          className={`relative ${isMobile ? 'h-64' : 'flex-1'} ${!isLogin && !isMobile ? 'order-2' : 'order-1'}`}
        >
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: isLogin 
                ? "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" 
                : "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-emerald-900/70 backdrop-blur-sm"></div>
          </div>
          
          {/* Content overlay */}
          <div className="relative h-full flex flex-col justify-center items-center text-center p-8 z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="mb-4 inline-block p-3 bg-emerald-500/20 rounded-full">
                {isLogin ? (
                  <Lock size={isMobile ? 24 : 32} className="text-emerald-300" />
                ) : (
                  <UserPlus size={isMobile ? 24 : 32} className="text-emerald-300" />
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {isLogin ? "Welcome Back" : "Join Our Community"}
              </h1>
              <p className="text-slate-200 text-sm md:text-base max-w-md mx-auto mb-6">
                {isLogin
                  ? "Log in to access your personalized timetable and continue optimizing your schedule."
                  : "Create an account to start building intelligent, conflict-free schedules with our AI-powered platform."}
              </p>
              
              {!isMobile && (
                <motion.div
                  className="mt-8 flex flex-col gap-4 max-w-xs mx-auto"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {[
                    "AI-powered timetable generation",
                    "Optimize teacher and resource allocation",
                    "Eliminate scheduling conflicts automatically",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-left">
                      <CheckCircle size={16} className="text-emerald-300 flex-shrink-0" />
                      <span className="text-sm text-slate-200">{feature}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Form (switches sides based on mode) */}
        <motion.div 
          key={`form-${isLogin ? "right" : "left"}`}
          initial={{ opacity: 0, x: isLogin ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? 50 : -50 }}
          transition={{ duration: 0.5 }}
          className={`flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-900 ${isLogin && !isMobile ? 'order-2' : 'order-1'}`}
        >
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center justify-center md:justify-start mb-8">
              <Calendar size={32} className="text-emerald-400 mr-2" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Smart Timetable
              </h2>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {isLogin ? "Sign In" : "Create Account"}
              </h2>
              <button
                onClick={toggleMode}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors underline"
              >
                {isLogin ? "Create an account" : "Already have an account?"}
              </button>
            </div>

            {/* Success Message */}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 mb-4 text-sm flex items-start gap-2"
              >
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 text-sm flex items-start gap-2"
              >
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? "login-form" : "signup-form"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {!isLogin && (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="Password"
                      className={`w-full bg-slate-800/50 border ${!isLogin && password && !isPasswordValid ? 'border-red-500' : 'border-slate-700'} rounded-lg py-3 pl-10 pr-10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Password requirements - shown when creating account and password field is focused or has content */}
                  {!isLogin && (passwordFocused || password) && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs space-y-1 px-1"
                    >
                      <div className="flex items-center gap-1">
                        {isPasswordValid ? (
                          <CheckCircle size={12} className="text-emerald-400" />
                        ) : (
                          <XCircle size={12} className="text-red-400" />
                        )}
                        <span className={isPasswordValid ? "text-emerald-400" : "text-red-400"}>
                          At least 8 characters
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {isLogin && (
                  <div className="text-right">
                    <a
                      href="#"
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
                
                {!isLogin && (
                  <p className="text-slate-400 text-sm flex items-center gap-1 mt-4">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    By signing up, you agree to our Terms and Privacy Policy
                  </p>
                )}
              </motion.form>
            </AnimatePresence>

            {/* Social Login Options */}
            <div className="mt-8">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-700 w-full"></div>
                <span className="bg-slate-900 px-2 text-sm text-slate-400 relative">
                  Or continue with
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="py-2.5 px-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors duration-300 flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm">Google</span>
                </button>
                <button className="py-2.5 px-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors duration-300 flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127c-.82-.088-1.643-.13-2.467-.127-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
                  </svg>
                  <span className="text-sm">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}