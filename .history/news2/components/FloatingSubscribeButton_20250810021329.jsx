"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function FloatingSubscribeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        throw new Error("구독 실패");
      }
      
      toast({ description: "구독 확인 메일을 보냈어요!" });
      setEmail("");
      setIsOpen(false);
    } catch (error) {
      toast({ description: "오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 lg:hidden"
      >
        <Mail className="h-6 w-6 text-white" />
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 lg:hidden">
          <Card className="w-full max-w-sm glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">뉴스레터 구독</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {loading ? "처리 중..." : "구독하기"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
