import React from "react";
import { BookMarked } from "lucide-react";

export function CitationBadge({ citations }) {
  if (!citations || citations.length === 0) return null;
  return (
    <div className="mt-4 pt-3 border-t-2 border-dashed border-black">
      <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500 font-extrabold">
        <BookMarked className="w-4 h-4 text-emerald-600" />
        <span>शासकीय पुस्तक संदर्भ (Official Curriculum Citations):</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {citations.map((cite, idx) => (
          <div key={idx} className="bg-amber-50/50 border-2 border-black p-3 text-xs rounded relative overflow-hidden">
            <div className="absolute right-1 top-1 bg-yellow-300 font-black px-1.5 py-0.5 text-[9px] border border-black">
              पुस्तकाचे पान क्र. {cite.page}
            </div>
            <div className="font-extrabold text-black">
              {cite.subject} • <span className="text-emerald-700">{cite.chapter}</span>
            </div>
            <p className="text-gray-600 italic mt-1 pl-2 border-l-2 border-gray-400">
              "{cite.snippet}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
