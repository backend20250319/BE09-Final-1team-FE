/**
 * 설정 탭 컴포넌트
 * - 뉴스레터 설정 (구독, 발송 시간, 빈도)
 * - 알림 설정 (브라우저 알림, 속보 알림)
 * - 계정 관리 (데이터 내보내기, 약관, 회원 탈퇴)
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, Bell, Settings, Users, Clock, Star, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserRole } from "@/lib/auth";

export default function SettingsTab() {
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [subscribedNewsletters, setSubscribedNewsletters] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // 사용자 역할 확인
    const role = getUserRole();
    setUserRole(role);
    
    // 로그인한 사용자인 경우에만 로컬 스토리지에서 구독 정보 복원
    if (role) {
      const savedSubscriptions = localStorage.getItem('newsletterSubscriptions');
      if (savedSubscriptions) {
        setSubscribedNewsletters(JSON.parse(savedSubscriptions));
      }
    }
  }, []);

  // 구독 해제 함수
  const handleUnsubscribe = (newsletterId) => {
    const updatedSubscriptions = subscribedNewsletters.filter(nl => nl.id !== newsletterId);
    setSubscribedNewsletters(updatedSubscriptions);
    
    if (userRole) {
      localStorage.setItem('newsletterSubscriptions', JSON.stringify(updatedSubscriptions));
    }
    
    toast({
      title: "구독 해제 완료",
      description: "뉴스레터 구독이 해제되었습니다.",
    });
  };

  return (
    <div className="space-y-6">
      {/* 구독 중인 뉴스레터 관리 카드 */}
      {userRole && subscribedNewsletters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              구독 중인 뉴스레터 ({subscribedNewsletters.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscribedNewsletters.map((newsletter) => (
                <div key={newsletter.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                        {newsletter.category}
                      </Badge>
                      <Badge className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                        {newsletter.frequency}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{newsletter.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{newsletter.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{newsletter.subscribers.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{newsletter.lastSent}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>4.8</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnsubscribe(newsletter.id)}
                    className="ml-4 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4 mr-1" />
                    구독해제
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 구독 중인 뉴스레터가 없을 때 안내 */}
      {userRole && subscribedNewsletters.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              뉴스레터 구독
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                구독 중인 뉴스레터가 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요
              </p>
              <Button asChild>
                <a href="/newsletter">뉴스레터 둘러보기</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 뉴스레터 설정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            뉴스레터 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 뉴스레터 구독 토글 */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="newsletter">뉴스레터 구독</Label>
              <p className="text-sm text-gray-600">
                매일 아침 맞춤 뉴스를 이메일로 받아보세요
              </p>
            </div>
            <Switch
              id="newsletter"
              checked={newsletterEnabled}
              onCheckedChange={setNewsletterEnabled}
            />
          </div>

          {/* 뉴스레터 구독 시 추가 설정 */}
          {newsletterEnabled && (
            <div className="ml-4 space-y-3 border-l-2 border-blue-200 pl-4">
              <div>
                <Label htmlFor="newsletter-time">발송 시간</Label>
                <Input
                  id="newsletter-time"
                  type="time"
                  defaultValue="07:00"
                  className="w-32"
                />
              </div>
              <div>
                <Label>발송 빈도</Label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      defaultChecked
                      className="mr-2"
                    />
                    매일
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      className="mr-2"
                    />
                    주간
                  </label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 알림 설정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 브라우저 알림 설정 */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">브라우저 알림</Label>
              <p className="text-sm text-gray-600">
                중요한 뉴스가 있을 때 알림을 받습니다
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          {/* 속보 알림 설정 */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="breaking-news">속보 알림</Label>
              <p className="text-sm text-gray-600">
                속보 뉴스를 즉시 알림으로 받습니다
              </p>
            </div>
            <Switch id="breaking-news" />
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            계정 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* 계정 관리 메뉴 버튼들 */}
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              데이터 내보내기
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              개인정보 처리방침
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              이용약관
            </Button>
            <Separator />
            {/* 회원 탈퇴 버튼 */}
            <Button variant="destructive" className="w-full">
              회원 탈퇴
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
