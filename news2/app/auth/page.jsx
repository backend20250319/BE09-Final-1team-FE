"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Lock, User, Heart } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function AuthPage() {
  const [selectedInterests, setSelectedInterests] = useState([])

  const interests = [
    { id: "politics", label: "정치", icon: "🏛️" },
    { id: "economy", label: "경제", icon: "💰" },
    { id: "society", label: "사회", icon: "👥" },
    { id: "it", label: "IT/과학", icon: "💻" },
    { id: "sports", label: "스포츠", icon: "⚽" },
    { id: "culture", label: "문화", icon: "🎭" },
    { id: "international", label: "국제", icon: "🌍" },
    { id: "entertainment", label: "연예", icon: "🎬" },
  ]

  const toggleInterest = (interestId) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId],
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">NewsHub</h1>
          <p className="text-gray-600 mt-2">개인 맞춤 뉴스 서비스</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>로그인</CardTitle>
                <CardDescription>계정에 로그인하여 개인 맞춤 뉴스를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input id="email" type="email" placeholder="이메일을 입력하세요" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input id="password" type="password" placeholder="비밀번호를 입력하세요" className="pl-10" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm">
                      로그인 상태 유지
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    비밀번호 찾기
                  </Link>
                </div>
                <Button className="w-full">로그인</Button>
                <div className="text-center">
                  <p className="text-sm text-gray-600">또는</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Google로 로그인
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>회원가입</CardTitle>
                <CardDescription>새 계정을 만들어 개인 맞춤 뉴스 서비스를 시작하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input id="signup-name" placeholder="이름을 입력하세요" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input id="signup-email" type="email" placeholder="이메일을 입력하세요" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input id="signup-password" type="password" placeholder="비밀번호를 입력하세요" className="pl-10" />
                  </div>
                </div>

                {/* Interest Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    관심 분야 선택 (선택사항)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {interests.map((interest) => (
                      <div
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedInterests.includes(interest.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{interest.icon}</div>
                          <div className="text-sm font-medium">{interest.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="newsletter" />
                    <Label htmlFor="newsletter" className="text-sm">
                      뉴스레터 구독 (매일 아침 맞춤 뉴스 받기)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm">
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        이용약관
                      </Link>{" "}
                      및{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        개인정보처리방침
                      </Link>
                      에 동의합니다
                    </Label>
                  </div>
                </div>

                <Button className="w-full">회원가입</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
