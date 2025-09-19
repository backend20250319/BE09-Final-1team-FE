import { NextResponse } from 'next/server'
import { getNewsletterServiceUrl } from '@/lib/utils/config'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'trending'
    
    console.log('피드 B형 뉴스레터 미리보기 요청:', { type })
    
    // 백엔드 API로 프록시 요청
    const backendUrl = getNewsletterServiceUrl(`/api/newsletter/preview/feed-b?type=${type}`)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 필요한 경우 인증 헤더 추가
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')
        })
      },
      // 쿠키 전달
      credentials: 'include'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('백엔드 API 오류:', response.status, errorText)
      
      return NextResponse.json(
        { 
          error: '백엔드 API 오류', 
          status: response.status,
          message: errorText 
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('백엔드에서 받은 데이터:', data)
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('피드 B형 뉴스레터 미리보기 API 오류:', error)
    
    return NextResponse.json(
      { 
        error: '서버 오류', 
        message: error.message,
        details: '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
      },
      { status: 500 }
    )
  }
}
