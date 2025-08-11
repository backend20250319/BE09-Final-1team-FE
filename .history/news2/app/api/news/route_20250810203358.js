import { NextResponse } from 'next/server'

/**
 * GET /api/news
 * 모든 뉴스 기사를 반환합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page')) || 1
    const size = parseInt(searchParams.get('size')) || 20
    
    // 백엔드 서버로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    let url = `${backendUrl}/news?page=${page}&size=${size}`
    
    if (category && category !== '전체') {
      url += `&category=${encodeURIComponent(category)}`
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('뉴스 API 오류:', error)
    return NextResponse.json(
      { error: '뉴스 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/news
 * 새로운 뉴스 기사를 생성합니다 (관리자용)
 */
export async function POST(request) {
  try {
    const body = await request.json()
    
    // 백엔드 서버로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    
    const response = await fetch(`${backendUrl}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('뉴스 생성 오류:', error)
    return NextResponse.json(
      { error: '뉴스 기사 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
