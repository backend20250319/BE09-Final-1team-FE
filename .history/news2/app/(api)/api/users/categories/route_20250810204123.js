import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 백엔드 서버로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    
    try {
      const response = await fetch(`${backendUrl}/users/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.log('⚠️ 백엔드 카테고리 API 실패, 기본 데이터 사용')
        throw new Error('BACKEND_UNAVAILABLE')
      }
    } catch (backendError) {
      // 백엔드 서버가 응답하지 않을 경우 기본 데이터 반환
      console.log('🔄 기본 관심사 카테고리 사용')
      
      const defaultCategories = [
        { id: 1, categoryName: '정치', icon: '🏛️' },
        { id: 2, categoryName: '경제', icon: '💰' },
        { id: 3, categoryName: '사회', icon: '🏘️' },
        { id: 4, categoryName: 'IT/과학', icon: '💻' },
        { id: 5, categoryName: '스포츠', icon: '⚽' },
        { id: 6, categoryName: '문화', icon: '🎭' },
        { id: 7, categoryName: '국제', icon: '🌍' },
        { id: 8, categoryName: '연예', icon: '🎬' },
        { id: 9, categoryName: '건강', icon: '🏥' },
        { id: 10, categoryName: '교육', icon: '📚' }
      ]
      
      return NextResponse.json({
        success: true,
        data: defaultCategories
      })
    }
    
  } catch (error) {
    console.error('관심사 카테고리 API 오류:', error)
    
    // 최종 폴백: 기본 데이터 반환
    const defaultCategories = [
      { id: 1, categoryName: '정치', icon: '🏛️' },
      { id: 2, categoryName: '경제', icon: '💰' },
      { id: 3, categoryName: '사회', icon: '🏘️' },
      { id: 4, categoryName: 'IT/과학', icon: '💻' },
      { id: 5, categoryName: '스포츠', icon: '⚽' },
      { id: 6, categoryName: '문화', icon: '🎭' }
    ]
    
    return NextResponse.json({
      success: true,
      data: defaultCategories
    })
  }
}
