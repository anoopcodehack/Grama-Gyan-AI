import React from "react";
import { Volume2, VolumeX } from "lucide-react";

export function AudioPlayer({ text, isSpeaking, onPlay, onStop }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      {isSpeaking ? (
        <button
          onClick={onStop}
          className="px-2.5 py-1 text-xs font-extrabold bg-[#e5473b] hover:bg-red-600 text-white border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 cursor-pointer"
        >
          <VolumeX className="w-3.5 h-3.5" />
          <span>थांबा (Stop)</span>
        </button>
      ) : (
        <button
          onClick={onPlay}
          className="px-2.5 py-1 text-xs font-black bg-[#c8f000] hover:bg-[#a0c000] text-black border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>ऐका (Listen Voice)</span>
        </button>
      )}
    </div>
  );
}
