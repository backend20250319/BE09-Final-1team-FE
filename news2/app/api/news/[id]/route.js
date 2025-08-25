import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = params
  
  // 단순한 Mock 데이터 반환
  const mockData = {
    id: parseInt(id),
    title: `뉴스 제목 ${id}`,
    content: `이것은 뉴스 ID ${id}의 내용입니다. 백엔드 서버 연결에 문제가 있어 Mock 데이터를 표시합니다.`,
    source: "Mock 언론사",
    publishedAt: new Date().toISOString(),
    category: "POLITICS",
    image: "/placeholder.jpg",
    views: Math.floor(Math.random() * 10000) + 100,
    summary: "Mock 뉴스 요약입니다.",
    link: "#",
    reporterName: "Mock 기자",
    isMock: true
  }
  
  return NextResponse.json(mockData)
}
