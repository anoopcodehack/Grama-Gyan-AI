import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, Send, Volume2, VolumeX, BookOpen, Award, Sparkles, Lightbulb, 
  PlusCircle, Wifi, WifiOff, User, MapPin, RotateCcw, Check, 
  BookMarked, HelpCircle, Edit, ChevronRight, Database, School, 
  Globe, Activity, MessageSquare, ArrowRight, X, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StudentProfile, ChatMessage, Citation } from "./types.js";
import { TEXTBOOK_CHUNKS, CULTURAL_ANALOGIES } from "./data/textbooks.js";

const CHAPTERS_LIST = [
  {
    id: "SSC_MH_9_SCI_CH3_ForcePressure",
    chapterName: "Chapter 3: Force and Pressure",
    displayTitleEn: "Chapter 3: Force & Pressure",
    displayTitleMr: "बल आणि दाब",
    class: "9" as const,
    board: "SSC_MH" as const,
    gradeText: "Class 9 Science (९ वी)"
  },
  {
    id: "SSC_MH_9_SCI_CH15_LifeProcesses",
    chapterName: "Chapter 15: Life Processes in Living Organisms",
    displayTitleEn: "Chapter 15: Life Processes",
    displayTitleMr: "सजीवांमधील जीवनप्रक्रिया",
    class: "9" as const,
    board: "SSC_MH" as const,
    gradeText: "Class 9 Science (९ वी)"
  },
  {
    id: "SSC_MH_10_SCI_CH1_Gravitation",
    chapterName: "Chapter 1: Gravitation",
    displayTitleEn: "Chapter 1: Gravitation",
    displayTitleMr: "गुरुत्वाकर्षण",
    class: "10" as const,
    board: "SSC_MH" as const,
    gradeText: "Class 10 Science (१० वी)"
  },
  {
    id: "SSC_MH_10_SCI_CH6_Refraction",
    chapterName: "Chapter 6: Refraction of Light",
    displayTitleEn: "Chapter 6: Refraction",
    displayTitleMr: "प्रकाशाचे अपवर्तन",
    class: "10" as const,
    board: "SSC_MH" as const,
    gradeText: "Class 10 Science (१० वी)"
  },
  {
    id: "NCERT_9_SCI_CH10_Gravitation",
    chapterName: "Chapter 10: Gravitation",
    displayTitleEn: "Chapter 10: Gravitation",
    displayTitleMr: "Buoyancy & Floating",
    class: "9" as const,
    board: "NCERT" as const,
    gradeText: "Class 9 NCERT (९ वी)"
  }
];

function getChapterDisplayNameMr(chapKey: string) {
  switch (chapKey) {
    case "Chapter 3: Force and Pressure":
      return "धडा ३: बल आणि दाब";
    case "Chapter 15: Life Processes in Living Organisms":
      return "धडा १५: सजीवांमधील जीवनप्रक्रिया";
    case "Chapter 1: Gravitation":
      return "धडा १: गुरुत्वाकर्षण";
    case "Chapter 6: Refraction of Light":
      return "धडा ६: प्रकाशाचे अपवर्तन";
    case "Chapter 10: Gravitation":
      return "धडा १०: गुरुत्वाकर्षण व प्लावकता (NCERT)";
    default:
      return chapKey;
  }
}

const SUGGESTED_QUESTIONS = [
  { text_mr: "डोक्यावर ओझे वाहताना चुंबळ का ठेवतात?", text_en: "Why is a head-cushion ring (Chumbhal) used to carry loads?", concept: "pressure", chapter: "Chapter 3: Force and Pressure" },
  { text_mr: "विहिरीतून पाणी ओढताना बादली पाण्यात हलकी का वाटते?", text_en: "Why does a bucket of water feel light inside the well?", concept: "buoyancy", chapter: "Chapter 3: Force and Pressure" },
  { text_mr: "पाने सूर्यप्रकाशाद्वारे स्वतःचे अन्न कशाप्रकारे बनवतात?", text_en: "How do leaves cook food using photosynthesis?", concept: "photosynthesis", chapter: "Chapter 15: Life Processes in Living Organisms" },
  { text_mr: "पाण्यात टाकलेली काठी तिरपी किंवा वाकलेली का भासते?", text_en: "Why does a stick dipped in water look bent?", concept: "refraction", chapter: "Chapter 6: Refraction of Light" },
  { text_mr: "केप्लरचा पहिला नियम काय आहे?", text_en: "What is Kepler's First Law?", concept: "gravity", chapter: "Chapter 1: Gravitation" },
  { text_mr: "काही वस्तू पाण्यात का तरंगतात आणि काही का बुडतात?", text_en: "Why do some objects float on water and others sink?", concept: "buoyancy", chapter: "Chapter 10: Gravitation" }
];

