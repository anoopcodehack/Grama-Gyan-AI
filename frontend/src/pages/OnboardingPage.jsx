import React, { useState } from "react";
import { Sparkles, MapPin } from "lucide-react";

export function OnboardingPage({ initialProfile, onSave }) {
  const [name, setName] = useState(initialProfile?.name || "प्रिया (Priya)");
  const [village, setVillage] = useState(initialProfile?.village || "मुरूड (Murud)");
  const [board, setBoard] = useState(initialProfile?.board || "SSC_MH");
  const [classNum, setClassNum] = useState(initialProfile?.class || "9");
  const [language, setLanguage] = useState(initialProfile?.language || "mr");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, village, board, class: classNum, language });
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
      <div className="absolute right-0 top-0 w-24 h-24 bg-[#c8f000] rotate-45 translate-x-12 translate-y-[-14px] border-b-2 border-black" />
      
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        <h2 className="text-xl font-black text-black leading-tight">तुमचा अभ्यास प्रोफाइल</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black uppercase mb-1">विद्यार्थ्याचे नाव (Name)</label>
          <input
            type="text"
            className="w-full border-2 border-black px-3 py-2 rounded-lg font-bold"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase mb-1">तुमचे गाव (Village Name)</label>
          <div className="relative">
            <input
              type="text"
              className="w-full border-2 border-black pl-10 pr-3 py-2 rounded-lg font-bold"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              required
            />
            <MapPin className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black uppercase mb-1">अभ्यासक्रम</label>
            <select
              className="w-full border-2 border-black px-3 py-2 rounded-lg font-bold bg-white"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
            >
              <option value="SSC_MH">महाराष्ट्र SSC</option>
              <option value="CBSE">CBSE / NCERT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">इयत्ता (Class)</label>
            <select
              className="w-full border-2 border-black px-3 py-2 rounded-lg font-bold bg-white"
              value={classNum}
              onChange={(e) => setClassNum(e.target.value)}
            >
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase mb-1">पसंतीची भाषा (Language)</label>
          <select
            className="w-full border-2 border-black px-3 py-2 rounded-lg font-bold bg-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="mr">मराठी (मराठीत खेळा व शिका)</option>
            <option value="en">English (English Medium)</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-[#c8f000] text-black border-3 border-black py-3 rounded-lg font-black tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#a0c000] active:translate-y-0.5 cursor-pointer text-sm"
        >
          गप्पा मारायला सुरुवात करा! (Go to Tutor)
        </button>
      </form>
    </div>
  );
}
