import React from "react";

export function TranscriptDisplay({ text, isActive }) {
  if (!isActive) return null;
  return (
    <div className="absolute top-[-30px] left-2 bg-[#e5473b] border-2 border-black text-white text-[10px] font-black px-2 py-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] animate-bounce z-10 flex items-center gap-1.5">
      <div className="flex gap-0.5">
        <div className="w-1 h-3.5 bg-white rounded animate-pulse" />
        <div className="w-1 h-2 bg-white rounded animate-pulse" />
      </div>
      <span>{text || "मी बोलणे ऐकत आहे... (Listening...)"}</span>
    </div>
  );
}
