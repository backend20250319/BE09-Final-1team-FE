"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { KakaoShareButton } from "./KakaoShareButton"

// 카카오 공유 기능 테스트 컴포넌트
export default function KakaoShareTest() {
  const [testData, setTestData] = useState({
    title: "📰 오늘의 테크 뉴스",
    description: "최신 기술 트렌드를 확인하세요!",
    imageUrl: "http://localhost:3000/images/news1.jpg",
    url: "http://localhost:3000/newsletter/test",
    category: "Technology",
    author: "Newsphere",
    date: new Date().toLocaleDateString("ko-KR"),
    sections: [
      {
        type: "article",
        items: [
          { title: "AI 기술의 새로운 돌파구" },
          { title: "클라우드 컴퓨팅의 미래" },
          { title: "스타트업 투자 동향" }
        ]
      }
    ]
  })

  const handleInputChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>카카오 공유 기능 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={testData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="뉴스레터 제목"
              />
            </div>
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                value={testData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="카테고리"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={testData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="뉴스레터 설명"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">썸네일 이미지 URL</Label>
            <Input
              id="imageUrl"
              value={testData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <Label htmlFor="url">공유 URL</Label>
            <Input
              id="url"
              value={testData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://example.com/newsletter"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">작성자</Label>
              <Input
                id="author"
                value={testData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="작성자"
              />
            </div>
            <div>
              <Label htmlFor="date">발행일</Label>
              <Input
                id="date"
                value={testData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                placeholder="2024. 1. 15."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>공유 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <KakaoShareButton 
              data={testData}
              templateId={123798}
              useCustomTemplate={true}
            >
              커스텀 템플릿으로 공유
            </KakaoShareButton>

            <KakaoShareButton 
              data={testData}
              useCustomTemplate={false}
            >
              기본 템플릿으로 공유
            </KakaoShareButton>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>현재 설정:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>템플릿 ID: 123798</li>
              <li>썸네일 변수: thumbnail</li>
              <li>이미지 URL: {testData.imageUrl}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>전송될 데이터 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify({
              templateId: 123798,
              templateArgs: {
                'TITLE': testData.title,
                'DESCRIPTION': testData.description,
                'thumbnail': testData.imageUrl,
                'WEB_URL': testData.url,
                'MOBILE_URL': testData.url,
                'PUBLISHED_DATE': testData.date,
                'CATEGORY': testData.category,
                'AUTHOR': testData.author,
                'SUMMARY_1': testData.sections?.[0]?.items?.[0]?.title || '',
                'SUMMARY_2': testData.sections?.[0]?.items?.[1]?.title || '',
                'SUMMARY_3': testData.sections?.[0]?.items?.[2]?.title || '',
                'ARTICLE_COUNT': testData.sections?.[0]?.items?.length || 0
              }
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
