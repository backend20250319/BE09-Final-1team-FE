import MainPage from "./page"
import { siteUrl } from "../lib/api-url"

async function fetchJSON(url, init) {
  const res = await fetch(url, { ...init, next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

export default async function Page() {
  try {
    // 내부 프록시를 그대로 써도 되고, 백엔드 직접 호출도 가능
    const [trending, list] = await Promise.all([
      fetchJSON(siteUrl(`/api/news/trending?hours=24&limit=1`)),
      fetchJSON(siteUrl(`/api/news?page=0&size=21`))
    ])

    // 백엔드 응답에 맞춰 매핑(당신의 MainPage에서 하던 그대로)
    const initialTrending = (() => {
      const src = (trending.content ?? trending.data ?? [])[0]
      if (!src) return null
      return {
        id: src.newsId,
        title: src.title,
        content: src.content ?? src.summary ?? "",
        source: src.press ?? "알 수 없음",
        publishedAt: src.publishedAt,
        category: src.categoryName,
        image: src.imageUrl ?? "/placeholder.jpg",
        views: src.viewCount ?? 0,
      }
    })()

    const mapped = (list.content ?? []).map((news) => ({
      id: news.newsId,
      title: news.title,
      content: news.content,
      source: news.press,
      publishedAt: news.publishedAt,
      category: news.categoryName,
      image: news.imageUrl,
      views: news.viewCount ?? 0
    }))

    return (
      <MainPage
        initialTrending={initialTrending}
        initialList={mapped}
        initialTotalPages={list.totalPages ?? 1}
        initialTotalElements={list.totalElements ?? mapped.length}
      />
    )
  } catch (error) {
    console.error('서버 컴포넌트 데이터 로딩 실패:', error)
    
    // 에러 시에도 기본 구조 유지
    return (
      <MainPage
        initialTrending={null}
        initialList={[]}
        initialTotalPages={1}
        initialTotalElements={0}
      />
    )
  }
}
