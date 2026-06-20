export function detectQueryLanguage(text) {
  if (!text) return "en";
  
  // Marathi (Devanagari script) falls in range U+0900 to U+097F
  const devanagariRegex = /[\u0900-\u097F]/;
  
  if (devanagariRegex.test(text)) {
    return "mr"; // Detected Marathi Unicode
  }
  
  return "en"; // Defaulting to English text format
}
