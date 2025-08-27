import { NextResponse } from 'next/server'
import { getNewsServiceUrl } from '@/lib/config'

export async function GET(request, { params }) {
  try {
    const { id } = params
    
    console.log('🔄 개별 뉴스 API 호출:', { id })
    
    // 백엔드 뉴스 서비스 API URL 구성
    const backendUrl = `${getNewsServiceUrl(`api/news/${id}`)}`
    
    console.log('📡 백엔드 뉴스 서비스 API 호출:', backendUrl)
    
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
      console.log('✅ 백엔드 뉴스 서비스에서 받은 뉴스 데이터:', data)
      
      // 백엔드 응답 구조를 프론트엔드에 맞게 변환
      const transformedData = {
        id: data.newsId,
        title: data.title,
        content: data.content,
        source: data.press,
        publishedAt: data.publishedAt,
        category: data.categoryName,
        image: data.imageUrl,
        views: data.viewCount || 0,
        summary: data.summary,
        link: data.link,
        reporterName: data.reporterName,
        isMock: false
      }
      
      console.log('🔄 변환된 뉴스 데이터:', transformedData)
      
      return NextResponse.json(transformedData)
    } catch (backendError) {
      console.warn('⚠️ 백엔드 서버 연결 실패, Mock 데이터 사용:', backendError.message)
      
      // Mock 데이터 생성
      const mockData = {
        id: parseInt(id),
        title: `Mock 뉴스 제목 ${id}`,
        content: `이것은 Mock 뉴스 내용입니다. 뉴스 ID는 ${id}이며, 백엔드 서버 연결에 실패하여 생성된 데이터입니다.`,
        source: "Mock 언론사",
        publishedAt: new Date().toISOString(),
        category: "POLITICS",
        image: "/placeholder.jpg",
        views: Math.floor(Math.random() * 10000) + 100,
        summary: "Mock 뉴스 요약입니다.",
        link: "#",
        reporterName: "Mock 기자",
        isMock: true
      }
      
      console.log('🎭 Mock 뉴스 데이터 생성 완료:', mockData)
      
      return NextResponse.json(mockData)
    }
  } catch (error) {
    console.error('❌ 개별 뉴스 API 오류:', error)
    
    return NextResponse.json(
      { error: '뉴스를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
