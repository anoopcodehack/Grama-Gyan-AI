export function extractKeyScienceConcepts(sentence) {
  const normalized = sentence.toLowerCase().trim();
  const conceptsFound = [];

  const keyMap = {
    "pressure": ["pressure", "दाब", "force/area", "atmospheric"],
    "gravity": ["gravity", "gravitation", "कर्षण", "गुरुत्वाकर्षण", "gophan", "गोफण"],
    "buoyancy": ["buoyant", "buoyancy", "plavakeey", "प्लावक", "force of water", "floating", "तरंगणे"],
    "inertia": ["inertia", "जडत्व", "law of motion", "न्यूटन जडत्व"],
    "friction": ["friction", "घर्षण", "rough surface", "घासणे"],
    "archimedes": ["archimedes", "अार्किमिडीज", "displacement of water", "principle"],
    "magnetism": ["magnet", "magnetic", "चुंबक", "लोहचुंबक", "magnetic field"],
    "photosynthesis": ["photosynthesis", "प्रकाशसंश्लेषण", "chlorophyll", "वनस्पती अन्न"]
  };

  for (const [englishTerm, syns] of Object.entries(keyMap)) {
    for (const syn of syns) {
      if (normalized.includes(syn)) {
        conceptsFound.push(englishTerm);
        break;
      }
    }
  }

  return conceptsFound.length > 0 ? conceptsFound : ["general_science"];
}
