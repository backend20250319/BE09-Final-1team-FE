import { NextResponse } from 'next/server'

/**
 * GET /api/news/search
 * Spring Boot 백엔드 API로 뉴스 검색을 프록시합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const size = searchParams.get('size') || '20'
    const page = searchParams.get('page') || '0'
    const press = searchParams.get('press')
    const category = searchParams.get('category')
    
    if (!query) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      )
    }
    
    // Spring Boot 백엔드 URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    let apiUrl = `${backendUrl}/api/news/search?query=${encodeURIComponent(query)}&size=${size}&page=${page}`
    
    // 추가 필터 파라미터
    if (press) {
      apiUrl += `&press=${encodeURIComponent(press)}`
    }
    if (category) {
      apiUrl += `&category=${encodeURIComponent(category)}`
    }
    
    console.log('Proxying to:', apiUrl) // 디버깅용
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      throw new Error(`Backend API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Proxy API error:', error)
    return NextResponse.json(
      { error: '뉴스 검색 중 오류가 발생했습니다.' }, 
      { status: 500 }
    )
  }
}
