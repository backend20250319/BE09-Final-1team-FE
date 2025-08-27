import MainPage from "./MainPage"

async function fetchJSON(url, init) {
  const res = await fetch(url, { ...init, next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

export default async function Page() {
  // 임시로 기본 데이터로 시작 (API 호출 문제 해결 후 제거)
  const initialTrending = {
    id: 1,
    title: "서버 컴포넌트 초기화 중...",
    content: "데이터를 불러오는 중입니다.",
    source: "시스템",
    publishedAt: new Date().toISOString(),
    category: "GENERAL",
    image: "/placeholder.jpg",
    views: 0
  }

  const initialList = [
    {
      id: 1,
      title: "초기 뉴스 데이터",
      content: "서버에서 데이터를 불러오는 중입니다.",
      source: "시스템",
      publishedAt: new Date().toISOString(),
      category: "GENERAL",
      image: "/placeholder.jpg",
      views: 0
    }
  ]

  return (
    <MainPage
      initialTrending={initialTrending}
      initialList={initialList}
      initialTotalPages={1}
      initialTotalElements={1}
    />
  )
}
