"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Bell, 
  Rss, 
  Smartphone, 
  Globe,
  CheckCircle,
  ExternalLink,
  Copy,
  Share2
} from "lucide-react";

export default function AlternativeSubscriptionOptions({ 
  category = "뉴스레터",
  onEmailSubscribe = null,
  onWebPushSubscribe = null,
  onRssSubscribe = null
}) {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  // 이메일 검증
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 이메일 구독 처리
  const handleEmailSubscribe = async () => {
    if (!validateEmail(email)) {
      toast({
        description: "이메일 형식이 올바르지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    setIsSubscribing(true);
    try {
      if (onEmailSubscribe) {
        await onEmailSubscribe(email);
      } else {
        // 기본 이메일 구독 로직
        const response = await fetch("/api/newsletters/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            category,
            method: "email"
          }),
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("이메일 구독에 실패했습니다.");
        }

        toast({
          title: "이메일 구독 완료!",
          description: "이메일로 뉴스레터를 받아보실 수 있습니다.",
        });
      }
    } catch (error) {
      toast({
        description: error.message || "구독 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // 웹 푸시 구독 처리
  const handleWebPushSubscribe = async () => {
    try {
      if (!("Notification" in window)) {
        toast({
          description: "이 브라우저는 푸시 알림을 지원하지 않습니다.",
          variant: "destructive"
        });
        return;
      }

      if (Notification.permission === "denied") {
        toast({
          description: "푸시 알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.",
          variant: "destructive"
        });
        return;
      }

      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast({
            description: "푸시 알림 권한이 거부되었습니다.",
            variant: "destructive"
          });
          return;
        }
      }

      if (onWebPushSubscribe) {
        await onWebPushSubscribe();
      } else {
        // 기본 웹 푸시 구독 로직
        const response = await fetch("/api/newsletters/web-push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("웹 푸시 구독에 실패했습니다.");
        }

        toast({
          title: "웹 푸시 구독 완료!",
          description: "브라우저에서 뉴스레터 알림을 받을 수 있습니다.",
        });
      }
    } catch (error) {
      toast({
        description: error.message || "웹 푸시 구독 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // RSS 구독 처리
  const handleRssSubscribe = () => {
    const rssUrl = `${window.location.origin}/api/newsletters/rss?category=${encodeURIComponent(category)}`;
    
    if (onRssSubscribe) {
      onRssSubscribe(rssUrl);
    } else {
      // RSS URL 복사
      navigator.clipboard.writeText(rssUrl).then(() => {
        toast({
          title: "RSS URL 복사 완료!",
          description: "RSS 리더기에 붙여넣어 구독하세요.",
        });
      }).catch(() => {
        // 복사 실패 시 새 창으로 열기
        window.open(rssUrl, '_blank');
      });
    }
  };

  // RSS URL 복사
  const copyRssUrl = () => {
    const rssUrl = `${window.location.origin}/api/newsletters/rss?category=${encodeURIComponent(category)}`;
    navigator.clipboard.writeText(rssUrl).then(() => {
      toast({
        title: "RSS URL 복사 완료!",
        description: "RSS 리더기에 붙여넣어 구독하세요.",
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          다른 방법으로 구독하기
        </h3>
        <p className="text-sm text-gray-600">
          카카오톡 대신 다른 방법으로 <Badge variant="secondary">{category}</Badge> 뉴스레터를 받아보세요
        </p>
      </div>

      <div className="grid gap-4">
        {/* 이메일 구독 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">이메일 뉴스레터</CardTitle>
                <p className="text-sm text-gray-500">매일 아침 이메일로 받기</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              <Button 
                onClick={handleEmailSubscribe}
                disabled={isSubscribing || !email}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubscribing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    구독 중...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    이메일로 구독하기
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 웹 푸시 알림 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">웹 푸시 알림</CardTitle>
                <p className="text-sm text-gray-500">브라우저에서 알림 받기</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              onClick={handleWebPushSubscribe}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                웹 푸시 알림 구독하기
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* RSS 피드 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Rss className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base">RSS 피드</CardTitle>
                <p className="text-sm text-gray-500">RSS 리더기로 구독하기</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <code className="text-xs text-gray-600 flex-1 truncate">
                  {`${window.location.origin}/api/newsletters/rss?category=${encodeURIComponent(category)}`}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyRssUrl}
                  className="flex-shrink-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Button 
                onClick={handleRssSubscribe}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <div className="flex items-center">
                  <Rss className="h-4 w-4 mr-2" />
                  RSS 구독하기
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 앱 다운로드 (선택사항) */}
        <Card className="hover:shadow-md transition-shadow border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">모바일 앱</CardTitle>
                <p className="text-sm text-gray-500">앱에서 더 편리하게 받기</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                곧 출시 예정입니다
              </p>
              <Button 
                disabled
                variant="outline"
                className="w-full"
              >
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  앱 다운로드 (준비 중)
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 추가 안내 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">구독 방법 안내</p>
            <ul className="text-xs text-gray-600 mt-1 space-y-1">
              <li>• 이메일: 매일 아침 7시에 정기 발송</li>
              <li>• 웹 푸시: 실시간 뉴스 알림</li>
              <li>• RSS: RSS 리더기에서 자동 업데이트</li>
              <li>• 언제든지 구독 해지 가능</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
