"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Filter,
  TrendingUp,
  Newspaper,
  Tag
} from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('latest');
  const [filters, setFilters] = useState({
    press: '',
    category: ''
  });

  // 검색 결과 로드
  useEffect(() => {
    if (!query) return;
    
    const loadSearchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          page: currentPage,
          size: 20
        });
        
        if (filters.press) params.append('press', filters.press);
        if (filters.category) params.append('category', filters.category);
        
        const response = await fetch(`/api/news/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.content || []);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.number + 1); // 백엔드는 0-based, 프론트엔드는 1-based
        }
      } catch (error) {
        console.error('검색 결과 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSearchResults();
  }, [query, currentPage, filters]);

  // 언론사별 그룹핑
  const pressGroups = searchResults.reduce((acc, item) => {
    const press = getFieldValue(item, 'press');
    if (!acc[press]) {
      acc[press] = [];
    }
    acc[press].push(item);
    return acc;
  }, {});

  // 카테고리별 그룹핑
  const categoryGroups = searchResults.reduce((acc, item) => {
    const category = getFieldValue(item, 'category');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 백엔드 응답 구조에 맞게 필드 매핑
  const getFieldValue = (item, field) => {
    switch (field) {
      case 'category':
        return item.categoryName || item.categoryDescription || '';
      case 'press':
        return item.press || '';
      case 'publishedAt':
        return item.publishedAt || '';
      case 'title':
        return item.title || '';
      case 'summary':
        return item.summary || '';
      case 'imageUrl':
        return item.imageUrl || '';
      case 'viewCount':
        return item.viewCount || 0;
      case 'likes':
        return item.likes || 0;
      default:
        return item[field] || '';
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-600 mb-2">검색어를 입력해주세요</h1>
            <p className="text-gray-500">뉴스를 검색하려면 검색어를 입력하세요.</p>
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
            <Search className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              "{query}" 검색 결과
            </h1>
            <Badge variant="secondary" className="text-sm">
              {searchResults.length}건
            </Badge>
          </div>
          
          {/* 필터 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">필터:</span>
            </div>
            
            <select
              value={filters.press}
              onChange={(e) => handleFilterChange('press', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 언론사</option>
              {Object.keys(pressGroups).map(press => (
                <option key={press} value={press}>
                  {press} ({pressGroups[press].length}건)
                </option>
              ))}
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 카테고리</option>
              {Object.keys(categoryGroups).map(category => (
                <option key={category} value={category}>
                  {category} ({categoryGroups[category].length}건)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="latest" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              최신순
            </TabsTrigger>
            <TabsTrigger value="press" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              언론사별
            </TabsTrigger>
            <TabsTrigger value="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              카테고리별
            </TabsTrigger>
          </TabsList>

          {/* 최신순 탭 */}
          <TabsContent value="latest" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">검색 중...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map((item) => (
                  <Card key={item.newsId} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                                                 {getFieldValue(item, 'imageUrl') && (
                           <img
                             src={getFieldValue(item, 'imageUrl')}
                             alt={getFieldValue(item, 'title')}
                             className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                           />
                         )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.categoryName}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {item.press}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.publishedAt)}
                            </span>
                          </div>
                          
                          <Link href={`/news/${item.newsId}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                              {item.title}
                            </h3>
                          </Link>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.summary}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {item.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {item.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="h-4 w-4" />
                              공유
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-500">다른 검색어를 시도해보세요.</p>
              </div>
            )}
          </TabsContent>

          {/* 언론사별 탭 */}
          <TabsContent value="press" className="space-y-6">
            {Object.entries(pressGroups).map(([press, articles]) => (
              <Card key={press}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    {press}
                    <Badge variant="secondary">{articles.length}건</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {articles.slice(0, 5).map((item) => (
                      <div key={item.newsId} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <Link href={`/news/${item.newsId}`}>
                          <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200">
                            {item.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.categoryName}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.publishedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 카테고리별 탭 */}
          <TabsContent value="category" className="space-y-6">
            {Object.entries(categoryGroups).map(([category, articles]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    {category}
                    <Badge variant="secondary">{articles.length}건</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {articles.slice(0, 5).map((item) => (
                      <div key={item.newsId} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <Link href={`/news/${item.newsId}`}>
                          <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200">
                            {item.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.press}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.publishedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
