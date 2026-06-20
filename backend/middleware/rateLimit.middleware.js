const ipRequests = new Map();

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown_village";
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 45; // Generous limit for class settings
  
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  const record = ipRequests.get(ip);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return next();
  }
  
  record.count++;
  if (record.count > maxRequests) {
    return res.status(429).json({
      error: "Too Many Requests",
      message: "विद्यार्थी मित्रांनो, कृपया सावकाश प्रश्न विचारा! (Please wait before asking another question.)"
    });
  }
  
  next();
}
