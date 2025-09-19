"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Mail, 
  Clock, 
  Users, 
  Shield,
  Save,
  TestTube,
  Bell,
  Globe,
  Database
} from "lucide-react"

export default function NewsletterSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    senderName: "NewSphere",
    senderEmail: "newsletter@newsphere.com",
    replyToEmail: "support@newsphere.com",
    defaultSubject: "[NewSphere] {category} 뉴스레터",
    footerText: "이 뉴스레터를 구독 취소하려면 여기를 클릭하세요.",
    maxSubscribers: 10000,
    sendRate: 1000,
    timezone: "Asia/Seoul",
    autoSend: true,
    doubleOptIn: true,
    trackOpens: true,
    trackClicks: true
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">일반 설정</TabsTrigger>
            <TabsTrigger value="sending">발송 설정</TabsTrigger>
            <TabsTrigger value="privacy">개인정보</TabsTrigger>
            <TabsTrigger value="advanced">고급 설정</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">일반 설정</h2>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                설정 저장
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    발신자 정보
                  </CardTitle>
                  <CardDescription>뉴스레터 발송 시 표시될 발신자 정보를 설정하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senderName">발신자 이름</Label>
                    <Input
                      id="senderName"
                      value={settings.senderName}
                      onChange={(e) => handleSettingChange("senderName", e.target.value)}
                      placeholder="발신자 이름을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">발신자 이메일</Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      value={settings.senderEmail}
                      onChange={(e) => handleSettingChange("senderEmail", e.target.value)}
                      placeholder="발신자 이메일을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replyToEmail">회신 이메일</Label>
                    <Input
                      id="replyToEmail"
                      type="email"
                      value={settings.replyToEmail}
                      onChange={(e) => handleSettingChange("replyToEmail", e.target.value)}
                      placeholder="회신 받을 이메일을 입력하세요"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    기본 설정
                  </CardTitle>
                  <CardDescription>뉴스레터의 기본 동작을 설정하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultSubject">기본 제목</Label>
                    <Input
                      id="defaultSubject"
                      value={settings.defaultSubject}
                      onChange={(e) => handleSettingChange("defaultSubject", e.target.value)}
                      placeholder="기본 제목을 입력하세요"
                    />
                    <p className="text-xs text-gray-500">사용 가능한 변수: {'{category}'}, {'{date}'}, {'{title}'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerText">푸터 텍스트</Label>
                    <Textarea
                      id="footerText"
                      value={settings.footerText}
                      onChange={(e) => handleSettingChange("footerText", e.target.value)}
                      placeholder="푸터에 표시될 텍스트를 입력하세요"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">시간대</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="시간대를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Seoul">Asia/Seoul (UTC+9)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sending Settings Tab */}
          <TabsContent value="sending" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">발송 설정</h2>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                설정 저장
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    발송 제한
                  </CardTitle>
                  <CardDescription>발송 속도와 구독자 수 제한을 설정하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxSubscribers">최대 구독자 수</Label>
                    <Input
                      id="maxSubscribers"
                      type="number"
                      value={settings.maxSubscribers}
                      onChange={(e) => handleSettingChange("maxSubscribers", parseInt(e.target.value))}
                      placeholder="최대 구독자 수를 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sendRate">시간당 발송 제한</Label>
                    <Input
                      id="sendRate"
                      type="number"
                      value={settings.sendRate}
                      onChange={(e) => handleSettingChange("sendRate", parseInt(e.target.value))}
                      placeholder="시간당 최대 발송 수를 입력하세요"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>자동 발송</Label>
                      <p className="text-sm text-gray-500">예약된 뉴스레터 자동 발송</p>
                    </div>
                    <Switch
                      checked={settings.autoSend}
                      onCheckedChange={(checked) => handleSettingChange("autoSend", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TestTube className="h-5 w-5 mr-2" />
                    테스트 설정
                  </CardTitle>
                  <CardDescription>뉴스레터 테스트 발송을 위한 설정</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testEmail">테스트 이메일</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="테스트 발송할 이메일을 입력하세요"
                    />
                  </div>
                  <Button variant="outline" className="w-full">
                    <TestTube className="h-4 w-4 mr-2" />
                    테스트 발송
                  </Button>
                  <div className="text-sm text-gray-500">
                    <p>• 테스트 발송은 실제 구독자에게 발송되지 않습니다</p>
                    <p>• 발송 전에 반드시 테스트해보세요</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Settings Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">개인정보 설정</h2>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                설정 저장
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    구독 설정
                  </CardTitle>
                  <CardDescription>구독자 등록 및 관리 설정</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>이중 확인</Label>
                      <p className="text-sm text-gray-500">구독 시 이메일 확인 필요</p>
                    </div>
                    <Switch
                      checked={settings.doubleOptIn}
                      onCheckedChange={(checked) => handleSettingChange("doubleOptIn", checked)}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>이중 확인을 활성화하면 구독자가 이메일 확인 후에만 구독이 완료됩니다.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    추적 설정
                  </CardTitle>
                  <CardDescription>뉴스레터 열기 및 클릭 추적 설정</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>열기 추적</Label>
                      <p className="text-sm text-gray-500">뉴스레터 열기 추적</p>
                    </div>
                    <Switch
                      checked={settings.trackOpens}
                      onCheckedChange={(checked) => handleSettingChange("trackOpens", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>클릭 추적</Label>
                      <p className="text-sm text-gray-500">링크 클릭 추적</p>
                    </div>
                    <Switch
                      checked={settings.trackClicks}
                      onCheckedChange={(checked) => handleSettingChange("trackClicks", checked)}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>추적 기능을 비활성화하면 개인정보 보호가 강화되지만 분석 데이터를 얻을 수 없습니다.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Settings Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">고급 설정</h2>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                설정 저장
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    데이터베이스 설정
                  </CardTitle>
                  <CardDescription>뉴스레터 데이터 관리 설정</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>데이터 백업</Label>
                    <Button variant="outline" className="w-full">
                      백업 생성
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>데이터 정리</Label>
                    <Button variant="outline" className="w-full">
                      오래된 데이터 정리
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>• 백업은 매주 자동으로 생성됩니다</p>
                    <p>• 90일 이상 된 로그는 자동으로 삭제됩니다</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    API 설정
                  </CardTitle>
                  <CardDescription>외부 서비스 연동 설정</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API 키</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="API 키를 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">웹훅 URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="웹훅 URL을 입력하세요"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>• API 키는 외부 서비스 연동에 사용됩니다</p>
                    <p>• 웹훅은 발송 완료 시 알림을 받기 위해 사용됩니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 