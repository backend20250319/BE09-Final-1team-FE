import { NextResponse } from 'next/server'
import { getNewsServiceUrl } from '@/lib/config'

// Mock 데이터 생성 함수
function generateMockNews(page, size, category) {
  const mockNews = []
  const categories = ["POLITICS", "ECONOMY", "SOCIETY", "CULTURE", "INTERNATIONAL", "IT_SCIENCE", "VEHICLE", "TRAVEL_FOOD", "ART"]
  const sources = ["조선일보", "중앙일보", "동아일보", "한겨레", "경향신문", "서울신문", "국민일보", "세계일보"]
  
  for (let i = 0; i < size; i++) {
    const newsId = (page - 1) * size + i + 1
    const randomCategory = category && category !== "전체" ? category : categories[Math.floor(Math.random() * categories.length)]
    const randomSource = sources[Math.floor(Math.random() * sources.length)]
    
    mockNews.push({
      newsId: newsId,
      title: `[${randomCategory}] ${randomSource} 뉴스 제목 ${newsId} - ${Math.random().toString(36).substring(7)}`,
      content: `이것은 ${randomCategory} 카테고리의 ${randomSource}에서 발행된 뉴스 내용입니다. 뉴스 ID는 ${newsId}이며, 이는 Mock 데이터입니다.`,
      press: randomSource,
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      categoryName: randomCategory,
      imageUrl: `/placeholder.jpg`,
      viewCount: Math.floor(Math.random() * 10000) + 100
    })
  }
  
  return mockNews
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const size = parseInt(searchParams.get('size') || '21')
    let category = searchParams.get('category')
    
    
    let backendUrl = `${getNewsServiceUrl('api/news')}?page=${page - 1}&size=${size}`
    if (category && category !== "전체") {
      backendUrl += `&category=${category}`
    }
    
    
    try {
      // 실제 백엔드 API 호출 시도
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })
      
      if (!response.ok) {
        console.error('❌ 백엔드 API 오류:', response.status, response.statusText)
        throw new Error(`백엔드 API 오류: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ 백엔드 뉴스 서비스에서 받은 데이터:', data)
      
      // 백엔드 응답 구조를 프론트엔드에 맞게 변환
      const transformedData = {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 1,
        currentPage: data.number + 1, // Spring Boot는 0-based pagination 사용
        size: data.size || size,
        isMock: false
      }
      
      console.log('🔄 변환된 데이터:', transformedData)
      
      return NextResponse.json(transformedData)
    } catch (backendError) {
      console.warn('⚠️ 백엔드 서버 연결 실패, Mock 데이터 사용:', backendError.message)
      
      // Mock 데이터 생성
      const mockContent = generateMockNews(page, size, category)
      const totalElements = 1000 // 총 뉴스 개수
      const totalPages = Math.ceil(totalElements / size)
      
      const mockData = {
        content: mockContent,
        totalElements: totalElements,
        totalPages: totalPages,
        currentPage: page,
        size: size,
        isMock: true
      }
      
      console.log('🎭 Mock 데이터 생성 완료:', mockData)
      
      return NextResponse.json(mockData)
    }
  } catch (error) {
    console.error('❌ 뉴스 API 오류:', error)
    
    return NextResponse.json(
      { error: '뉴스를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
