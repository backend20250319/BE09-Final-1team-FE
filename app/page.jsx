import MainPage from './MainPage';
import { siteUrl } from '../lib/api-url';

async function fetchJSON(url, init) {
  const res = await fetch(url, { ...init, next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export default async function Page() {
  try {
    // 내부 프록시를 사용하여 초기 데이터 가져오기
    const [trending, list] = await Promise.all([
      fetchJSON(siteUrl(`/api/news/trending?hours=24&limit=1`)),
      fetchJSON(siteUrl(`/api/news?page=0&size=21`)),
    ]);

    // 백엔드 응답에 맞춰 매핑
    const initialTrending = (() => {
      const src = (trending.content ?? trending.data ?? [])[0];
      if (!src) return null;
      return {
        id: src.newsId,
        title: src.title,
        content: src.content ?? src.summary ?? '',
        source: src.press ?? '알 수 없음',
        publishedAt: src.publishedAt,
        category: src.categoryName,
        image: src.imageUrl ?? '/placeholder.jpg',
        views: src.viewCount ?? 0,
      };
    })();

    const mapped = (list.content ?? []).map((news) => ({
      id: news.newsId,
      title: news.title,
      content: news.content,
      source: news.press,
      publishedAt: news.publishedAt,
      category: news.categoryName,
      image: news.imageUrl,
      views: news.viewCount ?? 0,
    }));

    return (
      <MainPage
        initialTrending={initialTrending}
        initialList={mapped}
        initialTotalPages={list.totalPages ?? 1}
        initialTotalElements={list.totalElements ?? mapped.length}
      />
    );
  } catch (error) {
    console.error('Failed to fetch initial data:', error);

    // 에러 시 기본 데이터 사용
    const initialTrending = {
      id: 1,
      title: '뉴스를 불러오는 중...',
      content: '잠시만 기다려주세요.',
      source: '시스템',
      publishedAt: new Date().toISOString(),
      category: 'GENERAL',
      image: '/placeholder.jpg',
      views: 0,
    };

    const initialList = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      title: `뉴스 제목 ${i + 1}`,
      content: '뉴스 내용을 불러오는 중입니다.',
      source: '시스템',
      publishedAt: new Date().toISOString(),
      category: 'GENERAL',
      image: '/placeholder.jpg',
      views: 0,
    }));

    return (
      <MainPage
        initialTrending={initialTrending}
        initialList={initialList}
        initialTotalPages={1}
        initialTotalElements={6}
      />
    );
  }
}
