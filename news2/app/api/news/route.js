import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/config'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '21')
    const category = searchParams.get('category')
    
    console.log('🔄 뉴스 API 호출:', { page, size, category })
    
    // 백엔드 API URL 구성
    let backendUrl = `${getApiUrl('api/news')}?page=${page}&size=${size}`
    if (category) {
      backendUrl += `&category=${category}`
    }
    
    console.log('📡 백엔드 API 호출:', backendUrl)
    
    // 실제 백엔드 API 호출
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('❌ 백엔드 API 오류:', response.status, response.statusText)
      throw new Error(`백엔드 API 오류: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ 백엔드에서 받은 뉴스 데이터:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ 뉴스 API 오류:', error)
    
    return NextResponse.json(
      { error: '뉴스를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
