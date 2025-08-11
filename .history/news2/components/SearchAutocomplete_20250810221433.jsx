"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Clock, TrendingUp, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { newsService } from "@/lib/newsService"

export default function SearchAutocomplete({ 
  placeholder = "뉴스 검색...",
  className = "",
  onSearch,
  showSuggestions = true,
  maxSuggestions = 5
}) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [trendingKeywords, setTrendingKeywords] = useState([])
  
  const router = useRouter()
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // 트렌딩 키워드 로드 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    setTrendingKeywords([
      "인공지능", "가상화폐", "주식시장", "환경보호", 
      "디지털전환", "스타트업", "블록체인", "메타버스"
    ])
  }, [])

  // 검색어 자동완성
  const handleInputChange = async (value) => {
    setQuery(value)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await newsService.searchNews(value, { size: maxSuggestions })
        setSuggestions(results.content || [])
        setShowDropdown(true)
      } catch (error) {
        console.error("검색 자동완성 실패:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  // 검색 실행
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return

    // 최근 검색어에 추가
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5)
    
    setRecentSearches(newRecentSearches)
    localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches))

    // 검색 페이지로 이동
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    
    // 드롭다운 닫기
    setShowDropdown(false)
    setQuery("")
    
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  // Enter 키 처리
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 최근 검색어 삭제
  const removeRecentSearch = (searchTerm) => {
    const newRecentSearches = recentSearches.filter(s => s !== searchTerm)
    setRecentSearches(newRecentSearches)
    localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches))
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 검색 입력창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => {
              setQuery("")
              setSuggestions([])
              setShowDropdown(false)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* 드롭다운 */}
      {showDropdown && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* 검색 결과 */}
          {query && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                검색 결과 ({suggestions.length})
              </div>
              {suggestions.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer group"
                  onClick={() => {
                    router.push(`/news/${item.id}`)
                    setShowDropdown(false)
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {item.source} • {item.category}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs ml-2">
                    {item.category}
                  </Badge>
                </div>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-sm text-blue-600 hover:text-blue-700"
                  onClick={() => handleSearch()}
                >
                  "{query}" 전체 검색 결과 보기
                </Button>
              </div>
            </div>
          )}

          {/* 최근 검색어 */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                최근 검색어
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer group"
                >
                  <div
                    className="flex-1 text-sm text-gray-700 group-hover:text-blue-600"
                    onClick={() => handleSearch(search)}
                  >
                    {search}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRecentSearch(search)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 트렌딩 키워드 */}
          {!query && trendingKeywords.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                인기 키워드
              </div>
              <div className="flex flex-wrap gap-1">
                {trendingKeywords.slice(0, 8).map((keyword, index) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    onClick={() => handleSearch(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="p-4 text-center text-sm text-gray-500">
              검색 중...
            </div>
          )}

          {/* 검색어가 있지만 결과가 없는 경우 */}
          {query && !isLoading && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              "{query}"에 대한 검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
