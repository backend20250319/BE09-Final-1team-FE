"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { 
  Mail, Clock, Users, Star, TrendingUp, Bell, Zap, Filter, CheckCircle, 
  AlertCircle, ArrowRight, User, RefreshCw, ExternalLink, Calendar,
  Hash, Eye, ChevronDown, ChevronUp
} from "lucide-react"
import { TextWithTooltips } from "@/components/tooltip"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { getUserRole, getUserInfo } from "@/lib/auth"
import Header from "@/components/header"
import { useNewsletters, useUserSubscriptions, useSubscribeNewsletter, useUnsubscribeNewsletter } from "@/hooks/useNewsletter"

// 카테고리별 주제 생성 함수
const generateTopicsForCategory = (category) => {
  const topicsMap = {
    "정치": ["국정감사", "정책발표", "여야갈등", "외교정책", "선거", "국회"],
    "경제": ["주식시장", "부동산", "금리", "환율", "기업실적", "투자"],
    "사회": ["교육", "의료", "환경", "교통", "범죄", "복지"],
    "생활": ["건강", "요리", "패션", "육아", "취미", "라이프스타일"],
    "세계": ["국제정치", "글로벌경제", "외교", "분쟁", "협력", "문화교류"],
    "IT/과학": ["인공지능", "블록체인", "클라우드", "모바일", "연구개발", "스타트업"],
    "자동차/교통": ["전기차", "자율주행", "대중교통", "도로교통", "친환경", "모빌리티"],
    "여행/음식": ["해외여행", "국내여행", "맛집", "요리", "호텔", "항공"],
    "예술": ["영화", "음악", "미술", "문학", "공연", "디자인"]
  };
  return topicsMap[category] || ["주요뉴스", "핫이슈", "트렌드", "분석"];
};

// 최근 헤드라인 생성 함수
const generateRecentHeadlines = (category) => {
  const headlines = [
    { title: `${category} 관련 주요 소식이 업데이트되었습니다`, time: "2시간 전", views: "1.2K" },
    { title: `${category} 분야의 새로운 동향과 전망`, time: "5시간 전", views: "856" },
    { title: `${category} 전문가들의 인사이트와 분석`, time: "1일 전", views: "2.1K" },
    { title: `${category} 관련 정책 변화와 영향`, time: "2일 전", views: "1.5K" },
    { title: `${category} 업계의 최신 트렌드 리포트`, time: "3일 전", views: "987" }
  ];
  return headlines;
};

