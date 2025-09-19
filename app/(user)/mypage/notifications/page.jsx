"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useKakaoPermission } from "@/lib/hooks/useKakaoPermission";
import { 
  Bell, 
  MessageCircle, 
  Mail, 
  Smartphone, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Shield
} from "lucide-react";

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const { 
    hasPermission, 
    checkTalkMessagePermission, 
    requestPermissionFlow,
    isLoading: isPermissionLoading 
  } = useKakaoPermission();

  // 알림 설정 상태
  const [settings, setSettings] = useState({
    kakaoNewsletter: false,
    emailNewsletter: true,
    webPush: false,
    smsAlerts: false,
    marketingEmails: false,
    frequency: 'daily', // daily, weekly, none
    time: '07:00'
  });

  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 설정 로드
  useEffect(() => {
    loadNotificationSettings();
    checkTalkMessagePermission();
  }, []);

  // 알림 설정 로드
  const loadNotificationSettings = async () => {
    try {
      const response = await fetch('/api/user/notification-settings', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('알림 설정 로드 실패:', error);
    }
  };

  // 알림 설정 저장
  const saveNotificationSettings = async (newSettings) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
        credentials: 'include'
      });

      if (response.ok) {
        setSettings(newSettings);
        toast({
          title: "설정 저장 완료",
          description: "알림 설정이 업데이트되었습니다.",
        });
      } else {
        throw new Error('설정 저장에 실패했습니다.');
      }
    } catch (error) {
      toast({
        description: error.message || "설정 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 카카오톡 뉴스레터 토글
  const handleKakaoNewsletterToggle = async (enabled) => {
    if (enabled && hasPermission === false) {
      try {
        await requestPermissionFlow('뉴스레터');
        const newSettings = { ...settings, kakaoNewsletter: true };
        await saveNotificationSettings(newSettings);
      } catch (error) {
        toast({
          description: "카카오톡 권한 요청에 실패했습니다.",
          variant: "destructive"
        });
      }
    } else {
      const newSettings = { ...settings, kakaoNewsletter: enabled };
      await saveNotificationSettings(newSettings);
    }
  };

  // 다른 설정 토글
  const handleSettingToggle = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    await saveNotificationSettings(newSettings);
  };

  // 빈도 변경
  const handleFrequencyChange = async (frequency) => {
    const newSettings = { ...settings, frequency };
    await saveNotificationSettings(newSettings);
  };

  // 시간 변경
  const handleTimeChange = async (time) => {
    const newSettings = { ...settings, time };
    await saveNotificationSettings(newSettings);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">알림 설정</h1>
        </div>
        <p className="text-gray-600">
          뉴스레터와 알림을 어떻게 받을지 설정하세요
        </p>
      </div>

      {/* 뉴스레터 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            뉴스레터 알림
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 카카오톡 뉴스레터 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium">카카오톡 뉴스레터</h3>
                {hasPermission === true && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    권한 있음
                  </Badge>
                )}
                {hasPermission === false && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    권한 필요
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                매일 아침 카카오톡으로 맞춤 뉴스를 받아보세요
              </p>
            </div>
            <Switch
              checked={settings.kakaoNewsletter}
              onCheckedChange={handleKakaoNewsletterToggle}
              disabled={isLoading || isPermissionLoading}
            />
          </div>

          {/* 이메일 뉴스레터 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">이메일 뉴스레터</h3>
                <Badge variant="secondary">기본</Badge>
              </div>
              <p className="text-sm text-gray-500">
                이메일로 뉴스레터를 받아보세요
              </p>
            </div>
            <Switch
              checked={settings.emailNewsletter}
              onCheckedChange={(checked) => handleSettingToggle('emailNewsletter', checked)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          {/* 발송 빈도 설정 */}
          <div className="space-y-3">
            <h3 className="font-medium">발송 빈도</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'daily', label: '매일', icon: Clock },
                { value: 'weekly', label: '주간', icon: Settings },
                { value: 'none', label: '해지', icon: Shield }
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={settings.frequency === value ? "default" : "outline"}
                  onClick={() => handleFrequencyChange(value)}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* 발송 시간 설정 */}
          {settings.frequency !== 'none' && (
            <div className="space-y-3">
              <h3 className="font-medium">발송 시간</h3>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500">에 발송</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 기타 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            기타 알림
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 웹 푸시 알림 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">웹 푸시 알림</h3>
              </div>
              <p className="text-sm text-gray-500">
                브라우저에서 실시간 뉴스 알림을 받아보세요
              </p>
            </div>
            <Switch
              checked={settings.webPush}
              onCheckedChange={(checked) => handleSettingToggle('webPush', checked)}
              disabled={isLoading}
            />
          </div>

          {/* SMS 알림 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium">SMS 알림</h3>
                <Badge variant="outline" className="text-xs">준비 중</Badge>
              </div>
              <p className="text-sm text-gray-500">
                중요한 뉴스를 SMS로 받아보세요
              </p>
            </div>
            <Switch
              checked={settings.smsAlerts}
              onCheckedChange={(checked) => handleSettingToggle('smsAlerts', checked)}
              disabled={true}
            />
          </div>

          {/* 마케팅 이메일 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-orange-600" />
                <h3 className="font-medium">마케팅 이메일</h3>
              </div>
              <p className="text-sm text-gray-500">
                이벤트, 프로모션 정보를 이메일로 받아보세요
              </p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => handleSettingToggle('marketingEmails', checked)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* 안내 정보 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">알림 설정 안내</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 카카오톡 뉴스레터는 메시지 전송 권한이 필요합니다</li>
                <li>• 웹 푸시 알림은 브라우저 설정에서 허용해야 합니다</li>
                <li>• 언제든지 설정을 변경하거나 구독을 해지할 수 있습니다</li>
                <li>• 개인정보는 안전하게 보호되며 마케팅 목적으로 사용되지 않습니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
