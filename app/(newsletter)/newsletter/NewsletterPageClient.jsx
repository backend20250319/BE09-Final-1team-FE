"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { 
  Mail, Clock, Users, Star, TrendingUp, Bell, Zap, Filter, CheckCircle, 
  AlertCircle, ArrowRight, User, RefreshCw, ExternalLink, Calendar,
  Hash, Eye, ChevronDown, ChevronUp
} from "lucide-react"
import { TextWithTooltips } from "@/components/tooltip"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { getUserRole, getUserInfo } from "@/lib/auth"
import Header from "@/components/header"
import { useNewsletters, useUserSubscriptions, useSubscribeNewsletter, useUnsubscribeNewsletter, useCategoryArticles, useCategoryHeadlines } from "@/hooks/useNewsletter"

// 카테고리별 구독자 수를 한 번에 가져오는 커스텀 훅
const useCategorySubscriberCounts = (categories) => {
  const [state, setState] = useState({
    counts: {},
    loading: true,
    hasData: false
  });
  const hasInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // 이미 초기화되었거나 현재 fetch 중이면 중단
    if (hasInitializedRef.current || isFetchingRef.current) {
      return;
    }

    // 카테고리가 없으면 로딩 완료
    if (!categories || categories.length === 0) {
      setState(prev => ({
        ...prev,
        loading: false
      }));
      hasInitializedRef.current = true;
      return;
    }

    const fetchAllCategoryCounts = async () => {
      console.log('🔄 카테고리별 구독자 수 로딩 시작');
      isFetchingRef.current = true;
      
      try {
        // 기본값을 즉시 설정하여 UI 반응성 향상
        const categoryDefaults = {
          "정치": 15420,
          "경제": 8920,
          "사회": 18760,
          "생활": 12340,
          "세계": 11230,
          "IT/과학": 12350,
          "자동차/교통": 9870,
          "여행/음식": 12340,
          "예술": 8760
        };
        
        const initialCounts = {};
        categories.forEach(category => {
          initialCounts[category] = categoryDefaults[category] || 10000;
        });
        
        // 상태를 한 번에 업데이트 (배치화)
        setState(prev => ({
          ...prev,
          counts: initialCounts,
          hasData: true
        }));
        
        // API 호출 (백그라운드에서 실행)
        const response = await fetch('/api/newsletter/stats/subscribers');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const newCounts = { ...initialCounts };
            // API 응답으로 기본값 업데이트
            Object.keys(data.data).forEach(category => {
              if (newCounts[category] !== undefined) {
                newCounts[category] = data.data[category];
              }
            });
            
            // 최종 상태를 한 번에 업데이트
            setState(prev => ({
              ...prev,
              counts: newCounts
            }));
            console.log('✅ 카테고리별 구독자 수 설정 완료:', newCounts);
          } else {
            console.warn("전체 통계 API 응답 오류:", response.status);
          }
        } else {
          console.warn("전체 통계 API 호출 실패:", response.status);
        }
      } catch (error) {
        console.error("카테고리별 구독자 수 로딩 실패:", error);
      } finally {
        console.log('🏁 카테고리별 구독자 수 로딩 완료');
        setState(prev => ({
          ...prev,
          loading: false
        }));
        hasInitializedRef.current = true;
        isFetchingRef.current = false;
      }
    };

    fetchAllCategoryCounts();
  }, [categories]); // categories를 의존성으로 추가

  return { 
    counts: state.counts, 
    loading: state.loading, 
    hasData: state.hasData 
  };
};

// 카테고리별 주제 생성 함수
const generateTopicsForCategory = (category) => {
  const topicsMap = {
    "정치": ["국정감사", "정책발표", "여야갈등", "외교정책", "선거", "국회"],
    "경제": ["주식시장", "부동산", "금리", "환율", "기업실적", "투자"],
    "사회": ["교육", "의료", "환경", "교통", "범죄", "복지"],
    "생활": ["건강", "요리", "패션", "육아", "취미", "라이프스타일"],
    "세계": ["국제정치", "글로벌경제", "외교", "분쟁", "협력", "문화교류"],
    "IT/과학": ["인공지능", "블록체인", "클라우드", "모바일", "연구개발", "스타트업"],
    "자동차/교통": ["전기차", "자율주행", "대중교통", "도로교통", "친환경", "모빌리티", "자동차시장", "교통정책"],
    "여행/음식": ["해외여행", "국내여행", "맛집", "요리", "호텔", "항공", "관광지", "음식문화"],
    "예술": ["영화", "음악", "미술", "문학", "공연", "디자인", "전시회", "문화행사"]
  };
  return topicsMap[category] || ["주요뉴스", "핫이슈", "트렌드", "분석"];
};

