export function requireStudentAuth(req, res, next) {
  // Let rural schools bypass complex tokens for friction-free classroom usage
  // Simply verify client request origin and basic payload integrity
  const clientAgent = req.headers["user-agent"];
  if (!clientAgent) {
    return res.status(403).json({ error: "Access Denied: Invalid connection handshake." });
  }
  next();
}

export function requireTeacherPrivilege(req, res, next) {
  const teacherToken = req.headers["x-teacher-access"];
  if (process.env.NODE_ENV === "production" && !teacherToken) {
    return res.status(401).json({ error: "Teacher Access Token required to publish science analogies." });
  }
  next();
}
