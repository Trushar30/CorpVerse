import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Info, CheckCircle2, AlertCircle, XCircle, Briefcase, Sparkles } from 'lucide-react';
import { getInterviewResult, startInterview, sendInterviewMessage } from '@api/interviews';
import { getApplicationById } from '@api/applications';
import ChatMessage from '@components/interview/ChatMessage';
import ChatInput from '@components/interview/ChatInput';
import OfferModal from '@components/modals/OfferModal';

export default function InterviewRoom() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  
  const [view, setView] = useState('loading'); // 'loading', 'prep', 'chat', 'results'
  const [interviewData, setInterviewData] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const handleOpenOffer = async () => {
    try {
      setIsLoadingOffer(true);
      const res = await getApplicationById(applicationId);
      setApplicationData(res.data?.application || res.data);
      setShowOfferModal(true);
    } catch (err) {
      console.error('Failed to load application offer:', err);
    } finally {
      setIsLoadingOffer(false);
    }
  };

  // Fetch initial state
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await getInterviewResult(applicationId);
        const data = res.data?.data || res.data;
        if (!data || !Array.isArray(data.transcript)) {
          setView('prep');
          return;
        }
        setInterviewData(data);
        if (data.isComplete) {
          setView('results');
        } else {
          setView('chat');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setView('prep');
        } else {
          setError(err.response?.data?.message || 'Failed to load interview');
          setView('error');
        }
      }
    };
    fetchState();
  }, [applicationId]);

  // Auto-scroll chat
  useEffect(() => {
    if (view === 'chat' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [interviewData?.transcript, view, isSending]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const res = await startInterview(applicationId);
      const startedData = res.data?.data || res.data;
      if (startedData && Array.isArray(startedData.transcript)) {
        setInterviewData(startedData);
        setView('chat');
        setIsStarting(false);
      } else {
        const resultRes = await getInterviewResult(applicationId);
        const data = resultRes.data?.data || resultRes.data;
        setInterviewData(data);
        setView('chat');
        setIsStarting(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview');
      setView('error');
      setIsStarting(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || isSending) return;
    
    // Optimistic UI update
    const userMsg = { role: 'user', message: text, sentAt: new Date().toISOString() };
    setInterviewData(prev => ({
      ...prev,
      transcript: [...(prev?.transcript || []), userMsg],
      totalTurns: (prev?.totalTurns || 0) + 1,
      turnsRemaining: Math.max(0, (prev?.turnsRemaining ?? 1) - 1),
    }));
    
    setIsSending(true);
    
    try {
      await sendInterviewMessage(applicationId, text);
      // Fetch full result to get the AI message and any completion state
      const resultRes = await getInterviewResult(applicationId);
      const data = resultRes.data?.data || resultRes.data;
      setInterviewData(data);
      
      if (data?.isComplete) {
        // Wait a bit before showing results so they can read the last message
        setTimeout(() => {
          setView('results');
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-[#090C15] flex items-center justify-center">
        <div className="text-emerald-400 font-mono animate-pulse">INITIALIZING SECURE CHANNEL...</div>
      </div>
    );
  }

  if (view === 'error') {
    return (
      <div className="min-h-screen bg-[#090C15] p-8">
        <button onClick={() => navigate('/dashboard/job-seeker/applications')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 font-mono text-sm">
          <ArrowLeft className="w-4 h-4" /> ABORT TO DASHBOARD
        </button>
        <div className="max-w-md mx-auto bg-[#0F1424] border-2 border-rose-500/50 p-6 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">System Error</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (view === 'prep') {
    return (
      <div className="min-h-screen bg-[#090C15] p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <button onClick={() => navigate('/dashboard/job-seeker/applications')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 font-mono text-sm">
            <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
          </button>
          
          <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-lg font-bold font-display text-slate-100 uppercase tracking-widest">Target Acquisition :: Interview Prep</h1>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-100">Ready to begin?</h2>
                <p className="text-slate-400 text-sm">You are about to enter a simulated AI technical interview.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#06080E] p-4 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 text-xs font-bold mb-1">FORMAT</div>
                  <div className="text-slate-300 text-sm">Technical + Behavioral</div>
                </div>
                <div className="bg-[#06080E] p-4 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 text-xs font-bold mb-1">DURATION</div>
                  <div className="text-slate-300 text-sm">~8-12 Questions</div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg space-y-3">
                <h3 className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Info className="w-4 h-4" /> PRO-TIPS FOR CANDIDATES
                </h3>
                <ul className="text-sm text-amber-200/80 space-y-2 ml-6 list-disc">
                  <li>Take your time. There is no strict time limit per question.</li>
                  <li>Provide detailed, specific examples from past experience.</li>
                  <li>Explain your thought process, not just the final answer.</li>
                  <li>If you don't know something, it's okay to admit it and explain how you'd figure it out.</li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(0,245,160,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isStarting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ESTABLISHING CONNECTION...
                    </>
                  ) : (
                    "START INTERVIEW PROTOCOL"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'results' && interviewData) {
    const isPass = interviewData.result === 'passed';
    const evalData = interviewData.evaluation;
    
    if (!evalData) {
      return (
        <div className="min-h-screen bg-[#090C15] flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold font-mono text-cyan-400">ANALYZING TRANSCRIPT & COMPILING SCORES...</h2>
          <p className="text-slate-400 text-sm max-w-md">The AI evaluation panel is reviewing your responses. This will update momentarily.</p>
          <div className="flex gap-4">
            <button
              onClick={async () => {
                const res = await getInterviewResult(applicationId);
                const data = res.data?.data || res.data;
                setInterviewData(data);
              }}
              className="px-5 py-2.5 bg-cyan-500 text-black text-xs font-mono font-bold rounded-lg hover:bg-cyan-400 transition-colors"
            >
              REFRESH SCORES
            </button>
            <button
              onClick={() => navigate('/dashboard/job-seeker/applications')}
              className="px-5 py-2.5 bg-slate-800 text-slate-300 text-xs font-mono font-bold rounded-lg hover:bg-slate-700 transition-colors"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-[#090C15] p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <button onClick={() => navigate('/dashboard/job-seeker/applications')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 font-mono text-sm">
            <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
          </button>

          <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className={`p-8 text-center border-b-2 ${isPass ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isPass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isPass ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>
              <h1 className="text-3xl font-black text-slate-100 mb-2">
                {isPass ? 'INTERVIEW PASSED' : 'INTERVIEW RESULTS'}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="text-slate-400 text-sm">Overall Score:</div>
                <div className={`text-2xl font-black ${isPass ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {evalData.overallScore}/100
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Category Scores */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 font-mono mb-4 uppercase tracking-widest border-b border-slate-800 pb-2">Category Analysis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Object.entries(evalData.categories || {}).map(([key, score]) => (
                    <div key={key} className="bg-[#06080E] p-4 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300 font-bold capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-cyan-400 font-mono text-sm">{score}/100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {evalData.strengths?.length > 0 && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-lg space-y-3">
                    <h3 className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> NOTABLE STRENGTHS
                    </h3>
                    <ul className="list-disc ml-5 text-sm text-emerald-100/80 space-y-1">
                      {evalData.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                
                {evalData.improvements?.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-lg space-y-3">
                    <h3 className="text-amber-400 font-bold text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> AREAS TO IMPROVE
                    </h3>
                    <ul className="list-disc ml-5 text-sm text-amber-100/80 space-y-1">
                      {evalData.improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Evaluation Notes */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 font-mono mb-3 uppercase tracking-widest">Detailed Notes</h3>
                <div className="bg-[#06080E] p-5 rounded-lg border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans italic">
                  "{evalData.notes}"
                </div>
              </div>
              
              {/* Status Message */}
              <div className="text-center pt-2">
                {isPass ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Your application has advanced to the Offer stage!</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 font-bold">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>You can re-apply for this role in 14 days.</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
                {isPass && (
                  <button
                    onClick={handleOpenOffer}
                    disabled={isLoadingOffer}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg transition-all shadow-[0_0_15px_rgba(0,245,160,0.35)] flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>{isLoadingOffer ? 'LOADING OFFER...' : 'REVIEW & NEGOTIATE OFFER'}</span>
                  </button>
                )}
                <button
                  onClick={() => setView('chat')}
                  className="flex-1 py-3 bg-[#06080E] hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-lg transition-colors"
                >
                  REVIEW TRANSCRIPT
                </button>
                <button
                  onClick={() => navigate('/dashboard/job-seeker/market')}
                  className="flex-1 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400 font-bold rounded-lg transition-colors"
                >
                  BROWSE OTHER ROLES
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Offer Modal (FR-21) */}
        <OfferModal
          isOpen={showOfferModal}
          application={applicationData}
          onClose={() => setShowOfferModal(false)}
          onOfferUpdated={(updated) => {
            if (updated) setApplicationData(updated);
          }}
        />
      </div>
    );
  }

  // CHAT VIEW
  if (view === 'chat' && interviewData) {
    const transcript = Array.isArray(interviewData.transcript) ? interviewData.transcript : [];
    const turnsRemaining = interviewData.turnsRemaining ?? 0;
    const maxTurns = interviewData.maxTurns ?? 10;

    return (
      <div className="flex flex-col h-screen bg-[#090C15]">
        {/* Header */}
        <div className="shrink-0 bg-[#0F1424] border-b-2 border-slate-800 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => {
                if (interviewData.isComplete) setView('results');
                else navigate('/dashboard/job-seeker/applications');
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 font-mono text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> 
              {interviewData.isComplete ? 'BACK TO RESULTS' : 'SAVE & EXIT'}
            </button>
            
            <div className="flex items-center gap-4">
              {!interviewData.isComplete && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#06080E] rounded-md border border-slate-800 font-mono text-xs">
                  <span className="text-slate-500">TURNS:</span>
                  <span className={turnsRemaining <= 2 ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}>
                    {maxTurns - turnsRemaining}/{maxTurns}
                  </span>
                </div>
              )}
              {interviewData.isComplete && (
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-md border border-emerald-500/30 text-xs">
                  INTERVIEW COMPLETE
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar"
        >
          <div className="max-w-4xl mx-auto">
            {transcript.map((msg, idx) => (
              <ChatMessage 
                key={idx} 
                message={msg} 
                isLatest={idx === transcript.length - 1} 
              />
            ))}
            
            {interviewData.isComplete && view === 'chat' && (
              <div className="my-8 p-6 bg-[#0F1424] border-2 border-emerald-500/30 rounded-xl text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-200">Interview Session Concluded</h3>
                <p className="text-slate-400 text-sm">Thank you for your time. Your evaluation results are ready.</p>
                <button
                  onClick={() => setView('results')}
                  className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                >
                  VIEW RESULTS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        {!interviewData.isComplete && (
          <ChatInput 
            onSend={handleSendMessage} 
            disabled={isSending || interviewData.isComplete} 
            isAiTyping={isSending} 
          />
        )}
      </div>
    );
  }

  return null;
}
