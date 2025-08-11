import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 백엔드 서버로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    
    const response = await fetch(`${backendUrl}/users/categories`, {
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
    console.error('관심사 카테고리 API 오류:', error)
    
    // 백엔드 서버가 응답하지 않을 경우 기본 데이터 반환
    const defaultCategories = [
      { id: 1, name: '정치' },
      { id: 2, name: '경제' },
      { id: 3, name: '사회' },
      { id: 4, name: 'IT/과학' },
      { id: 5, name: '스포츠' },
      { id: 6, name: '문화' }
    ]
    
    return NextResponse.json({
      success: true,
      data: defaultCategories
    })
  }
}
