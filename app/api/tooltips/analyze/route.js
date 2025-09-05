import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { text } = body
    
    if (!text) {
      return NextResponse.json({ error: '텍스트가 필요합니다.' }, { status: 400 })
    }
    
    console.log('🔄 툴팁 분석 API 호출:', { textLength: text.length })
    
    // 백엔드 툴팁 서비스 API 호출
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8082'}/api/tooltips/analyze`
    console.log('📡 백엔드 툴팁 서비스 API 호출:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      cache: 'no-store'
    })
    
    console.log('📡 백엔드 툴팁 서비스 응답 상태:', response.status, response.statusText)
    
    if (!response.ok) {
      console.error('❌ 백엔드 툴팁 서비스 API 오류:', response.status, response.statusText)
      // 백엔드 실패 시 빈 툴팁 배열 반환
      return NextResponse.json({
        success: true,
        tooltips: []
      })
    }
    
    const data = await response.json()
    console.log('✅ 백엔드 툴팁 서비스에서 받은 데이터:', data)
    
    // 백엔드 응답 구조를 프론트엔드에 맞게 변환
    const transformedData = {
      success: true,
      tooltips: data.tooltips || data.data || []
    }
    
    console.log('🔄 변환된 툴팁 데이터:', transformedData)
    
    return NextResponse.json(transformedData)
    
  } catch (error) {
    console.error('❌ 툴팁 분석 API 오류:', error)
    
    // 에러 발생 시 빈 툴팁 배열 반환
    return NextResponse.json({
      success: true,
      tooltips: []
    })
  }
}


