"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const ScrapContext = createContext();

export function ScrapProvider({ children }) {
  const [scraps, setScraps] = useState([]);

  // localStorage 연동 (새로고침해도 유지)
  useEffect(() => {
    const saved = localStorage.getItem("scraps");
    if (saved) setScraps(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("scraps", JSON.stringify(scraps));
  }, [scraps]);

  const addScrap = (news) => {
    if (!scraps.find((item) => item.newsId === news.newsId)) {
      setScraps([
        { ...news, scrapedAt: new Date().toISOString().slice(0, 10) },
        ...scraps,
      ]);
    }
  };
  const removeScrap = (newsId) => {
    setScraps(scraps.filter((item) => item.newsId !== newsId));
  };

  return (
    <ScrapContext.Provider value={{ scraps, addScrap, removeScrap }}>
      {children}
    </ScrapContext.Provider>
  );
}

export function useScrap() {
  return useContext(ScrapContext);
}
