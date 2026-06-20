import React from "react";
import { BookOpen, Star } from "lucide-react";

export function HistoryPage({ profile }) {
  const favorites = profile?.savedFavorites || [
    {
      question: "गुरुत्वाकर्षण म्हणजे काय? (What is gravity?)",
      answer: "गुरुत्वाकर्षण म्हणजे दोन वस्तूंमधील अदृश्य ओढण्याची शक्ती. शेतातील गोफण फिरवताना दगड बाहेर फेकण्याआधी दोरी जी शक्ती लावते, त्याला आपण अभिकेंद्री बल म्हणतो.",
      timestamp: new Date().toLocaleDateString()
    }
  ];

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-black">माझे जतन केलेले प्रश्न (My Learning Logs)</h2>
      </div>

      {favorites.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded text-gray-400 font-bold">
          अद्याप कोणताही प्रश्न जतन केलेला नाही.
        </div>
      ) : (
        favorites.map((fav, idx) => (
          <div key={idx} className="border-3 border-black p-4 bg-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] transition-transform">
            <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-black mb-2">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span>जतन केलेला विषय • {fav.timestamp}</span>
            </div>
            <h4 className="text-sm font-black text-black">Q: {fav.question}</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-bold mt-2 border-l-2 border-neutral-300 pl-2">
              {fav.answer}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
