import React, { useContext, useState } from "react";
import { StudentContext } from "./context/StudentContext.jsx";
import { SessionContext } from "./context/SessionContext.jsx";
import { OnboardingPage } from "./pages/OnboardingPage.jsx";
import { TutorPage } from "./pages/TutorPage.jsx";
import { HistoryPage } from "./pages/HistoryPage.jsx";
import { BookOpen, HelpCircle } from "lucide-react";

export function App() {
  const { profile, setProfile } = useContext(StudentContext);
  const { messages, setMessages, isLoading, setIsLoading } = useContext(SessionContext);
  const [activeTab, setActiveTab] = useState("tutor"); // tutor, history

  const handleProfileSave = (newProfile) => {
    setProfile(newProfile);
  };

  const handleSendMessage = async (text) => {
    const newMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_text: text, profile })
      });

      const data = await response.json();
      
      const botMessage = {
        id: `bot_${Date.now()}`,
        role: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString(),
        citations: data.citations,
        analogyUsed: data.analogyUsed
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans">
      {/* Header bar */}
      <header className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#c8f000] border-2 border-white flex items-center justify-center font-black text-black text-sm">GG</div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none text-[#c8f000]">ग्राम-ज्ञान (Grama-Gyan AI)</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">Rural India Vernacular AI Tutor</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("tutor")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded ${
              activeTab === "tutor" ? "bg-[#c8f000] text-black" : "text-white"
            }`}
          >
            Tutor
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded ${
              activeTab === "history" ? "bg-[#c8f000] text-black" : "text-white"
            }`}
          >
            History
          </button>
        </div>
      </header>

      {/* Primary Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4">
        {activeTab === "tutor" ? (
          <TutorPage
            profile={profile}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        ) : (
          <HistoryPage profile={profile} />
        )}
      </main>
    </div>
  );
}
