/**
 * India Bhashini National Language Translation Mission (NLTM) Configuration
 */
export const bhashiniConfig = {
  userId: process.env.BHASHINI_USER_ID || "",
  apiKey: process.env.BHASHINI_API_KEY || "",
  pipelineId: process.env.BHASHINI_PIPELINE_ID || "",
  apiUrl: "https://dhruva.gov.in/services/inference/pipeline",
};

export function getBhashiniHeaders() {
  return {
    "Content-Type": "application/json",
    "userID": bhashiniConfig.userId,
    "ulcaApiKey": bhashiniConfig.apiKey,
  };
}
