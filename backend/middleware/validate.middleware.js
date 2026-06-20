export function validateQueryObject(req, res, next) {
  const { query_text, profile } = req.body;
  
  if (!query_text || typeof query_text !== "string" || query_text.trim().length === 0) {
    return res.status(400).json({ error: "Validation Failure", message: "कृपया आपला प्रश्न प्रविष्ट करा (Please input a valid question text)." });
  }
  
  if (!profile) {
    return res.status(400).json({ error: "Validation Failure", message: "Student learning profile context must be supplied." });
  }
  
  const { board, class: classNum, language } = profile;
  if (!board || !classNum || !language) {
    return res.status(400).json({ error: "Validation Failure", message: "Learner profile must explicitly define Board, Class, and Language parameters." });
  }
  
  next();
}
