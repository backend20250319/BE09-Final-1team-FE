import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '10')
    const category = searchParams.get('category')
    const press = searchParams.get('press')
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    console.log('🔍 뉴스 검색 API 호출:', { query, page, size, category, press, sortBy, sortOrder })
    
    // 임시로 더미 검색 결과 반환
    // 실제로는 백엔드 API에서 검색 결과를 가져와야 함
    const mockSearchResults = [
      {
        newsId: 1,
        title: "주요 경제 정책 발표, 시장에 미치는 파급효과 분석",
        content: "정부가 발표한 새로운 경제 정책이 금융 시장에 미치는 영향을 전문가들이 분석하고 있습니다...",
        summary: "정부의 새로운 경제 정책이 시장에 미치는 영향과 전문가들의 분석을 다룹니다.",
        press: "경제신문",
        publishedAt: "2025-01-01T10:00:00",
        categoryName: "ECONOMY",
        categoryDescription: "경제",
        imageUrl: "/placeholder.jpg",
        viewCount: 2345
      },
      {
        newsId: 2,
        title: "인공지능 기술 발전으로 일자리 변화 예상",
        content: "최신 AI 기술 발전으로 다양한 산업 분야에서 일자리 변화가 예상됩니다...",
        summary: "AI 기술 발전에 따른 일자리 변화와 전문가들의 전망을 분석합니다.",
        press: "기술뉴스",
        publishedAt: "2025-01-01T09:30:00",
        categoryName: "IT_SCIENCE",
        categoryDescription: "IT/과학",
        imageUrl: "/placeholder.jpg",
        viewCount: 1876
      },
      {
        newsId: 3,
        title: "부동산 시장 동향 분석 리포트",
        content: "최근 부동산 시장의 변화와 향후 전망에 대한 전문가 분석이 발표되었습니다...",
        summary: "부동산 시장의 최신 동향과 전문가들의 전망을 분석합니다.",
        press: "부동산일보",
        publishedAt: "2025-01-01T09:00:00",
        categoryName: "ECONOMY",
        categoryDescription: "경제",
        imageUrl: "/placeholder.jpg",
        viewCount: 1542
      }
    ]
    
    // 검색어 필터링 (간단한 제목 기반 검색)
    let filteredResults = mockSearchResults
    if (query) {
      filteredResults = mockSearchResults.filter(news => 
        news.title.toLowerCase().includes(query.toLowerCase()) ||
        news.content.toLowerCase().includes(query.toLowerCase())
      )
    }
    
    // 카테고리 필터링
    if (category) {
      filteredResults = filteredResults.filter(news => news.categoryName === category)
    }
    
    // 언론사 필터링
    if (press) {
      filteredResults = filteredResults.filter(news => news.press === press)
    }
    
    // 정렬
    filteredResults.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'publishedAt':
          aValue = new Date(a.publishedAt).getTime()
          bValue = new Date(b.publishedAt).getTime()
          break
        case 'viewCount':
          aValue = a.viewCount || 0
          bValue = b.viewCount || 0
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        default:
          aValue = new Date(a.publishedAt).getTime()
          bValue = new Date(b.publishedAt).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    // 페이지네이션
    const totalElements = filteredResults.length
    const totalPages = Math.ceil(totalElements / size)
    const startIndex = page * size
    const endIndex = startIndex + size
    const paginatedResults = filteredResults.slice(startIndex, endIndex)
    
    const responseData = {
      content: paginatedResults,
      totalElements: totalElements,
      totalPages: totalPages,
      currentPage: page,
      size: size
    }
    
    console.log('✅ 뉴스 검색 API 응답 성공:', responseData)
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('❌ 뉴스 검색 API 오류:', error)
    return NextResponse.json(
      { error: 'Failed to search news' },
      { status: 500 }
    )
  }
}
