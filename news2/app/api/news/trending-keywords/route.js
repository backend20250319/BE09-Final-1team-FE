import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    const period = searchParams.get('period') || '24h'
    
    // 임시로 더미 트렌딩 키워드 데이터 반환
    // 실제로는 백엔드 API에서 가져와야 함
    const mockTrendingKeywords = {
      keywords: [
        { keyword: '인공지능', rank: 1, diff: 2 },
        { keyword: '부동산', rank: 2, diff: -1 },
        { keyword: '주식', rank: 3, diff: 1 },
        { keyword: '코로나19', rank: 4, diff: 0 },
        { keyword: '기술', rank: 5, diff: 3 },
        { keyword: '정치', rank: 6, diff: -2 },
        { keyword: '경제', rank: 7, diff: 0 },
        { keyword: '사회', rank: 8, diff: 1 },
        { keyword: '문화', rank: 9, diff: 0 },
        { keyword: '스포츠', rank: 10, diff: -1 }
      ]
    }
    
    console.log('🔥 트렌딩 키워드 요청:', { limit, period })
    console.log('✅ 트렌딩 키워드 응답:', mockTrendingKeywords)
    
    return NextResponse.json(mockTrendingKeywords)
  } catch (error) {
    console.error('❌ 트렌딩 키워드 조회 실패:', error)
    return NextResponse.json(
      { error: '트렌딩 키워드를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
