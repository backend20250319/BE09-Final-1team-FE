import { NextResponse } from 'next/server';
import { getNewsletterServiceUrl } from '@/lib/utils/config';
import { cookies } from 'next/headers';

/**
 * Enhanced Newsletter API - 로그인 상태별 자동 차별화
 * 
 * 서비스 레벨:
 * - PUBLIC: 비로그인 사용자 (기본 뉴스 + 로그인 유도)
 * - AUTHENTICATED_BASIC: 로그인 사용자 (확장 뉴스 + 구독 유도)
 * - PERSONALIZED: 구독자 (완전 개인화 + AI 추천)
 */
export async function GET(request) {
  try {
    console.log('🔍 Enhanced Newsletter API 호출');
    
    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 5;
    const headlinesPerCategory = parseInt(searchParams.get('headlinesPerCategory')) || 5;
    const trendingKeywordsLimit = parseInt(searchParams.get('trendingKeywordsLimit')) || 8;
    
    console.log('📊 Enhanced API 요청 파라미터:', {
      hasToken: !!accessToken,
      category,
      limit,
      headlinesPerCategory,
      trendingKeywordsLimit
    });
    
    // 백엔드 Enhanced API 호출
    const backendUrl = getNewsletterServiceUrl('/api/newsletter/enhanced');
    const queryParams = new URLSearchParams({
      ...(category && { category }),
      limit: limit.toString(),
      headlinesPerCategory: headlinesPerCategory.toString(),
      trendingKeywordsLimit: trendingKeywordsLimit.toString()
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
    
    console.log('📊 백엔드 Enhanced API 응답:', {
      status: backendResponse.status,
      success: backendData.success,
      serviceLevel: backendData.data?.serviceLevel,
      userAuthenticated: backendData.data?.userAuthenticated
    });

    if (!backendResponse.ok || !backendData.success) {
      // 백엔드 API가 없을 때 fallback 데이터 제공
      console.warn('⚠️ 백엔드 Enhanced API 실패, fallback 데이터 제공');
      
      const fallbackData = await generateFallbackEnhancedData({
        hasToken: !!accessToken,
        category,
        limit,
        headlinesPerCategory,
        trendingKeywordsLimit
      });
      
      return NextResponse.json({
        success: true,
        data: fallbackData,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: "1.0",
          source: "BFF_FALLBACK",
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
        source: "BFF"
      }
    });

  } catch (error) {
    console.error('❌ Enhanced Newsletter API 오류:', error);
    
    // 에러 발생 시에도 fallback 데이터 제공
    const fallbackData = await generateFallbackEnhancedData({
      hasToken: false,
      category: null,
      limit: 5,
      headlinesPerCategory: 5,
      trendingKeywordsLimit: 8
    });
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        source: "BFF_ERROR_FALLBACK",
        error: error.message
      }
    });
  }
}

/**
 * Fallback Enhanced 데이터 생성
 */
async function generateFallbackEnhancedData({ hasToken, category, limit, headlinesPerCategory, trendingKeywordsLimit }) {
  // 서비스 레벨 결정
  let serviceLevel = 'PUBLIC';
  let userAuthenticated = false;
  let message = '📰 일반 뉴스를 제공합니다';
  let upgradePrompt = '🔐 로그인하시면 관심사 기반 맞춤 뉴스를 받아보실 수 있어요!';
  
  if (hasToken) {
    serviceLevel = 'AUTHENTICATED_BASIC';
    userAuthenticated = true;
    message = '🔐 로그인하셨습니다. 카테고리를 구독하면 맞춤 뉴스를 받아보실 수 있어요!';
    upgradePrompt = '🎯 관심 카테고리를 구독하면 맞춤 뉴스를 받아보실 수 있어요!';
  }
  
  // 기본 카테고리들
  const categories = category ? [category] : ['정치', '경제', '사회', 'IT/과학', '세계'];
  
  // 카테고리별 뉴스 생성
  const categoriesData = {};
  categories.forEach(cat => {
    const newsCount = serviceLevel === 'PUBLIC' ? 5 : serviceLevel === 'AUTHENTICATED_BASIC' ? 7 : 10;
    
    categoriesData[cat] = {
      category: cat,
      articles: Array.from({ length: newsCount }, (_, i) => ({
        id: `${cat}_${i + 1}`,
        title: `${cat} 관련 주요 뉴스 ${i + 1}`,
        summary: `${cat} 분야의 중요한 소식입니다.`,
        url: `#${cat}_${i + 1}`,
        publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
        source: '뉴스피어',
        imageUrl: null
      })),
      headlines: Array.from({ length: headlinesPerCategory }, (_, i) => ({
        id: `headline_${cat}_${i + 1}`,
        title: `${cat} 헤드라인 ${i + 1}`,
        time: `${i + 1}시간 전`,
        views: `${Math.floor(Math.random() * 5000) + 1000}`
      }))
    };
  });
  
  // 트렌딩 키워드 생성
  const trendingKeywords = Array.from({ length: trendingKeywordsLimit }, (_, i) => ({
    keyword: `트렌딩키워드${i + 1}`,
    count: Math.floor(Math.random() * 1000) + 100,
    category: categories[i % categories.length]
  }));
  
  return {
    serviceLevel,
    userAuthenticated,
    message,
    upgradePrompt,
    capabilities: {
      level: serviceLevel,
      features: serviceLevel === 'PUBLIC' ? 
        ['기본 뉴스', '트렌딩 키워드', '인기 카테고리'] :
        serviceLevel === 'AUTHENTICATED_BASIC' ?
        ['확장 뉴스', '구독 관리', '개인화 준비'] :
        ['완전 개인화', 'AI 추천', '맞춤 통계'],
      limitations: serviceLevel === 'PUBLIC' ? 
        ['제한된 뉴스 수', '개인화 없음', '구독 관리 불가'] :
        serviceLevel === 'AUTHENTICATED_BASIC' ?
        ['제한된 개인화', 'AI 추천 없음'] :
        []
    },
    categories: categoriesData,
    trendingKeywords,
    subscriptionBenefits: serviceLevel === 'AUTHENTICATED_BASIC' ? [
      '관심 카테고리 맞춤 뉴스',
      'AI 개인화 추천', 
      '최적 발송 시간 설정',
      '읽기 기록 관리'
    ] : null,
    aiRecommendations: serviceLevel === 'PERSONALIZED' ? {
      status: 'available',
      message: 'AI 맞춤 추천 기능이 준비되어 있습니다'
    } : null
  };
}
