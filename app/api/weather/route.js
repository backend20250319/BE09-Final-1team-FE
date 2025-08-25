import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') || 'Seoul'
    
    console.log('🌤️ 날씨 API 호출:', { city })
    
    // 임시로 더미 날씨 데이터 반환
    // 실제로는 외부 날씨 API에서 가져와야 함
    const mockWeatherData = {
      city: city,
      temperature: 22,
      condition: '맑음',
      humidity: 65,
      windSpeed: 12,
      icon: '☀️',
      description: '맑은 하늘'
    }
    
    console.log('✅ 날씨 API 응답 성공:', mockWeatherData)
    
    return NextResponse.json(mockWeatherData)
  } catch (error) {
    console.error('❌ 날씨 API 오류:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
