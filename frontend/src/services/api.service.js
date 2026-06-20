export async function postQueryToTutor(queryText, studentProfile) {
  try {
    const response = await fetch("/api/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query_text: queryText,
        profile: studentProfile
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned error status: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error("[API Error] postQueryToTutor failed:", err);
    throw err;
  }
}

export async function submitCustomAnalogy(payload) {
  try {
    const response = await fetch("/api/v1/analogy-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (err) {
    console.error("[API Error] submitCustomAnalogy failed:", err);
    throw err;
  }
}

export async function getCommunityWisdom() {
  const res = await fetch("/api/v1/custom-analogies");
  return await res.json();
}
