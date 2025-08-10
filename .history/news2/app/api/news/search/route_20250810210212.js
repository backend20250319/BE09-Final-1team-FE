import { NextResponse } from 'next/server'
import { newsArticles } from '../../../../lib/news-data'

/**
 * GET /api/news/search
 * 뉴스 기사를 검색합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || searchParams.get('q')
    const page = parseInt(searchParams.get('page')) || 1
    const size = parseInt(searchParams.get('size')) || 20
    const type = searchParams.get('type') || 'full' // 'full' | 'suggest' | 'preview'
    
    if (!query) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      )
    }
    
    // 백엔드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    const params = new URLSearchParams({
      query: query,
      page: page - 1, // 백엔드는 0-based pagination
      size: size
    })
    
    if (type === 'suggest') {
      // 자동완성 제안은 프론트엔드에서 처리
      const searchResults = newsArticles.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        (item.tags && item.tags.some(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        ))
      )
      
      const uniqueKeywords = new Set()
      searchResults.forEach(item => {
        // 제목에서 키워드 추출
        const titleWords = item.title.split(/\s+/).filter(word => 
          word.length > 1 && word.toLowerCase().includes(query.toLowerCase())
        )
        titleWords.forEach(word => uniqueKeywords.add(word))
        
        // 태그에서 키워드 추출
        if (item.tags) {
          item.tags.forEach(tag => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              uniqueKeywords.add(tag)
            }
          })
        }
      })
      
      const suggestions = Array.from(uniqueKeywords).slice(0, 5)
      
      return NextResponse.json({
        suggestions: suggestions,
        query: query
      })
    }
    
    try {
      const response = await fetch(`${backendUrl}/api/news/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        // 백엔드가 없으면 프론트엔드에서 처리
        console.log('🔄 프론트엔드 검색 처리')
        
        const searchResults = newsArticles.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.summary.toLowerCase().includes(query.toLowerCase()) ||
          item.content.toLowerCase().includes(query.toLowerCase()) ||
          (item.tags && item.tags.some(tag => 
            tag.toLowerCase().includes(query.toLowerCase())
          ))
        )
        
        // 페이지네이션
        const startIndex = (page - 1) * size
        const endIndex = startIndex + size
        const paginatedResults = searchResults.slice(startIndex, endIndex)
        
        // 백엔드 응답 구조에 맞춰 반환
        const response = {
          content: paginatedResults.map(item => ({
            newsId: item.id,
            title: item.title,
            summary: item.summary,
            content: item.content,
            categoryName: item.category,
            press: item.source,
            reporterName: item.author,
            publishedAt: item.publishedAt,
            updatedAt: item.updatedAt,
            viewCount: item.views || 0,
            likes: item.likes || 0,
            imageUrl: item.image,
            tags: item.tags || [],
            link: item.link,
            trusted: item.trusted || false,
            dedupState: item.dedupState || 'NONE',
            dedupStateDescription: item.dedupStateDescription || '',
            oidAid: item.oidAid || ''
          })),
          totalElements: searchResults.length,
          totalPages: Math.ceil(searchResults.length / size),
          currentPage: page,
          size: size,
          first: page === 1,
          last: page >= Math.ceil(searchResults.length / size),
          query: query
        }
        
        return NextResponse.json(response)
      }
    } catch (error) {
      console.error('검색 API 오류:', error)
      return NextResponse.json(
        { error: '검색 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('뉴스 검색 API 오류:', error)
    return NextResponse.json(
      { error: '뉴스 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
