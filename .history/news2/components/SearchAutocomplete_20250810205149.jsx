"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [previewResults, setPreviewResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([
    "총선", "가상화폐", "카카오", "환경 보호", "주식 시장"
  ]);
  
  const router = useRouter();
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // 검색어 변경 시 자동완성 요청
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setPreviewResults([]);
      setIsOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // 자동완성 제안 요청
        const suggestRes = await fetch(`/api/news/search?q=${encodeURIComponent(query)}&type=suggest&size=5`);
        if (suggestRes.ok) {
          const suggestData = await suggestRes.json();
          setSuggestions(suggestData.suggestions || []);
        }

        // 미리보기 결과 요청
        const previewRes = await fetch(`/api/news/search?q=${encodeURIComponent(query)}&size=3`);
        if (previewRes.ok) {
          const previewData = await previewRes.json();
          setPreviewResults(previewData.content || []);
        }

        setIsOpen(true);
      } catch (error) {
        console.error('검색 자동완성 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    // 최근 검색어에 추가
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    // 검색 페이지로 이동
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="뉴스 검색..."
          className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* 자동완성 드롭다운 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* 검색 제안 */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                <Search className="h-3 w-3 mr-1" />
                검색 제안
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 미리보기 결과 */}
          {previewResults.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-600 mb-2">검색 결과 미리보기</div>
              <div className="space-y-2">
                {previewResults.map((result) => (
                  <button
                    key={result.newsId}
                    onClick={() => handleSearch(result.title)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors duration-200"
                  >
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                      {result.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{result.press}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatDate(result.publishedAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 최근 검색어 */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                최근 검색어
              </div>
              <div className="flex flex-wrap gap-1">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                    onClick={() => handleSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 트렌딩 키워드 */}
          <div className="p-3">
            <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              인기 키워드
            </div>
            <div className="flex flex-wrap gap-1">
              {trendingKeywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors duration-200"
                  onClick={() => handleSearch(keyword)}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
