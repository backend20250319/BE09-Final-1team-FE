import { NextResponse } from 'next/server'
import { newsArticles } from '../../../../lib/news-data'

/**
 * GET /api/news/[id]
 * 특정 뉴스 기사를 반환합니다
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    // 뉴스 기사 찾기
    const newsItem = newsArticles.find(item => item.id === parseInt(id))
    
    if (!newsItem) {
      return NextResponse.json(
        { error: '뉴스 기사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 응답 구조
    const response = {
      newsId: newsItem.id,
      title: newsItem.title,
      summary: newsItem.summary,
      content: newsItem.content,
      categoryName: newsItem.category,
      press: newsItem.source,
      reporterName: newsItem.author,
      publishedAt: newsItem.publishedAt,
      updatedAt: newsItem.updatedAt,
      viewCount: newsItem.views || 0,
      likes: newsItem.likes || 0,
      imageUrl: newsItem.image,
      tags: newsItem.tags || [],
      link: newsItem.link,
      trusted: newsItem.trusted || false,
      dedupState: newsItem.dedupState || 'NONE',
      dedupStateDescription: newsItem.dedupStateDescription || '',
      oidAid: newsItem.oidAid || ''
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('뉴스 상세 API 오류:', error)
    return NextResponse.json(
      { error: '뉴스 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


