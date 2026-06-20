let currentSynthUtterance = null;

export function speakTextNatively(text, language = "mr") {
  // Stop previous speech
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "mr" ? "mr-IN" : "en-US";
  
  currentSynthUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopNativeSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentSynthUtterance = null;
}
