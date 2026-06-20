import React from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner({ isOnline }) {
  if (isOnline) return null;
  return (
    <div className="bg-amber-500 text-white border-b-2 border-black px-4 py-2 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span>ऑफलाइन जोडणी • स्थानिक शाळा डेटाबेस मधून उत्तर दिले जाईल (Offline Active - Powered by regional school hub)</span>
    </div>
  );
}
