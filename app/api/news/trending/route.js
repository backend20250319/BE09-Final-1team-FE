import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('🔄 트렌딩 뉴스 데이터 조회 시작');
    
    const { searchParams } = new URL(request.url);
    const hours = searchParams.get('hours') || '24';
    const limit = searchParams.get('limit') || '1';
    
    // 백엔드 API 호출
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/news/trending?hours=${hours}&limit=${limit}`;
    console.log('🔄 백엔드 트렌딩 API 호출:', {
      url: backendUrl,
      hours,
      limit
    });

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 백엔드 트렌딩 API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 트렌딩 API 실패:', { 
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
    console.log('📡 백엔드 트렌딩 응답:', data);
    
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

    console.log('✅ 트렌딩 뉴스 조회 성공:', { 
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
      content: newsItems,
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
    console.error('❌ 트렌딩 뉴스 조회 실패:', error);
    
    // 네트워크 오류나 기타 예외 상황
    if (error.code === 'ECONNREFUSED') {
      console.log('🔄 백엔드 서버 연결 실패 - 빈 트렌딩 뉴스 목록 반환 (fallback)');
      return NextResponse.json({
        success: true,
        content: [],
        totalElements: 0,
        totalPages: 1,
        number: 0,
        size: 0,
        metadata: {
          total: 0,
          timestamp: new Date().toISOString(),
          fallback: true,
          message: '백엔드 서버에 연결할 수 없습니다.'
        }
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '트렌딩 뉴스 조회 중 오류가 발생했습니다.',
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
