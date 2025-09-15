import { NextResponse } from 'next/server';
import { getNewsletterServiceUrl } from '@/lib/utils/config';
import { cookies } from 'next/headers';

/**
 * Smart Recommendations API - 개인화/트렌딩 자동 선택
 * 
 * 로그인 사용자: 개인화 추천
 * 비로그인 사용자: 트렌딩 추천
 */
export async function GET(request) {
  try {
    console.log('🧠 Smart Recommendations API 호출');
    
    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const type = searchParams.get('type'); // 'personalized' | 'trending' | 'auto'
    
    console.log('📊 Smart Recommendations API 요청 파라미터:', {
      hasToken: !!accessToken,
      category,
      limit,
      type
    });
    
    // 추천 타입 결정
    let recommendationType = type;
    if (!recommendationType || recommendationType === 'auto') {
      recommendationType = accessToken ? 'personalized' : 'trending';
    }
    
    // 백엔드 Smart Recommendations API 호출
    const backendUrl = getNewsletterServiceUrl('/api/newsletter/smart-recommendations');
    const queryParams = new URLSearchParams({
      type: recommendationType,
      ...(category && { category }),
      limit: limit.toString()
    });
    
    const backendResponse = await fetch(`${backendUrl}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        'Cookie': cookieStore.toString() || ''
      }
    });

    const backendData = await backendResponse.json().catch(() => ({
      success: false,
      error: '백엔드 응답 파싱 실패'
    }));
    
    console.log('📊 백엔드 Smart Recommendations API 응답:', {
      status: backendResponse.status,
      success: backendData.success,
      recommendationType,
      hasToken: !!accessToken
    });

    if (!backendResponse.ok || !backendData.success) {
      // 백엔드 API가 없을 때 fallback 데이터 제공
      console.warn('⚠️ 백엔드 Smart Recommendations API 실패, fallback 데이터 제공');
      
      const fallbackData = await generateFallbackSmartRecommendations({
        hasToken: !!accessToken,
        category,
        limit,
        type: recommendationType
      });
      
      return NextResponse.json({
        success: true,
        data: fallbackData,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: "1.0",
          source: "BFF_SMART_FALLBACK",
          note: "백엔드 API가 없어 fallback 데이터를 제공합니다"
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: backendData.data,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        source: "BFF_SMART",
        recommendationType,
        tokenBased: !!accessToken
      }
    });

  } catch (error) {
    console.error('❌ Smart Recommendations API 오류:', error);
    
    // 에러 발생 시에도 fallback 데이터 제공
    const fallbackData = await generateFallbackSmartRecommendations({
      hasToken: false,
      category: null,
      limit: 10,
      type: 'trending'
    });
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        source: "BFF_SMART_ERROR_FALLBACK",
        error: error.message
      }
    });
  }
}

/**
 * Fallback Smart Recommendations 데이터 생성
 */
async function generateFallbackSmartRecommendations({ hasToken, category, limit, type }) {
  const isPersonalized = hasToken && type === 'personalized';
  const isTrending = !hasToken || type === 'trending';
  
  // 기본 카테고리들
  const categories = category ? [category] : ['정치', '경제', '사회', 'IT/과학', '세계'];
  
  // 추천 뉴스 생성
  const recommendations = Array.from({ length: limit }, (_, i) => {
    const cat = categories[i % categories.length];
    const isHot = Math.random() > 0.7; // 30% 확률로 핫 뉴스
    
    return {
      id: `recommendation_${i + 1}`,
      title: isPersonalized ? 
        `당신을 위한 맞춤 ${cat} 뉴스 ${i + 1}` :
        isTrending ?
        `${cat} 핫 트렌드 뉴스 ${i + 1}` :
        `${cat} 추천 뉴스 ${i + 1}`,
      summary: isPersonalized ?
        `당신의 관심사와 읽기 패턴을 분석한 맞춤 뉴스입니다.` :
        isTrending ?
        `현재 가장 인기 있는 ${cat} 뉴스입니다.` :
        `${cat} 분야의 추천 뉴스입니다.`,
      url: `#recommendation_${i + 1}`,
      publishedAt: new Date(Date.now() - i * 1800000).toISOString(), // 30분 간격
      source: '뉴스피어',
      category: cat,
      imageUrl: null,
      personalized: isPersonalized,
      trending: isTrending,
      hot: isHot,
      score: isPersonalized ? 
        Math.floor(Math.random() * 30) + 70 : // 70-100점
        isTrending ?
        Math.floor(Math.random() * 40) + 60 : // 60-100점
        Math.floor(Math.random() * 50) + 50, // 50-100점
      tags: [
        cat,
        isPersonalized ? '맞춤형' : isTrending ? '트렌딩' : '추천',
        isHot ? '핫' : '일반'
      ]
    };
  });
  
  // 트렌딩 키워드 생성
  const trendingKeywords = Array.from({ length: 8 }, (_, i) => ({
    keyword: isTrending ? `핫키워드${i + 1}` : `추천키워드${i + 1}`,
    count: Math.floor(Math.random() * 1000) + 100,
    category: categories[i % categories.length],
    trend: isTrending ? 'up' : 'stable',
    personalized: isPersonalized
  }));
  
  // AI 추천 섹션 (개인화된 경우만)
  const aiRecommendations = isPersonalized ? {
    status: 'available',
    message: 'AI가 당신의 관심사를 분석했습니다',
    insights: [
      '정치 뉴스에 높은 관심을 보이시네요',
      '경제 관련 뉴스를 자주 읽으시는군요',
      'IT/과학 분야도 관심이 있으시네요'
    ],
    suggestedCategories: ['정치', '경제', 'IT/과학'],
    readingPattern: {
      preferredTime: '오전 7시',
      averageReadTime: '3분',
      favoriteTopics: ['정치', '경제']
    }
  } : null;
  
  return {
    recommendations,
    trendingKeywords,
    aiRecommendations,
    recommendationType: type,
    userAuthenticated: hasToken,
    personalized: isPersonalized,
    message: isPersonalized ? 
      '🧠 AI가 당신을 위한 맞춤 뉴스를 추천합니다' :
      isTrending ?
      '🔥 현재 가장 핫한 트렌드 뉴스를 추천합니다' :
      '📰 추천 뉴스를 제공합니다',
    upgradePrompt: !hasToken ? 
      '🔐 로그인하시면 AI 맞춤 추천을 받아보실 수 있어요!' :
      !isPersonalized ?
      '🧠 AI 개인화 추천을 활성화하시겠어요?' :
      null,
    capabilities: {
      level: isPersonalized ? 'PERSONALIZED' : hasToken ? 'AUTHENTICATED_BASIC' : 'PUBLIC',
      features: isPersonalized ? 
        ['AI 맞춤 추천', '개인화 인사이트', '읽기 패턴 분석'] :
        hasToken ?
        ['기본 추천', '트렌딩 분석', 'AI 추천 준비'] :
        ['트렌딩 뉴스', '인기 키워드', '일반 추천']
    }
  };
}