export default function App() {
  // State for Onboarding and profile with Priya Patil's MH-SSC Class 9 Marathi journey pre-seeded
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem("gg_student_profile");
    if (saved) return JSON.parse(saved);
    return {
      name: "प्रिया पाटील",
      village: "शेळगाव",
      board: "SSC_MH",
      class: "9",
      language: "mr"
    };
  });

  const [onboardingMode, setOnboardingMode] = useState(false);
  const [editProfileMode, setEditProfileMode] = useState(false);

  // Profile forms
  const [profName, setProfName] = useState(profile?.name || "प्रिया पाटील");
  const [profVillage, setProfVillage] = useState(profile?.village || "शेळगाव");
  const [profBoard, setProfBoard] = useState<"SSC_MH" | "NCERT">(profile?.board || "SSC_MH");
  const [profClass, setProfClass] = useState<"9" | "10">(profile?.class || "9");
  const [profLang, setProfLang] = useState<"mr" | "en">(profile?.language || "mr");

  // Chat conversation and workspace tabs
  const [activeTab, setActiveTab] = useState<"chat" | "textbooks">("chat");
  const [textbookSearch, setTextbookSearch] = useState("");

  // Active Chapter being studied
  const [activeChapter, setActiveChapter] = useState<string>(() => {
    const saved = localStorage.getItem("gg_student_profile");
    if (saved) {
      const p = JSON.parse(saved);
      if (p.board === "NCERT") return "Chapter 10: Gravitation";
      if (p.board === "SSC_MH" && p.class === "10") return "Chapter 1: Gravitation";
      if (p.board === "SSC_MH" && p.class === "9") return "Chapter 3: Force and Pressure";
    }
    return "Chapter 3: Force and Pressure";
  });

  const handleChapterSelect = (chapterName: string, targetClass: "9" | "10") => {
    setActiveChapter(chapterName);
    if (profile && profile.class !== targetClass) {
      const updated = { ...profile, class: targetClass };
      setProfile(updated);
      setProfClass(targetClass);
      localStorage.setItem("gg_student_profile", JSON.stringify(updated));
    }
  };

  // Chat conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Special System Toggle states
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);

  // Speech Recognition hook states
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Analogy portal crowdsourcing modal
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [customAnalogies, setCustomAnalogies] = useState<any[]>([]);
  const [newConcept, setNewConcept] = useState("");
  const [newAnalogyText, setNewAnalogyText] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [analogySuccessMsg, setAnalogySuccessMsg] = useState("");

  // Sync online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync past conversations offline cached Q&As in localStorage partitioned by activeChapter
  useEffect(() => {
    if (profile) {
      const activeChapSanitized = activeChapter.replace(/[^a-zA-Z0-9]/g, "_");
      const cacheKey = `gg_chat_v2_${profile.board}_${profile.class}_${profile.language}_${activeChapSanitized}`;
      const savedChat = localStorage.getItem(cacheKey);
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      } else {
        // Init a warm welcome message
        const welcomeText = profile.language === "mr"
          ? `नमस्कार ${profile.name}! मी तुझा ग्राम-ज्ञान विज्ञान शिक्षक आहे. आपण आता **"${getChapterDisplayNameMr(activeChapter)}"** हा धडा अभ्यासत आहोत. \n\nया धड्याशी संबंधित शेतीची अवजारे, विहीर, बादली किंवा स्वयंपाकाशी संबंधित कोणताही विज्ञानाचा प्रश्न खाली विचार किंवा माईक दाबून मराठीत बोलून सांग!`
          : `Hello ${profile.name} from ${profile.village}! I am your Grama-Gyan Science tutor. We are currently studying **"${activeChapter}"**. Let's learn science using simple, beautiful examples from our village! Ask me any question about this lesson, or pick a suggested question from the deck below.`;
        
        const initChat: ChatMessage[] = [
          {
            id: "welcome",
            role: "assistant",
            text: welcomeText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
        setMessages(initChat);
        localStorage.setItem(cacheKey, JSON.stringify(initChat));
      }
    }
  }, [profile?.board, profile?.class, profile?.language, activeChapter]);

  // Load custom community analogies
  const loadCustomAnalogies = async () => {
    try {
      const res = await fetch("/api/v1/custom-analogies");
      const data = await res.json();
      if (data.custom) {
        setCustomAnalogies(data.custom);
      }
    } catch (e) {
      console.warn("Failing to connect to express server custom analogies API:", e);
    }
  };

  useEffect(() => {
    loadCustomAnalogies();
  }, []);

  // Web Speechrecognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (e: any) => {
        console.error("Speech Recognition error:", e);
        setIsListening(false);
      };
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
      };
      recognitionRef.current = rec;
    }
  }, [profile?.language]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert("तुमच्या ब्राउझरमध्ये स्पीच रेकग्निशन उपलब्ध नाही. कृपया कीबोर्डने टाईप करा किंवा नवीन टॅबमध्ये उघडा!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = profile?.language === "mr" ? "mr-IN" : "en-IN";
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Start speech failed:", e);
      }
    }
  };

  // Browser-native dynamic Text-To-Speech (Bilingual voice support)
  const handleVoicePlay = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("या उपकरणात स्पीच सिंथेसिस उपलब्ध नाही.");
      return;
    }

    if (activeSpeechText === text) {
      window.speechSynthesis.cancel();
      setActiveSpeechText(null);
      return;
    }

    window.speechSynthesis.cancel(); // cancel playing audio
    
    // String clean for cleaner reading
    const spokenText = text
      .replace(/ नमस्कार/g, "")
      .replace(/[*#_`]/g, "")
      .replace(/\[Source:[^\]]*\]/g, "")
      .replace(/- /g, "")
      .slice(0, 350); // Keep it crisp

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = profile?.language === "mr" ? "mr-IN" : "en-IN";
    utterance.rate = 0.95; // kids preferred pace
    
    utterance.onend = () => setActiveSpeechText(null);
    utterance.onerror = () => setActiveSpeechText(null);
    
    // Locate suitable regional accent voice
    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find(v => v.lang.startsWith(profile?.language || "mr"));
    if (matched) utterance.voice = matched;

    setActiveSpeechText(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceStop = () => {
    window.speechSynthesis.cancel();
    setActiveSpeechText(null);
  };

  // Submit student profiling onboarding data
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim() || !profVillage.trim()) {
      alert("कृपया नाव आणि गावाचे नाव लिहा!");
      return;
    }
    const newProfile: StudentProfile = {
      name: profName.trim(),
      village: profVillage.trim(),
      board: profBoard,
      class: profClass,
      language: profLang,
      subject: "Science & Technology"
    };
    
    // Auto align default activeChapter if curriculum board/class changes
    let defaultChapter = activeChapter;
    if (newProfile.board === "NCERT") {
      defaultChapter = "Chapter 10: Gravitation";
    } else if (newProfile.board === "SSC_MH" && newProfile.class === "10") {
      defaultChapter = "Chapter 1: Gravitation";
    } else if (newProfile.board === "SSC_MH" && newProfile.class === "9") {
      if (activeChapter !== "Chapter 3: Force and Pressure" && activeChapter !== "Chapter 15: Life Processes in Living Organisms") {
        defaultChapter = "Chapter 3: Force and Pressure";
      }
    }
    setActiveChapter(defaultChapter);
    
    setProfile(newProfile);
    localStorage.setItem("gg_student_profile", JSON.stringify(newProfile));
    setOnboardingMode(false);
    setEditProfileMode(false);
  };

  // Handle scientific query submissions
  const handleQuerySubmit = async (textToSubmit?: string) => {
    const query = (textToSubmit || inputText).trim();
    if (!query) return;

    if (!profile) return;

    setInputText("");
    setIsLoading(true);

    const userMsgId = `student_${Date.now()}`;
    const studentVoiceLog: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentMessages = [...messages, studentVoiceLog];
    setMessages(currentMessages);

    // 1. OFFLINE OR SIMULATED OFFLINE RESILIENT PATH
    const effectiveOnline = isOnline && !simulateOffline;
    if (!effectiveOnline) {
      setTimeout(() => {
        // Run local deterministic client-side similarity retrieval search
        const normQuery = query.toLowerCase();
        
        // Find matching predefined analogy
        const matchedAnalogy = CULTURAL_ANALOGIES.find(a => 
          a.keywords.some(k => normQuery.includes(k.toLowerCase()))
        );
        
        // Retrieve relevant textbook chunk
        const matchedChunk = TEXTBOOK_CHUNKS.find(c => 
          c.board === profile.board && 
          c.class === profile.class && 
          (normQuery.includes(c.title.toLowerCase()) || 
           c.content.toLowerCase().split(/\s+/).some(w => w.length > 4 && normQuery.includes(w)))
        ) || TEXTBOOK_CHUNKS.find(c => c.board === profile.board && c.class === profile.class);

        const analogyText = matchedAnalogy 
          ? (profile.language === "mr" ? matchedAnalogy.text_mr : matchedAnalogy.text_en)
          : (profile.language === "mr" 
              ? "चुलीतील सौर ऊर्जा आणि लाकडाच्या पेटण्याचे सोपे घरगुती उदाहरण आठवा." 
              : "Think of burning wood in a clay stove representing heat transfer.");

        const offlineAnswerText = profile.language === "mr"
          ? `नमस्कार ${profile.name}! ⚠️ तुमचे उपकरण सध्या *ऑफलाईन* आहे, तरी विज्ञानाचा अभ्यास थांबणार नाही! तुमच्या विज्ञानाच्या पुस्तकातील संदर्भानुसार खालील प्रमाणे उत्तर मिळवले आहे:\n\nतुम्ही विचारलेला प्रश्न हा **'${matchedAnalogy?.concept || "विज्ञान"}'** संकल्पनेशी संबंधित आहे. \n\n**घरगुती स्थानिक उदाहरण (Cultural Analogy):** \n${analogyText} \n\nअधिक वाचनासाठी तुमच्या पुस्तकामधील **'${matchedChunk?.chapter || "विज्ञान आणि तंत्रज्ञान"}'** (पान क्र. ${matchedChunk?.page || 42}) चा संदर्भ नक्की वाचा!`
          : `Hello ${profile.name}! ⚠️ Since your device is running in *Offline-Resilient mode*, I retrieved this scientific concept from your pre-loaded school textbooks:\n\nConcept: **"${matchedAnalogy?.concept || "General Science"}"**\n\n**Rural Cultural Analogy Weaved:**\n${analogyText}\n\n**Textbook Reference:**\nRefer to "${matchedChunk?.chapter || "General Science Textbook"}" on **Page ${matchedChunk?.page || 42}** of your ${profile.board === "SSC_MH" ? "Maharashtra State Board" : "NCERT"} Grade ${profile.class} school book.`;

        const helperTutorReply: ChatMessage = {
          id: `tutor_${Date.now()}`,
          role: "assistant",
          text: offlineAnswerText,
          conceptDetected: matchedAnalogy?.concept,
          citations: matchedChunk ? [
            {
              chapter: matchedChunk.chapter,
              chapter_number: matchedChunk.chapter_number,
              page: matchedChunk.page,
              snippet: matchedChunk.content,
              subject: matchedChunk.subject
            }
          ] : undefined,
          analogyUsed: matchedAnalogy ? {
            concept: matchedAnalogy.concept,
            text: profile.language === "mr" ? matchedAnalogy.text_mr : matchedAnalogy.text_en,
            type: matchedAnalogy.type
          } : undefined,
          isOfflineCached: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalOfflineMsgs = [...currentMessages, helperTutorReply];
        setMessages(finalOfflineMsgs);
        cacheSessionHistory(finalOfflineMsgs);
        setIsLoading(false);
      }, 700);
      return;
    }

    // 2. ONLINE DIRECT EXPRESS + GEMINI TUTOR PIPELINE
    try {
      const res = await fetch("/api/v1/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query_text: query,
          profile: profile
        })
      });

      if (!res.ok) {
        throw new Error("Tutor backend response error");
      }

      const data = await res.json();
      const tutorReply: ChatMessage = {
        id: `tutor_${Date.now()}`,
        role: "assistant",
        text: data.text,
        conceptDetected: data.conceptDetected,
        citations: data.citations,
        analogyUsed: data.analogyUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalOnlineMsgs = [...currentMessages, tutorReply];
      setMessages(finalOnlineMsgs);
      cacheSessionHistory(finalOnlineMsgs);
    } catch (e: any) {
      console.error(e);
      // Failover to client database chunk search gracefully instead of throwing crash errors
      const matchedChunk = TEXTBOOK_CHUNKS.find(c => c.board === profile.board && c.class === profile.class);
      const errReply: ChatMessage = {
        id: `tutor_${Date.now()}`,
        role: "assistant",
        text: profile.language === "mr"
          ? `नमस्कार ${profile.name}! आम्हाला सर्वरशी जोडण्यास थोडी अडचण येत आहे. परंतु पुस्तकातील संदर्भानुसार: ${matchedChunk?.content || ""}`
          : `Hello! Connecting to AI server failed, fallback textbook data: ${matchedChunk?.content || ""}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...currentMessages, errReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const cacheSessionHistory = (msgsList: ChatMessage[]) => {
    if (!profile) return;
    const cacheKey = `gg_chat_v1_${profile.board}_${profile.class}_${profile.language}`;
    localStorage.setItem(cacheKey, JSON.stringify(msgsList));
  };

  // Clear Chat history
  const clearChatHistory = () => {
    if (!profile) return;
    if (confirm(profile.language === "mr" ? "तुम्हाला विज्ञान चर्चेचा इतिहास साफ करायचा आहे का?" : "Are you sure you want to clear your chat history?")) {
      const cacheKey = `gg_chat_v1_${profile.board}_${profile.class}_${profile.language}`;
      const welcomeText = profile.language === "mr"
        ? `नमस्कार ${profile.name}! इतिहास स्वच्छ केला आहे. तुमच्या मनात विज्ञानाचा कोणताही प्रश्न असल्यास इथे विचारा!`
        : `Welcome back ${profile.name}! Your chat history is cleaned. Ask me any science questions!`;
      
      const initChat: ChatMessage[] = [
        {
          id: `welcome_${Date.now()}`,
          role: "assistant",
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initChat);
      localStorage.setItem(cacheKey, JSON.stringify(initChat));
      handleVoiceStop();
    }
  };

  // Teachers custom rural analogies submit handler
  const handleTeacherAnalogySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim() || !newAnalogyText.trim()) {
      alert("कृपया संकल्पना आणि उदाहरणाची माहिती भरा!");
      return;
    }

    try {
      const res = await fetch("/api/v1/analogy-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: newConcept.trim(),
          text: newAnalogyText.trim(),
          contributor: contributorName.trim() || "Village School Teacher",
          language: profile?.language || "mr"
        })
      });

      const data = await res.json();
      if (data.success) {
        setAnalogySuccessMsg(profile?.language === "mr" ? "यशस्वी! तुमचे उदाहरण अभ्यासक्रमात समाविष्ट केले गेले आहे." : "Success! Your analogy is injected into the textbook system!");
        setNewConcept("");
        setNewAnalogyText("");
        loadCustomAnalogies();
        setTimeout(() => {
          setAnalogySuccessMsg("");
          setShowTeacherModal(false);
        }, 1800);
      }
    } catch (e) {
      // Local addition fallback
      CULTURAL_ANALOGIES.push({
        concept: newConcept.toLowerCase().trim(),
        keywords: [newConcept.toLowerCase().trim()],
        text_mr: profile?.language === "mr" ? newAnalogyText : "",
        text_en: profile?.language !== "mr" ? newAnalogyText : "",
        region: "Local Community",
        type: "Community Wisdom"
      });
      setAnalogySuccessMsg("Saved locally in browser offline database!");
      setNewConcept("");
      setNewAnalogyText("");
      setTimeout(() => {
        setAnalogySuccessMsg("");
        setShowTeacherModal(false);
      }, 1500);
    }
  };

  // Reset/Delete user profile to go back to onboarding screen
  const performProfileReset = () => {
    // Populate form fields with current student profile values for editing comfort
    if (profile) {
      setProfName(profile.name);
      setProfVillage(profile.village);
      setProfBoard(profile.board);
      setProfClass(profile.class);
      setProfLang(profile.language);
    }
    setOnboardingMode(true);
    handleVoiceStop();
  };

  const handleQuickLanguageSwitch = () => {
    if (!profile) return;
    const newLang = profile.language === "mr" ? "en" : "mr";
    const updated = { ...profile, language: newLang };
    setProfile(updated);
    setProfLang(newLang);
    localStorage.setItem("gg_student_profile", JSON.stringify(updated));
  };


  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#111111] grid grid-cols-1 md:grid-cols-[260px_1fr] grid-rows-[auto_1fr] overflow-x-hidden selection:bg-[#c8f000]">
      
      {/* 1. TOP BAR */}
      <header className="col-span-1 md:col-span-2 bg-white border-b-3 border-[#111111] h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="border-2 border-black bg-[#c8f000] p-1.5 md:p-2 flex items-center justify-center font-extrabold text-sm brutalist-card">
            <School className="w-4 h-4 md:w-5 md:h-5 text-black" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-black tracking-wider leading-none">GRAMA-GYAN AI</h1>
            <span className="text-[9px] md:text-[10px] text-gray-500 font-extrabold tracking-widest uppercase">Rural State Board Learning</span>
          </div>
        </div>

        {/* Topbar Right Action items */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Simulated Offline Mode Toggle button */}
          <button 
            onClick={() => setSimulateOffline(!simulateOffline)}
            className={`flex items-center gap-1.5 px-2 md:px-3 py-1 text-xs font-bold rounded border-2 border-[#111111] transition-all cursor-pointer ${
              simulateOffline 
                ? "bg-[#e5473b] text-white" 
                : "bg-white text-black hover:bg-gray-50"
            }`}
            title="Simulate village offline connection"
            id="offline-sim-toggle"
          >
            {simulateOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#22c55e]" />
                <span className="hidden sm:inline">Online Connected</span>
              </>
            )}
          </button>

          {/* Display online/offline real tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold brutalist-badge bg-[#f2f2f0]">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline && !simulateOffline ? "bg-[#22c55e] animate-pulse" : "bg-amber-500"}`} />
            <span>{isOnline && !simulateOffline ? "Internet OK" : "Rural Local Engine"}</span>
          </div>

          {/* Quick Language switch card */}
          {profile && (
            <button 
              onClick={handleQuickLanguageSwitch}
              className="px-2.5 py-1 text-xs font-black bg-[#c8f000] border-2 border-black brutalist-btn flex items-center gap-1"
              id="lang-quick-toggle"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{profile.language === "mr" ? "English" : "मराठी"}</span>
            </button>
          )}

          {/* Onboarding Trigger button */}
          {profile && (
            <div 
              onClick={performProfileReset}
              className="flex items-center gap-2 px-2.5 py-1 text-xs font-extrabold bg-[#f2f2f0] hover:bg-neutral-200 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none"
              title="Change your learning profile"
              id="profile-reset"
            >
              <User className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden md:inline overflow-hidden whitespace-nowrap text-ellipsis max-w-[80px]">
                {profile.name}
              </span>
              <Edit className="w-3 h-3 text-gray-500" />
            </div>
          )}
        </div>
      </header>

      {/* ONBOARDING MODAL OVERLAY */}
      <AnimatePresence>
        {onboardingMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
            id="onboarding-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black p-5 md:p-8 max-w-lg w-full brutalist-card my-8 relative"
              id="onboarding-container"
            >
              {profile && (
                <button 
                  onClick={() => setOnboardingMode(false)}
                  className="absolute top-4 right-4 p-1.5 bg-[#f2f2f0] hover:bg-neutral-200 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer z-10 transition-colors"
                  title="Close / बंद करा"
                >
                  <X className="w-4 h-4 text-black font-extrabold" />
                </button>
              )}

              <div className="text-center mb-6">
                <div className="inline-block border-3 border-black bg-[#c8f000] p-3 rounded-full mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <School className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-black mb-1">
                  {profile ? "प्रोफाइल बदला / Edit Profile" : "नमस्कार! Welcome to Grama-Gyan AI"}
                </h2>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                  {profile ? "Update your companion settings" : "Village Student Science Portal"}
                </p>
                <div className="h-1 w-16 bg-[#e5473b] mx-auto mt-3 border-1 border-black" />
              </div>

              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5">तुमचे नाव / Student Name:</label>
                  <input 
                    type="text" 
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    placeholder="उदा. प्रिया पाटील (e.g. Priya Patil)"
                    className="w-full px-4 py-2.5 border-3 border-black font-extrabold focus:outline-none focus:bg-[#c8f000]/10 placeholder:text-gray-400"
                    maxLength={30}
                    required
                  />
                </div>

                {/* Village */}
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5">तुमचे गाव / Village Name:</label>
                  <input 
                    type="text" 
                    value={profVillage}
                    onChange={(e) => setProfVillage(e.target.value)}
                    placeholder="उदा. शेळगाव (e.g. Shelgaon)"
                    className="w-full px-4 py-2.5 border-3 border-black font-extrabold focus:outline-none focus:bg-[#c8f000]/10 placeholder:text-gray-400"
                    maxLength={30}
                    required
                  />
                </div>

                {/* Curriculum and Grade Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Board */}
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1.5">शिक्षण मंडळ / Board:</label>
                    <select 
                      value={profBoard}
                      onChange={(e: any) => setProfBoard(e.target.value)}
                      className="w-full px-3 py-2 border-3 border-black font-extrabold bg-white focus:outline-none"
                    >
                      <option value="SSC_MH">महाराष्ट्र बोर्ड (SSC MH)</option>
                      <option value="NCERT">CBSE / NCERT</option>
                    </select>
                  </div>

                  {/* Class */}
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1.5">इयत्ता / Class Grade:</label>
                    <select 
                      value={profClass}
                      onChange={(e: any) => setProfClass(e.target.value)}
                      className="w-full px-3 py-2 border-3 border-black font-extrabold bg-white focus:outline-none"
                    >
                      <option value="9">इयत्ता ९ वी (Grade 9)</option>
                      <option value="10">इयत्ता १० वी (Grade 10)</option>
                    </select>
                  </div>
                </div>

                {/* Preference Language */}
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1.5">अभ्यास भाषा / Medium of Study:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProfLang("mr")}
                      className={`py-2 px-4 border-3 border-black font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        profLang === "mr" 
                          ? "bg-[#c8f000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                          : "bg-white text-gray-500"
                      }`}
                    >
                      मराठी माध्यम (Marathi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfLang("en")}
                      className={`py-2 px-4 border-3 border-black font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        profLang === "en" 
                          ? "bg-[#c8f000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                          : "bg-white text-gray-500"
                      }`}
                    >
                      English Medium
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 mt-6">
                  {profile && (
                    <button
                      type="button"
                      onClick={() => setOnboardingMode(false)}
                      className="flex-1 py-3 text-sm font-black bg-neutral-200 hover:bg-neutral-300 text-black transition-all border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                    >
                      रद्द करा / Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-[2] py-3 text-sm font-black bg-[#e5473b] hover:bg-red-600 text-white transition-all border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    {profile ? "जतन करा / Save Changes" : "चला सुरू करूया! Let's Learn!"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. SIDEBAR PANEL */}
      <aside className="bg-[#111111] text-white border-r-3 border-black flex flex-col p-4 md:sticky md:top-16 md:h-[calc(100vh-64px)] overflow-y-auto">
        
        {/* Onboarding Quick Check or display profile info */}
        {profile && (
          <div 
            onClick={performProfileReset}
            className="mb-6 p-3 bg-neutral-800 hover:bg-neutral-700 border-2 border-neutral-600 rounded relative overflow-hidden cursor-pointer group transition-all select-none shadow-[2px_2px_0px_0px_rgba(200,240,0,0.15)] hover:shadow-[3px_3px_0px_0px_rgba(200,240,0,0.3)] hover:border-[#c8f000]"
            title={profile.language === "mr" ? "प्रोफाइल बदला" : "Edit Profile"}
          >
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-25 transition-opacity">
              <User className="w-16 h-16 text-white" />
            </div>
            
            <div className="absolute top-2 right-2 opacity-40 group-hover:opacity-100 transition-opacity">
              <Edit className="w-3.5 h-3.5 text-white" />
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#c8f000]" />
              <span className="text-[10px] tracking-widest text-[#c8f000] font-black uppercase">Active Student Tracker</span>
            </div>
            
            <h3 className="text-sm font-black text-white group-hover:text-[#c8f000] transition-colors">{profile.name}</h3>
            <p className="text-xs font-bold text-gray-300">गाव: {profile.village}</p>
            
            <div className="mt-2 pt-2 border-t border-gray-600 flex justify-between items-center text-[10px] text-gray-300">
              <span className="font-extrabold bg-[#111111] px-1.5 py-0.5 rounded text-gray-300">
                {profile.board === "SSC_MH" ? "MH SSC Board" : "CBSE NCERT"}
              </span>
              <span className="font-extrabold text-[#c8f000]">Grade {profile.class}</span>
            </div>
          </div>
        )}

        {/* State Board Science chapters */}
        <div className="flex-1 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <BookOpen className="w-4 h-4 text-[#c8f000]" />
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Chapters / धडे</h4>
            </div>

            {/* Curriculum chapter selection */}
            <div className="space-y-1" id="chapters-list">
              {profile?.board === "SSC_MH" ? (
                <>
                  <button 
                    onClick={() => handleChapterSelect("Chapter 3: Force and Pressure", "9")}
                    className={`w-full text-left p-2 border rounded transition-all cursor-pointer block ${
                      activeChapter === "Chapter 3: Force and Pressure"
                        ? "border-[#c8f000] bg-[#1f1f1f]"
                        : "border-neutral-900 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700 opacity-80"
                    }`}
                  >
                    <div className="text-[10px] text-gray-400 font-bold">Class 9 Science</div>
                    <div className="text-xs font-black text-white py-0.5">Chapter 3: Force & Pressure</div>
                    <div className="text-[9px] text-[#c8f000] font-extrabold">बल आणि दाब (9 वी)</div>
                  </button>

                  <button 
                    onClick={() => handleChapterSelect("Chapter 15: Life Processes in Living Organisms", "9")}
                    className={`w-full text-left p-2 border rounded transition-all cursor-pointer block ${
                      activeChapter === "Chapter 15: Life Processes in Living Organisms"
                        ? "border-[#c8f000] bg-[#1f1f1f]"
                        : "border-neutral-900 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700 opacity-80"
                    }`}
                  >
                    <div className="text-[10px] text-gray-400 font-bold">Class 9 Science</div>
                    <div className="text-xs font-black text-white py-0.5">Chapter 15: Life Processes</div>
                    <div className="text-[9px] text-[#c8f000] font-extrabold">सजीवांमधील जीवनप्रक्रिया</div>
                  </button>

                  <button 
                    onClick={() => handleChapterSelect("Chapter 1: Gravitation", "10")}
                    className={`w-full text-left p-2 border rounded transition-all cursor-pointer block ${
                      activeChapter === "Chapter 1: Gravitation"
                        ? "border-[#c8f000] bg-[#1f1f1f]"
                        : "border-neutral-900 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700 opacity-80"
                    }`}
                  >
                    <div className="text-[10px] text-gray-400 font-bold">Class 10 Science</div>
                    <div className="text-xs font-black text-white py-0.5">Chapter 1: Gravitation</div>
                    <div className="text-[9px] text-[#c8f000] font-extrabold">गुरुत्वाकर्षण (10 वी)</div>
                  </button>

                  <button 
                    onClick={() => handleChapterSelect("Chapter 6: Refraction of Light", "10")}
                    className={`w-full text-left p-2 border rounded transition-all cursor-pointer block ${
                      activeChapter === "Chapter 6: Refraction of Light"
                        ? "border-[#c8f000] bg-[#1f1f1f]"
                        : "border-neutral-900 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700 opacity-80"
                    }`}
                  >
                    <div className="text-[10px] text-gray-400 font-bold">Class 10 Science</div>
                    <div className="text-xs font-black text-white py-0.5">Chapter 6: Refraction</div>
                    <div className="text-[9px] text-[#c8f000] font-extrabold">प्रकाशाचे अपवर्तन</div>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleChapterSelect("Chapter 10: Gravitation", "9")}
                    className={`w-full text-left p-2 border rounded transition-all cursor-pointer block ${
                      activeChapter === "Chapter 10: Gravitation"
                        ? "border-[#c8f000] bg-[#1f1f1f]"
                        : "border-neutral-900 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700 opacity-80"
                    }`}
                  >
                    <div className="text-[10px] text-gray-400 font-bold">Class 9 NCERT</div>
                    <div className="text-xs font-black text-white py-0.5">Chapter 10: Gravitation</div>
                    <div className="text-[9px] text-[#c8f000] font-extrabold">Buoyancy and Floating</div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Prompt community portal button */}
          <div className="pt-4 border-t border-neutral-800">
            <button 
              onClick={() => setShowTeacherModal(true)}
              className="w-full p-2.5 bg-[#444444] hover:bg-[#555555] active:translate-y-0.5 text-xs font-black tracking-wide border-2 border-black rounded text-[#c8f000] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(200,240,0,1)]"
              id="teacher-modal-trigger"
            >
              <PlusCircle className="w-4 h-4 text-[#c8f000]" />
              <span>शिक्षक योगदान विभाग</span>
            </button>
            <p className="text-[10px] text-gray-400 mt-2 text-center font-bold">
              Teachers/Parents: Add village physics analogies to help children learn
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-4 border-t border-neutral-800 text-[10px] text-neutral-500 font-bold">
          <div className="flex items-center gap-1 mb-1">
            <Database className="w-3 h-3" />
            <span>Pre-seeded chunks: {TEXTBOOK_CHUNKS.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Analogies Active: {CULTURAL_ANALOGIES.length}</span>
          </div>
          <div className="mt-2 text-neutral-600 flex items-center gap-1">
            <span>Crafted for rural India</span>
            <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Segmented Tab Switcher */}
        <div className="bg-white border-b-3 border-black p-2 flex gap-2 overflow-x-auto select-none shrink-0" id="student-tab-switcher">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-[#c8f000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
            id="tab-btn-chat"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>💬 अभ्यास गप्पा (Tutor Chat)</span>
          </button>
          
          <button
            onClick={() => setActiveTab("textbooks")}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "textbooks"
                ? "bg-[#c8f000] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
            id="tab-btn-textbooks"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📚 पुस्तक कपाट (Bookshelf)</span>
          </button>
        </div>

        {activeTab === "chat" && (
          <>
            {/* Chat Messages Section */}
            <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 bg-[#f9f9f7]">
              {messages.map((msg, idx) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col max-w-3xl ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"} w-full`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === "user" ? (
                      <button 
                        onClick={performProfileReset}
                        className="flex items-center gap-1.5 px-2 py-0.5 border border-black bg-white hover:bg-neutral-100 rounded transition-colors text-xs text-black font-extrabold cursor-pointer select-none"
                        title={profile?.language === "mr" ? "प्रोफाइल बदला" : "Edit Profile"}
                      >
                        <span>{profile?.name} (विद्यार्थी)</span>
                        <div className="w-5 h-5 rounded-full border border-black bg-[#e5473b] flex items-center justify-center text-white text-[9px] font-black">ST</div>
                        <Edit className="w-2.5 h-2.5 text-neutral-500 hover:text-black transition-colors" />
                      </button>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full border border-black bg-[#c8f000] flex items-center justify-center text-black text-[10px] font-black">GG</div>
                        <span className="text-xs text-black font-extrabold">ग्राम-ज्ञान शिक्षक (AI Guide)</span>
                        
                        {msg.isOfflineCached && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-white font-extrabold rounded border border-black uppercase tracking-wider animate-pulse ml-2 flex items-center gap-1">
                            <WifiOff className="w-2.5 h-2.5" />
                            <span>सुरक्षित ऑफलाईन संदर्भ</span>
                          </span>
                        )}
                      </>
                    )}
                    <span className="text-[10px] text-neutral-400 font-bold ml-1">{msg.timestamp}</span>
                  </div>

                  {/* Message Content Bubble (Neo brutalist card style) */}
                  <div className={`p-4 border-3 border-black text-sm md:text-base leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-white rounded-l-xl rounded-tr-lg" 
                      : "bg-white rounded-r-xl rounded-tl-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  }`}>
                    {/* Process Text newlines */}
                    <div className="whitespace-pre-line font-medium text-slate-800">
                      {msg.text}
                    </div>

                    {/* CITATIONS AND CULTURAL ANALOGY COMPONENT */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t-2 border-dashed border-black">
                        <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500 font-extrabold">
                          <BookMarked className="w-4 h-4 text-emerald-600" />
                          <span>शासकीय पुस्तक संदर्भ (Official Curriculum Citations):</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {msg.citations.map((cite, cIdx) => (
                            <div key={cIdx} className="bg-amber-50/50 border-2 border-black p-3 text-xs rounded relative overflow-hidden">
                              <div className="absolute right-1 top-1 bg-yellow-300 font-black px-1.5 py-0.5 text-[9px] border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                पुस्तकाचे पान क्र. {cite.page}
                              </div>
                              
                              <div className="font-extrabold text-black flex items-center gap-1 mb-1 pr-12">
                                <span>{cite.subject}</span>
                                <span>•</span>
                                <span className="text-emerald-700">{cite.chapter}</span>
                              </div>
                              
                              <p className="text-gray-600 italic leading-relaxed border-l-2 border-gray-400 pl-2 py-0.5">
                                "{cite.snippet}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cultural Analogy weaved Spotlight Badge */}
                    {msg.analogyUsed && (
                      <div className="mt-3 p-3 bg-[#c8f000]/10 border-2 border-dashed border-[#a0c000] rounded flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#a0c000] uppercase tracking-wider">
                          <Lightbulb className="w-4 h-4 fill-[#c8f000] text-black" />
                          <span>ग्राम-गोष्ट संदर्भ (Village Analogy matched)</span>
                        </div>
                        <div className="text-xs text-slate-700 font-extrabold">
                          संकल्पना ({msg.analogyUsed.concept}) • {msg.analogyUsed.type === "agricultural_tool" ? "शेती अवजारे" : msg.analogyUsed.type === "village_well" ? "विहीर व पाणी उपसा" : "घरगुती दैनिक गोष्ट"}
                        </div>
                        <p className="text-xs text-[#111111] font-bold bg-[#c8f000]/15 p-2 rounded border border-black/10">
                          {msg.analogyUsed.text}
                        </p>
                      </div>
                    )}

                    {/* Audio Voiceback Controls for child comprehension assistance */}
                    {msg.role === "assistant" && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-2">
                        {activeSpeechText === msg.text ? (
                          <button 
                            onClick={handleVoiceStop}
                            className="px-2.5 py-1 text-xs font-extrabold bg-[#e5473b] hover:bg-red-600 text-white border-2 border-black rounded shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 flex items-center gap-1 cursor-pointer"
                            id={`stop-speech-${idx}`}
                          >
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>थांबा (Stop Audio)</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleVoicePlay(msg.text)}
                            className="px-2.5 py-1 text-xs font-black bg-[#c8f000] hover:bg-[#a0c000] text-black border-2 border-black rounded shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 flex items-center gap-1 cursor-pointer"
                            id={`play-speech-${idx}`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>अवाज ऐका ({profile?.language === "mr" ? "मराठीत ऐका" : "Speak text"})</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 text-xs font-extrabold text-[#e5473b] bg-white p-3 border-2 border-black brutalist-card max-w-[240px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" id="loading-indicator">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span>ग्राम-ज्ञान उत्तर शोधत आहे...</span>
                </div>
              )}
            </div>

            {/* 4. ACTIVE INPUT CONTROLS SECTION */}
            <div className="p-3 md:p-4 bg-white border-t-3 border-black space-y-3 shrink-0">
              
              {/* Sugguestions prompt cookies deck */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex-shrink-0 flex items-center gap-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span>प्रश्नांच्या चकत्या :</span>
                </span>
                
                {SUGGESTED_QUESTIONS.filter(qn => qn.chapter === activeChapter).map((qn, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => handleQuerySubmit(profile?.language === "mr" ? qn.text_mr : qn.text_en)}
                    className="px-3 py-1 text-[11px] font-black bg-[#f2f2f0] hover:bg-[#c8f000] border-2 border-black rounded-full transition-colors whitespace-nowrap cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {profile?.language === "mr" ? qn.text_mr : qn.text_en}
                  </button>
                ))}
              </div>

              {/* Core Input box */}
              <div className="relative flex items-center gap-2 w-full pr-1">
                {/* SPEECH RECORDING WAVE VISUALIZER BAR */}
                {isListening && (
                  <div className="absolute top-[-30px] left-2 bg-[#e5473b] border-2 border-black text-white text-[10px] font-black px-2 py-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] animate-bounce z-10 flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      <div className="w-1 h-3.5 bg-white rounded animate-pulse" />
                      <div className="w-1 h-2 bg-white rounded animate-pulse delay-75" />
                      <div className="w-1 h-4 bg-white rounded animate-pulse delay-100" />
                    </div>
                    <span>मी बोलणे ऐकत आहे... (Speak clearly)</span>
                  </div>
                )}
                
                {/* Mic Transcription trigger */}
                <button
                  onClick={toggleVoiceRecording}
                  className={`p-3 border-3 border-black rounded-xl cursor-pointer transition-transform shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                    isListening 
                      ? "bg-[#e5473b] text-white animate-pulse" 
                      : "bg-white hover:bg-orange-50 text-black"
                  }`}
                  title="माईक दाबून प्रश्न विचारा (Tap to speak)"
                  id="voice-mic-button"
                >
                  <Mic className="w-6 h-6" />
                </button>

                {/* Inp entry */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuerySubmit()}
                  placeholder={profile?.language === "mr" 
                    ? "इथे विज्ञानाचा प्रश्न लिहा... (उदा. सूर्याचे प्रकाशसंश्लेषण म्हणजे काय?)" 
                    : "Ask any scientific concept here... (e.g. What is Kepler's law?)"}
                  className="flex-1 px-4 py-3.5 border-3 border-black rounded-xl font-bold focus:outline-none focus:bg-[#c8f000]/5 placeholder:text-gray-400 font-sans shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  disabled={isLoading}
                  maxLength={150}
                  id="chat-text-input"
                />

                {/* SEND */}
                <button
                  onClick={() => handleQuerySubmit()}
                  className="p-3.5 bg-[#c8f000] text-black border-3 border-black rounded-xl cursor-pointer transition-transform shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#a0c000] active:translate-y-0.5"
                  disabled={isLoading}
                  id="search-submit-btn"
                >
                  <Send className="w-5 h-5 flex-shrink-0" />
                </button>

                {/* Clear history button */}
                <button
                  onClick={clearChatHistory}
                  className="p-3 border-3 border-black rounded-xl hover:bg-neutral-100 text-gray-500 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="चर्चा साफ करा (Clear Chat)"
                  id="clear-chat-history"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold px-1.5">
                <span>* मुलांसाठी सोपे विज्ञान, संकल्पना चित्रे आणि घरगुती गोष्टी समाविष्ट</span>
                <span className="text-[#e5473b] font-black">१००% ऑफलाईन-पर्यायी प्रणाली</span>
              </div>
            </div>
          </>
        )}

        {activeTab === "textbooks" && (
          <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 bg-[#f9f9f7]">
            <div className="bg-white border-3 border-black p-5 brutalist-card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-black mb-1">📚 शासकीय विज्ञान पुस्तक कपाट (Interactive Curriculum Bookshelf)</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Live Pre-seeded Maharashtra SSC & CBSE Chunks</p>
                </div>
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    value={textbookSearch}
                    onChange={(e) => setTextbookSearch(e.target.value)}
                    placeholder="पुढील शोध घ्या (e.g. force)..."
                    className="w-full px-3 py-1.5 text-xs border-2 border-black font-extrabold focus:outline-none focus:bg-[#c8f000]/10"
                    id="textbook-search-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {TEXTBOOK_CHUNKS.filter(c => 
                  c.title.toLowerCase().includes(textbookSearch.toLowerCase()) ||
                  c.chapter.toLowerCase().includes(textbookSearch.toLowerCase()) ||
                  c.content.toLowerCase().includes(textbookSearch.toLowerCase())
                ).map(c => (
                  <div key={c.id} className="border-3 border-black p-4 bg-white relative overflow-hidden flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform duration-100">
                    <div className="absolute right-2 top-2 bg-[#c8f000] border-2 border-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      {c.board === "SSC_MH" ? "MH Board" : "CBSE / NCERT"} • Class {c.class}
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase mb-1">{c.subject}</div>
                      <h4 className="text-sm font-black text-black leading-tight mb-2 pr-16">{c.title}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-bold mb-3 italic bg-neutral-50 p-2 border-l-3 border-gray-400">
                        "{c.content}"
                      </p>
                    </div>
                    <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between items-center text-[10px] text-gray-500 font-extrabold">
                      <span>{c.chapter}</span>
                      <span className="bg-gray-100 text-black px-2 py-0.5 border border-black">पान क्र. {c.page}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. TEACHER CONTRIBUTIONS MODAL OVERLAY */}
      <AnimatePresence>
        {showTeacherModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
            id="teacher-modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border-4 border-black p-5 md:p-6 max-w-lg w-full brutalist-card my-8"
              id="teacher-modal-container"
            >
              <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-[#e5473b]" />
                  <h3 className="font-black text-lg">ग्राम-गोष्ट योगदान (Add Analogy)</h3>
                </div>
                <button 
                  onClick={() => setShowTeacherModal(false)}
                  className="p-1 hover:bg-neutral-100 rounded border-2 border-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {analogySuccessMsg ? (
                <div className="p-4 bg-emerald-50 border-3 border-[#22c55e] text-[#22c55e] font-black text-center text-sm rounded mb-4 animate-bounce">
                  {analogySuccessMsg}
                </div>
              ) : null}

              <form onSubmit={handleTeacherAnalogySubmit} className="space-y-4">
                <p className="text-xs text-gray-500 font-bold leading-relaxed mb-1">
                  शिक्षकांसाठी: आपण अनुभवलेला किंवा दैनंदिन शेतीच्या साधनांवरून मुलांच्या चटकन लक्षात येणारा एखादा विज्ञानाचा सिद्धांत उदाहरणासह लिहा.
                </p>

                {/* Concept identifier */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-1">विज्ञानाची संकल्पना (Scientific Concept e.g. lever, pressure, gravity):</label>
                  <input 
                    type="text" 
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    placeholder="उदा. गुरुत्वाकर्षण, lever, buoyancy"
                    className="w-full px-3 py-2 border-2 border-black font-extrabold focus:outline-none"
                    required
                  />
                </div>

                {/* Local Custom analogy written content */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-1">ग्रामीण स्थानिक उदाहरण / ग्रामीण गोष्ट (Regional Analogy Text):</label>
                  <textarea 
                    value={newAnalogyText}
                    onChange={(e) => setNewAnalogyText(e.target.value)}
                    placeholder="उदा. विहिरीतून पाणी काढताना बादली जोपर्यंत पाण्याखाली असते तोपर्यंत विहिरीच्या पाण्याचे प्लावक बल तिला वरच्या बाजूने ढकलत असते..."
                    className="w-full px-3 py-2 border-2 border-black font-bold h-24 focus:outline-none"
                    required
                  />
                </div>

                {/* Contributor Name */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-1">योगदानकर्त्याचे नाव आणि शाळा (Your Name & School):</label>
                  <input 
                    type="text" 
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    placeholder="उदा. सानप सर, जिल्हा परिषद प्राथमिक शाळा, Shelgaon"
                    className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#c8f000] text-black border-3 border-black font-black text-sm hover:bg-[#a0c000] transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    अभ्यासक्रमात जोडा (Submit Analogy)
                  </button>
                </div>
              </form>

              {/* Display existing custom contributions in active session */}
              {customAnalogies.length > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-gray-100">
                  <h4 className="text-xs font-black text-black uppercase mb-1.5">नुकतेच जोडलेले योगदान सूची:</h4>
                  <div className="max-h-24 overflow-y-auto space-y-2">
                    {customAnalogies.map((analogy: any) => (
                      <div key={analogy.id} className="p-2 border border-black bg-slate-50 rounded text-[11px]">
                        <span className="font-extrabold text-indigo-700 bg-white border border-black px-1.5 rounded mr-1">
                          {analogy.concept}
                        </span>
                        <span className="font-bold text-gray-500">by {analogy.contributor}</span>
                        <p className="text-gray-600 truncate mt-0.5">"{analogy.text_mr || analogy.text_en}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
