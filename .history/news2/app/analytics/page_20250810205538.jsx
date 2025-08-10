"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Newspaper, 
  Tag, 
  Eye,
  Calendar,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/trending-keywords?period=${period}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('분석 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPeriod = (period) => {
    switch (period) {
      case '24h': return '24시간';
      case '7d': return '7일';
      case '30d': return '30일';
      default: return period;
    }
  };

  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">분석 데이터를 로드하는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">뉴스 분석 대시보드</h1>
          </div>
          
          {/* 기간 선택 */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">분석 기간:</span>
            <div className="flex gap-2">
              {['24h', '7d', '30d'].map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {formatPeriod(p)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 키워드</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalKeywords || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatPeriod(period)} 동안 추출된 키워드
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활발한 언론사</CardTitle>
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.analytics?.topPress?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                상위 언론사 수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">인기 카테고리</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.analytics?.topCategories?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                주요 카테고리 수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">트렌딩 키워드</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.trendingKeywords?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                상위 키워드 수
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              개요
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              트렌딩 키워드
            </TabsTrigger>
            <TabsTrigger value="press" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              언론사 분석
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              시간대별
            </TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 시간대별 분포 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    시간대별 뉴스 발행 패턴
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.analytics?.hourlyDistribution?.map((item) => (
                      <div key={item.hour} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-16">{formatHour(item.hour)}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(item.count / Math.max(...analyticsData.analytics.hourlyDistribution.map(h => h.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 카테고리별 분포 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    카테고리별 뉴스 비중
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.analytics?.topCategories?.slice(0, 8).map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(item.count / Math.max(...analyticsData.analytics.topCategories.map(c => c.count))) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 트렌딩 키워드 탭 */}
          <TabsContent value="keywords" className="space-y-6">
            <div className="grid gap-4">
              {analyticsData?.trendingKeywords?.map((keyword, index) => (
                <Card key={keyword.keyword} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={index < 3 ? "default" : "secondary"}
                          className={`text-sm ${
                            index === 0 ? "bg-red-500" : 
                            index === 1 ? "bg-orange-500" : 
                            index === 2 ? "bg-yellow-500" : ""
                          }`}
                        >
                          #{index + 1}
                        </Badge>
                        <h3 className="text-xl font-semibold text-gray-900">{keyword.keyword}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{keyword.count}</div>
                        <div className="text-sm text-gray-500">언급 횟수</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">{keyword.pressCount}</div>
                        <div className="text-sm text-gray-600">언론사</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">{keyword.categoryCount}</div>
                        <div className="text-sm text-gray-600">카테고리</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-semibold text-purple-600">{keyword.recentArticles.length}</div>
                        <div className="text-sm text-gray-600">최근 기사</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">관련 언론사</h4>
                        <div className="flex flex-wrap gap-1">
                          {keyword.pressList.slice(0, 5).map((press) => (
                            <Badge key={press} variant="outline" className="text-xs">
                              {press}
                            </Badge>
                          ))}
                          {keyword.pressList.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{keyword.pressList.length - 5}개 더
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">최근 관련 기사</h4>
                        <div className="space-y-2">
                          {keyword.recentArticles.slice(0, 3).map((article) => (
                            <Link 
                              key={article.id} 
                              href={`/news/${article.id}`}
                              className="block p-2 rounded hover:bg-gray-50 transition-colors duration-200"
                            >
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {article.title}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{article.press}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(article.publishedAt).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 언론사 분석 탭 */}
          <TabsContent value="press" className="space-y-6">
            <div className="grid gap-4">
              {analyticsData?.analytics?.topPress?.map((press, index) => (
                <Card key={press.press} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={index < 3 ? "default" : "secondary"}
                          className={`text-sm ${
                            index === 0 ? "bg-red-500" : 
                            index === 1 ? "bg-orange-500" : 
                            index === 2 ? "bg-yellow-500" : ""
                          }`}
                        >
                          #{index + 1}
                        </Badge>
                        <h3 className="text-xl font-semibold text-gray-900">{press.press}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{press.count}</div>
                        <div className="text-sm text-gray-500">발행 기사</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(press.count / Math.max(...analyticsData.analytics.topPress.map(p => p.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 시간대별 탭 */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  24시간 뉴스 발행 패턴
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-2 h-32">
                  {analyticsData?.analytics?.hourlyDistribution?.map((item) => (
                    <div key={item.hour} className="flex flex-col items-center">
                      <div className="flex-1 w-full bg-gray-200 rounded-t">
                        <div 
                          className="bg-blue-600 rounded-t transition-all duration-300"
                          style={{ 
                            height: `${(item.count / Math.max(...analyticsData.analytics.hourlyDistribution.map(h => h.count))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{item.hour}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                  시간대별 뉴스 발행량 (가장 활발한 시간대: {
                    analyticsData?.analytics?.hourlyDistribution?.reduce((max, item) => 
                      item.count > max.count ? item : max
                    )?.hour || 0
                  }시)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
