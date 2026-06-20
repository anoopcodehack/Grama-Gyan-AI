const STORAGE_KEY = "@grama_gyan_offline_history";

export function loadOfflineChatHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Local storage lookup failed:", err);
    return [];
  }
}

export function saveOfflineChatHistory(messagesList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesList));
  } catch (err) {
    console.error("Failed to commit messages to local storage:", err);
  }
}

export function clearOfflineChat() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Local storage clear failed:", err);
  }
}
