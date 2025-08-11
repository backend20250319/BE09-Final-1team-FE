"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// 이메일 검증 함수
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function SubscribeForm({ compact = false }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
        description: "구독 확인 메일을 보냈어요. 메일함을 확인해 주세요.",
        variant: "default"
      });
      setEmail("");
    } catch (err) {
      toast({ 
        description: err.message || "오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="이메일 주소를 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${compact ? 'h-10 text-sm' : 'h-12 text-base'} w-full px-4 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 bg-white shadow-sm`}
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={loading} 
          className={`${compact ? 'h-10 text-sm' : 'h-12 text-base'} w-full font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              처리 중...
            </div>
          ) : (
            "구독하기"
          )}
        </Button>
      </form>
      
      {!compact && (
        <p className="text-xs text-gray-500 text-center">
          언제든지 구독을 해지할 수 있습니다.
        </p>
      )}
    </div>
  );
} 