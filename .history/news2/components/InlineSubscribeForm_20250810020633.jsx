"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

// 이메일 검증 함수
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function InlineSubscribeForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // localStorage에서 숨김 상태 확인
    const isHidden = localStorage.getItem("inlineSubscribeHidden");
    if (!isHidden) {
      setIsVisible(true);
    }
  }, []);

  const hideForm = () => {
    setIsVisible(false);
    localStorage.setItem("inlineSubscribeHidden", "true");
  };

  async function onSubmit(e) {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({ 
        description: "이메일 형식이 올바르지 않습니다.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "구독 실패");
      }
      
      toast({ 
        description: "확인 메일을 보냈어요. 메일함을 확인해 주세요.",
        variant: "default"
      });
      setEmail("");
      hideForm(); // 성공 시 폼 숨김
    } catch (err) {
      toast({ 
        description: err.message || "오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isVisible) return null;

  return (
    <div className="my-6 px-4 py-3 rounded-xl border bg-white/70 backdrop-blur relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={hideForm}
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="mb-3">
        <p className="text-sm text-gray-700 font-medium">
          이 기사들, 내 메일함으로 요약 받아보기
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-11 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/90"
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={loading} 
          className="h-11 px-6 font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : "구독하기"}
        </Button>
      </form>
    </div>
  );
}
