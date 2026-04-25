import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { verificationService } from "../services/verificationService";
import { Progress } from "../components/ui/progress";

export default function BoostMcqTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skillName = searchParams.get("skill");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState([]);

  useEffect(() => {
    if (!skillName) return navigate("/dashboard/skill-control");
    const fetchTest = async () => {
      try {
        setLoading(true);
        const data = await verificationService.generateBoostTest(skillName, "mcq");
        setMcqQuestions(data.mcqs);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load test.");
        setTimeout(() => navigate("/dashboard/skill-control"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [skillName, navigate]);

  const handleOptionSelect = (index) => {
    const questionId = mcqQuestions[currentMcqIndex].questionId;
    const updatedAnswers = [...mcqAnswers];
    const existingIndex = updatedAnswers.findIndex((a) => a.questionId === questionId);

    if (existingIndex > -1) updatedAnswers[existingIndex].answerIndex = index;
    else updatedAnswers.push({ questionId, answerIndex: index });

    setMcqAnswers(updatedAnswers);

    if (currentMcqIndex < mcqQuestions.length - 1) {
      setTimeout(() => setCurrentMcqIndex((curr) => curr + 1), 300);
    }
  };

  const isOptionSelected = (index) => {
    const qId = mcqQuestions[currentMcqIndex]?.questionId;
    const answer = mcqAnswers.find((a) => a.questionId === qId);
    return answer?.answerIndex === index;
  };

  const handleSubmit = async () => {
    if (mcqAnswers.length < mcqQuestions.length) {
      toast.error("Please answer all questions!");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Analyzing answers...", { id: "mcq-grading" });
      const { result } = await verificationService.submitMcqBoost(skillName, mcqAnswers);
      
      toast.success(
        `Boost complete! You got ${result.correctCount}/5 correct. (+${result.hikeApplied}% hike)`,
        { id: "mcq-grading" }
      );
      setTimeout(() => navigate("/dashboard/skill-control"), 2500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed", { id: "mcq-grading" });
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-indigo-400">Loading Quick Boost...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <Toaster theme="dark" />
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white">MCQ Boost for {skillName}</h1>
        <p className="text-sm text-slate-400 mt-1">+1% hike for each correct answer</p>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <Progress value={(mcqAnswers.length / mcqQuestions.length) * 100} className="h-2 bg-white/5 mb-6" />
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <span className="text-indigo-400 text-xs font-bold uppercase block mb-2">
            Question {currentMcqIndex + 1} of {mcqQuestions.length}
          </span>
          <h2 className="text-xl text-white font-medium">{mcqQuestions[currentMcqIndex]?.question}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mcqQuestions[currentMcqIndex]?.options.map((option, idx) => {
            const selected = isOptionSelected(idx);
            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={`text-left p-5 rounded-xl border transition-all duration-300 ${
                  selected 
                    ? "bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                    : "bg-white/[0.03] border-white/5 hover:bg-white/10"
                }`}
              >
                <span className={`text-sm font-medium ${selected ? "text-indigo-100" : "text-slate-300"}`}>{option}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => setCurrentMcqIndex((c) => Math.max(0, c - 1))}
            disabled={currentMcqIndex === 0}
            className="text-slate-400 disabled:opacity-30 text-sm font-medium"
          >
            ← Previous
          </button>
          
          {currentMcqIndex === mcqQuestions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Submit Boost
            </button>
          ) : (
            <button
              onClick={() => setCurrentMcqIndex((c) => Math.min(mcqQuestions.length - 1, c + 1))}
              className="text-slate-400 text-sm font-medium"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
