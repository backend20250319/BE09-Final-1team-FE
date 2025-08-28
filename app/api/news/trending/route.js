import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.NEWS_BASE_URL || 'http://localhost:8082'

export async function GET(req) {
  try {
    console.log('🔧 환경 변수 NEWS_BASE_URL:', process.env.NEWS_BASE_URL)
    console.log('🔧 기본값 BASE:', BASE)
    
    const { search } = new URL(req.url)
    const url = `${BASE}/api/news/trending${search}`
    
    console.log('🔗 프록시 요청 URL:', url)
    
    const resp = await fetch(url, { 
      headers: { 'Content-Type': 'application/json' }, 
      cache: 'no-store',
      timeout: 10000 // 10초 타임아웃 추가
    })
    
    console.log('📡 응답 상태:', resp.status, resp.statusText)
    
    if (!resp.ok) {
      console.error('❌ API 응답 오류:', resp.status, resp.statusText)
      return NextResponse.json(
        { error: `API 요청 실패: ${resp.status} ${resp.statusText}` },
        { status: resp.status }
      )
    }
    
    const text = await resp.text()
    console.log('📄 응답 텍스트 길이:', text.length)
    
    if (!text) {
      console.warn('⚠️ 빈 응답')
      return NextResponse.json({ content: [] })
    }
    
    let data
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error('❌ JSON 파싱 오류:', parseError)
      return NextResponse.json(
        { error: '유효하지 않은 JSON 응답' },
        { status: 500 }
      )
    }
    
    console.log('✅ 파싱된 데이터 구조:', {
      hasContent: !!data.content,
      contentLength: data.content?.length,
      hasData: !!data.data,
      dataLength: data.data?.length
    })
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ 프록시 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}
