import { mapBackendNewsletter, processBackendResponse } from '@/lib/utils/utils';

// 특정 뉴스레터 조회 API
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // ID 유효성 검사
    if (!id || isNaN(id)) {
      return Response.json({
        success: false,
        message: '유효하지 않은 뉴스레터 ID입니다.',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    // 백엔드 API URL (환경변수에서 가져오기)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // 실제 백엔드 API 호출
    const response = await fetch(`${backendUrl}/api/newsletters/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 필요한 경우 인증 헤더 추가
        // 'Authorization': `Bearer ${token}`
      },
      // 타임아웃 설정
      signal: AbortSignal.timeout(5000) // 5초 타임아웃
    });

    if (response.ok) {
      const backendData = await response.json();
      
      // 백엔드 데이터를 프론트엔드 형식으로 매핑
      const mappedNewsletter = mapBackendNewsletter(backendData);
      
      return Response.json({
        success: true,
        data: mappedNewsletter,
        message: '뉴스레터를 성공적으로 가져왔습니다.'
      });
    } else if (response.status === 404) {
      return Response.json({
        success: false,
        message: '뉴스레터를 찾을 수 없습니다.',
        code: 'NOT_FOUND'
      }, { status: 404 });
    } else {
      console.warn('백엔드 API 호출 실패:', response.status);
      // 백엔드 호출 실패 시 기본 데이터에서 해당 ID 찾기
      const defaultNewsletter = getDefaultNewsletterById(parseInt(id));
      
      if (defaultNewsletter) {
        return Response.json({
          success: true,
          data: defaultNewsletter,
          message: '기본 뉴스레터 데이터를 반환합니다.'
        });
      } else {
        return Response.json({
          success: false,
          message: '뉴스레터를 찾을 수 없습니다.',
          code: 'NOT_FOUND'
        }, { status: 404 });
      }
    }
    
  } catch (error) {
    console.error('뉴스레터 API 에러:', error);
    
    // 에러 발생 시 기본 데이터에서 해당 ID 찾기
    const { id } = params;
    const defaultNewsletter = getDefaultNewsletterById(parseInt(id));
    
    if (defaultNewsletter) {
      return Response.json({
        success: true,
        data: defaultNewsletter,
        message: '기본 뉴스레터 데이터를 반환합니다.'
      });
    } else {
      return Response.json({
        success: false,
        message: '뉴스레터를 불러오는데 실패했습니다.',
        code: 'SERVER_ERROR'
      }, { status: 500 });
    }
  }
}

// 기본 뉴스레터 데이터에서 특정 ID 찾기
function getDefaultNewsletterById(id) {
  const defaultNewsletters = getDefaultNewsletters();
  return defaultNewsletters.find(newsletter => newsletter.id === id);
}

// 기본 뉴스레터 데이터 (fallback용)
function getDefaultNewsletters() {
  return [
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
      author: "정치부 기자",
      authorAvatar: "/placeholder-user.jpg",
      date: new Date().toLocaleDateString("ko-KR"),
      time: new Date().toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' }),
      views: 1250,
      content: [
        {
          type: "header",
          title: "오늘의 주요 정치 소식",
          subtitle: "국회와 정부의 최신 동향을 전해드립니다"
        },
        {
          type: "article",
          title: "국정감사 결과 발표",
          summary: "올해 국정감사에서 주요 쟁점들이 논의되었습니다.",
          category: "국회",
          readTime: "3분",
          image: "https://via.placeholder.com/300x200/667eea/ffffff?text=Politics"
        }
      ],
      sections: [
        {
          type: "header",
          heading: "오늘의 주요 정치 소식",
          subtitle: "국회와 정부의 최신 동향을 전해드립니다"
        },
        {
          type: "article",
          heading: "국정감사 결과 발표",
          items: [
            {
              title: "국정감사 결과 발표",
              summary: "올해 국정감사에서 주요 쟁점들이 논의되었습니다.",
              category: "국회",
              readTime: "3분",
              image: "https://via.placeholder.com/300x200/667eea/ffffff?text=Politics"
            }
          ]
        }
      ]
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
      author: "경제부 기자",
      authorAvatar: "/placeholder-user.jpg",
      date: new Date().toLocaleDateString("ko-KR"),
      time: new Date().toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' }),
      views: 980,
      content: [
        {
          type: "header",
          title: "이번 주 경제 동향",
          subtitle: "주요 경제 지표와 시장 분석"
        },
        {
          type: "article",
          title: "주식 시장 전망",
          summary: "이번 주 주식 시장의 주요 이슈와 전망을 분석합니다.",
          category: "주식",
          readTime: "5분",
          image: "https://via.placeholder.com/300x200/10b981/ffffff?text=Economy"
        }
      ],
      sections: [
        {
          type: "header",
          heading: "이번 주 경제 동향",
          subtitle: "주요 경제 지표와 시장 분석"
        },
        {
          type: "article",
          heading: "주식 시장 전망",
          items: [
            {
              title: "주식 시장 전망",
              summary: "이번 주 주식 시장의 주요 이슈와 전망을 분석합니다.",
              category: "주식",
              readTime: "5분",
              image: "https://via.placeholder.com/300x200/10b981/ffffff?text=Economy"
            }
          ]
        }
      ]
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
      author: "IT부 기자",
      authorAvatar: "/placeholder-user.jpg",
      date: new Date().toLocaleDateString("ko-KR"),
      time: new Date().toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' }),
      views: 2100,
      content: [
        {
          type: "header",
          title: "최신 IT 트렌드",
          subtitle: "기술의 미래를 만나보세요"
        },
        {
          type: "article",
          title: "AI 기술 발전 현황",
          summary: "인공지능 기술의 최신 발전 상황과 향후 전망을 살펴봅니다.",
          category: "AI",
          readTime: "7분",
          image: "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=AI"
        }
      ],
      sections: [
        {
          type: "header",
          heading: "최신 IT 트렌드",
          subtitle: "기술의 미래를 만나보세요"
        },
        {
          type: "article",
          heading: "AI 기술 발전 현황",
          items: [
            {
              title: "AI 기술 발전 현황",
              summary: "인공지능 기술의 최신 발전 상황과 향후 전망을 살펴봅니다.",
              category: "AI",
              readTime: "7분",
              image: "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=AI"
            }
          ]
        }
      ]
    }
  ];
}
