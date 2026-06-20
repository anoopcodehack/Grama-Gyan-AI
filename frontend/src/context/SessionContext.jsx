import React, { createContext, useState } from "react";

export const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <SessionContext.Provider value={{ messages, setMessages, isLoading, setIsLoading, clearChat }}>
      {children}
    </SessionContext.Provider>
  );
}
