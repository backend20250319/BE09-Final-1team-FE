import { NextResponse } from 'next/server'
import { newsArticles } from '../../../../lib/news-data'

/**
 * GET /api/news/search
 * 뉴스 기사를 검색합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const page = parseInt(searchParams.get('page')) || 1
    const size = parseInt(searchParams.get('size')) || 20
    
    if (!query) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      )
    }
    
    // 검색 로직
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
    
    // 응답 구조
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
    
  } catch (error) {
    console.error('뉴스 검색 API 오류:', error)
    return NextResponse.json(
      { error: '뉴스 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
