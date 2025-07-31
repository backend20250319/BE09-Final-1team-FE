"use client"

import { useState, useEffect } from "react";
import Header from "@/components/header";
import NewsletterHeader from "./components/NewsletterHeader";
import CategoryFilter from "./components/CategoryFilter";
import NewsletterGrid from "./components/NewsletterGrid";
import Sidebar from "./components/Sidebar";

export default function NewsletterPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const categories = ["전체", "정치", "경제", "사회", "IT/과학", "스포츠", "문화"];

  const newsletters = [
    {
      id: 1,
      title: "매일 경제 뉴스",
      description: "주요 경제 뉴스와 시장 동향을 매일 아침에 받아보세요",
      category: "경제",
      subscribers: 15420,
      frequency: "매일",
      lastSent: "2시간 전",
      isSubscribed: true,
      tags: ["경제", "투자", "시장동향"]
    },
    {
      id: 2,
      title: "AI & Tech Weekly",
      description: "AI와 기술 분야의 최신 동향을 주간으로 정리해드립니다",
      category: "IT/과학",
      subscribers: 8920,
      frequency: "주간",
      lastSent: "1일 전",
      isSubscribed: false,
      tags: ["AI", "기술", "혁신"]
    },
    {
      id: 3,
      title: "환경 & 지속가능",
      description: "환경 보호와 지속가능한 발전에 관한 뉴스를 전달합니다",
      category: "사회",
      subscribers: 5670,
      frequency: "주간",
      lastSent: "3일 전",
      isSubscribed: true,
      tags: ["환경", "지속가능", "정책"]
    },
    {
      id: 4,
      title: "정치 인사이드",
      description: "정치 현안과 정책 동향을 깊이 있게 분석해드립니다",
      category: "정치",
      subscribers: 12340,
      frequency: "매일",
      lastSent: "6시간 전",
      isSubscribed: false,
      tags: ["정치", "정책", "분석"]
    },
    {
      id: 5,
      title: "스포츠 하이라이트",
      description: "주요 스포츠 이벤트와 선수들의 활약을 요약해드립니다",
      category: "스포츠",
      subscribers: 9870,
      frequency: "매일",
      lastSent: "4시간 전",
      isSubscribed: false,
      tags: ["스포츠", "경기", "선수"]
    },
    {
      id: 6,
      title: "문화 & 라이프스타일",
      description: "문화, 예술, 라이프스타일 관련 트렌드를 소개합니다",
      category: "문화",
      subscribers: 7430,
      frequency: "주간",
      lastSent: "5일 전",
      isSubscribed: true,
      tags: ["문화", "예술", "라이프스타일"]
    }
  ];

  const [subscribedNewsletters, setSubscribedNewsletters] = useState(
    newsletters.filter(nl => nl.isSubscribed)
  );

  const handleSubscribe = (newsletterId) => {
    setSubscribedNewsletters(prev => {
      const newsletter = newsletters.find(nl => nl.id === newsletterId);
      if (prev.find(nl => nl.id === newsletterId)) {
        return prev.filter(nl => nl.id !== newsletterId);
      } else {
        return [...prev, newsletter];
      }
    });
  };

  const filteredNewsletters = selectedCategory === "전체" 
    ? newsletters 
    : newsletters.filter(newsletter => newsletter.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <NewsletterHeader />
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
              isLoaded={isLoaded} 
              newsletters={newsletters} 
              filteredNewsletters={filteredNewsletters} 
            />
            <NewsletterGrid 
              filteredNewsletters={filteredNewsletters} 
              isLoaded={isLoaded} 
              subscribedNewsletters={subscribedNewsletters} 
              handleSubscribe={handleSubscribe} 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
            />
          </div>
          <Sidebar 
            subscribedNewsletters={subscribedNewsletters} 
            handleSubscribe={handleSubscribe} 
            newsletters={newsletters} 
          />
        </div>
      </div>
    </div>
  );
}