import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('🔄 뉴스 데이터 조회 시작');
    
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '21';
    const category = searchParams.get('category');
    
    // 백엔드 API 호출
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/news?page=${page}&size=${size}${category ? `&category=${category}` : ''}`;
    console.log('🔄 백엔드 API 호출:', {
      url: backendUrl,
      page,
      size,
      category
    });

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 백엔드 API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 뉴스 API 실패:', { 
        status: response.status, 
        statusText: response.statusText,
        errorText,
        url: backendUrl
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorText || `백엔드 API 오류 (${response.status})`,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('📡 백엔드 응답:', data);
    
    // HTML 태그를 제거하는 함수
    const stripHtmlTags = (html) => {
      if (!html) return ''
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    }

    // 뉴스 요약을 생성하는 함수
    const getNewsDescription = (news) => {
      if (news.summary) {
        return stripHtmlTags(news.summary)
      }
      if (news.content) {
        const cleanContent = stripHtmlTags(news.content)
        return cleanContent.length > 150 ? cleanContent.substring(0, 150) + '...' : cleanContent
      }
      return '뉴스 내용을 불러오는 중입니다.'
    }

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const newsItems = data.content?.map(news => ({
      newsId: news.newsId,
      id: news.newsId,
      title: news.title,
      content: news.content,
      summary: news.summary,
      categoryName: news.categoryName,
      category: news.categoryName,
      categoryKo: getCategoryKoreanName(news.categoryName),
      press: news.press,
      source: news.press,
      url: news.link,
      imageUrl: news.imageUrl,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
      reporterName: news.reporterName,
      viewCount: news.viewCount,
      views: news.viewCount || 0,
      // 기존 호환성을 위한 필드들
      description: getNewsDescription(news),
      author: news.reporterName || news.press,
      // 백엔드 원본 데이터 보존
      _backendData: news
    })) || [];

    console.log('✅ 뉴스 조회 성공:', { 
      count: newsItems.length,
      news: newsItems.map(news => ({
        id: news.id,
        title: news.title,
        category: news.categoryKo,
        source: news.source
      }))
    });

    return NextResponse.json({
      success: true,
      data: newsItems, // 프론트엔드에서 기대하는 'data' 필드로 변경
      content: newsItems, // 기존 호환성 유지
      totalElements: data.totalElements || newsItems.length,
      totalPages: data.totalPages || 1,
      number: data.number || 0,
      size: data.size || newsItems.length,
      metadata: {
        total: data.totalElements || newsItems.length,
        page: data.number || 0,
        size: data.size || newsItems.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 뉴스 조회 실패:', error);
    
    // 네트워크 오류나 기타 예외 상황
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch')) {
      console.log('🔄 백엔드 서버 연결 실패 - 폴백 뉴스 데이터 반환');
      
      // 폴백 뉴스 데이터
      const fallbackNews = [
        {
          newsId: 'fallback-1',
          id: 'fallback-1',
          title: 'AI 기술 발전으로 인한 일자리 변화 전망',
          content: '인공지능 기술의 급속한 발전으로 인해 다양한 산업 분야에서 일자리 구조가 변화하고 있습니다. 전문가들은 새로운 기술에 적응할 수 있는 인재 양성이 중요하다고 강조합니다.',
          summary: 'AI 기술 발전으로 일자리 구조 변화, 새로운 기술 적응 인재 양성 중요',
          categoryName: 'IT_SCIENCE',
          category: 'IT_SCIENCE',
          categoryKo: 'IT/과학',
          press: '테크뉴스',
          source: '테크뉴스',
          url: '#',
          imageUrl: '/placeholder.svg',
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          reporterName: '기자',
          viewCount: 1250,
          views: 1250,
          description: 'AI 기술 발전으로 일자리 구조 변화, 새로운 기술 적응 인재 양성 중요',
          author: '기자',
          _backendData: { fallback: true }
        },
        {
          newsId: 'fallback-2',
          id: 'fallback-2',
          title: '경제 성장률 전망과 정책 방향',
          content: '올해 경제 성장률 전망이 발표되었으며, 정부는 지속 가능한 성장을 위한 정책 방향을 제시했습니다. 소비자 물가 안정과 고용 창출에 중점을 두고 있습니다.',
          summary: '경제 성장률 전망 발표, 지속 가능한 성장 정책 방향 제시',
          categoryName: 'ECONOMY',
          category: 'ECONOMY',
          categoryKo: '경제',
          press: '경제일보',
          source: '경제일보',
          url: '#',
          imageUrl: '/placeholder.svg',
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          reporterName: '기자',
          viewCount: 980,
          views: 980,
          description: '경제 성장률 전망 발표, 지속 가능한 성장 정책 방향 제시',
          author: '기자',
          _backendData: { fallback: true }
        },
        {
          newsId: 'fallback-3',
          id: 'fallback-3',
          title: '환경 보호를 위한 새로운 정책 발표',
          content: '정부가 환경 보호를 위한 새로운 정책을 발표했습니다. 탄소 중립 목표 달성을 위한 구체적인 방안들이 포함되어 있으며, 기업과 시민들의 참여가 중요하다고 강조했습니다.',
          summary: '환경 보호 새 정책 발표, 탄소 중립 목표 달성 방안 포함',
          categoryName: 'SOCIETY',
          category: 'SOCIETY',
          categoryKo: '사회',
          press: '환경뉴스',
          source: '환경뉴스',
          url: '#',
          imageUrl: '/placeholder.svg',
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          reporterName: '기자',
          viewCount: 756,
          views: 756,
          description: '환경 보호 새 정책 발표, 탄소 중립 목표 달성 방안 포함',
          author: '기자',
          _backendData: { fallback: true }
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: fallbackNews,
        content: fallbackNews,
        totalElements: fallbackNews.length,
        totalPages: 1,
        number: 0,
        size: fallbackNews.length,
        metadata: {
          total: fallbackNews.length,
          page: 0,
          size: fallbackNews.length,
          timestamp: new Date().toISOString(),
          fallback: true,
          message: '백엔드 서버에 연결할 수 없어 샘플 뉴스를 표시합니다.'
        }
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '뉴스 조회 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// 백엔드 카테고리명을 한국어로 변환하는 함수
function getCategoryKoreanName(categoryName) {
  const categoryMapping = {
    'POLITICS': '정치',
    'ECONOMY': '경제',
    'SOCIETY': '사회',
    'LIFE': '생활',
    'INTERNATIONAL': '세계',
    'IT_SCIENCE': 'IT/과학',
    'VEHICLE': '자동차/교통',
    'TRAVEL_FOOD': '여행/음식',
    'ART': '예술',
  };
  
  return categoryMapping[categoryName] || categoryName;
}
