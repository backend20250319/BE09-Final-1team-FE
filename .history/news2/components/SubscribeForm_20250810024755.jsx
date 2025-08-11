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
    <form onSubmit={onSubmit} className={compact ? "flex gap-2" : "space-y-3"}>
      <Input
        type="email"
        placeholder="이메일 주소"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/50 border-gray-200"
        disabled={loading}
      />
      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full gradient-bg hover:shadow-lg"
      >
        {loading ? "처리 중..." : "구독하기"}
      </Button>
    </form>
  );
} 