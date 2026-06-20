import React from "react";
import { CitationBadge } from "./CitationBadge.jsx";
import { Lightbulb, WifiOff } from "lucide-react";

export function AnswerCard({ msg, onPlaySound, activeSpeech }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex flex-col max-w-3xl ${isUser ? "ml-auto items-end" : "mr-auto items-start"} w-full`}>
      <div className="flex items-center gap-2 mb-1">
        {isUser ? (
          <>
            <span className="text-xs text-black font-extrabold">विद्यार्थी</span>
            <div className="w-5 h-5 rounded-full bg-[#e5473b] border border-black flex items-center justify-center text-white text-[10px] font-bold">ST</div>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full bg-[#c8f000] border border-black flex items-center justify-center text-black text-[10px] font-bold">GG</div>
            <span className="text-xs text-black font-extrabold">ग्राम-ज्ञान शिक्षक (AI)</span>
            {msg.isOfflineCached && (
              <span className="px-1 py-0.5 text-[8px] bg-amber-500 text-white font-extrabold rounded flex items-center gap-1">
                <WifiOff className="w-2 h-2" />
                <span>सुरक्षित ऑफलाईन</span>
              </span>
            )}
          </>
        )}
      </div>

      <div className={`p-4 border-3 border-black text-sm leading-relaxed ${
        isUser ? "bg-white rounded-l-xl rounded-tr-lg" : "bg-white rounded-r-xl rounded-tl-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
      }`}>
        <div className="whitespace-pre-line font-medium text-slate-800">{msg.text}</div>

        <CitationBadge citations={msg.citations} />

        {msg.analogyUsed && (
          <div className="mt-3 p-3 bg-[#c8f000]/10 border-2 border-dashed border-[#a0c000] rounded">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#a0c000] uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 fill-[#c8f000]" />
              <span>ग्राम-गोष्ट संदर्भ (Village Analogy matched)</span>
            </div>
            <p className="text-xs text-[#111111] mt-1 font-bold">{msg.analogyUsed.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