// 최근 헤드라인 생성 함수
const generateRecentHeadlines = (category) => {
  const headlinesMap = {
    "정치": [
      { title: "국정감사 시작, 여야 간 주요 쟁점 논의 예정", time: "1시간 전", views: "3.5K" },
      { title: "외교부, 주요국과 양자회담 개최 계획 발표", time: "3시간 전", views: "2.8K" },
      { title: "국회 예산안 심의, 내년도 재정운용 방향 논의", time: "5시간 전", views: "2.1K" },
      { title: "정책발표, 경제 활성화를 위한 새로운 방안 제시", time: "1일 전", views: "4.2K" },
      { title: "선거제도 개편 논의, 정치 개혁안 주요 내용", time: "2일 전", views: "3.1K" }
    ],
    "경제": [
      { title: "주식시장 상승세 지속, 외국인 투자자 순매수 확대", time: "30분 전", views: "5.2K" },
      { title: "부동산 시장 안정화 정책, 새로운 규제 방안 발표", time: "2시간 전", views: "4.8K" },
      { title: "금리 인하 기대감 확산, 중앙은행 정책 방향 주목", time: "4시간 전", views: "3.9K" },
      { title: "환율 변동성 확대, 수출입업계 영향 분석", time: "1일 전", views: "3.2K" },
      { title: "기업실적 발표 시즌, 주요 기업들 실적 전망", time: "2일 전", views: "2.7K" }
    ],
    "사회": [
      { title: "교육정책 개편안 발표, 학생 중심 교육으로 전환", time: "1시간 전", views: "4.1K" },
      { title: "의료진 부족 현상 심화, 의사 수급 대책 마련", time: "3시간 전", views: "3.6K" },
      { title: "환경보호 정책 강화, 탄소중립 목표 달성 방안", time: "5시간 전", views: "2.9K" },
      { title: "교통사고 감소를 위한 새로운 안전정책 시행", time: "1일 전", views: "2.4K" },
      { title: "복지정책 확대, 취약계층 지원 방안 발표", time: "2일 전", views: "3.3K" }
    ],
    "생활": [
      { title: "건강관리 트렌드, 올해 주목할 건강법 5가지", time: "2시간 전", views: "3.8K" },
      { title: "요리 레시피 공유, 집에서 만드는 건강한 한끼", time: "4시간 전", views: "2.5K" },
      { title: "패션 트렌드 리포트, 올해의 인기 스타일 분석", time: "6시간 전", views: "2.1K" },
      { title: "육아 정보, 아이와 함께하는 창의적 놀이법", time: "1일 전", views: "1.9K" },
      { title: "취미 생활 가이드, 새로운 취미로 삶의 질 향상", time: "2일 전", views: "1.7K" }
    ],
    "세계": [
      { title: "국제정치 동향, 주요국 정상회담 결과 분석", time: "1시간 전", views: "4.3K" },
      { title: "글로벌경제 전망, 세계 경제 성장률 예측", time: "3시간 전", views: "3.7K" },
      { title: "외교 관계 변화, 새로운 국제 협력 체계 구축", time: "5시간 전", views: "2.8K" },
      { title: "국제 분쟁 해결 노력, 평화 협상 진행 상황", time: "1일 전", views: "3.4K" },
      { title: "문화교류 확대, 한류의 세계적 영향력 분석", time: "2일 전", views: "2.6K" }
    ],
    "IT/과학": [
      { title: "인공지능 기술 발전, 새로운 AI 모델 출시", time: "30분 전", views: "6.1K" },
      { title: "블록체인 기술 응용, 금융권 디지털 혁신 가속", time: "2시간 전", views: "4.9K" },
      { title: "클라우드 서비스 확대, 기업 디지털 전환 가속화", time: "4시간 전", views: "3.8K" },
      { title: "모바일 기술 혁신, 새로운 스마트폰 기능 소개", time: "1일 전", views: "4.5K" },
      { title: "연구개발 성과, 혁신적 과학기술 발전 현황", time: "2일 전", views: "3.2K" }
    ],
    "자동차/교통": [
      { title: "전기차 시장 급성장, 올해 판매량 전년 대비 150% 증가", time: "2시간 전", views: "2.1K" },
      { title: "자율주행 기술 발전, 도로교통법 개정안 발표", time: "4시간 전", views: "1.8K" },
      { title: "친환경 모빌리티 솔루션, 도시 교통 혁신 가져올까", time: "6시간 전", views: "1.5K" },
      { title: "자동차 반도체 부족 현상, 글로벌 공급망 영향", time: "1일 전", views: "2.3K" },
      { title: "대중교통 개편안 발표, 시민 편의성 대폭 개선", time: "2일 전", views: "1.9K" }
    ],
    "여행/음식": [
      { title: "해외여행 수요 급증, 항공권 예약률 전년 대비 200% 증가", time: "1시간 전", views: "3.2K" },
      { title: "신규 관광지 발굴, 숨겨진 보물 같은 여행지 소개", time: "3시간 전", views: "2.8K" },
      { title: "미식가들이 주목하는 올해의 트렌드 음식", time: "5시간 전", views: "2.1K" },
      { title: "호텔 업계 디지털 전환, AI 기반 맞춤 서비스 도입", time: "1일 전", views: "1.7K" },
      { title: "지역별 특색 음식 문화, 전통과 현대의 조화", time: "2일 전", views: "2.4K" }
    ],
    "예술": [
      { title: "올해의 주목할 예술가, 젊은 작가들의 혁신적 작품", time: "2시간 전", views: "1.9K" },
      { title: "디지털 아트 전시회, 메타버스와 예술의 만남", time: "4시간 전", views: "2.2K" },
      { title: "클래식 음악 페스티벌, 세계적 연주자들의 축제", time: "6시간 전", views: "1.6K" },
      { title: "영화계 신기술 도입, VR/AR 기반 새로운 경험", time: "1일 전", views: "2.8K" },
      { title: "공공미술 프로젝트, 도시를 예술로 물들이다", time: "2일 전", views: "1.4K" }
    ]
  };
  
  return headlinesMap[category] || [
    { title: `${category} 관련 주요 소식이 업데이트되었습니다`, time: "2시간 전", views: "1.2K" },
    { title: `${category} 분야의 새로운 동향과 전망`, time: "5시간 전", views: "856" },
    { title: `${category} 전문가들의 인사이트와 분석`, time: "1일 전", views: "2.1K" },
    { title: `${category} 관련 정책 변화와 영향`, time: "2일 전", views: "1.5K" },
    { title: `${category} 업계의 최신 트렌드 리포트`, time: "3일 전", views: "987" }
  ];
};

