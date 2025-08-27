// 뉴스레터 목록 API
export async function GET() {
  try {
    // 실제 환경에서는 데이터베이스에서 가져와야 합니다
    const newsletters = [
      {
        id: 1,
        title: "정치 뉴스 데일리",
        description: "매일 업데이트되는 정치 관련 최신 뉴스를 받아보세요. 국회 소식, 정책 동향, 정치 현안을 한눈에!",
        category: "정치",
        frequency: "매일",
        subscribers: 15420,
        lastSent: "2시간 전",
        tags: ["정치", "국회", "정책", "현안"],
        isSubscribed: false
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
        isSubscribed: false
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
        isSubscribed: false
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
        isSubscribed: false
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
        isSubscribed: false
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
        isSubscribed: false
      },
      {
        id: 7,
        title: "자동차/교통 업데이트",
        description: "자동차 시장 동향, 신차 소식, 교통 정책 변화를 실시간으로 전달합니다.",
        category: "자동차/교통",
        frequency: "주 3회",
        subscribers: 7890,
        lastSent: "1일 전",
        tags: ["자동차", "교통", "신차", "정책"],
        isSubscribed: false
      },
      {
        id: 8,
        title: "여행/음식 스토리",
        description: "국내외 여행지 소개, 맛집 추천, 음식 문화 이야기를 담습니다.",
        category: "여행/음식",
        frequency: "주 2회",
        subscribers: 5670,
        lastSent: "3일 전",
        tags: ["여행", "음식", "맛집", "문화"],
        isSubscribed: false
      },
      {
        id: 9,
        title: "예술/문화 인사이트",
        description: "전시회, 공연, 영화, 음악 등 문화 예술계의 최신 소식을 전합니다.",
        category: "예술",
        frequency: "주 2회",
        subscribers: 4320,
        lastSent: "4일 전",
        tags: ["예술", "문화", "전시", "공연"],
        isSubscribed: false
      },
      {
        id: 10,
        title: "스포츠 하이라이트",
        description: "국내외 스포츠 소식, 경기 결과, 선수 인터뷰를 빠르게 전달합니다.",
        category: "스포츠",
        frequency: "매일",
        subscribers: 15670,
        lastSent: "1시간 전",
        tags: ["스포츠", "경기", "선수", "하이라이트"],
        isSubscribed: false
      }
    ]

    return Response.json(newsletters)
  } catch (error) {
    console.error('뉴스레터 목록 조회 실패:', error)
    return Response.json(
      { error: '뉴스레터 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
