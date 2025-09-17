import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { term } = params
    
    if (!term) {
      return NextResponse.json({ error: '용어가 필요합니다.' }, { status: 400 })
    }
    
    console.log('🔄 툴팁 정의 API 호출:', { term })
    
    // 백엔드 툴팁 서비스 API 호출 (게이트웨이를 통해)
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/news/analysis/definition/${encodeURIComponent(term)}`
    console.log('📡 백엔드 툴팁 정의 API 호출:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    console.log('📡 백엔드 툴팁 정의 API 응답 상태:', response.status, response.statusText)
    
    if (!response.ok) {
      console.error('❌ 백엔드 툴팁 정의 API 오류:', response.status, response.statusText)
      // 백엔드 실패 시 빈 정의 배열 반환
      return NextResponse.json({
        success: true,
        definitions: []
      })
    }
    
    const data = await response.json()
    console.log('✅ 백엔드 툴팁 정의 API에서 받은 데이터:', data)
    
    // 백엔드 응답 구조를 프론트엔드에 맞게 변환
    const transformedData = {
      success: true,
      definitions: data.definitions || data.data || []
    }
    
    console.log('🔄 변환된 툴팁 정의 데이터:', transformedData)
    
    return NextResponse.json(transformedData)
    
  } catch (error) {
    console.error('❌ 툴팁 정의 API 오류:', error)
    
    // 에러 발생 시 빈 정의 배열 반환
    return NextResponse.json({
      success: true,
      definitions: []
    })
  }
}
