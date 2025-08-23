import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '10'
    
    // 백엔드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8082'
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
    console.log('✅ 인기 뉴스 첫 번째 아이템:', data.content?.[0])
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ 인기 뉴스 조회 실패:', error)
    return NextResponse.json({ error: '인기 뉴스를 불러올 수 없습니다.' }, { status: 500 })
  }
}
