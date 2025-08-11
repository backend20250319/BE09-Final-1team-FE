import { NextResponse } from 'next/server'

/**
 * GET /api/news/trending-keywords
 * 트렌딩 키워드를 반환합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    const period = searchParams.get('period') || '24h' // 24h, 7d, 30d

    // 실제 Spring Boot API 호출 시도
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      const params = new URLSearchParams({
        limit: limit.toString(),
        period: period
      })

      const response = await fetch(`${apiUrl}/api/news/trending-keywords?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (apiError) {
      console.log('실제 API 연결 실패, 더미 데이터 사용:', apiError.message)
    }

    // API 연결 실패 시 더미 데이터 사용
    const { newsArticles } = await import('../../../../lib/news-data')
    
    // 뉴스 데이터에서 키워드 추출 (실제로는 더 정교한 분석 필요)
    const keywordCounts = {}
    
    // 최근 기간 필터링
    const now = new Date()
    const periodMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    const filteredArticles = newsArticles.filter(article => {
      const articleDate = new Date(article.publishedAt)
      return (now - articleDate) <= periodMs[period]
    })

    // 키워드 카운팅
    filteredArticles.forEach(article => {
      // 태그에서 키워드 추출
      if (article.tags) {
        article.tags.forEach(tag => {
          const keyword = tag.toLowerCase().trim()
          if (keyword.length > 1) {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
          }
        })
      }
      
      // 제목에서 주요 키워드 추출 (간단한 방식)
      const titleWords = article.title
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && word.length < 10)
      
      titleWords.forEach(word => {
        const keyword = word.toLowerCase().trim()
        if (keyword.length > 1) {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
        }
      })
    })

    // 상위 키워드 정렬
    const trendingKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([keyword, count], index) => ({
        keyword,
        count,
        rank: index + 1,
        trend: Math.random() > 0.5 ? 'up' : 'down', // 실제로는 이전 기간과 비교
        diff: Math.floor(Math.random() * 10) - 5 // 실제로는 이전 기간과의 차이
      }))

    // 응답 데이터
    const response = {
      keywords: trendingKeywords,
      period,
      totalKeywords: Object.keys(keywordCounts).length,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('트렌딩 키워드 API 오류:', error)
    return NextResponse.json(
      { error: '트렌딩 키워드를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