export default function NewsletterPageClient({ initialNewsletters }) {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)
  const [localSubscriptions, setLocalSubscriptions] = useState(new Set())
  const [expandedCards, setExpandedCards] = useState(new Set()) // 확장된 카드 상태

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
    initialData: initialNewsletters || [],
    staleTime: 0,
  })

  const { 
    data: userSubscriptions = [], 
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions 
  } = useUserSubscriptions({
    enabled: !!userRole,
    retry: 1,
    retryDelay: 1000,
  })

  // 뮤테이션 훅들
  const subscribeMutation = useSubscribeNewsletter()
  const unsubscribeMutation = useUnsubscribeNewsletter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    
    const role = getUserRole()
    setUserRole(role)
    setIsClient(true)
    
    return () => clearTimeout(timer)
  }, [])

  // 서버 구독 목록이 업데이트되면 로컬 상태 동기화
  useEffect(() => {
    if (Array.isArray(userSubscriptions)) {
      const serverCategories = new Set();
      
      userSubscriptions.forEach(sub => {
        // 카테고리 직접 매칭
        if (sub.category) {
          serverCategories.add(sub.category);
        }
        
        // preferredCategories 배열 처리
        if (sub.preferredCategories && Array.isArray(sub.preferredCategories)) {
          sub.preferredCategories.forEach(prefCat => {
            // 백엔드 카테고리명을 프론트엔드 카테고리명으로 변환
            const categoryMapping = {
              'POLITICS': '정치',
              'ECONOMY': '경제',
              'SOCIETY': '사회',
              'LIFE': '생활',
              'INTERNATIONAL': '세계',
              'IT_SCIENCE': 'IT/과학',
              'VEHICLE': '자동차/교통',
              'TRAVEL_FOOD': '여행/음식',
              'ART': '예술'
            };
            
            const frontendCategory = categoryMapping[prefCat] || prefCat;
            serverCategories.add(frontendCategory);
          });
        }
      });
      
      setLocalSubscriptions(serverCategories);
    }
  }, [userSubscriptions]);

  const categories = ["전체", "정치", "경제", "사회", "생활", "세계", "IT/과학", "자동차/교통", "여행/음식", "예술"]

  // 카드 확장/축소 토글
  const toggleCardExpansion = (newsletterId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsletterId)) {
        newSet.delete(newsletterId);
      } else {
        newSet.add(newsletterId);
      }
      return newSet;
    });
  };

  // 구독 여부 판단
  const isSubscribedByCategory = (category) => {
    // 로컬 상태에서 먼저 확인
    if (localSubscriptions.has(category)) return true;
    
    // 서버 구독 목록에서 확인
    if (Array.isArray(userSubscriptions)) {
      return userSubscriptions.some(sub => {
        // 카테고리 직접 매칭
        if (sub.category === category) return true;
        
        // preferredCategories 배열에서 확인
        if (sub.preferredCategories && Array.isArray(sub.preferredCategories)) {
          return sub.preferredCategories.some(prefCat => {
            // 백엔드 카테고리명을 프론트엔드 카테고리명으로 변환
            const categoryMapping = {
              'POLITICS': '정치',
              'ECONOMY': '경제',
              'SOCIETY': '사회',
              'LIFE': '생활',
              'INTERNATIONAL': '세계',
              'IT_SCIENCE': 'IT/과학',
              'VEHICLE': '자동차/교통',
              'TRAVEL_FOOD': '여행/음식',
              'ART': '예술'
            };
            return categoryMapping[prefCat] === category || prefCat === category;
          });
        }
        
        return false;
      });
    }
    
    return false;
  };

  // 구독/해제 처리
  const handleToggleSubscribe = async (newsletter, checked) => {
    if (!userRole) {
      toast({
        title: "로그인이 필요합니다",
        description: "뉴스레터를 구독하려면 먼저 로그인해주세요.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo?.email) {
      toast({
        title: "사용자 정보 오류",
        description: "사용자 이메일 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      return;
    }

    if (checked) {
      // 구독 제한 확인 (최대 3개 카테고리)
      const currentSubscriptions = Array.from(localSubscriptions);
      if (currentSubscriptions.length >= 3) {
        toast({
          title: "구독 제한",
          description: "최대 3개 카테고리까지 구독할 수 있습니다. 다른 카테고리 구독을 해제한 후 다시 시도해주세요.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
        return;
      }

      setLocalSubscriptions(prev => new Set([...prev, newsletter.category]));
      
      subscribeMutation.mutate(
        { category: newsletter.category, email: userInfo.email },
        {
          onSuccess: () => {
            // 성공 시 서버에서 최신 구독 정보를 가져옴
            refetchSubscriptions();
            toast({
              title: "구독 완료",
              description: `${newsletter.category} 카테고리를 구독했습니다. (${currentSubscriptions.length + 1}/3)`,
              icon: <CheckCircle className="h-4 w-4 text-green-500" />
            });
          },
          onError: (error) => {
            // 실패 시 로컬 상태에서 제거
            setLocalSubscriptions(prev => {
              const newSet = new Set(prev);
              newSet.delete(newsletter.category);
              return newSet;
            });
            
            // 구독 제한 오류 처리
            if (error.message?.includes('CATEGORY_LIMIT_EXCEEDED')) {
              toast({
                title: "구독 제한",
                description: "최대 3개 카테고리까지 구독할 수 있습니다. 다른 카테고리 구독을 해제한 후 다시 시도해주세요.",
                variant: "destructive",
                icon: <AlertCircle className="h-4 w-4 text-red-500" />
              });
            } else {
              toast({
                title: "구독 실패",
                description: error.message || "구독 처리 중 오류가 발생했습니다.",
                variant: "destructive",
                icon: <AlertCircle className="h-4 w-4 text-red-500" />
              });
            }
          }
        }
      );
    } else {
      // 구독 해제 시 로컬 상태에서 제거
      setLocalSubscriptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(newsletter.category);
        return newSet;
      });
      
      // 해당 카테고리의 구독을 찾아서 해제
      const sub = (userSubscriptions || []).find(s => {
        // 카테고리 직접 매칭
        if (s.category === newsletter.category) return true;
        
        // preferredCategories 배열에서 확인
        if (s.preferredCategories && Array.isArray(s.preferredCategories)) {
          const categoryMapping = {
            'POLITICS': '정치',
            'ECONOMY': '경제',
            'SOCIETY': '사회',
            'LIFE': '생활',
            'INTERNATIONAL': '세계',
            'IT_SCIENCE': 'IT/과학',
            'VEHICLE': '자동차/교통',
            'TRAVEL_FOOD': '여행/음식',
            'ART': '예술'
          };
          
          return s.preferredCategories.some(prefCat => {
            const frontendCategory = categoryMapping[prefCat] || prefCat;
            return frontendCategory === newsletter.category;
          });
        }
        
        return false;
      });
      
      if (!sub) {
        toast({
          title: "구독 정보 오류",
          description: "해당 카테고리의 구독 정보를 찾을 수 없습니다.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
        return;
      }
      
      unsubscribeMutation.mutate(sub.id, {
        onSuccess: () => {
          // 성공 시 서버에서 최신 구독 정보를 가져옴
          refetchSubscriptions();
          toast({
            title: "구독 해제",
            description: `${newsletter.category} 카테고리 구독을 해제했습니다.`,
            icon: <CheckCircle className="h-4 w-4 text-blue-500" />
          });
        },
        onError: (error) => {
          // 실패 시 로컬 상태 복원
          setLocalSubscriptions(prev => new Set([...prev, newsletter.category]));
          toast({
            title: "구독 해제 실패",
            description: error.message || "구독 해제 중 오류가 발생했습니다.",
            variant: "destructive",
            icon: <AlertCircle className="h-4 w-4 text-red-500" />
          });
        }
      });
    }
  };

  // 필터링된 뉴스레터
  const filteredNewsletters = useMemo(() => {
    if (!Array.isArray(newsletters)) return [];
    if (selectedCategory === "전체") return newsletters;
    return newsletters.filter(n => n.category === selectedCategory);
  }, [newsletters, selectedCategory]);

  // 향상된 뉴스레터 데이터 (카테고리별 여러 주제 포함)
  const enhancedNewsletters = useMemo(() => {
    return filteredNewsletters.map(newsletter => ({
      ...newsletter,
      // 카테고리별 여러 주제 생성
      topics: generateTopicsForCategory(newsletter.category),
      // 최근 뉴스 헤드라인 시뮬레이션
      recentHeadlines: generateRecentHeadlines(newsletter.category),
      // 통계 정보
      stats: {
        totalArticles: Math.floor(Math.random() * 50) + 20,
        weeklyGrowth: Math.floor(Math.random() * 15) + 1,
        averageReadTime: Math.floor(Math.random() * 5) + 3
      }
    }));
  }, [filteredNewsletters]);

  const isLoading = newslettersLoading || (userRole && subscriptionsLoading)

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
              <div className="mt-2 text-sm text-gray-500">
                {selectedCategory === "전체"
                  ? `전체 ${enhancedNewsletters.length}개의 뉴스레터`
                  : `${selectedCategory} 카테고리 ${enhancedNewsletters.length}개의 뉴스레터`}
              </div>
            </div>

            {/* Enhanced Newsletter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                // 스켈레톤
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
                enhancedNewsletters.map((newsletter, index) => {
                  const isSubscribed = isSubscribedByCategory(newsletter.category);
                  const isExpanded = expandedCards.has(newsletter.id);
                  return (
                    <Card
                      key={newsletter.id}
                      className={`glass hover-lift animate-slide-in transition-all duration-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      } ${isSubscribed ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''} ${
                        isExpanded ? 'md:col-span-2' : ''
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
                              {isSubscribed && (
                                <Badge className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow animate-pulse">
                                  구독 중
                                </Badge>
                              )}
                            </div>
                            
                            <CardTitle className="text-lg mb-2 flex items-center justify-between">
                              <TextWithTooltips text={newsletter.title} />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCardExpansion(newsletter.id)}
                                className="ml-2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CardTitle>
                            
                            <CardDescription className="line-clamp-2">
                              <TextWithTooltips text={newsletter.description} />
                            </CardDescription>
                          </div>

                          {/* 구독 토글 */}
                          <div className="flex items-center space-x-2 ml-4">
                            <Switch
                              checked={isSubscribed}
                              onCheckedChange={(checked) => handleToggleSubscribe(newsletter, checked)}
                              disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <Label
                              className={`text-xs font-medium whitespace-nowrap ${
                                isSubscribed ? "text-blue-600" : "text-gray-600"
                              }`}
                            >
                              {subscribeMutation.isPending || unsubscribeMutation.isPending ? "처리 중..." :
                               isSubscribed ? "구독 중" : "구독"}
                            </Label>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* 주요 통계 */}
                        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50/50 rounded-lg">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Hash className="h-3 w-3 text-blue-500 mr-1" />
                              <span className="text-xs text-gray-500">총 기사</span>
                            </div>
                            <div className="font-semibold text-sm">{newsletter.stats?.totalArticles}</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-xs text-gray-500">주간 성장</span>
                            </div>
                            <div className="font-semibold text-sm text-green-600">+{newsletter.stats?.weeklyGrowth}%</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Clock className="h-3 w-3 text-orange-500 mr-1" />
                              <span className="text-xs text-gray-500">읽기 시간</span>
                            </div>
                            <div className="font-semibold text-sm">{newsletter.stats?.averageReadTime}분</div>
                          </div>
                        </div>

                        {/* 카테고리별 주제들 */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            주요 주제
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {newsletter.topics?.slice(0, isExpanded ? newsletter.topics.length : 4).map((topic, idx) => (
                              <Badge 
                                key={idx} 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              >
                                #{topic}
                              </Badge>
                            ))}
                            {!isExpanded && newsletter.topics?.length > 4 && (
                              <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                +{newsletter.topics.length - 4}개
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* 확장 시 최근 헤드라인 표시 */}
                        {isExpanded && (
                          <div className="mb-4 border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              최근 헤드라인
                            </h4>
                            <ScrollArea className="h-32">
                              <div className="space-y-2">
                                {newsletter.recentHeadlines?.map((headline, idx) => (
                                  <div key={idx} className="flex items-start space-x-2 text-xs">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div className="flex-1">
                                      <p className="text-gray-700 leading-relaxed">{headline.title}</p>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-gray-400">{headline.time}</span>
                                        <div className="flex items-center space-x-1 text-gray-400">
                                          <Eye className="h-2.5 w-2.5" />
                                          <span>{headline.views}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}

                        <Separator className="mb-4" />

                        {/* 기존 Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {newsletter.tags.map((tag) => (
                            <Badge key={tag} className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
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
                            <Star className="h-3 w-3 fill-current text-yellow-400" />
                            <span>4.8</span>
                          </div>
                        </div>

                        {/* 구독 상태 안내 */}
                        <div className="mt-3 p-2 bg-blue-50/50 rounded text-xs text-gray-600">
                          {isSubscribed ? (
                            <div>
                              <span className="font-medium text-blue-600">'{newsletter.category}' 카테고리를 구독하고 있습니다.</span>
                              <div className="mt-1 text-gray-500">
                                현재 구독: {localSubscriptions.size}/3개 카테고리
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span>이 토글은 <span className="font-medium">'{newsletter.category}'</span> 카테고리 구독을 전환합니다.</span>
                              <div className="mt-1 text-gray-500">
                                현재 구독: {localSubscriptions.size}/3개 카테고리
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}

              {/* 결과 없음 처리 */}
              {!isLoading && enhancedNewsletters.length === 0 && (
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
            </div>
          </div>

          {/* Sidebar - 기존 사이드바 유지 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* My Subscriptions */}
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
                      현재 구독 중인 뉴스레터 ({localSubscriptions.size}/3개)
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
                        userSubscriptions.map((subscription) => {
                          // 구독 정보에서 카테고리 추출
                          const categories = subscription.preferredCategories || [];
                          const categoryNames = categories.map(cat => {
                            const categoryMapping = {
                              'POLITICS': '정치',
                              'ECONOMY': '경제',
                              'SOCIETY': '사회',
                              'LIFE': '생활',
                              'INTERNATIONAL': '세계',
                              'IT_SCIENCE': 'IT/과학',
                              'VEHICLE': '자동차/교통',
                              'TRAVEL_FOOD': '여행/음식',
                              'ART': '예술'
                            };
                            return categoryMapping[cat] || cat;
                          }).join(', ');
                          
                          return (
                            <div key={subscription.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  <TextWithTooltips text={categoryNames || '일반 뉴스레터'} />
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {subscription.frequency === 'DAILY' ? '매일' : 
                                   subscription.frequency === 'WEEKLY' ? '주간' : 
                                   subscription.frequency === 'MONTHLY' ? '월간' : '즉시'}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // 구독 해제 시 로컬 상태에서도 제거
                                  const categories = subscription.preferredCategories || [];
                                  categories.forEach(cat => {
                                    const categoryMapping = {
                                      'POLITICS': '정치',
                                      'ECONOMY': '경제',
                                      'SOCIETY': '사회',
                                      'LIFE': '생활',
                                      'INTERNATIONAL': '세계',
                                      'IT_SCIENCE': 'IT/과학',
                                      'VEHICLE': '자동차/교통',
                                      'TRAVEL_FOOD': '여행/음식',
                                      'ART': '예술'
                                    };
                                    const frontendCategory = categoryMapping[cat] || cat;
                                    setLocalSubscriptions(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(frontendCategory);
                                      return newSet;
                                    });
                                  });
                                  
                                  unsubscribeMutation.mutate(subscription.id, {
                                    onError: () => {
                                      // 실패 시 로컬 상태 복원
                                      categories.forEach(cat => {
                                        const categoryMapping = {
                                          'POLITICS': '정치',
                                          'ECONOMY': '경제',
                                          'SOCIETY': '사회',
                                          'LIFE': '생활',
                                          'INTERNATIONAL': '세계',
                                          'IT_SCIENCE': 'IT/과학',
                                          'VEHICLE': '자동차/교통',
                                          'TRAVEL_FOOD': '여행/음식',
                                          'ART': '예술'
                                        };
                                        const frontendCategory = categoryMapping[cat] || cat;
                                        setLocalSubscriptions(prev => new Set([...prev, frontendCategory]));
                                      });
                                    }
                                  });
                                }}
                                disabled={unsubscribeMutation.isPending}
                                className="hover-glow text-red-500 hover:text-red-700"
                              >
                                {unsubscribeMutation.isPending ? "처리 중..." : "구독해제"}
                              </Button>
                            </div>
                          );
                        })
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

              {/* 로그인 안내 */}
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

              {/* Newsletter Preferences */}
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
