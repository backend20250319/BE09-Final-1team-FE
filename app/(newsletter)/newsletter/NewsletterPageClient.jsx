"use client"

import { useState, useEffect, useMemo, useRef } from "react"
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

import { useNewsletters, useUserSubscriptions, useSubscribeNewsletter, useUnsubscribeNewsletter, useCategoryArticles, useTrendingKeywords, useCategoryHeadlines } from "@/hooks/useNewsletter"
import { useQuery } from '@tanstack/react-query'
import KakaoShare from '@/components/KakaoShare'

// 카테고리별 구독자 수를 한 번에 가져오는 커스텀 훅
const useCategorySubscriberCounts = (categories) => {
  const { data: counts = {}, isLoading: loading } = useQuery({
    queryKey: ['newsletter-stats-subscribers'],
    queryFn: async () => {
      console.log('🔄 카테고리별 구독자 수 로딩 시작');
      
      const response = await fetch('/api/newsletter/stats/subscribers');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API 응답 데이터:', data);
        
        if (data.success && data.data) {
          console.log('✅ 카테고리별 구독자 수 설정 완료:', data.data);
          return data.data;
        } else {
          console.warn("전체 통계 API 응답 구조 오류:", data);
          return {};
        }
      } else {
        console.warn("전체 통계 API 호출 실패:", response.status);
        return {};
      }
    },
    staleTime: 30 * 1000, // 30초간 fresh 상태 유지
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    retryDelay: 1000,
  });

  return { counts, loading };
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
      { title: "국회 예산안 심의 시작, 주요 정책 쟁점 논의", time: "1시간 전", views: "3.2K" },
      { title: "외교부, 주요국과 정상회담 준비 착수", time: "3시간 전", views: "2.8K" },
      { title: "정치개혁법안 발의, 여야 간 견해차 좁혀지지 않아", time: "5시간 전", views: "2.1K" },
      { title: "지방선거 준비 본격화, 주요 정당 공약 발표", time: "1일 전", views: "4.5K" },
      { title: "정부 정책 평가 보고서 발표, 경제 정책 효과 분석", time: "2일 전", views: "3.1K" }
    ],
    "경제": [
      { title: "한국은행 기준금리 동결 결정, 인플레이션 우려 지속", time: "2시간 전", views: "4.1K" },
      { title: "주요 기업 실적 발표, 반도체 업계 회복세 뚜렷", time: "4시간 전", views: "3.8K" },
      { title: "부동산 시장 안정화 정책 발표, 시장 반응 주목", time: "6시간 전", views: "3.2K" },
      { title: "글로벌 경제 불확실성 증가, 한국 경제 영향 분석", time: "1일 전", views: "2.9K" },
      { title: "신성장 산업 투자 확대, 정부 지원책 발표", time: "2일 전", views: "2.4K" }
    ],
    "사회": [
      { title: "사회적 거리두기 완화, 일상 회복 조짐 뚜렷", time: "1시간 전", views: "5.2K" },
      { title: "교육 정책 개편안 발표, 학생 부담 경감 방안", time: "3시간 전", views: "4.1K" },
      { title: "의료진 부족 현상 심화, 정부 대책 마련", time: "5시간 전", views: "3.8K" },
      { title: "환경 보호 정책 강화, 탄소중립 목표 달성 노력", time: "1일 전", views: "3.5K" },
      { title: "사회 안전망 확충, 취약계층 지원 강화", time: "2일 전", views: "2.9K" }
    ],
    "생활": [
      { title: "일상생활 편의성 증대, 스마트홈 기술 보급 확산", time: "2시간 전", views: "3.1K" },
      { title: "건강관리 트렌드, 웨어러블 디바이스 활용 증가", time: "4시간 전", views: "2.7K" },
      { title: "취미생활 변화, 온라인 클래스 수요 급증", time: "6시간 전", views: "2.3K" },
      { title: "가족 여가 문화, 홈 엔터테인먼트 시장 성장", time: "1일 전", views: "1.9K" },
      { title: "일상 스트레스 해소법, 마음건강 관리 중요성", time: "2일 전", views: "2.5K" }
    ],
    "세계": [
      { title: "글로벌 경제 불확실성, 주요국 정책 대응 분석", time: "1시간 전", views: "4.8K" },
      { title: "국제 관계 변화, 새로운 세계 질서 형성", time: "3시간 전", views: "4.2K" },
      { title: "기후변화 대응, 글로벌 협력 강화", time: "5시간 전", views: "3.5K" },
      { title: "국제 분쟁 해결, 평화 협상 진행 상황", time: "1일 전", views: "3.1K" },
      { title: "세계 문화 교류, 글로벌 문화 축제 개최", time: "2일 전", views: "2.8K" }
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
    ],
    "IT/과학": [
      { title: "AI 기술 혁신, 챗GPT-5 출시 임박", time: "1시간 전", views: "4.2K" },
      { title: "반도체 업계 회복세, 삼성전자 실적 전망 긍정적", time: "3시간 전", views: "3.8K" },
      { title: "메타버스 기술 발전, 가상현실 생태계 확장", time: "5시간 전", views: "2.9K" },
      { title: "양자컴퓨팅 연구 성과, 암호화 기술 혁신 가져올까", time: "1일 전", views: "2.1K" },
      { title: "바이오테크 스타트업 투자 열풍, 신약 개발 가속화", time: "2일 전", views: "1.8K" }
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

export default function NewsletterPageClient({ initialNewsletters }) {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)
  const [localSubscriptions, setLocalSubscriptions] = useState(new Set())
  const [expandedCards, setExpandedCards] = useState(new Set()) // 확장된 카드 상태
  const [expandedTopics, setExpandedTopics] = useState(new Set()) // 확장된 주제 섹션 상태

  const [userRole, setUserRole] = useState(null)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()
  
  // 이전 userSubscriptions를 추적하기 위한 ref
  const prevUserSubscriptionsRef = useRef(null)

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

  // 디버깅: 뉴스레터 목록 로깅
  console.log('📰 뉴스레터 목록:', {
    newsletters: newsletters,
    length: newsletters.length,
    ids: newsletters.map(n => n.id),
    uniqueIds: [...new Set(newsletters.map(n => n.id))],
    hasDuplicates: newsletters.length !== [...new Set(newsletters.map(n => n.id))].length
  });

  const { 
    data: userSubscriptions = [], 
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions 
  } = useUserSubscriptions({
    enabled: !!userRole && isClient, // 사용자 역할이 있고 클라이언트에서만 활성화
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
  })

  // 디버깅: userSubscriptions 상태 로깅
  console.log('🔍 userSubscriptions 상태:', {
    data: userSubscriptions,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    userRole: userRole,
    enabled: !!userRole || typeof window !== 'undefined',
    isArray: Array.isArray(userSubscriptions),
    length: Array.isArray(userSubscriptions) ? userSubscriptions.length : 'N/A',
    enabledCondition: !!userRole || typeof window !== 'undefined'
  });

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
  
  // 카테고리별 데이터 맵 생성
  const categoryDataMap = {
    "정치": politicsData.data,
    "경제": economyData.data,
    "사회": societyData.data,
    "생활": lifeData.data,
    "세계": worldData.data,
    "IT/과학": itScienceData.data,
    "자동차/교통": vehicleData.data,
    "여행/음식": travelFoodData.data,
    "예술": artData.data
  };
  
  // 각 카테고리별 트렌딩 키워드 조회 (개별 훅으로 분리)
  const politicsKeywords = useTrendingKeywords("정치", 8);
  const economyKeywords = useTrendingKeywords("경제", 8);
  const societyKeywords = useTrendingKeywords("사회", 8);
  const lifeKeywords = useTrendingKeywords("생활", 8);
  const worldKeywords = useTrendingKeywords("세계", 8);
  const itScienceKeywords = useTrendingKeywords("IT/과학", 8);
  const vehicleKeywords = useTrendingKeywords("자동차/교통", 8);
  const travelFoodKeywords = useTrendingKeywords("여행/음식", 8);
  const artKeywords = useTrendingKeywords("예술", 8);
  
  // 카테고리별 트렌딩 키워드 맵 생성
  const categoryKeywordsMap = {
    "정치": politicsKeywords.data,
    "경제": economyKeywords.data,
    "사회": societyKeywords.data,
    "생활": lifeKeywords.data,
    "세계": worldKeywords.data,
    "IT/과학": itScienceKeywords.data,
    "자동차/교통": vehicleKeywords.data,
    "여행/음식": travelFoodKeywords.data,
    "예술": artKeywords.data
  };
  
  // 선택된 카테고리의 데이터 (현재 선택된 카테고리용)
  const selectedCategoryData = selectedCategory === "전체" ? null : categoryDataMap[selectedCategory];
  
  // 선택된 카테고리의 트렌딩 키워드 (현재 선택된 카테고리용)
  const selectedCategoryKeywords = selectedCategory === "전체" ? null : categoryKeywordsMap[selectedCategory];
  
  // 카테고리별 헤드라인 조회 (선택된 카테고리만)
  const headlinesQuery = useCategoryHeadlines(selectedCategory === "전체" ? null : selectedCategory, 5)

  // 카테고리별 구독자 수 조회
  const { counts: categorySubscriberCounts, loading: categoryCountsLoading } = useCategorySubscriberCounts(allCategories)
  
  // 디버깅용 로그
  console.log('카테고리 구독자 수 상태:', {
    counts: categorySubscriberCounts,
    loading: categoryCountsLoading,
    hasData: Object.keys(categorySubscriberCounts).length > 0
  });

  // 뮤테이션 훅들
  const subscribeMutation = useSubscribeNewsletter()
  const unsubscribeMutation = useUnsubscribeNewsletter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    
    let role = getUserRole()
    console.log('🔍 getUserRole() 결과:', role)
    
    // 개발 환경에서 역할이 없으면 기본값 설정
    if (!role && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      role = 'USER'
      console.log('🔧 개발 환경에서 기본 역할 설정:', role)
    }
    
    setUserRole(role)
    setIsClient(true)
    
    return () => clearTimeout(timer)
  }, [])

  // 사용자 역할이 설정되면 구독 정보 새로고침
  useEffect(() => {
    if (userRole && isClient && refetchSubscriptions) {
      console.log('🔄 사용자 역할 설정됨, 구독 정보 새로고침 시작');
      refetchSubscriptions();
    }
  }, [userRole, isClient, refetchSubscriptions]);

  // 서버 구독 목록이 업데이트되면 로컬 상태 동기화
  useEffect(() => {
    if (Array.isArray(userSubscriptions) && !subscriptionsLoading) {
      // 이전 데이터와 비교하여 실제 변경사항이 있는지 확인
      const prevData = prevUserSubscriptionsRef.current;
      const currentData = JSON.stringify(userSubscriptions);
      
      if (prevData === currentData) {
        console.log('🔄 서버 구독 목록 동기화: 데이터 변경 없음 (스킵)');
        return;
      }
      
      // 현재 데이터를 ref에 저장
      prevUserSubscriptionsRef.current = currentData;
      
      const serverCategories = new Set();
      
      userSubscriptions.forEach(sub => {
        console.log('📋 구독 정보 처리:', sub);
        
        // 매핑된 구독 데이터에서 카테고리 추출
        if (sub.category) {
          serverCategories.add(sub.category);
          console.log(`✅ ${sub.category} 추가됨 (직접 매핑)`);
        }
        
        // 백엔드 원본 데이터에서 preferredCategories 처리 (fallback)
        if (sub._backendData && sub._backendData.preferredCategories && Array.isArray(sub._backendData.preferredCategories)) {
          console.log('📋 백엔드 preferredCategories:', sub._backendData.preferredCategories);
          
          sub._backendData.preferredCategories.forEach(prefCat => {
            console.log('🔍 카테고리 매핑 중:', prefCat);
            
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
            console.log(`🔍 매핑 결과: ${prefCat} -> ${frontendCategory}`);
            
            if (frontendCategory) {
              serverCategories.add(frontendCategory);
              console.log(`✅ ${frontendCategory} 추가됨 (백엔드 매핑)`);
            } else {
              console.log(`❌ 매핑 실패: ${prefCat}`);
            }
          });
        }
      });
      
      // 현재 로컬 상태와 서버 상태를 비교하여 변경사항이 있을 때만 업데이트
      const currentCategories = Array.from(localSubscriptions).sort();
      const newCategories = Array.from(serverCategories).sort();
      
      const hasChanged = currentCategories.length !== newCategories.length || 
                        currentCategories.some((cat, index) => cat !== newCategories[index]);
      
      if (hasChanged) {
        console.log('🔄 서버 구독 목록 동기화:', {
          userSubscriptions: userSubscriptions,
          serverCategories: Array.from(serverCategories),
          currentLocalSubscriptions: Array.from(localSubscriptions),
          serverCategoriesSize: serverCategories.size,
          hasChanged: hasChanged
        });
        
        // 로컬 상태 업데이트
        setLocalSubscriptions(serverCategories);
        
        // 업데이트 후 상태 확인
        setTimeout(() => {
          console.log('✅ 로컬 상태 업데이트 완료:', Array.from(serverCategories));
        }, 100);
      } else {
        console.log('🔄 서버 구독 목록 동기화: 변경사항 없음');
      }
    }
  }, [userSubscriptions, subscriptionsLoading]);



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
    // 서버 구독 목록에서 먼저 확인 (더 정확함)
    if (Array.isArray(userSubscriptions)) {
      const isSubscribed = userSubscriptions.some(sub => {
        // 매핑된 카테고리 직접 매칭
        if (sub.category === category) {
          console.log(`✅ ${category}: 서버 구독에서 직접 매칭`);
          return true;
        }
        
        // 백엔드 원본 데이터에서 preferredCategories 확인 (fallback)
        if (sub._backendData && sub._backendData.preferredCategories && Array.isArray(sub._backendData.preferredCategories)) {
          return sub._backendData.preferredCategories.some(prefCat => {
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
            if (frontendCategory === category) {
              console.log(`✅ ${category}: 서버 구독에서 preferredCategories 매칭 (${prefCat} -> ${frontendCategory})`);
              return true;
            }
            return false;
          });
        }
        
        return false;
      });
      
      if (isSubscribed) {
        return true;
      }
    }
    
    // 로컬 상태에서 확인 (서버 상태가 없을 때 fallback)
    if (localSubscriptions.has(category)) {
      console.log(`✅ ${category}: 로컬 상태에서 구독 중 (서버 상태 없음)`);
      return true;
    }
    
    console.log(`❌ ${category}: 구독하지 않음`);
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

    // 서버에서 최신 구독 상태를 먼저 확인
    const isCurrentlySubscribed = isSubscribedByCategory(newsletter.category);
    
    if (checked) {
      // 이미 구독 중인 카테고리인지 확인 (서버 상태 기준)
      if (isCurrentlySubscribed) {
        toast({
          title: "이미 구독 중",
          description: `${newsletter.category} 카테고리는 이미 구독 중입니다.`,
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
        return;
      }
      
      // 구독 제한 확인 (최대 3개 카테고리)
      const currentSubscriptions = Array.from(localSubscriptions);
      
      // 3개 제한 확인
      if (currentSubscriptions.length >= 3) {
        toast({
          title: "구독 제한",
          description: "최대 3개 카테고리까지 구독할 수 있습니다. 다른 카테고리 구독을 해제한 후 다시 시도해주세요.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
        return;
      }

      // 로컬 상태 업데이트 (낙관적 업데이트)
      setLocalSubscriptions(prev => new Set([...prev, newsletter.category]));
      
      subscribeMutation.mutate(
        { category: newsletter.category, email: userInfo.email },
        {
          onSuccess: () => {
            // 성공 시 서버에서 최신 구독 정보를 가져옴
            refetchSubscriptions();
            
            // 구독자 통계 즉시 업데이트
            const queryClient = subscribeMutation.queryClient;
            if (queryClient) {
              queryClient.setQueryData(['newsletter-stats-subscribers'], (oldData) => {
                if (oldData && typeof oldData === 'object') {
                  const newData = { ...oldData };
                  // 새로 구독한 카테고리 +1
                  newData[newsletter.category] = (newData[newsletter.category] || 0) + 1;
                  return newData;
                }
                return oldData;
              });
            }
            
            toast({
              title: "구독 완료",
              description: `${newsletter.category} 카테고리를 구독했습니다. (${Array.from(localSubscriptions).length}/3)`,
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
      
      // 구독 해제 시 카테고리명을 직접 전달
      unsubscribeMutation.mutate(newsletter.category, {
        onSuccess: () => {
          // 성공 시 로컬 상태에서 즉시 제거하고 서버에서 최신 구독 정보를 가져옴
          setLocalSubscriptions(prev => {
            const newSet = new Set(prev);
            newSet.delete(newsletter.category);
            return newSet;
          });
          refetchSubscriptions();
          
          // 구독자 통계 즉시 업데이트
          const queryClient = unsubscribeMutation.queryClient;
          if (queryClient) {
            queryClient.setQueryData(['newsletter-stats-subscribers'], (oldData) => {
              if (oldData && typeof oldData === 'object') {
                const newData = { ...oldData };
                newData[newsletter.category] = Math.max(0, (newData[newsletter.category] || 0) - 1);
                return newData;
              }
              return oldData;
            });
          }
          
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
                  
                  // 헤드라인 데이터 디버깅 (개발 환경에서만)
                  if (process.env.NODE_ENV === 'development') {
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
                  
                  // 디버깅용 로그 (개발 환경에서만)
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`🔍 주요 주제 데이터 (${newsletter.category}):`, {
                      trendingKeywordsData: trendingKeywordsData?.length || 0,
                      categoryDataTrendingKeywords: categoryData?.trendingKeywords?.length || 0,
                      categoryDataMainTopics: categoryData?.mainTopics?.length || 0,
                      finalMainTopics: mainTopics?.length || 0,
                      mainTopics: mainTopics
                    });
                  }
                  
                  const totalArticles = categoryData?.totalArticles || newsletter.stats?.totalArticles || 20;
                  
                  return (
                    <Card
                      key={newsletter.id}
                      className={`glass hover-lift animate-slide-in transition-all duration-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      } ${isSubscribed ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''} ${
                        isExpanded ? 'md:col-span-2' : ''
                      }`}
                      style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                                {newsletter.category}
                              </Badge>
                              <Badge className="bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">
                                {newsletter.frequency}
                              </Badge>
                              {isSubscribed && (
                                <Badge className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow animate-pulse">
                                  구독 중
                                </Badge>
                              )}
                            </div>
                            
                            <CardTitle className="text-lg mb-2 flex items-start justify-between">
                              <div className="flex-1">
                                <TextWithTooltips text={newsletter.title} />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCardExpansion(newsletter.id)}
                                className="ml-2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CardTitle>
                            
                            <CardDescription className="line-clamp-2">
                              <TextWithTooltips text={newsletter.description} />
                            </CardDescription>
                          </div>

                          {/* 구독 토글 */}
                          <div className="flex items-center space-x-2 ml-4">
                            <Switch
                              checked={isSubscribed}
                              onCheckedChange={(checked) => handleToggleSubscribe(newsletter, checked)}
                              disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <Label
                              className={`text-xs font-medium whitespace-nowrap ${
                                isSubscribed ? "text-blue-600" : "text-gray-600"
                              }`}
                            >
                              {subscribeMutation.isPending || unsubscribeMutation.isPending ? "처리 중..." :
                               isSubscribed ? "구독 중" : "구독"}
                            </Label>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* 주요 통계 */}
                        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50/50 rounded-lg">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Hash className="h-3 w-3 text-blue-500 mr-1" />
                              <span className="text-xs text-gray-500">총 기사</span>
                            </div>
                            <div className="font-semibold text-sm">{totalArticles}</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-xs text-gray-500">주간 성장</span>
                            </div>
                            <div className="font-semibold text-sm text-green-600">+{newsletter.stats?.weeklyGrowth}%</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Clock className="h-3 w-3 text-orange-500 mr-1" />
                              <span className="text-xs text-gray-500">읽기 시간</span>
                            </div>
                            <div className="font-semibold text-sm">{newsletter.stats?.averageReadTime}분</div>
                          </div>
                        </div>

                        {/* 카테고리별 주제들 */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            주요 주제
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {mainTopics && mainTopics.length > 0 ? (
                              <>
                                {mainTopics.slice(0, isTopicsExpanded ? mainTopics.length : 4).map((topic, idx) => (
                                  <Badge 
                                    key={`${newsletter.id}-${idx}`} 
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                  >
                                    #{topic}
                                  </Badge>
                                ))}
                                {!isTopicsExpanded && mainTopics.length > 4 && (
                                  <Badge 
                                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                                    onClick={() => toggleTopicsExpansion(newsletter.id)}
                                  >
                                    +{mainTopics.length - 4}개
                                  </Badge>
                                )}
                                {isTopicsExpanded && mainTopics.length > 4 && (
                                  <Badge 
                                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                                    onClick={() => toggleTopicsExpansion(newsletter.id)}
                                  >
                                    접기
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <div className="text-gray-400 text-xs">주제 정보를 불러오는 중...</div>
                            )}
                          </div>
                        </div>

                        {/* 확장 시 최근 헤드라인 표시 */}
                        {isExpanded && (
                          <div className="mb-4 border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              최근 헤드라인
                            </h4>
                            <ScrollArea className="h-32">
                              <div className="space-y-2">
                                {isHeadlinesLoading ? (
                                  // 로딩 중일 때 스켈레톤 UI 표시
                                  Array.from({ length: 3 }).map((_, idx) => (
                                    <div key={idx} className="flex items-start space-x-2 text-xs animate-pulse">
                                      <div className="w-1 h-1 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                                      <div className="flex-1">
                                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <div className="h-2 w-12 bg-gray-200 rounded"></div>
                                          <div className="flex items-center space-x-1">
                                            <div className="h-2 w-2 bg-gray-200 rounded"></div>
                                            <div className="h-2 w-8 bg-gray-200 rounded"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (headlinesData && headlinesData.length > 0) ? (
                                  headlinesData.map((headline, idx) => (
                                    <div key={idx} className="flex items-start space-x-2 text-xs">
                                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <div className="flex-1">
                                        <p className="text-gray-700 leading-relaxed">{headline.title}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <span className="text-gray-400">{headline.time}</span>
                                          <div className="flex items-center space-x-1 text-gray-400">
                                            <Users className="h-2.5 w-2.5" />
                                            <span>
                                              {categoryCountsLoading ? (
                                                <span className="animate-pulse">로딩 중...</span>
                                              ) : (
                                                `${categorySubscriberCount?.toLocaleString() || 0}명 구독`
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : articles.length > 0 ? (
                                  articles.map((article, idx) => (
                                    <div key={article.id || idx} className="flex items-start space-x-2 text-xs">
                                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <div className="flex-1">
                                        <p className="text-gray-700 leading-relaxed">{article.title}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <span className="text-gray-400">
                                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '최근'}
                                          </span>
                                          {article.summary && (
                                            <div className="flex items-center space-x-1 text-gray-400">
                                              <span className="truncate">{article.summary.substring(0, 30)}...</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  newsletter.recentHeadlines?.map((headline, idx) => (
                                    <div key={idx} className="flex items-start space-x-2 text-xs">
                                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <div className="flex-1">
                                        <p className="text-gray-700 leading-relaxed">{headline.title}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <span className="text-gray-400">{headline.time}</span>
                                          <div className="flex items-center space-x-1 text-gray-400">
                                            <Users className="h-2.5 w-2.5" />
                                            <span>
                                              {categoryCountsLoading ? (
                                                <span className="animate-pulse">로딩 중...</span>
                                              ) : (
                                                `${categorySubscriberCount?.toLocaleString() || 0}명 구독`
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        )}

                        <Separator className="mb-4" />

                        {/* 기존 Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {newsletter.tags.map((tag) => (
                            <Badge key={tag} className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>
                                {categoryCountsLoading ? (
                                  <span className="animate-pulse">로딩 중...</span>
                                ) : (
                                  `${categorySubscriberCount?.toLocaleString() || 0}`
                                )}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{newsletter.lastSent}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-current text-yellow-400" />
                            <span>4.8</span>
                          </div>
                        </div>

                        {/* 구독 상태 안내 */}
                        <div className="mt-3 p-2 bg-blue-50/50 rounded text-xs text-gray-600">
                          {isSubscribed ? (
                            <div>
                              <span className="font-medium text-blue-600">'{newsletter.category}' 카테고리를 구독하고 있습니다.</span>
                              <div className="mt-1 text-gray-500">
                                현재 구독: {Array.from(localSubscriptions).length}/3개 카테고리
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span>이 토글은 <span className="font-medium">'{newsletter.category}'</span> 카테고리 구독을 전환합니다.</span>
                              <div className="mt-1 text-gray-500">
                                현재 구독: {Array.from(localSubscriptions).length}/3개 카테고리
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}

              {/* 결과 없음 처리 */}
              {!isLoading && enhancedNewsletters.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedCategory} 카테고리의 뉴스레터가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    다른 카테고리를 선택하거나 나중에 다시 확인해보세요.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCategory("전체")}
                    className="hover-lift"
                  >
                    전체 뉴스레터 보기
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 기존 사이드바 유지 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* My Subscriptions */}
              {userRole && (
                <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-blue-500" />
                        내 구독
                      </div>
                      <Link 
                        href="/newsletter/dashboard" 
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                      >
                        대시보드
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      현재 구독 중인 뉴스레터 ({Array.from(localSubscriptions).length}/3개)
                      {Array.from(localSubscriptions).length > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({Array.from(localSubscriptions).join(', ')})
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {subscriptionsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">구독 정보 로딩 중...</p>
                        </div>
                      ) : userSubscriptions.length > 0 ? (
                        userSubscriptions.map((subscription) => {
                          // 구독 정보에서 카테고리 추출
                          const categories = subscription.preferredCategories || [];
                          const categoryNames = categories.map(cat => {
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
                            return categoryMapping[cat] || cat;
                          }).join(', ');
                          
                          return (
                            <div key={subscription.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  <TextWithTooltips text={categoryNames || '일반 뉴스레터'} />
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {subscription.frequency === 'DAILY' ? '매일' : 
                                   subscription.frequency === 'WEEKLY' ? '주간' : 
                                   subscription.frequency === 'MONTHLY' ? '월간' : '즉시'}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // 구독 해제 시 로컬 상태에서도 제거
                                  const categories = subscription.preferredCategories || [];
                                  categories.forEach(cat => {
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
                                    const frontendCategory = categoryMapping[cat];
                                    if (frontendCategory) {
                                      setLocalSubscriptions(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(frontendCategory);
                                        return newSet;
                                      });
                                    }
                                  });
                                  
                                  // 첫 번째 카테고리를 기준으로 구독 해제 (일관성을 위해)
                                  const firstCategory = categories[0];
                                  if (firstCategory) {
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
                                    const frontendCategory = categoryMapping[firstCategory];
                                    
                                    if (frontendCategory) {
                                      unsubscribeMutation.mutate(frontendCategory, {
                                        onError: () => {
                                          // 실패 시 로컬 상태 복원
                                          categories.forEach(cat => {
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
                                            const frontendCategory = categoryMapping[cat];
                                            if (frontendCategory) {
                                              setLocalSubscriptions(prev => new Set([...prev, frontendCategory]));
                                            }
                                          });
                                        }
                                      });
                                    }
                                  }
                                }}
                                disabled={unsubscribeMutation.isPending}
                                className="hover-glow text-red-500 hover:text-red-700"
                              >
                                {unsubscribeMutation.isPending ? "처리 중..." : "구독해제"}
                              </Button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-3">
                            구독 중인 뉴스레터가 없습니다
                          </p>
                          <Link href="/newsletter/dashboard">
                            <Button variant="outline" size="sm" className="hover-lift">
                              구독 대시보드 보기
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 로그인 안내 */}
              {!userRole && (
                <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-gray-500" />
                      로그인 필요
                    </CardTitle>
                    <CardDescription>
                      뉴스레터 구독을 위해 로그인해주세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">
                        뉴스레터를 구독하고 관리하려면 로그인이 필요합니다.
                      </p>
                      <Link href="/auth">
                        <Button className="w-full hover-lift">
                          로그인하기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Newsletter Preferences */}
              {userRole && (
                <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.4s' }}>
                  <CardHeader>
                    <CardTitle className="text-lg">알림 설정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications" className="text-sm">
                          이메일 알림
                        </Label>
                        <Switch id="email-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications" className="text-sm">
                          푸시 알림
                        </Label>
                        <Switch id="push-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="weekly-digest" className="text-sm">
                          주간 요약
                        </Label>
                        <Switch id="weekly-digest" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 뉴스레터 공유 섹션 */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2 text-yellow-500" />
                    뉴스레터 공유
                  </CardTitle>
                  <CardDescription>
                    친구들과 유용한 정보를 나눠보세요!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KakaoShare 
                    newsletterData={{
                      id: 'newsletter-main',
                      title: '📰 NewSphere - 최신 뉴스를 한눈에!',
                      description: `🔥 ${newsletters.length}개의 뉴스레터 | 📊 ${newsletters.reduce((sum, n) => sum + n.subscribers, 0).toLocaleString()}명 구독 | 🎯 정치, 경제, 사회, IT/과학 등 다양한 카테고리의 최신 정보를 받아보세요!`,
                      imageUrl: 'https://via.placeholder.com/800x400/667eea/ffffff?text=NewSphere+Newsletter',
                      url: typeof window !== 'undefined' ? window.location.href : ''
                    }}
                    showStats={true}
                    showFloating={false}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              {/* Popular Newsletters */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    인기 뉴스레터
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {newsletters
                      .sort((a, b) => b.subscribers - a.subscribers)
                      .slice(0, 5)
                      .map((newsletter, index) => (
                        <div key={newsletter.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-all duration-300">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            <div>
                              <p className="text-sm font-medium">
                                <TextWithTooltips text={newsletter.title} />
                              </p>
                              <p className="text-xs text-gray-500">{newsletter.subscribers.toLocaleString()} 구독자</p>
                            </div>
                          </div>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>


            </div>
          </div>
        </div>
      </div> 
    </>
  )
}