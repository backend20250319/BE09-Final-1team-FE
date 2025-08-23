import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '10'
    
    // 백엔드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
    const response = await fetch(
      `${backendUrl}/api/trending/popular?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('🔥 인기 뉴스 요청:', { page, size })
    console.log('✅ 인기 뉴스 응답:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ 인기 뉴스 조회 실패:', error)
    
    // 백엔드 API 실패 시 더미 데이터 반환
    const fallbackData = {
      content: [
        {
          newsId: 1,
          title: "주요 경제 정책 발표, 시장에 미치는 파급효과 분석",
          content: "정부가 발표한 새로운 경제 정책이 금융시장과 실물경제에 미칠 영향에 대해 전문가들이 다양한 분석을 내놓고 있습니다. 이번 정책은 투자자들의 관심을 집중시키고 있으며, 시장의 반응을 주목해야 할 것으로 보입니다.",
          press: "경제신문",
          publishedAt: "2025-01-01T10:00:00",
          categoryName: "경제",
          imageUrl: "/placeholder.jpg",
          viewCount: 2345,
          link: "#"
        }
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
      first: true,
      last: true
    }
    
    return NextResponse.json(fallbackData)
  }
}
