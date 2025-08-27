import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    const period = searchParams.get('period') || '24h'
    
    // 임시로 더미 트렌딩 뉴스 데이터 반환
    // 실제로는 백엔드 API에서 가져와야 함
    const mockTrendingNews = [
      {
        id: 1,
        title: "인공지능 기술 발전으로 일자리 변화 예상",
        content: "최신 AI 기술 발전으로 다양한 산업 분야에서 일자리 변화가 예상됩니다...",
        source: "기술뉴스",
        publishedAt: "2025-01-01T10:00:00",
        category: "IT_SCIENCE",
        image: "/placeholder.jpg",
        views: 15420,
        trend: "up"
      },
      {
        id: 2,
        title: "부동산 시장 동향 분석 리포트",
        content: "최근 부동산 시장의 변화와 향후 전망에 대한 전문가 분석...",
        source: "경제일보",
        publishedAt: "2025-01-01T09:30:00",
        category: "ECONOMY",
        image: "/placeholder.jpg",
        views: 12350,
        trend: "down"
      },
      {
        id: 3,
        title: "주식 시장 급등락, 투자자 주의 필요",
        content: "최근 주식 시장의 급등락으로 투자자들의 신중한 접근이 필요합니다...",
        source: "투자뉴스",
        publishedAt: "2025-01-01T09:00:00",
        category: "ECONOMY",
        image: "/placeholder.jpg",
        views: 9870,
        trend: "up"
      }
    ]
    
    console.log('🔥 트렌딩 뉴스 요청:', { limit, period })
    console.log('✅ 트렌딩 뉴스 응답:', mockTrendingNews)
    
    return NextResponse.json(mockTrendingNews)
  } catch (error) {
    console.error('❌ 트렌딩 뉴스 조회 실패:', error)
    return NextResponse.json(
      { error: '트렌딩 뉴스를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
