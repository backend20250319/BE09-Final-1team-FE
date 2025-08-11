import { NextResponse } from 'next/server'
import { newsArticles, NEWS_CATEGORIES } from '../../../lib/news-data'

/**
 * GET /api/news
 * 모든 뉴스 기사를 반환합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page')) || 1
    const size = parseInt(searchParams.get('size')) || 20
    
    let filteredNews = newsArticles
    
    // 카테고리 매핑
    const categoryMapping = {
      'POLITICS': NEWS_CATEGORIES.POLITICS,
      'ECONOMY': NEWS_CATEGORIES.ECONOMY,
      'SOCIETY': NEWS_CATEGORIES.SOCIETY,
      'IT_SCIENCE': NEWS_CATEGORIES.IT_SCIENCE,
      'SPORTS': NEWS_CATEGORIES.SPORTS,
      'CULTURE': NEWS_CATEGORIES.CULTURE
    }
    
    // 카테고리 필터링
    if (category && category !== '전체') {
      const mappedCategory = categoryMapping[category] || category
      filteredNews = newsArticles.filter(item => item.category === mappedCategory)
    }
    
    // 페이지네이션
    const startIndex = (page - 1) * size
    const endIndex = startIndex + size
    const paginatedNews = filteredNews.slice(startIndex, endIndex)
    
    // 응답 구조
    const response = {
      content: paginatedNews.map(item => ({
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
      totalElements: filteredNews.length,
      totalPages: Math.ceil(filteredNews.length / size),
      currentPage: page,
      size: size,
      first: page === 1,
      last: page >= Math.ceil(filteredNews.length / size)
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('뉴스 API 오류:', error)
    return NextResponse.json(
      { error: '뉴스 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/news
 * 새로운 뉴스 기사를 생성합니다 (관리자용)
 */
export async function POST(request) {
  try {
    const body = await request.json()
    
    // 여기에 뉴스 생성 로직을 구현할 수 있습니다
    // 현재는 더미 응답을 반환합니다
    
    return NextResponse.json({
      message: '뉴스 기사가 성공적으로 생성되었습니다.',
      id: Date.now()
    })
    
  } catch (error) {
    console.error('뉴스 생성 오류:', error)
    return NextResponse.json(
      { error: '뉴스 기사 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
