"use client";

import { createContext, useContext, useState } from "react";

const MypageContext = createContext();

export const useMypageContext = () => {
  const context = useContext(MypageContext);
  if (!context) {
    throw new Error("useMypageContext must be used within MypageProvider");
  }
  return context;
};

export const MypageProvider = ({ children }) => {
  const [readArticleCount, setReadArticleCount] = useState(0);
  const [scrapCount, setScrapCount] = useState(0);

  const value = {
    readArticleCount,
    setReadArticleCount,
    scrapCount,
    setScrapCount,
  };

  return (
    <MypageContext.Provider value={value}>{children}</MypageContext.Provider>
  );
};
