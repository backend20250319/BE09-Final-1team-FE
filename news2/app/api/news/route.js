import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '21'
    const category = searchParams.get('category')
    
    // 백엔드 API URL 구성
    let backendUrl = `http://localhost:8000/api/news?page=${page}&size=${size}`
    if (category && category !== '전체') {
      backendUrl += `&category=${category}`
    }
    
    console.log('🔄 백엔드 API 호출:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ 백엔드 응답 성공:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ 프록시 API 오류:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news data' },
      { status: 500 }
    )
  }
}
