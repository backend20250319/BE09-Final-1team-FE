"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import { Mail, Clock, Users, Star, TrendingUp, Bell, Zap, Filter, CheckCircle, AlertCircle, ArrowRight, User, RefreshCw } from "lucide-react"
import { TextWithTooltips } from "@/components/tooltip"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { getUserRole, getUserInfo } from "@/lib/auth"
import Header from "@/components/header"
import { useNewsletters, useUserSubscriptions, useSubscribeNewsletter, useUnsubscribeNewsletter } from "@/hooks/useNewsletter"

export default function NewsletterPageClient({ initialNewsletters }) {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)

  const [userRole, setUserRole] = useState(null)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  // React Query 훅들
  const { 
    data: newsletters = [], 
    isLoading: newslettersLoading, 
    error: newslettersError,
    refetch: refetchNewsletters 
  } = useNewsletters({
    initialData: initialNewsletters || [], // SSR 데이터를 초기값으로 사용
    staleTime: 0, // 즉시 stale로 설정하여 클라이언트에서 재검증
  })

  const { 
    data: userSubscriptions = [], 
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions 
  } = useUserSubscriptions({
    enabled: !!userRole, // 로그인한 사용자만 활성화
    retry: 1, // 재시도 횟수 제한
    retryDelay: 1000, // 재시도 간격
  })

  // 뮤테이션 훅들
  const subscribeMutation = useSubscribeNewsletter()
  const unsubscribeMutation = useUnsubscribeNewsletter()

  useEffect(() => {
    // 클라이언트에서 마운트된 후에만 로딩 상태를 true로 설정
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    
    // 사용자 역할 확인
    const role = getUserRole()
    setUserRole(role)
    
    // 클라이언트 사이드 렌더링 확인
    setIsClient(true)
    
    return () => clearTimeout(timer)
  }, [])

  const categories = ["전체", "정치", "경제", "사회", "생활", "세계", "IT/과학", "자동차/교통", "여행/음식", "예술"]

  const handleSubscribe = async (newsletterId) => {
    if (!userRole) {
      toast({
        title: "로그인이 필요합니다",
        description: "뉴스레터를 구독하려면 먼저 로그인해주세요.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      })
      return
    }

    const newsletter = newsletters.find(nl => nl.id === newsletterId)
    console.log('구독 처리:', { newsletterId, newsletter, userSubscriptions })
    
    const isCurrentlySubscribed = Array.isArray(userSubscriptions) && userSubscriptions.some(nl => 
      nl.category === newsletter.category || nl.preferredCategories?.includes(newsletter.category)
    )
    
    console.log('현재 구독 상태:', { isCurrentlySubscribed, category: newsletter.category })

    if (isCurrentlySubscribed) {
      // 구독 해제 - 해당 카테고리의 구독 찾기
      const subscription = userSubscriptions.find(nl => 
        nl.category === newsletter.category || nl.preferredCategories?.includes(newsletter.category)
      )
      console.log('구독 해제 대상:', subscription)
      
      if (subscription) {
        unsubscribeMutation.mutate(subscription.id, {
          onSuccess: () => {
            console.log('구독 해제 성공')
            refetchSubscriptions()
          }
        })
      } else {
        unsubscribeMutation.mutate(newsletter.category, {
          onSuccess: () => {
            console.log('구독 해제 성공')
            refetchSubscriptions()
          }
        })
      }
    } else {
      // 구독 추가 - 로그인한 사용자는 바로 구독 (이메일 입력 불필요)
      const userInfo = getUserInfo()
      if (!userInfo || !userInfo.email) {
        toast({
          title: "사용자 정보 오류",
          description: "사용자 이메일 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        })
        return
      }
      
      console.log('구독 요청:', { category: newsletter.category, email: userInfo.email })
      
      subscribeMutation.mutate(
        { category: newsletter.category, email: userInfo.email },
        {
          onSuccess: (data) => {
            console.log('구독 성공:', data)
            // 구독 완료 후 즉시 구독 목록 새로고침
            refetchSubscriptions()
          },
          onError: (error) => {
            console.error('구독 실패:', error)
            // 에러 발생 시 토스트 메시지는 useNewsletter 훅에서 처리됨
          }
        }
      )
    }
  }



  // 카테고리별 필터링된 뉴스레터 목록
  const filteredNewsletters = useMemo(() => {
    if (!newsletters || !Array.isArray(newsletters)) return []
    if (selectedCategory === "전체") return newsletters
    return newsletters.filter(newsletter => newsletter.category === selectedCategory)
  }, [newsletters, selectedCategory])

  // 로딩 상태
  const isLoading = newslettersLoading || (userRole && subscriptionsLoading)

  // 클라이언트 사이드에서만 렌더링
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 animate-slide-in">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Mail className="h-8 w-8 mr-3 text-purple-500 animate-pulse-slow" />
                  뉴스레터
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchNewsletters()
                    if (userRole) refetchSubscriptions()
                  }}
                  disabled={isLoading}
                  className="hover-lift"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  새로고침
                </Button>
              </div>
              <p className="text-gray-600">관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요</p>
            </div>

            {/* Error Display */}
            {(newslettersError || subscriptionsError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">
                    데이터를 불러오는 중 오류가 발생했습니다. 새로고침 버튼을 클릭해주세요.
                  </span>
                </div>
              </div>
            )}

            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">카테고리별 필터:</span>
              </div>
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
              {/* 필터링 결과 표시 */}
              <div className="mt-2 text-sm text-gray-500">
                {(() => {
                  if (!filteredNewsletters || !Array.isArray(filteredNewsletters)) return "로딩 중..."
                  if (!userSubscriptions || !Array.isArray(userSubscriptions)) return "로딩 중..."
                  
                  const availableNewsletters = filteredNewsletters.filter(
                    newsletter => !userSubscriptions.some(sub => sub.id === newsletter.id)
                  )
                  return selectedCategory === "전체" 
                    ? `전체 ${availableNewsletters.length}개의 구독 가능한 뉴스레터`
                    : `${selectedCategory} 카테고리 ${availableNewsletters.length}개의 구독 가능한 뉴스레터`
                })()}
              </div>
            </div>

            {/* Newsletter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                // 로딩 상태
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="glass animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // 실제 뉴스레터 목록
                (filteredNewsletters || [])
                  .filter(newsletter => !(Array.isArray(userSubscriptions) ? userSubscriptions : []).some(sub => 
                    sub.category === newsletter.category || sub.preferredCategories?.includes(newsletter.category)
                  ))
                  .map((newsletter, index) => (
                    <Card 
                      key={newsletter.id} 
                      className={`glass hover-lift animate-slide-in ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                                {newsletter.category}
                              </Badge>
                              <Badge className="bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">
                                {newsletter.frequency}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg mb-2">
                              <TextWithTooltips text={newsletter.title} />
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              <TextWithTooltips text={newsletter.description} />
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={Array.isArray(userSubscriptions) && userSubscriptions.some(nl => 
                                  nl.category === newsletter.category || nl.preferredCategories?.includes(newsletter.category)
                                )}
                                onCheckedChange={() => handleSubscribe(newsletter.id)}
                                disabled={subscribeMutation.isPending || unsubscribeMutation.isPending || subscriptionsLoading}
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <Label className={`text-xs font-medium ${
                                Array.isArray(userSubscriptions) && userSubscriptions.some(nl => 
                                  nl.category === newsletter.category || nl.preferredCategories?.includes(newsletter.category)
                                ) ? "text-blue-600" : "text-gray-600"
                              }`}>
                                {subscribeMutation.isPending || unsubscribeMutation.isPending ? "처리 중..." : 
                                 Array.isArray(userSubscriptions) && userSubscriptions.some(nl => 
                                   nl.category === newsletter.category || nl.preferredCategories?.includes(newsletter.category)
                                 ) ? "구독 중" : "구독"}
                              </Label>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {newsletter.tags.map((tag) => (
                            <Badge key={tag} className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{newsletter.subscribers?.toLocaleString() || "0"}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{newsletter.lastSent}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.8</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
              
              {/* 필터링 결과가 없을 때 */}
              {!isLoading && filteredNewsletters.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedCategory} 카테고리의 뉴스레터가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    다른 카테고리를 선택하거나 나중에 다시 확인해보세요.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCategory("전체")}
                    className="hover-lift"
                  >
                    전체 뉴스레터 보기
                  </Button>
                </div>
              )}

              {/* 구독한 뉴스레터가 모두 숨겨져서 표시할 뉴스레터가 없을 때 */}
              {!isLoading && filteredNewsletters.length > 0 && 
               filteredNewsletters.filter(newsletter => !(Array.isArray(userSubscriptions) ? userSubscriptions : []).some(sub => 
                 sub.category === newsletter.category || sub.preferredCategories?.includes(newsletter.category)
               )).length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    이미 모든 뉴스레터를 구독하셨습니다!
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedCategory === "전체" 
                      ? "현재 표시 가능한 모든 뉴스레터를 구독하고 계십니다."
                      : `${selectedCategory} 카테고리의 모든 뉴스레터를 구독하고 계십니다.`
                    }
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <Link href="/mypage">
                      <Button variant="outline" className="hover-lift">
                        마이페이지에서 관리
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedCategory("전체")}
                      className="hover-lift"
                    >
                      다른 카테고리 보기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* My Subscriptions - 로그인한 사용자만 표시 */}
              {userRole && (
                <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-blue-500" />
                        내 구독
                      </div>
                      <Link 
                        href="/newsletter/dashboard" 
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                      >
                        대시보드
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      현재 구독 중인 뉴스레터 ({userSubscriptions.length}개)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {subscriptionsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">구독 정보 로딩 중...</p>
                        </div>
                      ) : userSubscriptions.length > 0 ? (
                        userSubscriptions.map((newsletter) => (
                          <div key={newsletter.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                <TextWithTooltips text={newsletter.title} />
                              </h4>
                              <p className="text-xs text-gray-500">{newsletter.frequency}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unsubscribeMutation.mutate(newsletter.id)}
                              disabled={unsubscribeMutation.isPending}
                              className="hover-glow"
                            >
                              {unsubscribeMutation.isPending ? "처리 중..." : "구독해제"}
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-3">
                            구독 중인 뉴스레터가 없습니다
                          </p>
                          <Link href="/newsletter/dashboard">
                            <Button variant="outline" size="sm" className="hover-lift">
                              구독 대시보드 보기
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 로그인하지 않은 사용자를 위한 로그인 안내 */}
              {!userRole && (
                <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-gray-500" />
                      로그인 필요
                    </CardTitle>
                    <CardDescription>
                      뉴스레터 구독을 위해 로그인해주세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">
                        뉴스레터를 구독하고 관리하려면 로그인이 필요합니다.
                      </p>
                      <Link href="/auth">
                        <Button className="w-full hover-lift">
                          로그인하기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Newsletter Preferences - 로그인한 사용자만 표시 */}
              {userRole && (
                <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.4s' }}>
                  <CardHeader>
                    <CardTitle className="text-lg">알림 설정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications" className="text-sm">
                          이메일 알림
                        </Label>
                        <Switch id="email-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications" className="text-sm">
                          푸시 알림
                        </Label>
                        <Switch id="push-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="weekly-digest" className="text-sm">
                          주간 요약
                        </Label>
                        <Switch id="weekly-digest" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Popular Newsletters */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    인기 뉴스레터
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {newsletters
                      .sort((a, b) => b.subscribers - a.subscribers)
                      .slice(0, 5)
                      .map((newsletter, index) => (
                        <div key={newsletter.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-all duration-300">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            <div>
                              <p className="text-sm font-medium">
                                <TextWithTooltips text={newsletter.title} />
                              </p>
                              <p className="text-xs text-gray-500">{newsletter.subscribers.toLocaleString()} 구독자</p>
                            </div>
                          </div>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>


    </>
  )
}
