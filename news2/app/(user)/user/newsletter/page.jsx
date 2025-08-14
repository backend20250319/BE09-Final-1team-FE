"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { 
  Mail, 
  Bell, 
  Settings, 
  Plus, 
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  Bookmark,
  Share2,
  CheckCircle
} from "lucide-react"
import Header from "@/components/header"
import { useToast } from "@/hooks/use-toast"

export default function UserNewsletter() {
  const [activeTab, setActiveTab] = useState("subscriptions")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  // 컴포넌트 마운트 시 localStorage에서 구독 상태 확인
  useEffect(() => {
    const stored = localStorage.getItem('subscribed')
    if (stored === 'true') {
      setIsSubscribed(true)
    }
  }, [])

  const [mySubscriptions, setMySubscriptions] = useState([])
  const [availableNewsletters, setAvailableNewsletters] = useState([])
  const [recentEmails, setRecentEmails] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = () => {
      setLoading(true)
      
      // 더미 데이터 사용
      const fallbackSubscriptions = [
        {
          id: 1,
          name: "주간 IT 뉴스",
          description: "IT 업계의 최신 동향과 기술 소식을 매주 전달합니다",
          category: "IT/과학",
          frequency: "주간",
          lastReceived: "2024-01-15",
          nextDelivery: "2024-01-22",
          status: "active",
          unreadCount: 2
        },
        {
          id: 2,
          name: "일간 경제 브리핑",
          description: "경제 뉴스와 시장 동향을 매일 간단히 요약해드립니다",
          category: "경제",
          frequency: "일간",
          lastReceived: "2024-01-15",
          nextDelivery: "2024-01-16",
          status: "active",
          unreadCount: 0
        },
        {
          id: 3,
          name: "월간 환경 리포트",
          description: "환경 보호와 지속가능한 발전에 대한 심층 분석",
          category: "사회",
          frequency: "월간",
          lastReceived: "2024-01-01",
          nextDelivery: "2024-02-01",
          status: "inactive",
          unreadCount: 0
        }
      ]
      
      const fallbackAvailable = [
        {
          id: 4,
          name: "스포츠 하이라이트",
          description: "주요 스포츠 경기 결과와 선수 소식을 전달합니다",
          category: "스포츠",
          frequency: "일간",
          subscribers: 12500,
          rating: 4.5
        },
        {
          id: 5,
          name: "문화 예술 소식",
          description: "영화, 음악, 미술 등 문화 예술계의 최신 소식",
          category: "문화",
          frequency: "주간",
          subscribers: 8900,
          rating: 4.3
        },
        {
          id: 6,
          name: "정치 동향 분석",
          description: "정치 현안과 정책 변화에 대한 전문적인 분석",
          category: "정치",
          frequency: "주간",
          subscribers: 15600,
          rating: 4.7
        }
      ]
      
      const fallbackEmails = [
        {
          id: 1,
          subject: "[주간 IT 뉴스] AI 기술의 미래 전망",
          sender: "주간 IT 뉴스",
          receivedAt: "2024-01-15 08:00",
          isRead: false,
          hasAttachment: false
        },
        {
          id: 2,
          subject: "[일간 경제 브리핑] 경제 정책 변화 분석",
          sender: "일간 경제 브리핑",
          receivedAt: "2024-01-15 07:00",
          isRead: true,
          hasAttachment: true
        },
        {
          id: 3,
          subject: "[주간 IT 뉴스] 새로운 프로그래밍 언어 동향",
          sender: "주간 IT 뉴스",
          receivedAt: "2024-01-14 08:00",
          isRead: false,
          hasAttachment: false
        }
      ]
      
      setMySubscriptions(fallbackSubscriptions)
      setAvailableNewsletters(fallbackAvailable)
      setRecentEmails(fallbackEmails)
      setLoading(false)
    }

    fetchData()
  }, [])
    {
      id: 1,
      subject: "[주간 IT 뉴스] AI 기술의 미래 전망",
      sender: "주간 IT 뉴스",
      receivedAt: "2024-01-15 08:00",
      isRead: false,
      hasAttachment: false
    },
    {
      id: 2,
      subject: "[일간 경제 브리핑] 경제 정책 변화 분석",
      sender: "일간 경제 브리핑",
      receivedAt: "2024-01-15 07:00",
      isRead: true,
      hasAttachment: true
    },
    {
      id: 3,
      subject: "[주간 IT 뉴스] 새로운 프로그래밍 언어 동향",
      sender: "주간 IT 뉴스",
      receivedAt: "2024-01-14 08:00",
      isRead: false,
      hasAttachment: false
    }
  ]

  // 구독 처리 함수
  const handleSubscribe = (newsletterId) => {
    const newsletter = availableNewsletters.find(nl => nl.id === newsletterId)
    if (newsletter) {
      // localStorage에 구독 상태 저장
      localStorage.setItem('subscribed', 'true')
      setIsSubscribed(true)
      
      toast({
        title: "구독 완료!",
        description: `${newsletter.name} 구독이 완료되었습니다.`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      })
    }
  }

  // 구독 해제 함수
  const handleUnsubscribe = () => {
    localStorage.removeItem('subscribed')
    setIsSubscribed(false)
    
    toast({
      title: "구독 해제 완료",
      description: "뉴스레터 구독이 해제되었습니다.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscriptions">내 구독</TabsTrigger>
            <TabsTrigger value="discover">뉴스레터 찾기</TabsTrigger>
            <TabsTrigger value="inbox">받은 편지함</TabsTrigger>
          </TabsList>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">내 뉴스레터 구독</h2>
              <Button onClick={() => setActiveTab("discover")}>
                <Plus className="h-4 w-4 mr-2" />
                새 뉴스레터 구독
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mySubscriptions.map((newsletter) => (
                <Card key={newsletter.id} className="hover-lift">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{newsletter.name}</CardTitle>
                        <CardDescription>{newsletter.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{newsletter.category}</Badge>
                        {newsletter.unreadCount > 0 && (
                          <Badge variant="destructive">{newsletter.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">발송 주기</span>
                        <span>{newsletter.frequency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">마지막 수신</span>
                        <span>{newsletter.lastReceived}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">다음 발송</span>
                        <span>{newsletter.nextDelivery}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={newsletter.status === "active"}
                            onCheckedChange={() => {}}
                          />
                          <span className="text-sm">
                            {newsletter.status === "active" ? "활성" : "비활성"}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">뉴스레터 찾기</h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="뉴스레터 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </div>
            </div>

            {/* 구독한 사용자에게 안내 메시지 */}
            {isSubscribed && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <h3 className="text-lg font-medium text-green-900">
                          이미 뉴스레터를 구독하고 계십니다!
                        </h3>
                        <p className="text-green-700 mt-1">
                          구독 중인 뉴스레터는 "내 구독" 탭에서 관리할 수 있습니다.
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleUnsubscribe}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      구독 해제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 구독하지 않은 사용자에게만 뉴스레터 카드 표시 */}
            {!isSubscribed && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableNewsletters.map((newsletter) => (
                  <Card key={newsletter.id} className="hover-lift">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{newsletter.name}</CardTitle>
                          <CardDescription>{newsletter.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{newsletter.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">발송 주기</span>
                          <span>{newsletter.frequency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">구독자 수</span>
                          <span>{newsletter.subscribers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">평점</span>
                          <span className="flex items-center">
                            ⭐ {newsletter.rating}
                          </span>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => handleSubscribe(newsletter.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          구독하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">받은 편지함</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Bookmark className="h-4 w-4 mr-2" />
                  북마크
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  공유
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>최근 받은 뉴스레터</CardTitle>
                <CardDescription>최근에 받은 뉴스레터 이메일들입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>발신자</TableHead>
                      <TableHead>받은 시간</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEmails.map((email) => (
                      <TableRow key={email.id} className={!email.isRead ? "bg-blue-50" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {!email.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            <span className={!email.isRead ? "font-semibold" : ""}>
                              {email.subject}
                            </span>
                            {email.hasAttachment && <span className="text-gray-400">📎</span>}
                          </div>
                        </TableCell>
                        <TableCell>{email.sender}</TableCell>
                        <TableCell>{email.receivedAt}</TableCell>
                        <TableCell>
                          <Badge variant={email.isRead ? "secondary" : "default"}>
                            {email.isRead ? "읽음" : "안읽음"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 