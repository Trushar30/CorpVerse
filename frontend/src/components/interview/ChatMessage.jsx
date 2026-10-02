import React, { useState, useEffect } from 'react';
import { Bot, User, Clock } from 'lucide-react';

export default function ChatMessage({ message, isLatest }) {
  const isAI = message.role === 'ai';
  const [displayedText, setDisplayedText] = useState(isAI && isLatest ? '' : message.message);
  
  // Typing effect for the latest AI message
  useEffect(() => {
    if (isAI && isLatest && displayedText.length < message.message.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(message.message.slice(0, displayedText.length + 1));
      }, 20); // ~20ms per character
      return () => clearTimeout(timeout);
    }
  }, [displayedText, isAI, isLatest, message.message]);

  const formattedTime = message.sentAt
    ? new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        {/* Avatar */}
        <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border mt-1
          ${isAI 
            ? 'bg-[#06080E] border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(0,245,160,0.2)]' 
            : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)]'}`}
        >
          {isAI ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} space-y-1`}>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span>{isAI ? 'SYS_INTERVIEWER' : 'OPERATOR'}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedTime}
            </span>
          </div>
          
          <div className={`p-4 rounded-xl border relative
            ${isAI 
              ? 'bg-[#0F1424] border-slate-700 text-slate-200 rounded-tl-none font-mono text-sm leading-relaxed' 
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-50 rounded-tr-none font-sans text-[15px] leading-relaxed'}`}
          >
            {isAI && isLatest ? displayedText : message.message}
            {isAI && isLatest && displayedText.length < message.message.length && (
              <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
