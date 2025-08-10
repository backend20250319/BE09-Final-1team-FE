import { NextResponse } from 'next/server'
import { newsArticles } from '../../../../lib/news-data'

/**
 * GET /api/news/trending
 * 트렌딩 뉴스를 반환합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    
    // 트렌딩 뉴스 로직 (조회수 기준으로 정렬)
    const trendingNews = newsArticles
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit)
    
    // 응답 구조
    const response = {
      content: trendingNews.map(item => ({
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
      totalElements: trendingNews.length,
      limit: limit
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('트렌딩 뉴스 API 오류:', error)
    return NextResponse.json(
      { error: '트렌딩 뉴스를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
