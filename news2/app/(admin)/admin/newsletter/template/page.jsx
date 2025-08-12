"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Save,
  Palette,
  Type,
  Image,
  Layout,
  Settings
} from "lucide-react"

export default function NewsletterTemplate() {
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // 샘플 템플릿 데이터
  const templates = [
    {
      id: 1,
      name: "기본 뉴스레터",
      description: "일반적인 뉴스레터 템플릿",
      category: "기본",
      lastModified: "2024-01-15",
      usage: 15
    },
    {
      id: 2,
      name: "IT 뉴스 템플릿",
      description: "IT 관련 뉴스에 최적화된 템플릿",
      category: "IT",
      lastModified: "2024-01-14",
      usage: 8
    },
    {
      id: 3,
      name: "경제 브리핑 템플릿",
      description: "경제 뉴스 전용 템플릿",
      category: "경제",
      lastModified: "2024-01-13",
      usage: 12
    },
    {
      id: 4,
      name: "환경 리포트 템플릿",
      description: "환경 관련 뉴스 템플릿",
      category: "환경",
      lastModified: "2024-01-12",
      usage: 5
    }
  ]

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    content: ""
  })

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">템플릿 목록</TabsTrigger>
            <TabsTrigger value="editor">템플릿 에디터</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">뉴스레터 템플릿</h2>
              <Button onClick={() => setActiveTab("editor")}>
                <Plus className="h-4 w-4 mr-2" />
                새 템플릿 생성
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover-lift cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>마지막 수정: {template.lastModified}</span>
                        <span>사용 횟수: {template.usage}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">템플릿 에디터</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  미리보기
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Editor Tools */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">편집 도구</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>템플릿 정보</Label>
                      <Input 
                        placeholder="템플릿 이름"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                      />
                      <Input 
                        placeholder="카테고리"
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                      />
                      <Textarea 
                        placeholder="설명"
                        value={newTemplate.description}
                        onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>편집 도구</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          <Type className="h-4 w-4 mr-1" />
                          텍스트
                        </Button>
                        <Button variant="outline" size="sm">
                          <Image className="h-4 w-4 mr-1" />
                          이미지
                        </Button>
                        <Button variant="outline" size="sm">
                          <Layout className="h-4 w-4 mr-1" />
                          레이아웃
                        </Button>
                        <Button variant="outline" size="sm">
                          <Palette className="h-4 w-4 mr-1" />
                          색상
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>설정</Label>
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-1" />
                        고급 설정
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Editor */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>템플릿 내용</CardTitle>
                    <CardDescription>HTML과 CSS를 사용하여 템플릿을 편집하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="HTML 템플릿을 입력하세요..."
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                      className="min-h-[500px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">템플릿 미리보기</h2>
              <div className="flex space-x-2">
                <Button variant="outline">데스크톱</Button>
                <Button variant="outline">모바일</Button>
                <Button variant="outline">태블릿</Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="max-w-2xl mx-auto bg-white border rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">샘플 뉴스레터</h1>
                    <p className="text-gray-600">2024년 1월 15일</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">주요 뉴스</h2>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-medium text-gray-800 mb-2">AI 기술의 미래 전망</h3>
                        <p className="text-gray-600 text-sm">
                          최신 AI 기술 동향과 미래 전망에 대한 전문가들의 분석이 이어지고 있습니다...
                        </p>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">경제 동향</h2>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h3 className="font-medium text-gray-800 mb-2">경제 정책 변화 분석</h3>
                        <p className="text-gray-600 text-sm">
                          새로운 경제 정책이 시장에 미치는 영향에 대한 분석이 나오고 있습니다...
                        </p>
                      </div>
                    </div>

                    <div className="text-center pt-6 border-t">
                      <p className="text-sm text-gray-500">
                        이 뉴스레터를 구독 취소하려면 <a href="#" className="text-blue-600">여기</a>를 클릭하세요.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 