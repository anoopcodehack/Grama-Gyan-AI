/**
 * Web Speech API Integration Service
 */
export function getSpeechRecognitionInstance(languageCode = "mr-IN") {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn("Speech recognition is not natively supported in this browser environment.");
    return null;
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = languageCode;
  
  return recognition;
}
