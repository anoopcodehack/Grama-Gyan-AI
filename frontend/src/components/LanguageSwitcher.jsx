import React from "react";

export function LanguageSwitcher({ activeLang, onSelect }) {
  return (
    <div className="flex border-2 border-black rounded overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
      <button
        onClick={() => onSelect("mr")}
        className={`px-3 py-1.5 text-xs font-black uppercase transition-colors cursor-pointer ${
          activeLang === "mr" ? "bg-[#c8f000] text-black" : "bg-white hover:bg-neutral-100"
        }`}
      >
        मराठी
      </button>
      <button
        onClick={() => onSelect("en")}
        className={`px-3 py-1.5 text-xs font-black uppercase transition-colors cursor-pointer ${
          activeLang === "en" ? "bg-[#c8f000] text-black" : "bg-white hover:bg-neutral-100"
        }`}
      >
        English
      </button>
    </div>
  );
}
