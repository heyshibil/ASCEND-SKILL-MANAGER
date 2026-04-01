import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, XCircle, ChevronRight, TerminalSquare, BrainCircuit, Activity } from 'lucide-react';

export default function ScoreReport() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // The invisible payload dropped by React Router navigate!
  const state = location.state;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // If they manually try visiting /report without taking a test, redirect them
    if (!state || !state.report) {
      navigate('/dashboard');
      return;
    }

    // Framer smooth counter animation logic
    let startTimestamp = null;
    const duration = 2000; // 2 seconds to count up
    const finalScore = state.report.finalScore;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart formula so it slows down near the top
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      setAnimatedScore(Math.floor(easeProgress * finalScore));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [state, navigate]);

  if (!state || !state.report) return null;

  const { report, skillName } = state;
  const { breakdown, finalScore, feedback, mcqResults } = report;

  // Determine the Color mapping based on score
  const scoreColor = finalScore >= 80 ? '#22c55e' : finalScore >= 50 ? '#eab308' : '#ef4444';
  const scoreShadow = finalScore >= 80 ? 'rgba(34, 197, 94, 0.4)' : finalScore >= 50 ? 'rgba(234, 179, 8, 0.4)' : 'rgba(239, 68, 68, 0.4)';

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white py-12 px-6 relative overflow-hidden font-sans pb-32">
      {/* Immersive Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900 rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-900 rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-10">
        
        {/* Header Text */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-indigo-200 tracking-wide uppercase font-semibold">{skillName} Authentication</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">Verification Complete</h1>
          <p className="text-slate-400">Your test results and AI review have been officially recorded.</p>
        </motion.div>

        {/* Massive Score Circle Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          <div 
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] bg-black/20 border border-white/5"
            style={{ boxShadow: `0 0 60px ${scoreShadow}` }}
          >
             {/* Animated SVG Circle outline */}
             <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="48" 
                  fill="none" 
                  stroke={scoreColor} 
                  strokeWidth="4" 
                  strokeDasharray="301"
                  initial={{ strokeDashoffset: 301 }}
                  animate={{ strokeDashoffset: 301 - (301 * finalScore) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                  className="drop-shadow-lg"
                />
             </svg>
             
             <div className="flex flex-col items-center">
                <motion.span 
                  className="text-6xl sm:text-7xl font-bold tracking-tighter"
                  style={{ color: scoreColor }}
                >
                  {animatedScore}
                </motion.span>
                <span className="text-slate-400 text-sm tracking-widest uppercase font-medium mt-1">Total Score</span>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* MCQ Breakdown List */}
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4 }}
             className="flex flex-col gap-4"
          >
             <h2 className="text-xl font-semibold flex items-center gap-2">
               <BadgeCheck className="w-5 h-5 text-indigo-400" />
               Theory Audit ({breakdown.mcqPoints} / 40)
             </h2>
             
             {mcqResults && mcqResults.map((mcq, i) => {
                // Determine the style string cleanly!
                const boxStyle = mcq.isCorrect 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-red-500/10 border-red-500/30";
                
                return (
                  <div key={i} className={`p-5 rounded-xl border flex flex-col gap-3 transition-colors ${boxStyle}`}>
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-sm text-slate-200 leading-relaxed font-medium">{mcq.question}</p>
                      {mcq.isCorrect ? <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2 text-xs">
                      {!mcq.isCorrect && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200">
                          <span className="opacity-60 font-medium">You picked:</span>
                          <span>{mcq.options[mcq.userAnswerIndex]}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                        <span className="opacity-60 font-medium">Correct Answer:</span>
                        <span>{mcq.options[mcq.correctAnswerIndex]}</span>
                      </div>
                    </div>
                  </div>
                );
             })}
          </motion.div>

          {/* Compiler & AI Feedback */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.6 }}
             className="flex flex-col gap-6"
          >
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <TerminalSquare className="w-5 h-5 text-indigo-400" />
                  Compiler Logic ({breakdown.compilerPoints} / 50)
                </h2>
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                  {breakdown.compilerPoints === 50 ? (
                    <p className="text-sm text-emerald-300">Flawless execution! Passed all rigorous edge-case unit tests perfectly without timeout.</p>
                  ) : breakdown.compilerPoints > 0 ? (
                    <p className="text-sm text-yellow-300">Code executes successfully but failed several edge-case strict equality unit tests. Review documentation constraints.</p>
                  ) : (
                    <p className="text-sm text-red-300">Code failed to safely execute or evaluate to correct outputs. Algorithm logically flawed.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-1">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                  AI Code Review ({breakdown.aiPoints} / 10)
                </h2>
                <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl font-mono relative flex-1">
                  <div className="absolute top-0 left-0 w-full h-8 bg-black/40 border-b border-slate-800 flex items-center px-4 gap-2 rounded-t-xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    <span className="ml-2 text-[10px] text-slate-500">review.sh</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mt-6 whitespace-pre-wrap">
                    $ ./audit --analyze <br/><br/>
                    {feedback}
                  </p>
                </div>
              </div>
          </motion.div>

        </div>

      </div>

      {/* Fixed Bottom Action Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-0 left-0 w-full h-24 bg-black/60 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      >
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-white/20 hover:scale-105 cursor-pointer"
        >
          Return to Dashboard
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>

    </div>
  );
}
