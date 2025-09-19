"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Clock, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function SearchAutocomplete({
  placeholder = "뉴스 검색...",
  className = "",
  showSuggestions = true,
  onSearch
}) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const router = useRouter()
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // 카테고리 매핑
  const backendToFrontendCategory = {
    POLITICS: "정치",
    ECONOMY: "경제",
    SOCIETY: "사회",
    LIFE: "생활/문화",
    INTERNATIONAL: "세계",
    IT_SCIENCE: "IT/과학",
    VEHICLE: "자동차/교통",
    TRAVEL_FOOD: "여행/음식",
    ART: "예술",
  };

  // 검색어 변경 시 자동완성 요청
  useEffect(() => {
    if (!showSuggestions || query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    // 디바운싱
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      await fetchSuggestions(query)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, showSuggestions])

  // 검색 제안 가져오기
  const fetchSuggestions = async (searchQuery) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/news/search?query=${encodeURIComponent(searchQuery)}&size=5`)
      if (response.ok) {
        const data = await response.json()
        const items = data.content || []

        // 카테고리 매핑 적용: category 또는 categoryName 필드를 한글로 변환하여 categoryName에 저장
        const mapped = items.map(item => {
          const categoryFromApi = item.category || item.categoryName;
          let mappedCategory = "일반"; // 기본값을 '일반'으로 설정

          if (categoryFromApi && typeof categoryFromApi === 'string') {
            // API 카테고리 값을 대문자로 변환하여 매핑 객체에서 찾습니다. (e.g. 'sports' -> 'SPORTS')
            mappedCategory = backendToFrontendCategory[categoryFromApi.toUpperCase()] || "일반";
          }
          return {
            ...item,
            categoryName: mappedCategory
          }
        })

        setSuggestions(mapped)
        setShowDropdown(true)
        setSelectedIndex(-1)
      }
    } catch (error) {
      console.error("검색 제안 로드 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 검색 실행
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return

    setShowDropdown(false)
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // 키보드 네비게이션
  const handleKeyDown = (e) => {
    if (!showDropdown) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSearch(suggestions[selectedIndex].title)
        } else {
          handleSearch()
        }
        break
      case "Escape":
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  // 클릭 이벤트 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 인기 키워드 (실제로는 API에서 가져올 수 있음)
  const popularKeywords = ["AI", "경제", "정치", "환경", "기술"]

  return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true)
              }}
              placeholder={placeholder}
              className="pl-10 pr-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300 rounded-lg"
          />
          <Button
              onClick={() => handleSearch()}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* 자동완성 드롭다운 */}
        {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
              {/* 검색 결과 */}
              {suggestions.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 mb-2 px-2">검색 결과</div>
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.newsId || index}
                            className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedIndex === index ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                            onClick={() => handleSearch(suggestion.title)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {suggestion.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                              <span>{suggestion.press}</span>
                              <span>•</span>
                              <span>{suggestion.categoryName}</span>
                              <span>•</span>
                              <span>{new Date(suggestion.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.viewCount}회
                            </Badge>
                          </div>
                        </div>
                    ))}
                  </div>
              )}

              {/* 인기 키워드 */}
              {suggestions.length === 0 && query.length >= 2 && !isLoading && (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 mb-2 px-2">인기 키워드</div>
                    <div className="flex flex-wrap gap-1">
                      {popularKeywords.map((keyword) => (
                          <Badge
                              key={keyword}
                              variant="outline"
                              className="cursor-pointer hover:bg-blue-50 text-xs"
                              onClick={() => handleSearch(keyword)}
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {keyword}
                          </Badge>
                      ))}
                    </div>
                  </div>
              )}

              {/* 로딩 상태 */}
              {isLoading && (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                    <div className="text-xs mt-2">검색 중...</div>
                  </div>
              )}

              {/* 검색 결과 없음 */}
              {suggestions.length === 0 && query.length >= 2 && !isLoading && (
                  <div className="p-4 text-center text-gray-500">
                    <div className="text-sm">"{query}"에 대한 검색 결과가 없습니다.</div>
                    <div className="text-xs mt-1">다른 키워드로 검색해보세요.</div>
                  </div>
              )}
            </div>
        )}
      </div>
  )
}