const NewsletterPageClient = React.memo(function NewsletterPageClient({ initialNewsletters }) {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)
  const [localSubscriptions, setLocalSubscriptions] = useState(new Set())
  const [expandedCards, setExpandedCards] = useState(new Set()) // 확장된 카드 상태
  const [expandedTopics, setExpandedTopics] = useState(new Set()) // 확장된 주제 섹션 상태

  const [userRole, setUserRole] = useState(null)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  // React Query 훅들
  const { 
    data: newsletters = [], 
    isLoading: newslettersLoading, 
    error: newslettersError,
    refetch: refetchNewsletters 
  } = useNewsletters({
    initialData: initialNewsletters || [],
    staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지 (5분에서 증가)
    refetchOnMount: false, // 마운트 시 자동 refetch 비활성화
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
    refetchInterval: false, // 자동 새로고침 비활성화
  })

  const { 
    data: userSubscriptions = [], 
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions 
  } = useUserSubscriptions({
    enabled: !!userRole,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
  })

  // 카테고리별 기사 데이터 조회 - 실제로 필요한 카테고리만 조회 (백엔드 서버가 없을 때를 대비)
  const allCategories = ["정치", "경제", "사회", "생활", "세계", "IT/과학", "자동차/교통", "여행/음식", "예술"]
  const categories = ["전체", ...allCategories]
  
  // 각 카테고리별 백엔드 데이터 조회 (개별 훅으로 분리)
  const politicsData = useCategoryArticles("정치", 5);
  const economyData = useCategoryArticles("경제", 5);
  const societyData = useCategoryArticles("사회", 5);
  const lifeData = useCategoryArticles("생활", 5);
  const worldData = useCategoryArticles("세계", 5);
  const itScienceData = useCategoryArticles("IT/과학", 5);
  const vehicleData = useCategoryArticles("자동차/교통", 5);
  const travelFoodData = useCategoryArticles("여행/음식", 5);
  const artData = useCategoryArticles("예술", 5);
  
  // 카테고리별 데이터 맵 생성 (메모이제이션)
  const categoryDataMap = useMemo(() => ({
    "정치": politicsData.data,
    "경제": economyData.data,
    "사회": societyData.data,
    "생활": lifeData.data,
    "세계": worldData.data,
    "IT/과학": itScienceData.data,
    "자동차/교통": vehicleData.data,
    "여행/음식": travelFoodData.data,
    "예술": artData.data
  }), [
    politicsData.data,
    economyData.data,
    societyData.data,
    lifeData.data,
    worldData.data,
    itScienceData.data,
    vehicleData.data,
    travelFoodData.data,
    artData.data
  ]);
  
  // 각 카테고리별 트렌딩 키워드 조회 (최적화된 버전)
  const [keywordsState, setKeywordsState] = useState({
    categoryKeywordsMap: {},
    loading: true
  });
  const keywordsFetchedRef = useRef(false);

  // 트렌드 키워드를 한 번에 가져오는 함수
  const fetchAllTrendingKeywords = useCallback(async () => {
    if (keywordsFetchedRef.current) return;
    
    console.log('🔄 모든 카테고리 트렌드 키워드 로딩 시작');
    keywordsFetchedRef.current = true;
    
    try {
      const categories = ["정치", "경제", "사회", "생활", "세계", "IT/과학", "자동차/교통", "여행/음식", "예술"];
      const keywordsMap = {};
      
      // 순차적으로 처리하여 타임아웃 문제 해결
      for (const category of categories) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초로 타임아웃 증가
          
          console.log(`🔄 ${category} 카테고리 트렌드 키워드 조회 시작`);
          
          const response = await fetch(`/api/newsletter/category/trending-keywords?category=${encodeURIComponent(category)}&limit=8`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${category} 카테고리 트렌드 키워드 조회 성공:`, data.data?.length || 0, '개');
            keywordsMap[category] = data.success ? data.data : [];
          } else {
            console.warn(`트렌드 키워드 조회 실패 (${response.status}): ${category}`);
            keywordsMap[category] = [];
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.warn(`트렌드 키워드 조회 타임아웃: ${category}`);
          } else {
            console.error(`트렌드 키워드 조회 오류 (${category}):`, error);
          }
          keywordsMap[category] = [];
        }
        
        // 각 요청 사이에 짧은 지연 추가 (서버 부하 방지)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 상태를 한 번에 업데이트 (배치화)
      setKeywordsState(prev => ({
        ...prev,
        categoryKeywordsMap: keywordsMap,
        loading: false
      }));
      console.log('✅ 모든 카테고리 트렌드 키워드 로딩 완료');
    } catch (error) {
      console.error('트렌드 키워드 로딩 실패:', error);
      setKeywordsState(prev => ({
        ...prev,
        loading: false
      }));
    }
  }, []);

  // 컴포넌트 마운트 시 한 번만 실행 (의존성 배열 제거)
  useEffect(() => {
    fetchAllTrendingKeywords();
  }, []); // 빈 의존성 배열로 변경
  
  // 카테고리별 트렌딩 키워드 맵 추출
  const categoryKeywordsMap = keywordsState.categoryKeywordsMap;
  const keywordsLoading = keywordsState.loading;
  
  // 선택된 카테고리의 데이터 (현재 선택된 카테고리용)
  const selectedCategoryData = selectedCategory === "전체" ? null : categoryDataMap[selectedCategory];
  
  // 선택된 카테고리의 트렌딩 키워드 (현재 선택된 카테고리용)
  const selectedCategoryKeywords = selectedCategory === "전체" ? null : categoryKeywordsMap[selectedCategory];
  
  // 카테고리별 헤드라인 조회 (선택된 카테고리만, "전체"가 아닐 때만)
  const headlinesQuery = useCategoryHeadlines(
    selectedCategory && selectedCategory !== "전체" ? selectedCategory : null, 
    5
  )

  // 카테고리별 구독자 수 조회
  const { counts: categorySubscriberCounts, loading: categoryCountsLoading, hasData: hasSubscriberData } = useCategorySubscriberCounts(allCategories)
  
  // 디버깅용 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('카테고리 구독자 수 상태:', {
      counts: categorySubscriberCounts,
      loading: categoryCountsLoading,
      hasData: hasSubscriberData
    });
  }

  // 뮤테이션 훅들
  const subscribeMutation = useSubscribeNewsletter()
  const unsubscribeMutation = useUnsubscribeNewsletter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    
    const role = getUserRole()
    setUserRole(role)
    setIsClient(true)
    
    return () => clearTimeout(timer)
  }, [])

  // 서버 구독 목록이 업데이트되면 로컬 상태 동기화
  useEffect(() => {
    if (Array.isArray(userSubscriptions)) {
      const serverCategories = new Set();
      
      userSubscriptions.forEach(sub => {
        // preferredCategories 배열 처리 (백엔드에서 이 필드로 카테고리 정보를 제공)
        if (sub.preferredCategories && Array.isArray(sub.preferredCategories)) {
          sub.preferredCategories.forEach(prefCat => {
            // 백엔드 카테고리명을 프론트엔드 카테고리명으로 변환
            const categoryMapping = {
              'POLITICS': '정치',
              'ECONOMY': '경제',
              'SOCIETY': '사회',
              'LIFE': '생활',
              'INTERNATIONAL': '세계',
              'IT_SCIENCE': 'IT/과학',
              'VEHICLE': '자동차/교통',
              'TRAVEL_FOOD': '여행/음식',
              'ART': '예술'
            };
            
            const frontendCategory = categoryMapping[prefCat];
            if (frontendCategory) {
              serverCategories.add(frontendCategory);
            }
          });
        }
      });
      
      console.log('서버 구독 목록 동기화:', Array.from(serverCategories));
      setLocalSubscriptions(serverCategories);
    }
  }, [userSubscriptions]);



  // 카드 확장/축소 토글
  const toggleCardExpansion = (newsletterId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsletterId)) {
        newSet.delete(newsletterId);
      } else {
        newSet.add(newsletterId);
      }
      return newSet;
    });
  };

  // 주제 섹션 확장/축소 토글
  const toggleTopicsExpansion = (newsletterId) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsletterId)) {
        newSet.delete(newsletterId);
      } else {
        newSet.add(newsletterId);
      }
      return newSet;
    });
  };

  // 구독 여부 판단
  const isSubscribedByCategory = (category) => {
    // 로컬 상태에서 먼저 확인
    if (localSubscriptions.has(category)) return true;
    
    // 서버 구독 목록에서 확인
    if (Array.isArray(userSubscriptions)) {
      return userSubscriptions.some(sub => {
        // 카테고리 직접 매칭
        if (sub.category === category) return true;
        
        // preferredCategories 배열에서 확인
        if (sub.preferredCategories && Array.isArray(sub.preferredCategories)) {
          return sub.preferredCategories.some(prefCat => {
            // 백엔드 카테고리명을 프론트엔드 카테고리명으로 변환
            const categoryMapping = {
              'POLITICS': '정치',
              'ECONOMY': '경제',
              'SOCIETY': '사회',
              'LIFE': '생활',
              'INTERNATIONAL': '세계',
              'IT_SCIENCE': 'IT/과학',
              'VEHICLE': '자동차/교통',
              'TRAVEL_FOOD': '여행/음식',
              'ART': '예술'
            };
            const frontendCategory = categoryMapping[prefCat];
            return frontendCategory === category;
          });
        }
        
        return false;
      });
    }
    
    return false;
  };

  // 구독/해제 처리
  const handleToggleSubscribe = async (newsletter, checked) => {
    if (!userRole) {
      toast({
        title: "로그인이 필요합니다",
        description: "뉴스레터를 구독하려면 먼저 로그인해주세요.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo?.email) {
      toast({
        title: "사용자 정보 오류",
        description: "사용자 이메일 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      return;
    }

    if (checked) {
      // 구독 제한 확인 (최대 3개 카테고리)
      const currentSubscriptions = Array.from(localSubscriptions);
      if (currentSubscriptions.length >= 3) {
        toast({
          title: "구독 제한",
          description: "최대 3개 카테고리까지 구독할 수 있습니다. 다른 카테고리 구독을 해제한 후 다시 시도해주세요.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
        return;
      }

      setLocalSubscriptions(prev => new Set([...prev, newsletter.category]));
      
      subscribeMutation.mutate(
        { category: newsletter.category, email: userInfo.email },
        {
          onSuccess: () => {
            // 성공 시 서버에서 최신 구독 정보를 가져옴
            refetchSubscriptions();
            toast({
              title: "구독 완료",
              description: `${newsletter.category} 카테고리를 구독했습니다. (${currentSubscriptions.length + 1}/3)`,
              icon: <CheckCircle className="h-4 w-4 text-green-500" />
            });
          },
          onError: (error) => {
            // 실패 시 로컬 상태에서 제거
            setLocalSubscriptions(prev => {
              const newSet = new Set(prev);
              newSet.delete(newsletter.category);
              return newSet;
            });
            
            // 구독 제한 오류 처리
            if (error.message?.includes('CATEGORY_LIMIT_EXCEEDED')) {
              toast({
                title: "구독 제한",
                description: "최대 3개 카테고리까지 구독할 수 있습니다. 다른 카테고리 구독을 해제한 후 다시 시도해주세요.",
                variant: "destructive",
                icon: <AlertCircle className="h-4 w-4 text-red-500" />
              });
            } else {
              toast({
                title: "구독 실패",
                description: error.message || "구독 처리 중 오류가 발생했습니다.",
                variant: "destructive",
                icon: <AlertCircle className="h-4 w-4 text-red-500" />
              });
            }
          }
        }
      );
    } else {
      // 구독 해제 시 로컬 상태에서 제거
      setLocalSubscriptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(newsletter.category);
        return newSet;
      });
      
      // 해당 카테고리의 구독을 찾아서 해제
      const sub = (userSubscriptions || []).find(s => {
        // preferredCategories 배열에서 확인
        if (s.preferredCategories && Array.isArray(s.preferredCategories)) {
          const categoryMapping = {
            'POLITICS': '정치',
            'ECONOMY': '경제',
            'SOCIETY': '사회',
            'LIFE': '생활',
            'INTERNATIONAL': '세계',
            'IT_SCIENCE': 'IT/과학',
            'VEHICLE': '자동차/교통',
            'TRAVEL_FOOD': '여행/음식',
            'ART': '예술'
          };
          
          return s.preferredCategories.some(prefCat => {
            const frontendCategory = categoryMapping[prefCat];
            return frontendCategory === newsletter.category;
          });
        }
        
        return false;
      });
      
      if (!sub) {
        toast({
          title: "구독 정보 오류",
          description: "해당 카테고리의 구독 정보를 찾을 수 없습니다.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
        return;
      }
      
      unsubscribeMutation.mutate(newsletter.category, {
        onSuccess: () => {
          // 성공 시 로컬 상태에서 즉시 제거하고 서버에서 최신 구독 정보를 가져옴
          setLocalSubscriptions(prev => {
            const newSet = new Set(prev);
            newSet.delete(newsletter.category);
            return newSet;
          });
          refetchSubscriptions();
          toast({
            title: "구독 해제",
            description: `${newsletter.category} 카테고리 구독을 해제했습니다.`,
            icon: <CheckCircle className="h-4 w-4 text-blue-500" />
          });
        },
        onError: (error) => {
          // 실패 시 로컬 상태 복원
          setLocalSubscriptions(prev => new Set([...prev, newsletter.category]));
          toast({
            title: "구독 해제 실패",
            description: error.message || "구독 해제 중 오류가 발생했습니다.",
            variant: "destructive",
            icon: <AlertCircle className="h-4 w-4 text-red-500" />
          });
        }
      });
    }
  };

  // 필터링된 뉴스레터
  const filteredNewsletters = useMemo(() => {
    if (!Array.isArray(newsletters)) return [];
    if (selectedCategory === "전체") return newsletters;
    return newsletters.filter(n => n.category === selectedCategory);
  }, [newsletters, selectedCategory]);

  // 향상된 뉴스레터 데이터 (카테고리별 여러 주제 포함)
  const enhancedNewsletters = useMemo(() => {
    return filteredNewsletters.map(newsletter => ({
      ...newsletter,
      // 카테고리별 여러 주제 생성
      topics: generateTopicsForCategory(newsletter.category),
      // 최근 뉴스 헤드라인 시뮬레이션
      recentHeadlines: generateRecentHeadlines(newsletter.category),
      // 통계 정보 (백엔드 데이터가 없을 때만 기본값 사용)
      stats: {
        totalArticles: 0, // 백엔드 데이터로 덮어쓸 예정
        weeklyGrowth: Math.floor(Math.random() * 15) + 1,
        averageReadTime: Math.floor(Math.random() * 5) + 3
      }
    }));
  }, [filteredNewsletters]);

  // 로딩 상태 메모이제이션
  const isLoading = useMemo(() => {
    return newslettersLoading || (userRole && subscriptionsLoading);
  }, [newslettersLoading, userRole, subscriptionsLoading]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 animate-slide-in">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Mail className="h-8 w-8 mr-3 text-purple-500 animate-pulse-slow" />
                  뉴스레터
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // 선택적으로 필요한 데이터만 새로고침
                    refetchNewsletters()
                    if (userRole) {
                      refetchSubscriptions()
                    }
                  }}
                  disabled={isLoading}
                  className="hover-lift"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  새로고침
                </Button>
              </div>
              <p className="text-gray-600">관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요</p>
            </div>

            {/* Error Display */}
            {(newslettersError || subscriptionsError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">
                    데이터를 불러오는 중 오류가 발생했습니다. 새로고침 버튼을 클릭해주세요.
                  </span>
                </div>
              </div>
            )}

            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">카테고리별 필터:</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category, index) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap hover-lift ${
                      isLoaded ? 'animate-slide-in' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {selectedCategory === "전체"
                  ? `전체 ${enhancedNewsletters.length}개의 뉴스레터`
                  : `${selectedCategory} 카테고리 ${enhancedNewsletters.length}개의 뉴스레터`}
              </div>
            </div>

            {/* Enhanced Newsletter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                // 스켈레톤
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="glass animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                enhancedNewsletters.map((newsletter, index) => {
                  const isSubscribed = isSubscribedByCategory(newsletter.category);
                  const isExpanded = expandedCards.has(newsletter.id);
                  const isTopicsExpanded = expandedTopics.has(newsletter.id);
                  
                  // 카테고리별 구독자 수 조회
                  const categorySubscriberCount = categorySubscriberCounts[newsletter.category] || 0;
                  
                  // 현재 뉴스레터 카테고리의 백엔드 데이터 조회
                  const categoryData = categoryDataMap[newsletter.category];
                  
                  // 실제 기사 데이터가 있으면 사용, 없으면 기본값 사용
                  const articles = categoryData?.articles || [];
                  
                  // 현재 뉴스레터 카테고리의 트렌딩 키워드 조회
                  const trendingKeywordsData = categoryKeywordsMap[newsletter.category];
                  
                  // 헤드라인 데이터 조회 (선택된 카테고리와 일치할 때만)
                  const isCurrentCategorySelected = selectedCategory === newsletter.category || selectedCategory === "전체";
                  const headlinesData = isCurrentCategorySelected && headlinesQuery?.data ? headlinesQuery.data : null;
                  const isHeadlinesLoading = isCurrentCategorySelected && headlinesQuery?.isLoading || false;
                  
                  // 헤드라인 데이터 디버깅 (개발 환경에서만, 선택된 카테고리만)
                  if (process.env.NODE_ENV === 'development' && selectedCategory === newsletter.category) {
                    console.log(`🔍 헤드라인 데이터 (${newsletter.category}):`, {
                      data: headlinesData?.length || 0,
                      isLoading: isHeadlinesLoading,
                      isSuccess: headlinesQuery?.isSuccess,
                      isError: headlinesQuery?.isError,
                      selectedCategory,
                      isCurrentCategorySelected
                    });
                  }
                  
                  // 백엔드에서 트렌드 키워드를 우선 사용, 없으면 기본값 사용
                  const mainTopics = (trendingKeywordsData && trendingKeywordsData.length > 0) 
                    ? trendingKeywordsData.map(item => item.keyword) 
                    : (categoryData?.trendingKeywords && categoryData.trendingKeywords.length > 0)
                    ? categoryData.trendingKeywords
                    : (categoryData?.mainTopics && categoryData.mainTopics.length > 0)
                    ? categoryData.mainTopics
                    : generateTopicsForCategory(newsletter.category);
                  
                  // 디버깅용 로그 (개발 환경에서만, 선택된 카테고리만)
                  if (process.env.NODE_ENV === 'development' && selectedCategory === newsletter.category) {
                    console.log(`