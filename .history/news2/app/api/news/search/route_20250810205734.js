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
    
    // 검색 로직 - 더 정확한 검색을 위해 개선
    const searchResults = newsArticles.filter(item => {
      const searchQuery = query.toLowerCase();
      const title = item.title.toLowerCase();
      const summary = item.summary.toLowerCase();
      const content = item.content.toLowerCase();
      const category = item.category.toLowerCase();
      const source = item.source.toLowerCase();
      const tags = item.tags ? item.tags.map(tag => tag.toLowerCase()) : [];
      
      return title.includes(searchQuery) ||
             summary.includes(searchQuery) ||
             content.includes(searchQuery) ||
             category.includes(searchQuery) ||
             source.includes(searchQuery) ||
             tags.some(tag => tag.includes(searchQuery));
    });
    
    // 자동완성 제안 (검색어 기반)
    const suggestions = []
    if (type === 'suggest') {
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
      
      suggestions.push(...Array.from(uniqueKeywords).slice(0, 5))
    }
    
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
        updatedAt: item.publishedAt, // updatedAt이 없으면 publishedAt 사용
        viewCount: item.views || 0,
        likes: item.likes || 0,
        imageUrl: item.image,
        tags: item.tags || [],
        link: `/news/${item.id}`, // 실제 링크 생성
        trusted: true, // 기본값
        dedupState: 'NONE',
        dedupStateDescription: '',
        oidAid: ''
      })),
      totalElements: searchResults.length,
      totalPages: Math.ceil(searchResults.length / size),
      currentPage: page,
      size: size,
      first: page === 1,
      last: page >= Math.ceil(searchResults.length / size),
      query: query,
      suggestions: type === 'suggest' ? suggestions : undefined
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
