import React, { createContext, useState, useEffect } from "react";

export const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const raw = localStorage.getItem("@student_profile_data");
    return raw
      ? JSON.parse(raw)
      : { name: "प्रिया (Priya)", village: "मुरूड (Murud)", board: "SSC_MH", class: "9", language: "mr" };
  });

  useEffect(() => {
    localStorage.setItem("@student_profile_data", JSON.stringify(profile));
  }, [profile]);

  return (
    <StudentContext.Provider value={{ profile, setProfile }}>
      {children}
    </StudentContext.Provider>
  );
}
