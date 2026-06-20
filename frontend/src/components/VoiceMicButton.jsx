import React from "react";
import { Mic } from "lucide-react";

export function VoiceMicButton({ isListening, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 border-3 border-black rounded-xl cursor-pointer transition-transform shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
        isListening
          ? "bg-[#e5473b] text-white animate-pulse"
          : "bg-white hover:bg-orange-50 text-black"
      }`}
      title="माईक दाबून प्रश्न विचारा (Tap to speak)"
      id="fe-voice-mic-btn"
    >
      <Mic className="w-6 h-6" />
    </button>
  );
}
