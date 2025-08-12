"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, ThumbsUp, Share2, MoreHorizontal, TrendingUp, Users, Sparkles } from "lucide-react"
import Header from "@/components/header"
import { TextWithTooltips } from "@/components/tooltip"

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const categories = ["전체", "정치", "경제", "사회", "IT/과학", "스포츠", "문화"]

  const discussions = [
    {
      id: 1,
      title: "AI 기술 발전이 우리 일자리에 미치는 영향에 대해 어떻게 생각하시나요?",
      content: "최근 AI 기술이 급속도로 발전하면서 많은 분야에서 자동화가 진행되고 있습니다. 이에 대해 긍정적인 측면과 우려되는 측면이 모두 있는 것 같은데, 여러분의 생각은 어떠신가요?",
      author: {
        name: "김철수",
        avatar: "/placeholder-user.jpg",
        level: "레벨 5"
      },
      category: "IT/과학",
      replies: 23,
      likes: 45,
      views: 156,
      createdAt: "2시간 전",
      tags: ["AI", "일자리", "기술발전"]
    },
    {
      id: 2,
      title: "2024년 경제 전망, 개인 투자자로서 준비해야 할 것은?",
      content: "올해 경제 상황이 예상보다 복잡해 보입니다. 개인 투자자로서 어떤 방향으로 포트폴리오를 구성하는 것이 좋을지 의견을 나누어 보겠습니다.",
      author: {
        name: "이영희",
        avatar: "/placeholder-user.jpg",
        level: "레벨 3"
      },
      category: "경제",
      replies: 18,
      likes: 32,
      views: 89,
      createdAt: "4시간 전",
      tags: ["투자", "경제", "포트폴리오"]
    },
    {
      id: 3,
      title: "환경보호 정책, 실효성과 실현 가능성에 대한 토론",
      content: "정부가 발표한 새로운 환경보호 정책에 대해 다양한 의견이 나오고 있습니다. 정책의 실효성과 실현 가능성에 대해 토론해 보시죠.",
      author: {
        name: "박민수",
        avatar: "/placeholder-user.jpg",
        level: "레벨 7"
      },
      category: "사회",
      replies: 31,
      likes: 67,
      views: 234,
      createdAt: "6시간 전",
      tags: ["환경", "정책", "지속가능"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 animate-slide-in">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Sparkles className="h-8 w-8 mr-3 text-purple-500 animate-pulse-slow" />
                커뮤니티
              </h1>
              <p className="text-gray-600">뉴스에 대한 다양한 의견을 나누고 토론해보세요</p>
            </div>

            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category, index) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap hover-lift ${
                      isLoaded ? 'animate-slide-in' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Create Discussion */}
            <Card className="mb-6 glass hover-lift animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                  새로운 토론 시작하기
                </CardTitle>
                <CardDescription>
                  관심 있는 주제에 대해 토론을 시작해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="토론 제목을 입력하세요" className="bg-white/50 border-gray-200" />
                  <Textarea 
                    placeholder="토론 내용을 작성하세요..." 
                    className="min-h-[100px] bg-white/50 border-gray-200"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {["정치", "경제", "사회", "IT/과학"].map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer hover:bg-blue-700 transition"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="gradient-bg hover:shadow-lg transition-all duration-300">
                      토론 시작
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discussions List */}
            <div className="space-y-4">
              {discussions.map((discussion, index) => (
                <Card 
                  key={discussion.id} 
                  className={`glass hover-lift animate-slide-in ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${(index + 1) * 0.2}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={discussion.author.avatar} />
                          <AvatarFallback>{discussion.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{discussion.author.name}</span>
                            <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                              {discussion.author.level}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                            <span>{discussion.createdAt}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {discussion.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="hover-glow">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-3 hover:text-blue-600 cursor-pointer transition-colors">
                      <TextWithTooltips text={discussion.title} />
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      <TextWithTooltips text={discussion.content} />
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {discussion.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow"
                        >
                          #{tag}
                        </Badge>                      
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 hover-glow">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{discussion.replies}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 hover-glow">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-sm">{discussion.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="hover-glow">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <TrendingUp className="h-3 w-3" />
                        <span>{discussion.views}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Community Stats */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-500" />
                    커뮤니티 현황
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">총 회원수</span>
                      <span className="font-medium">12,345</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">오늘 토론</span>
                      <span className="font-medium">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">이번 주 댓글</span>
                      <span className="font-medium">156</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="text-lg">인기 태그</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["AI", "경제", "정치", "환경", "기술", "투자", "정책", "사회"].map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer hover:bg-blue-700 transition"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Community Guidelines */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <CardTitle className="text-lg">커뮤니티 가이드라인</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 서로를 존중하는 토론 문화를 만들어주세요</p>
                    <p>• 사실에 근거한 의견을 제시해주세요</p>
                    <p>• 타인을 비방하거나 차별하는 발언은 금지됩니다</p>
                    <p>• 스팸이나 광고성 게시물은 삭제될 수 있습니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 