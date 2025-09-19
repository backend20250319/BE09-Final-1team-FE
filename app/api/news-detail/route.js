import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 })
    }
    
    console.log('🔄 뉴스 상세 API 호출:', { id })
    
    // 백엔드 서버 API 호출
    const backendUrl = `http://localhost:8000/api/news/${id}`
    console.log('📡 백엔드 서버 API 호출:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    console.log('📡 백엔드 응답 상태:', response.status, response.statusText)
    
    if (!response.ok) {
      console.error('❌ 백엔드 API 오류:', response.status, response.statusText)
      throw new Error(`백엔드 API 오류: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ 백엔드에서 받은 뉴스 데이터:', data)
    
    // 백엔드 응답 구조를 프론트엔드에 맞게 변환
    const transformedData = {
      id: data.newsId,
      title: data.title,
      content: data.content,
      source: data.press,
      publishedAt: data.publishedAt,
      category: data.categoryName,
      image: data.imageUrl,
      views: data.viewCount || 0,
      summary: data.summary,
      link: data.link,
      reporterName: data.reporterName,
      isMock: false
    }
    
    console.log('🔄 변환된 뉴스 데이터:', transformedData)
    
    return NextResponse.json(transformedData)
    
  } catch (error) {
    console.error('❌ 뉴스 상세 API 오류:', error)
    
    return NextResponse.json(
      { error: '뉴스를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
