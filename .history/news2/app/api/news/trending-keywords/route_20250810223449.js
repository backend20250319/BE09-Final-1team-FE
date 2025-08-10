import { NextResponse } from 'next/server'

/**
 * GET /api/news/trending-keywords
 * Spring Boot 백엔드 API로 트렌딩 키워드를 프록시합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    const period = searchParams.get('period') || '24h'
    
    // Spring Boot 백엔드 URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const apiUrl = `${backendUrl}/api/news/trending-keywords?limit=${limit}&period=${period}`
    
    console.log('Proxying trending keywords to:', apiUrl) // 디버깅용
    
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
    
    // 백엔드 API가 없을 경우 기본 데이터 반환
    const fallbackData = {
      keywords: [
        { keyword: "AI", count: 15, rank: 1, trend: "up", diff: 3 },
        { keyword: "경제", count: 12, rank: 2, trend: "up", diff: 2 },
        { keyword: "정치", count: 10, rank: 3, trend: "down", diff: -1 },
        { keyword: "환경", count: 8, rank: 4, trend: "up", diff: 1 },
        { keyword: "기술", count: 7, rank: 5, trend: "up", diff: 2 }
      ],
      period: "24h",
      totalKeywords: 5,
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json(fallbackData)
  }
}
