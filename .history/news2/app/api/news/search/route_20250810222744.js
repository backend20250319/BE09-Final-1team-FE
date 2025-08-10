import { NextResponse } from 'next/server'

/**
 * GET /api/news/search
 * 뉴스 기사를 검색합니다 (실제 Spring Boot API와 연결)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '20'
    const press = searchParams.get('press')
    const category = searchParams.get('category')
    
    if (!query) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 실제 Spring Boot API 호출
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    const params = new URLSearchParams({
      query: query,
      page: page,
      size: size
    })

    if (press) params.append('press', press)
    if (category) params.append('category', category)

    const response = await fetch(`${apiUrl}/api/news/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`)
    }

    const data = await response.json()
    
    // Spring Boot Pageable 응답 구조 그대로 반환
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('뉴스 검색 API 오류:', error)
    
    // API 연결 실패 시 더미 데이터로 폴백
    try {
      const { newsArticles } = await import('../../../../lib/news-data')
      
      const query = new URL(request.url).searchParams.get('query')
      const page = parseInt(new URL(request.url).searchParams.get('page')) || 0
      const size = parseInt(new URL(request.url).searchParams.get('size')) || 20
      
      // 더미 데이터에서 검색
      const searchResults = newsArticles.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary?.toLowerCase().includes(query.toLowerCase()) ||
        item.content?.toLowerCase().includes(query.toLowerCase()) ||
        (item.tags && item.tags.some(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        ))
      )
      
      // 페이지네이션
      const startIndex = page * size
      const endIndex = startIndex + size
      const paginatedResults = searchResults.slice(startIndex, endIndex)
      
      // Spring Boot Pageable 구조로 응답
      const response = {
        content: paginatedResults.map(item => ({
          newsId: item.id,
          originalNewsId: 0,
          title: item.title,
          summary: item.summary,
          press: item.source,
          link: null,
          trusted: 1,
          publishedAt: item.publishedAt,
          createdAt: new Date().toISOString(),
          reporterName: item.author || '',
          viewCount: item.views || 0,
          categoryName: item.category,
          categoryDescription: item.category,
          dedupState: 'KEPT',
          dedupStateDescription: '보관',
          imageUrl: item.image,
          oidAid: `${item.id}-${Date.now()}`,
          updatedAt: null
        })),
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: {
            empty: true,
            unsorted: true,
            sorted: false
          },
          offset: page * size,
          unpaged: false,
          paged: true
        },
        last: endIndex >= searchResults.length,
        totalPages: Math.ceil(searchResults.length / size),
        totalElements: searchResults.length,
        first: page === 0,
        size: size,
        number: page,
        sort: {
          empty: true,
          unsorted: true,
          sorted: false
        },
        numberOfElements: paginatedResults.length,
        empty: paginatedResults.length === 0
      }
      
      return NextResponse.json(response)
    } catch (fallbackError) {
      console.error('폴백 데이터 로드 실패:', fallbackError)
      return NextResponse.json(
        { error: '뉴스 검색 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }
}
