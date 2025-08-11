import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  const size = searchParams.get('size') || '21'
  const category = searchParams.get('category')

  try {
    // 백엔드 API URL 구성
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    let apiUrl = `${baseUrl}/api/news?page=${page}&size=${size}`
    
    if (category && category !== '전체') {
      apiUrl = `${baseUrl}/api/news?category=${category}&page=${page}&size=${size}`
    }

    console.log('🔄 백엔드 API 호출:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } // 1분마다 캐시 갱신
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // 백엔드 응답 구조에 맞게 변환
    const newsItems = data.content ? data.content.map(item => ({
      id: item.newsId,
      title: item.title,
      summary: item.summary || item.content?.substring(0, 200) + '...',
      content: item.content,
      category: item.categoryName,
      source: item.press,
      author: item.reporterName,
      publishedAt: item.publishedAt,
      updatedAt: item.updatedAt,
      views: 0,
      likes: 0,
      image: item.imageUrl || "/placeholder.svg",
      tags: [],
      isPublished: true,
      isFeatured: false,
      link: item.link,
      trusted: item.trusted === 1,
      dedupState: item.dedupState,
      dedupStateDescription: item.dedupStateDescription,
      oidAid: item.oidAid
    })) : []

    const result = {
      content: newsItems,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      currentPage: data.number + 1,
      size: data.size,
      first: data.first,
      last: data.last
    }

    console.log('✅ API Route 성공:', result.content.length, '개 뉴스')
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ API Route 실패:', error)
    
    // 백엔드 실패 시 더미 데이터 반환
    const { newsArticles } = await import('@/lib/news-data')
    
    let filteredArticles = newsArticles
    if (category && category !== '전체') {
      filteredArticles = newsArticles.filter(article => article.category === category)
    }
    
    const startIndex = (parseInt(page) - 1) * parseInt(size)
    const endIndex = startIndex + parseInt(size)
    const dummyNewsItems = filteredArticles.slice(startIndex, endIndex).map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      source: item.source,
      author: item.author,
      publishedAt: item.publishedAt,
      updatedAt: item.publishedAt,
      views: item.views,
      likes: item.likes,
      image: item.image,
      tags: item.tags,
      isPublished: true,
      isFeatured: false
    }))
    
    const result = {
      content: dummyNewsItems,
      totalElements: filteredArticles.length,
      totalPages: Math.ceil(filteredArticles.length / parseInt(size)),
      currentPage: parseInt(page),
      size: parseInt(size),
      first: parseInt(page) === 1,
      last: parseInt(page) >= Math.ceil(filteredArticles.length / parseInt(size))
    }
    
    console.log('✅ 더미 데이터 반환:', dummyNewsItems.length, '개')
    return NextResponse.json(result)
  }
}
