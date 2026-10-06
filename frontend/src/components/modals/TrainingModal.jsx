import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  X,
  Award,
  Zap,
} from 'lucide-react';
import { getTrainingModules, completeTrainingModule } from '@api/training';

export default function TrainingModal({ isOpen, domain = 'Technology', onClose, onCompleted }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [module, setModule] = useState(null);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' | 'quiz' | 'result'
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchModule = async () => {
      setLoading(true);
      setError(null);
      setSelectedAnswers({});
      setQuizResult(null);
      setActiveTab('lesson');

      try {
        const res = await getTrainingModules({ domain });
        const list = res.data?.data || res.data || [];
        if (isMounted) {
          if (list.length > 0) {
            setModule(list[0]);
          } else {
            // Fallback: fetch without domain filter
            const fallbackRes = await getTrainingModules();
            const fallbackList = fallbackRes.data?.data || fallbackRes.data || [];
            setModule(fallbackList[0] || null);
          }
        }
      } catch (err) {
        console.error('Failed to load training module:', err);
        if (isMounted) setError('Failed to load training course. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchModule();
    return () => {
      isMounted = false;
    };
  }, [isOpen, domain]);

  if (!isOpen) return null;

  const handleOptionSelect = (qIdx, optIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const allAnswered =
    module?.questions?.length > 0 &&
    module.questions.every((_, idx) => selectedAnswers[idx] !== undefined);

  const handleSubmitQuiz = async () => {
    if (!module || submitting) return;

    const answersArray = module.questions.map((_, idx) => selectedAnswers[idx]);
    setSubmitting(true);
    setError(null);

    try {
      const res = await completeTrainingModule(module._id, { answers: answersArray });
      const data = res.data?.data || res.data;
      setQuizResult(data);
      setActiveTab('result');

      if (data.passed && onCompleted) {
        onCompleted(data);
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setQuizResult(null);
    setActiveTab('quiz');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0F1424] border-2 border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden arcade-panel my-8">
        {/* Top Header */}
        <div className="p-6 border-b-2 border-slate-800 flex items-start justify-between gap-4 bg-[#090C15]/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <GraduationCap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {module?.domain || domain}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> +25 EXP REWARD
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-bold">
                  ★ BYPASS 48H COOLDOWN
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold font-display text-slate-100 tracking-tight mt-1">
                {module?.title || 'Domain Training & Cooldown Bypass'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-slate-800/80 flex items-center gap-2 bg-[#06080E]/40 font-mono text-xs">
          <button
            onClick={() => setActiveTab('lesson')}
            className={`px-4 py-2 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'lesson'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>[1] LESSON NOTES</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>[2] QUIZ ASSESSMENT</span>
          </button>
          {quizResult && (
            <button
              onClick={() => setActiveTab('result')}
              className={`px-4 py-2 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'result'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>[3] RESULTS ({quizResult.score}%)</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">LOADING CURRICULUM DATA...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && module && (
            <>
              {/* TAB 1: LESSON NOTES */}
              {activeTab === 'lesson' && (
                <div className="space-y-4">
                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs text-cyan-200/90 leading-relaxed font-sans">
                    💡 <strong>Objective:</strong> {module.description} Complete the 3-question quiz with an{' '}
                    <strong>80% or higher</strong> score to immediately clear your application cooldown and reapply.
                  </div>

                  <div className="p-5 rounded-xl bg-[#06080E] border border-slate-800 text-xs text-slate-300 font-sans space-y-4 leading-relaxed whitespace-pre-line">
                    {module.content}
                  </div>
                </div>
              )}

              {/* TAB 2: QUIZ ASSESSMENT */}
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
                    <span className="text-slate-400">PASSING GRADE: ≥ 80% (3/3 Required)</span>
                    <span className="text-amber-400 font-bold">
                      {Object.keys(selectedAnswers).length} / {module.questions.length} ANSWERED
                    </span>
                  </div>

                  {module.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl bg-[#06080E] border border-slate-800 space-y-3"
                    >
                      <div className="font-bold text-slate-200 text-xs sm:text-sm font-sans flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[11px] shrink-0">
                          Q{qIdx + 1}
                        </span>
                        <span>{q.question}</span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleOptionSelect(qIdx, optIdx)}
                              className={`w-full text-left p-3 rounded-lg text-xs font-sans transition-all flex items-center justify-between border ${
                                isSelected
                                  ? 'bg-amber-500/15 border-amber-400/80 text-amber-200 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                  : 'bg-[#090C15] border-slate-800/80 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-400 text-black'
                                    : 'border-slate-600 bg-transparent'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: QUIZ RESULTS */}
              {activeTab === 'result' && quizResult && (
                <div className="space-y-6">
                  {/* Verdict Banner */}
                  <div
                    className={`p-6 rounded-xl border-2 text-center space-y-2 ${
                      quizResult.passed
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(0,245,160,0.2)]'
                        : 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                    }`}
                  >
                    <div className="inline-flex p-3 rounded-full bg-[#06080E] border border-slate-800 mb-1">
                      {quizResult.passed ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                      ) : (
                        <XCircle className="w-8 h-8 text-rose-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-black font-display text-slate-100">
                      {quizResult.passed ? 'TRAINING CERTIFIED — COOLDOWN BYPASSED!' : 'PASSING GRADE NOT MET'}
                    </h3>
                    <div className="text-2xl font-black font-mono">
                      <span className={quizResult.passed ? 'text-emerald-400' : 'text-rose-400'}>
                        {quizResult.score}%
                      </span>
                      <span className="text-xs text-slate-400 font-sans ml-2">
                        ({quizResult.correctCount}/{quizResult.totalQuestions} Correct)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans max-w-md mx-auto">
                      {quizResult.message}
                    </p>
                  </div>

                  {/* Question Review */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Assessment Review & Explanations:
                    </h4>
                    {quizResult.review?.map((rev, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border space-y-2 text-xs font-sans ${
                          rev.isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-rose-950/20 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span>Q{idx + 1}: {rev.question}</span>
                          <span className={rev.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                            {rev.isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Your answer: <span className="font-semibold text-slate-200">{rev.options[rev.selectedOption] || 'None'}</span>
                        </div>
                        {!rev.isCorrect && (
                          <div className="text-[11px] text-emerald-300">
                            Correct answer: <span className="font-bold">{rev.options[rev.correctAnswerIndex]}</span>
                          </div>
                        )}
                        {rev.explanation && (
                          <div className="p-2.5 rounded bg-[#06080E] border border-slate-800 text-[11px] text-slate-300 italic">
                            💡 {rev.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-slate-800 bg-[#090C15]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold font-mono transition-all"
          >
            CLOSE
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {activeTab === 'lesson' && (
              <button
                onClick={() => setActiveTab('quiz')}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg text-xs font-pixel shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span>TAKE QUIZ ASSESSMENT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {activeTab === 'quiz' && (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered || submitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs font-pixel shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? 'EVALUATING ANSWERS...' : 'SUBMIT & CLEAR COOLDOWN'}
              </button>
            )}

            {activeTab === 'result' && (
              <>
                {!quizResult?.passed ? (
                  <button
                    onClick={handleRetake}
                    className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg text-xs font-pixel transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>RETRY QUIZ</span>
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs font-pixel shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>RETURN & REAPPLY</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
