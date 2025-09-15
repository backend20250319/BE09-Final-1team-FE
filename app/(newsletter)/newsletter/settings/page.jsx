"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings, 
  Palette, 
  Bell, 
  Mail, 
  Smartphone, 
  Target,
  Eye,
  Clock,
  Save,
  Palette as ColorPalette,
  Type,
  Layout
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function NewsletterSettings() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

  // 설정 상태
  const [settings, setSettings] = useState({
    // 알림 설정
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    dailyDigest: true,
    
    // 디자인 설정
    theme: "light",
    fontSize: "medium",
    layout: "compact",
    colorScheme: "blue",
    
    // 관심사 설정
    interests: ["경제", "IT/과학", "정치"],
    
    // 발송 설정
    preferredTime: "09:00",
    timezone: "Asia/Seoul",
    language: "ko"
  })

  const [newInterest, setNewInterest] = useState("")

  useEffect(() => {
    setIsLoaded(true)
    // 로컬 스토리지에서 설정 복원
    const savedSettings = localStorage.getItem('newsletterSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const saveSettings = (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem('newsletterSettings', JSON.stringify(newSettings))
    toast({
      title: "설정 저장됨",
      description: "설정이 성공적으로 저장되었습니다.",
    })
  }

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  const addInterest = () => {
    if (newInterest.trim() && !settings.interests.includes(newInterest.trim())) {
      const newInterests = [...settings.interests, newInterest.trim()]
      handleSettingChange('interests', newInterests)
      setNewInterest("")
    }
  }

  const removeInterest = (interest) => {
    const newInterests = settings.interests.filter(i => i !== interest)
    handleSettingChange('interests', newInterests)
  }

  const themes = [
    { value: "light", label: "라이트", description: "밝은 테마" },
    { value: "dark", label: "다크", description: "어두운 테마" },
    { value: "auto", label: "자동", description: "시스템 설정 따름" }
  ]

  const colorSchemes = [
    { value: "blue", label: "파란색", color: "bg-blue-500" },
    { value: "green", label: "초록색", color: "bg-green-500" },
    { value: "purple", label: "보라색", color: "bg-purple-500" },
    { value: "orange", label: "주황색", color: "bg-orange-500" },
    { value: "red", label: "빨간색", color: "bg-red-500" }
  ]

  const fontSizes = [
    { value: "small", label: "작게" },
    { value: "medium", label: "보통" },
    { value: "large", label: "크게" }
  ]

  const layouts = [
    { value: "compact", label: "간결", description: "콤팩트한 레이아웃" },
    { value: "comfortable", label: "편안", description: "여유로운 레이아웃" },
    { value: "detailed", label: "상세", description: "자세한 정보 표시" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Settings className="h-8 w-8 mr-3 text-blue-600" />
            뉴스레터 설정
          </h1>
          <p className="text-gray-600">뉴스레터 경험을 개인화하고 맞춤 설정을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notification Settings */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-500" />
                  알림 설정
                </CardTitle>
                <CardDescription>
                  뉴스레터 알림 방식을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <Label htmlFor="email-notifications">이메일 알림</Label>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-green-500" />
                        <Label htmlFor="push-notifications">푸시 알림</Label>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <Label htmlFor="daily-digest">일일 요약</Label>
                      </div>
                      <Switch
                        id="daily-digest"
                        checked={settings.dailyDigest}
                        onCheckedChange={(checked) => handleSettingChange('dailyDigest', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-orange-500" />
                        <Label htmlFor="weekly-digest">주간 요약</Label>
                      </div>
                      <Switch
                        id="weekly-digest"
                        checked={settings.weeklyDigest}
                        onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design Settings */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-500" />
                  디자인 설정
                </CardTitle>
                <CardDescription>
                  뉴스레터의 외관을 개인화하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="theme">테마</Label>
                      <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map((theme) => (
                            <SelectItem key={theme.value} value={theme.value}>
                              <div className="flex items-center space-x-2">
                                <span>{theme.label}</span>
                                <span className="text-xs text-gray-500">({theme.description})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="font-size">글자 크기</Label>
                      <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange('fontSize', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="layout">레이아웃</Label>
                      <Select value={settings.layout} onValueChange={(value) => handleSettingChange('layout', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {layouts.map((layout) => (
                            <SelectItem key={layout.value} value={layout.value}>
                              <div className="flex items-center space-x-2">
                                <span>{layout.label}</span>
                                <span className="text-xs text-gray-500">({layout.description})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>색상 테마</Label>
                      <div className="flex space-x-2 mt-2">
                        {colorSchemes.map((scheme) => (
                          <button
                            key={scheme.value}
                            onClick={() => handleSettingChange('colorScheme', scheme.value)}
                            className={`w-8 h-8 rounded-full ${scheme.color} ${
                              settings.colorScheme === scheme.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                            }`}
                            title={scheme.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests Settings */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-500" />
                  관심사 설정
                </CardTitle>
                <CardDescription>
                  관심 있는 주제를 설정하여 맞춤 뉴스레터를 받아보세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="새 관심사 추가..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    className="flex-1"
                  />
                  <Button onClick={addInterest} disabled={!newInterest.trim()}>
                    추가
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {settings.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center space-x-1">
                      <span>{interest}</span>
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Settings */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="text-lg">발송 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="preferred-time">선호 시간</Label>
                  <Input
                    id="preferred-time"
                    type="time"
                    value={settings.preferredTime}
                    onChange={(e) => handleSettingChange('preferredTime', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="timezone">시간대</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">한국 시간 (UTC+9)</SelectItem>
                      <SelectItem value="America/New_York">미국 동부 시간 (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">영국 시간 (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">언어</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="text-lg">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Save className="h-4 w-4 mr-2" />
                    설정 내보내기
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Layout className="h-4 w-4 mr-2" />
                    기본값으로 복원
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Type className="h-4 w-4 mr-2" />
                    미리보기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Summary */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="text-lg">설정 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>활성 알림:</span>
                    <span className="font-medium">
                      {[settings.emailNotifications, settings.pushNotifications].filter(Boolean).length}개
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>관심사:</span>
                    <span className="font-medium">{settings.interests.length}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span>테마:</span>
                    <span className="font-medium capitalize">{settings.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>발송 시간:</span>
                    <span className="font-medium">{settings.preferredTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 