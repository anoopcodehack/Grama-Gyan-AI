import React, { useState } from "react";
import { MessageSquare, Sparkles, Send, Volume2, RotateCcw } from "lucide-react";
import { AnswerCard } from "../components/AnswerCard.jsx";
import { VoiceMicButton } from "../components/VoiceMicButton.jsx";

export function TutorPage({ profile, messages, onSendMessage, onClearHistory, isLoading }) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full bg-[#f9f9f7]">
      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 max-w-sm mx-auto">
            <MessageSquare className="w-12 h-12 text-[#e5473b] mx-auto mb-4" />
            <h3 className="text-md font-black">ग्राम-ज्ञान शिक्षक गप्पा</h3>
            <p className="text-xs text-gray-400 mt-2">आपल्या विज्ञान पुस्तकातील कोणताही प्रश्न विचार किंवा खालील पर्यायी चकती निवडा.</p>
          </div>
        ) : (
          messages.map((m) => (
            <AnswerCard key={m.id} msg={m} />
          ))
        )}

        {isLoading && (
          <div className="text-xs font-bold text-[#e5473b] bg-white border-2 border-black inline-block p-2 rounded">
            उत्तर शोधत आहे...
          </div>
        )}
      </div>

      {/* Input row */}
      <div className="p-4 bg-white border-t-3 border-black">
        <div className="flex gap-2 items-center">
          <VoiceMicButton isListening={isListening} onClick={() => setIsListening(!isListening)} />
          
          <input
            type="text"
            className="flex-1 px-4 py-3 border-2 border-black rounded-xl font-bold focus:outline-none"
            placeholder={profile?.language === "mr" ? "इथे विज्ञानाचा प्रश्न लिहा..." : "Ask your science questions here..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="p-3 bg-[#c8f000] border-2 border-black rounded-xl font-black"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
