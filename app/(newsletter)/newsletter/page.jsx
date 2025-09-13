import NewsletterPageClient from './NewsletterPageClient'

// SEO를 위한 메타데이터
export const metadata = {
  title: '뉴스레터 - 최신 정보를 받아보세요',
  description: '관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요. 정치, 경제, 사회, IT/과학 등 다양한 카테고리의 뉴스레터를 제공합니다.',
  keywords: '뉴스레터, 구독, 뉴스, 정보, 이메일',
  openGraph: {
    title: '뉴스레터 - 최신 정보를 받아보세요',
    description: '관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요.',
    type: 'website',
  },
}

export default async function NewsletterPage() {
  // 서버에서 초기 뉴스레터 데이터 가져오기 (SSR) - 정적 데이터만 사용
  let initialNewsletters = null
  
  try {
    // 서버 사이드에서는 정적 데이터만 반환하도록 수정
    if (typeof window === "undefined") {
      initialNewsletters = [
        {
          id: 1,
          title: "정치 뉴스 데일리",
          description: "매일 업데이트되는 정치 관련 최신 뉴스를 받아보세요. 국회 소식, 정책 동향, 정치 현안을 한눈에!",
          category: "정치",
          frequency: "매일",
          subscribers: 15420,
          lastSent: "2시간 전",
          tags: ["정치", "국회", "정책", "현안"],
          isSubscribed: false,
        },
        {
          id: 2,
          title: "경제 트렌드 위클리",
          description: "주요 경제 지표, 주식 시장 동향, 부동산 소식을 주간으로 정리해서 전달합니다.",
          category: "경제",
          frequency: "주간",
          subscribers: 8920,
          lastSent: "1일 전",
          tags: ["경제", "주식", "부동산", "투자"],
          isSubscribed: false,
        },
        {
          id: 3,
          title: "IT/과학 인사이드",
          description: "최신 기술 트렌드, 스타트업 소식, 과학 연구 성과를 깊이 있게 다룹니다.",
          category: "IT/과학",
          frequency: "주 3회",
          subscribers: 12350,
          lastSent: "6시간 전",
          tags: ["IT", "기술", "스타트업", "과학"],
          isSubscribed: false,
        },
        {
          id: 4,
          title: "사회 이슈 포커스",
          description: "사회적 이슈와 현안을 다양한 관점에서 분석하고 해석합니다.",
          category: "사회",
          frequency: "매일",
          subscribers: 18760,
          lastSent: "4시간 전",
          tags: ["사회", "이슈", "현안", "분석"],
          isSubscribed: false,
        },
        {
          id: 5,
          title: "생활 정보 가이드",
          description: "일상생활에 유용한 정보, 건강, 요리, 쇼핑 팁을 제공합니다.",
          category: "생활",
          frequency: "주 2회",
          subscribers: 6540,
          lastSent: "2일 전",
          tags: ["생활", "건강", "요리", "쇼핑"],
          isSubscribed: false,
        },
        {
          id: 6,
          title: "세계 뉴스 브리프",
          description: "전 세계 주요 뉴스와 국제 관계 동향을 간결하게 요약해서 전달합니다.",
          category: "세계",
          frequency: "매일",
          subscribers: 11230,
          lastSent: "3시간 전",
          tags: ["세계", "국제", "외교", "글로벌"],
          isSubscribed: false,
        },
        {
          id: 7,
          title: "자동차 & 모빌리티 인사이드",
          description: "전기차, 자율주행, 친환경 모빌리티 등 자동차와 교통 분야의 최신 트렌드를 다룹니다.",
          category: "자동차/교통",
          frequency: "주 3회",
          subscribers: 8750,
          lastSent: "1일 전",
          tags: ["자동차", "전기차", "자율주행", "모빌리티"],
          isSubscribed: false,
        },
        {
          id: 8,
          title: "여행 & 푸드 가이드",
          description: "국내외 여행 정보와 맛집 소개, 음식 문화를 다루는 종합 가이드입니다.",
          category: "여행/음식",
          frequency: "주 2회",
          subscribers: 12340,
          lastSent: "2일 전",
          tags: ["여행", "음식", "맛집", "관광"],
          isSubscribed: false,
        },
        {
          id: 9,
          title: "아트 & 컬처 스토리",
          description: "영화, 음악, 미술, 문학 등 다양한 예술 분야의 소식과 문화 이벤트를 전합니다.",
          category: "예술",
          frequency: "주 2회",
          subscribers: 6540,
          lastSent: "3일 전",
          tags: ["예술", "문화", "영화", "음악"],
          isSubscribed: false,
        },
      ];
    }
  } catch (error) {
    console.error('❌ 서버에서 뉴스레터 데이터 로딩 실패:', error)
    // 서버에서 실패해도 클라이언트에서 재시도할 수 있도록 null 전달
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* 초기 데이터와 함께 클라이언트 컴포넌트로 전달 */}
      <NewsletterPageClient initialNewsletters={initialNewsletters} />
    </div>
  )
} 