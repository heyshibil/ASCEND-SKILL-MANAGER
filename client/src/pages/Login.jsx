import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuthStore();

  // Component States
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    careergoal: "",
  });

  // Check if user just verified their email
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccess("Email verified successfully! You can now sign in.");
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleGithubLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const REDIRECT_URI = "http://localhost:5000/api/auth/github/callback";
    const scope = "read:user,repo";
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user types
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const response = await login(formData.email, formData.password);

        // RBAC
        if (response.user.role === "admin") {
          navigate("/admin");
        } else {
          response.user.onboardingStatus === "completed"
            ? navigate("/dashboard")
            : navigate("/discovery");
        }
      } else {
        // --- REGISTER FLOW ---
        const response = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          careerGoal: formData.careergoal,
        });

        setSuccess(response?.message || "Please check your email to verify.");
        setFormData({ username: "", email: "", password: "", careergoal: "" });
        setIsLogin(true);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* --- Background Ambient Gradients --- */}
      <div className="absolute top-[-15%] left-[-10%] w-125 h-125 bg-[#312e81] rounded-full mix-blend-screen filter blur-[150px] opacity-25 pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-150 h-150 bg-[#1a1029] rounded-full mix-blend-screen filter blur-[150px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-[40%] left-[60%] w-75 h-75 bg-[#0f172a] rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none"></div>

      {/* --- Main Content Wrapper --- */}
      <div className="relative z-10 w-full max-w-112.5 px-6 flex flex-col items-center py-12">
        {/* Header Section */}
        <div className="text-center mb-8 w-full flex flex-col items-center">
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-2">
            Welcome to Ascend
          </h1>
          <h2 className="text-md text-slate-400 mb-2 font-medium tracking-tight">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
        </div>

        {/* Status Messages (Error / Success) */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="w-full mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl text-center">
            {success}
          </div>
        )}

        {/* Login/Register Card */}
        <div className="w-full bg-white/2 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-[0_8px_30px_rgb(49,46,129,0.15)] transition-all duration-500 flex flex-col group/card">
          <button
            onClick={handleGithubLogin}
            type="button"
            className="group relative flex items-center justify-center w-full gap-3 bg-white/4 hover:bg-white/8 border border-white/10 text-white px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden shadow-lg cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"></div>
            <svg
              className="w-5 h-5 fill-current relative z-10 group-hover:scale-105 transition-transform duration-300"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="font-medium text-sm tracking-wide relative z-10">
              Continue with GitHub
            </span>
          </button>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/5"></div>
            <span className="px-3 text-xs text-slate-500 font-medium">OR</span>
            <div className="flex-1 border-t border-white/5"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="e.g. dev_johndoe"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">
                    Career Goal
                  </label>
                  <input
                    type="text"
                    name="careergoal"
                    value={formData.careergoal}
                    onChange={handleInputChange}
                    placeholder="e.g. Frontend Engineer, DevOps"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-600"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                minLength="8"
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full font-medium px-4 py-3.5 rounded-xl transition-all text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer
                ${
                  loading
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-slate-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                }`}
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <span className="text-indigo-400">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="text-indigo-400">Sign in</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
