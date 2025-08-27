import MainPage from "./MainPage"

async function fetchJSON(url, init) {
  const res = await fetch(url, { ...init, next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

export default async function Page() {
  // 임시로 기본 데이터 사용 (서버 컴포넌트 API 호출 문제 해결 후 제거)
  const initialTrending = {
    id: 1,
    title: "최신 뉴스를 불러오는 중...",
    content: "잠시만 기다려주세요.",
    source: "시스템",
    publishedAt: new Date().toISOString(),
    category: "GENERAL",
    image: "/placeholder.jpg",
    views: 0
  }

  const initialList = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `뉴스 제목 ${i + 1}`,
    content: "뉴스 내용을 불러오는 중입니다.",
    source: "시스템",
    publishedAt: new Date().toISOString(),
    category: "GENERAL",
    image: "/placeholder.jpg",
    views: 0
  }))

  return (
    <MainPage
      initialTrending={initialTrending}
      initialList={initialList}
      initialTotalPages={1}
      initialTotalElements={6}
    />
  )
}
