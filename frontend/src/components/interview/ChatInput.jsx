import React, { useState } from 'react';
import { Send, Command } from 'lucide-react';

export default function ChatInput({ onSend, disabled, isAiTyping }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled && !isAiTyping) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-[#0F1424] border-t-2 border-slate-800 p-4">
      <div className="max-w-4xl mx-auto flex flex-col space-y-2">
        {/* Typing indicator */}
        <div className="h-6 flex items-center">
          {isAiTyping && (
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
              <span>SYS_INTERVIEWER is typing</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          )}
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isAiTyping}
            placeholder={isAiTyping ? "Awaiting input..." : "Type your answer here..."}
            className="w-full bg-[#06080E] border-2 border-slate-800 rounded-xl pl-4 pr-16 py-3 min-h-[80px] max-h-[200px] text-slate-200 font-sans focus:border-cyan-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed shadow-inner transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={disabled || isAiTyping || !text.trim()}
            className="absolute right-3 bottom-3 p-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_10px_rgba(0,229,255,0.3)] disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span>Enter to send</span>
            </span>
            <span>Shift + Enter for new line</span>
          </div>
          <span className={text.length > 2000 ? 'text-rose-400' : ''}>
            {text.length} / 2000
          </span>
        </div>
      </div>
    </div>
  );
}
