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
  const scoreColor = finalScore >= 80 ? 'var(--success)' : finalScore >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="theme-dark min-h-screen py-12 px-6 font-[var(--font-sans)] pb-32" style={{ background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-md)] mb-4" style={{ background: 'var(--accent-bg)' }}>
            <Activity className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[12px] text-[var(--accent)] tracking-wide font-medium">{skillName} authentication</span>
          </div>
          <h1 className="text-[32px] font-medium tracking-[-0.02em] text-[var(--text-primary)] mb-2">Verification complete</h1>
          <p className="text-[14px] text-[var(--text-secondary)]">Your test results and AI review have been officially recorded.</p>
        </motion.div>

        {/* Score Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-[var(--radius-lg)] border p-8 sm:p-12 flex flex-col items-center justify-center"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center relative border" style={{ borderColor: 'var(--border-subtle)' }}>
             <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="3"
                  strokeDasharray="289"
                  initial={{ strokeDashoffset: 289 }}
                  animate={{ strokeDashoffset: 289 - (289 * finalScore) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
             </svg>

             <div className="flex flex-col items-center">
                <motion.span
                  className="text-[48px] font-medium tracking-tighter"
                  style={{ color: scoreColor }}
                >
                  {animatedScore}
                </motion.span>
                <span className="text-[12px] text-[var(--text-tertiary)] tracking-wide font-medium mt-1">Total score</span>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* MCQ Breakdown */}
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4 }}
             className="flex flex-col gap-4"
          >
             <h2 className="text-[18px] font-medium flex items-center gap-2 text-[var(--text-primary)]">
               <BadgeCheck className="w-5 h-5 text-[var(--accent)]" />
               Theory audit ({breakdown.mcqPoints} / 40)
             </h2>

             {mcqResults && mcqResults.map((mcq, i) => {
                const boxBg = mcq.isCorrect ? "var(--success-bg)" : "var(--danger-bg)";
                const boxBorder = mcq.isCorrect ? "var(--success)" : "var(--danger)";

                return (
                  <div key={i} className="p-4 rounded-[var(--radius-lg)] border flex flex-col gap-3" style={{ background: boxBg, borderColor: boxBorder + '33' }}>
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-[14px] text-[var(--text-primary)] leading-relaxed font-medium">{mcq.question}</p>
                      {mcq.isCorrect ? <BadgeCheck className="w-5 h-5 text-[var(--success)] shrink-0" /> : <XCircle className="w-5 h-5 text-[var(--danger)] shrink-0" />}
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2 text-[12px]">
                      {!mcq.isCorrect && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                          <span className="opacity-60 font-medium">You picked:</span>
                          <span>{mcq.options[mcq.userAnswerIndex]}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <span className="opacity-60 font-medium">Correct:</span>
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
                <h2 className="text-[18px] font-medium flex items-center gap-2 text-[var(--text-primary)]">
                  <TerminalSquare className="w-5 h-5 text-[var(--accent)]" />
                  Compiler logic ({breakdown.compilerPoints} / 50)
                </h2>
                <div className="p-4 rounded-[var(--radius-lg)] border" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)' }}>
                  {breakdown.compilerPoints === 50 ? (
                    <p className="text-[14px] text-[var(--success)]">Flawless execution! Passed all rigorous edge-case unit tests perfectly without timeout.</p>
                  ) : breakdown.compilerPoints > 0 ? (
                    <p className="text-[14px] text-[var(--warning)]">Code executes successfully but failed several edge-case strict equality unit tests. Review documentation constraints.</p>
                  ) : (
                    <p className="text-[14px] text-[var(--danger)]">Code failed to safely execute or evaluate to correct outputs. Algorithm logically flawed.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-1">
                <h2 className="text-[18px] font-medium flex items-center gap-2 text-[var(--text-primary)]">
                  <BrainCircuit className="w-5 h-5 text-[var(--accent)]" />
                  AI code review ({breakdown.aiPoints} / 10)
                </h2>
                <div className="p-4 rounded-[var(--radius-lg)] border font-[var(--font-mono)] flex-1" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)' }}>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
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
        className="fixed bottom-0 left-0 w-full h-20 z-50 flex items-center justify-center border-t"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 h-9 rounded-[var(--radius-md)] font-medium transition-colors text-[14px]"
        >
          Return to dashboard
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

    </div>
  );
}
