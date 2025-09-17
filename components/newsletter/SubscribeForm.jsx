"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAsyncLoading } from "@/lib/hooks/useLoading";
import { LoadingButton } from "@/components/ui/loading";

// 이메일 검증 함수
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function SubscribeForm({ compact = false, darkTheme = false }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const { loading, execute } = useAsyncLoading();

  async function onSubmit(e) {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({ 
        description: "이메일 형식이 올바르지 않습니다.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await execute(async () => {
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
          description: "구독 확인 메일을 보냈어요. 메일함을 확인해 주세요.",
          variant: "default"
        });
        setEmail("");
      });
    } catch (err) {
      toast({ 
        description: err.message || "오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-3 w-full">
      <Input
        type="email"
        placeholder="이메일 주소를 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`${compact ? 'h-10 text-sm' : 'h-12 text-base'} flex-1 px-4 border-2 rounded-lg focus:ring-2 transition-all duration-200 ${
          darkTheme 
            ? 'border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-blue-500/20' 
            : 'border-gray-200 bg-white/90 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-200'
        }`}
        disabled={loading}
      />
      <LoadingButton 
        type="submit" 
        loading={loading}
        loadingText="처리 중..."
        className={`${compact ? 'h-10 text-sm px-6' : 'h-12 text-base px-8'} font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0`}
      >
        구독하기
      </LoadingButton>
    </form>
  );
} 