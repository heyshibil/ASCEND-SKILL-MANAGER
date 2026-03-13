import React from 'react';

export default function Login() {
  const handleGithubLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const REDIRECT_URI = 'http://localhost:5000/api/auth/github/callback';

    // We need 'repo' and 'read:user' scopes to scan the user's code later
    const scope = "read:user,repo"

    // Github url
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;

    // Redirect the whole page to github
    window.location.href = githubAuthUrl;
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* --- Background Ambient Gradients --- */}
      {/* Top Left Violet Glow */}
      <div className="absolute top-[-15%] left-[-10%] w-125 h-125 bg-[#312e81] rounded-full mix-blend-screen filter blur-[150px] opacity-25 pointer-events-none"></div>
      
      {/* Bottom Right Deep Indigo/Blue Glow */}
      <div className="absolute bottom-[-15%] right-[-10%] w-150 h-150 bg-[#1a1029] rounded-full mix-blend-screen filter blur-[150px] opacity-30 pointer-events-none"></div>
      
      {/* Center Muted Blue Accent */}
      <div className="absolute top-[40%] left-[60%] w-75 h-75 bg-[#0f172a] rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none"></div>

      {/* --- Main Content Wrapper --- */}
      <div className="relative z-10 w-full max-w-112.5 px-6 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-10 w-full flex flex-col items-center">
          {/* <div className="mb-8">
            <span className="text-2xl font-bold tracking-tighter text-white">Talvix</span>
          </div> */}
          
          <h1 className="text-5xl font-semibold text-white tracking-tight mb-2">
            Welcome to Talvix
          </h1>
          
          <h2 className="text-lg text-slate-300 mb-6 font-medium tracking-tight">
            Understand your skill momentum.
          </h2>
          
          {/* <div className="max-w-[340px] space-y-3">
            <p className="text-sm text-slate-500 leading-relaxed">
              Talvix analyzes your development activity and reveals how your skills evolve over time.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Measure skill liquidity, detect decay, and understand where to focus next.
            </p>
          </div> */}
        </div>

        {/* Login Card */}
        <div className="w-full bg-white/2 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-[0_8px_30px_rgb(49,46,129,0.15)] hover:-translate-y-1px transition-all duration-500 flex flex-col items-center group/card">
          
          <button
            onClick={handleGithubLogin}
            className="group relative flex items-center justify-center w-full gap-3 bg-white/4 hover:bg-white/8 border border-white/10 text-white px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden shadow-lg cursor-pointer"
          >
            {/* Soft inner glow on hover */}
            <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-white/5 to-transparent shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"></div>
            
            {/* GitHub SVG */}
            <svg
              className="w-5 h-5 fill-current relative z-10 group-hover:scale-105 transition-transform duration-300"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="font-medium text-sm tracking-wide relative z-10">Continue with GitHub</span>
          </button>

          <p className="text-[13px] text-slate-500/80 mt-6 text-center w-full px-2">
            We only read public repository data to analyze skill trends.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-10">
          <p className="text-xs text-slate-600 text-center">
            By continuing you agree to our{' '}
            <a href="/terms" className="hover:text-slate-300 transition-colors underline decoration-slate-600/50 underline-offset-4">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="hover:text-slate-300 transition-colors underline decoration-slate-600/50 underline-offset-4">Privacy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}