import { NewsletterContent } from "./types/newsletter";
import { authenticatedFetch, getUserInfo, isAuthenticated } from "./auth";

/**
 * 백엔드 데이터를 프론트엔드 형식으로 매핑하는 함수
 */
const mapBackendToFrontend = (backendData) => {
  // 백엔드 카테고리 매핑
  const categoryMapping = {
    POLITICS: "정치",
    ECONOMY: "경제",
    SOCIETY: "사회",
    LIFE: "생활",
    INTERNATIONAL: "세계",
    IT_SCIENCE: "IT/과학",
    VEHICLE: "자동차/교통",
    TRAVEL_FOOD: "여행/음식",
    ART: "예술",
  };

  // 프론트엔드 카테고리를 백엔드 형식으로 변환
  const reverseCategoryMapping = Object.fromEntries(
    Object.entries(categoryMapping).map(([key, value]) => [value, key])
  );

  return {
    // 뉴스레터 목록 매핑
    mapNewsletters: (backendNewsletters) => {
      return backendNewsletters.map((newsletter) => ({
        id: newsletter.id,
        title: newsletter.title,
        description: newsletter.description,
        category: categoryMapping[newsletter.category] || newsletter.category,
        frequency: newsletter.frequency,
        subscribers: newsletter.subscriberCount || newsletter.subscribers,
        lastSent: newsletter.lastSentAt
          ? formatTimeAgo(newsletter.lastSentAt)
          : newsletter.lastSent,
        tags: newsletter.tags || [],
        isSubscribed: newsletter.isSubscribed || false,
        // 백엔드 원본 데이터 보존
        _backendData: newsletter,
      }));
    },

    // 구독 정보 매핑
    mapSubscriptions: (backendSubscriptions) => {
      if (!backendSubscriptions || !Array.isArray(backendSubscriptions)) {
        return [];
      }

      const mappedSubscriptions = [];

      backendSubscriptions.forEach((subscription) => {
        // preferredCategories 배열이 있으면 각 카테고리를 개별 구독으로 변환
        if (
          subscription.preferredCategories &&
          Array.isArray(subscription.preferredCategories)
        ) {
          subscription.preferredCategories.forEach((prefCat, index) => {
            const frontendCategory = categoryMapping[prefCat];
            if (frontendCategory) {
              mappedSubscriptions.push({
                id: `${subscription.id}-${prefCat}`, // 고유한 ID 생성
                originalId: subscription.id, // 원본 ID 보존
                category: frontendCategory,
                status: subscription.status,
                createdAt: subscription.createdAt,
                updatedAt: subscription.updatedAt,
                // 백엔드 원본 데이터 보존
                _backendData: subscription,
              });
            }
          });
        } else {
          // 기존 방식 (단일 카테고리)
          mappedSubscriptions.push({
            id: subscription.id,
            category:
              categoryMapping[subscription.category] || subscription.category,
            status: subscription.status,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
            // 백엔드 원본 데이터 보존
            _backendData: subscription,
          });
        }
      });

      return mappedSubscriptions;
    },

    // 카테고리 변환 (프론트엔드 → 백엔드)
    toBackendCategory: (frontendCategory) => {
      return reverseCategoryMapping[frontendCategory] || frontendCategory;
    },

    // 카테고리 변환 (백엔드 → 프론트엔드)
    toFrontendCategory: (backendCategory) => {
      return categoryMapping[backendCategory] || backendCategory;
    },
  };
};

// 시간 포맷팅 함수
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}시간 전`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  }
};

/**
 * 뉴스레터 관련 API 서비스 (클라이언트 전용)
 *
 * 모든 뉴스레터 관련 작업은 이 서비스를 통해 Next.js API Route를 호출합니다.
 * 직접 백엔드 호출은 하지 않으며, BFF(Backend for Frontend) 패턴을 따릅니다.
 *
 * 주요 특징:
 * - 클라이언트에서는 항상 /api/* 엔드포인트를 호출
 * - 서버 사이드에서는 정적 데이터나 환경에 따른 처리
 * - 모든 백엔드 통신은 API 라우트를 통해 처리
 */
export const newsletterService = {
  // 뉴스레터 목록 조회
  async getNewsletters() {
    try {
      // 서버 사이드에서는 API 라우트로 리디렉션하거나 정적 데이터 반환
      if (typeof window === "undefined") {
        // SSR에서는 기본 데이터 반환 (실제 데이터는 클라이언트에서 로드)
        return [
          {
            id: 1,
            title: "정치 뉴스 데일리",
            description:
              "매일 업데이트되는 정치 관련 최신 뉴스를 받아보세요. 국회 소식, 정책 동향, 정치 현안을 한눈에!",
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
            description:
              "주요 경제 지표, 주식 시장 동향, 부동산 소식을 주간으로 정리해서 전달합니다.",
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
            description:
              "최신 기술 트렌드, 스타트업 소식, 과학 연구 성과를 깊이 있게 다룹니다.",
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
            description:
              "사회적 이슈와 현안을 다양한 관점에서 분석하고 해석합니다.",
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
            description:
              "일상생활에 유용한 정보, 건강, 요리, 쇼핑 팁을 제공합니다.",
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
            description:
              "전 세계 주요 뉴스와 국제 관계 동향을 간결하게 요약해서 전달합니다.",
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
            description:
              "전기차, 자율주행, 친환경 모빌리티 등 자동차와 교통 분야의 최신 트렌드를 다룹니다.",
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
            description:
              "국내외 여행 정보와 맛집 소개, 음식 문화를 다루는 종합 가이드입니다.",
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
            description:
              "영화, 음악, 미술, 문학 등 다양한 예술 분야의 소식과 문화 이벤트를 전합니다.",
            category: "예술",
            frequency: "주 2회",
            subscribers: 6540,
            lastSent: "3일 전",
            tags: ["예술", "문화", "영화", "음악"],
            isSubscribed: false,
          },
        ];
      }

      // 클라이언트 사이드에서는 항상 API 라우트 호출
      const response = await fetch("/api/newsletters", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 백엔드 데이터가 있으면 매핑하여 반환
      if (data.success && data.data) {
        const mapper = mapBackendToFrontend();
        return mapper.mapNewsletters(data.data);
      }

      // 백엔드 데이터가 없으면 기본 데이터 반환
      return data.newsletters || [];
    } catch (error) {
      console.error("뉴스레터 목록 조회 실패:", error);

      // 에러 발생 시 기본 데이터 반환 (fallback)
      return [
        {
          id: 1,
          title: "정치 뉴스 데일리",
          description: "매일 업데이트되는 정치 관련 최신 뉴스를 받아보세요.",
          category: "정치",
          frequency: "매일",
          subscribers: 15420,
          lastSent: "2시간 전",
          tags: ["정치", "국회", "정책"],
          isSubscribed: false,
        },
      ];
    }
  },

  // 뉴스레터 구독 (카테고리 기반)
  async subscribeNewsletter(category, email) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // 카테고리 매핑 (프론트엔드 → 백엔드)
      const categoryMapping = {
        정치: "POLITICS",
        경제: "ECONOMY",
        사회: "SOCIETY",
        생활: "LIFE",
        세계: "INTERNATIONAL",
        "IT/과학": "IT_SCIENCE",
        "자동차/교통": "VEHICLE",
        "여행/음식": "TRAVEL_FOOD",
        예술: "ART",
      };

      const backendCategory = categoryMapping[category];
      if (!backendCategory) {
        throw new Error("지원하지 않는 카테고리입니다.");
      }

      // 기존 구독 정보 가져오기 (API 라우트를 통해)
      let existingCategories = [];
      try {
        const subscriptionsResponse = await fetch(
          "/api/newsletters/user-subscriptions",
          {
            method: "GET",
            headers,
            credentials: "include",
          }
        );

        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json();
          console.log("🔍 기존 구독 정보:", subscriptionsData);

          // 응답 데이터 구조 확인 및 처리
          const data = subscriptionsData.data || subscriptionsData;

          if (Array.isArray(data)) {
            // 기존 구독에서 카테고리들 수집
            data.forEach((sub) => {
              // preferredCategories 배열 처리
              if (
                sub.preferredCategories &&
                Array.isArray(sub.preferredCategories)
              ) {
                existingCategories.push(...sub.preferredCategories);
              }
              // 단일 카테고리 처리 (fallback)
              else if (sub.category) {
                existingCategories.push(sub.category);
              }
            });
          }
        }
      } catch (error) {
        console.warn("기존 구독 정보 조회 실패:", error);
      }

      // 중복 제거
      const uniqueExistingCategories = [...new Set(existingCategories)];
      console.log("🔍 현재 구독 중인 카테고리들:", uniqueExistingCategories);
      console.log("🔍 새로 구독하려는 카테고리:", backendCategory);

      // 이미 구독 중인 카테고리인지 확인
      if (uniqueExistingCategories.includes(backendCategory)) {
        throw new Error("이미 구독 중인 카테고리입니다.");
      }

      // 최대 구독 개수 제한 (3개)
      if (uniqueExistingCategories.length >= 3) {
        throw new Error(
          "최대 3개까지 구독할 수 있습니다. 다른 카테고리의 구독을 해제한 후 다시 시도해주세요."
        );
      }

      // 새 카테고리 추가
      const allCategories = [...uniqueExistingCategories, backendCategory];

      const requestBody = {
        email,
        frequency: "DAILY",
        preferredCategories: allCategories,
      };

      console.log("구독 요청 전송:", {
        url: "/api/newsletters/subscribe",
        method: "POST",
        headers,
        body: requestBody,
      });

      const response = await fetch("/api/newsletters/subscribe", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("뉴스레터 구독 실패:", error);
      throw error;
    }
  },

  // 뉴스레터 구독 해제 (카테고리 기반)
  async unsubscribeNewsletter(category) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // 카테고리 매핑 (프론트엔드 → 백엔드)
      const categoryMapping = {
        정치: "POLITICS",
        경제: "ECONOMY",
        사회: "SOCIETY",
        생활: "LIFE",
        세계: "INTERNATIONAL",
        "IT/과학": "IT_SCIENCE",
        "자동차/교통": "VEHICLE",
        "여행/음식": "TRAVEL_FOOD",
        예술: "ART",
      };

      const backendCategory = categoryMapping[category];
      if (!backendCategory) {
        throw new Error("지원하지 않는 카테고리입니다.");
      }

      console.log("🔍 구독 해제 시도:", { category, backendCategory });

      console.log("🔄 구독 해제 요청 전송:", {
        url: "/api/newsletters/unsubscribe",
        method: "POST",
        headers,
        body: { category },
      });

      const response = await fetch("/api/newsletters/unsubscribe", {
        method: "POST",
        headers,
        body: JSON.stringify({ category }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ 구독 업데이트 실패:", {
          status: response.status,
          error: errorData,
        });
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("✅ 구독 해제 성공:", result);
      return result;
    } catch (error) {
      console.error("❌ 뉴스레터 구독 해제 실패:", error);
      throw error;
    }
  },

  // 사용자 구독 목록 조회
  async getUserSubscriptions() {
    try {
      // 현재 인증 상태 확인
      const userInfo = getUserInfo();
      const isAuth = isAuthenticated();
      
      console.log("🔍 getUserSubscriptions 호출:", {
        url: "/api/newsletters/user-subscriptions",
        isAuthenticated: isAuth,
        hasUserInfo: !!userInfo,
        userInfo: userInfo ? { id: userInfo.id, email: userInfo.email } : null
      });

      // authenticatedFetch를 사용하여 인증 헤더 자동 처리
      console.log("🔄 getUserSubscriptions - authenticatedFetch 호출 시작");
      const response = await authenticatedFetch("/api/newsletters/user-subscriptions", {
        method: "GET",
      });
      console.log("✅ getUserSubscriptions - authenticatedFetch 호출 완료");

      console.log("📡 API 응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        // 응답 본문을 텍스트로 먼저 읽어서 로깅
        const responseText = await response.text();
        console.error("❌ API 오류 응답 (텍스트):", responseText);
        
        let errorData = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("❌ JSON 파싱 실패:", parseError);
          errorData = { error: responseText || `HTTP error! status: ${response.status}` };
        }
        
        console.error("❌ API 오류 응답 (파싱됨):", errorData);
        
        // 503 Service Unavailable 오류에 대한 특별 처리
        if (response.status === 503) {
          const serviceUnavailableError = new Error("서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
          serviceUnavailableError.status = 503;
          serviceUnavailableError.isServiceUnavailable = true;
          throw serviceUnavailableError;
        }
        
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const responseText = await response.text();
      console.log("📡 API 응답 본문 (텍스트):", responseText);
      
      let data = {};
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ JSON 파싱 실패:", parseError);
        throw new Error("API 응답을 파싱할 수 없습니다.");
      }
      
      console.log("✅ API 응답 데이터:", data);
      console.log("📋 data.data:", data.data);
      console.log("📋 data.data || data:", data.data || data);

      const subscriptionsData = data.data || data || [];
      console.log("📋 최종 subscriptionsData:", subscriptionsData);

      // fallback 모드인 경우 사용자에게 알림
      if (data.metadata?.fallback) {
        console.log("⚠️ 백엔드 서비스 fallback 모드:", data.metadata.message);
        // 사용자에게 알림을 표시할 수 있도록 커스텀 이벤트 발생
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("backendUnavailable", {
            detail: { message: data.metadata.message }
          }));
        }
      }

      const mappedData =
        mapBackendToFrontend(data).mapSubscriptions(subscriptionsData);
      console.log("📋 매핑된 데이터:", mappedData);

      return mappedData;
    } catch (error) {
      console.error("❌ 사용자 구독 목록 조회 실패:", error);
      
      // 503 Service Unavailable 오류인 경우 특별 처리
      if (error.isServiceUnavailable || error.status === 503) {
        console.log("🔄 서비스 일시 중단 - 사용자에게 알림 후 빈 배열 반환");
        // 사용자에게 알림을 표시할 수 있도록 오류를 다시 던짐
        throw new Error("서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
      
      // 기타 API 실패 시 빈 배열 반환 (fallback)
      console.log("🔄 빈 배열을 반환합니다 (fallback)");
      return [];
    }
  },

  // 구독 정보 조회
  async getSubscription(subscriptionId) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `/api/newsletters/subscription/${subscriptionId}`,
        {
          method: "GET",
          headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("구독 정보 조회 실패:", error);
      throw error;
    }
  },

  // 내 구독 목록 조회
  async getMySubscriptions() {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/newsletters/subscription/my", {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const subscriptionsData = data.data || data || [];
      return mapBackendToFrontend(data).mapSubscriptions(subscriptionsData);
    } catch (error) {
      console.error("내 구독 목록 조회 실패:", error);
      throw error;
    }
  },

  // 활성 구독 목록 조회
  async getActiveSubscriptions() {
    try {
      const headers = {
        "Content-Type": "application/json",
          
      };

      const response = await fetch("/api/newsletters/subscription/active", {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return mapBackendToFrontend(data).mapSubscriptions(data.data);
    } catch (error) {
      console.error("활성 구독 목록 조회 실패:", error);
      throw error;
    }
  },

  // 구독 상태 변경
  async updateSubscriptionStatus(subscriptionId, status) {
    try {
      const headers = {
        "Content-Type": "application/json",
          
      };

      const response = await fetch(
        `/api/newsletters/subscription/${subscriptionId}/status`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ status }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("구독 상태 변경 실패:", error);
      throw error;
    }
  },

  // 구독 토글 (카테고리별)
  async toggleSubscription(category, isActive) {
    try {
      // 사용자 정보에서 이메일 가져오기 (여러 소스에서 시도)
      let userEmail = null;
      try {
        // 1. localStorage에서 userInfo 확인
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo.email) {
          userEmail = userInfo.email;
          console.log('📧 localStorage userInfo에서 이메일 조회:', userEmail);
        }
        
        // 2. localStorage에서 직접 email 확인
        if (!userEmail) {
          userEmail = localStorage.getItem('email');
          if (userEmail) {
            console.log('📧 localStorage email에서 이메일 조회:', userEmail);
          }
        }
        
        // 3. sessionStorage에서 확인
        if (!userEmail) {
          const sessionUserInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
          if (sessionUserInfo.email) {
            userEmail = sessionUserInfo.email;
            console.log('📧 sessionStorage userInfo에서 이메일 조회:', userEmail);
          }
        }
        
        // 4. 기본값 설정 (개발 환경)
        if (!userEmail && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          userEmail = 'test@example.com';
          console.log('📧 개발 환경 기본 이메일 사용:', userEmail);
        }
        
      } catch (error) {
        console.warn('⚠️ 사용자 정보 조회 실패:', error);
        // 개발 환경에서는 기본값 사용
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          userEmail = 'test@example.com';
          console.log('📧 오류 발생 시 개발 환경 기본 이메일 사용:', userEmail);
        }
      }

      const response = await fetch('/api/newsletters/subscription/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: category,
          isActive: isActive,
          email: userEmail
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 503 Service Unavailable 오류 처리 (백엔드 서비스 사용 불가)
        if (response.status === 503) {
          console.warn('⚠️ 백엔드 서비스 일시 중단 - 로컬 상태만 업데이트');
          return {
            success: true,
            message: `${category} 카테고리 ${isActive ? '구독' : '구독 해제'}이 로컬에서 처리되었습니다. (서버 동기화는 나중에 시도됩니다)`,
            fallback: true,
            category: category,
            isActive: isActive
          };
        }
        
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("구독 토글 실패:", error);
      
      // 네트워크 오류나 백엔드 연결 실패인 경우 fallback 처리
      if (error.message.includes('fetch') || error.message.includes('network') || 
          error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND') ||
          error.message.includes('백엔드 서비스가 일시적으로 사용할 수 없습니다')) {
        console.warn('⚠️ 백엔드 연결 실패 - 로컬 상태만 업데이트');
        return {
          success: true,
          message: `${category} 카테고리 ${isActive ? '구독' : '구독 해제'}이 로컬에서 처리되었습니다. (서버 동기화는 나중에 시도됩니다)`,
          fallback: true,
          category: category,
          isActive: isActive
        };
      }
      
      throw error;
    }
  },

  // 새로운 뉴스레터 콘텐츠 생성 (JSON)
  async generateNewsletterContent(options = {}) {
    try {
      const {
        newsletterId = Date.now(),
        category,
        personalized = false,
        userId,
        limit = 5,
      } = options;

      const response = await fetch("/api/newsletters/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            
        },
        body: JSON.stringify({
          newsletterId,
          category,
          personalized,
          userId,
          limit,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // JSON을 NewsletterContent 객체로 변환
        return NewsletterContent.fromJSON(result.data);
      } else {
        throw new Error(result.error || "뉴스레터 콘텐츠 생성 실패");
      }
    } catch (error) {
      console.error("뉴스레터 콘텐츠 생성 실패:", error);
      throw error;
    }
  },

  // 개인화된 뉴스레터 콘텐츠 생성
  async generatePersonalizedNewsletter(userId, options = {}) {
    return this.generateNewsletterContent({
      ...options,
      personalized: true,
      userId,
    });
  },

  // 뉴스레터 이메일 HTML 생성
  async generateNewsletterEmail(options = {}) {
    try {
      const {
        newsletterId = Date.now(),
        category,
        personalized = false,
        userId,
        limit = 5,
        includeTracking = true,
        includeUnsubscribe = true,
        theme = "default",
        format = "html",
      } = options;

      const response = await fetch("/api/newsletters/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            
        },
        body: JSON.stringify({
          newsletterId,
          category,
          personalized,
          userId,
          limit,
          includeTracking,
          includeUnsubscribe,
          theme,
          format,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (format === "text") {
        return await response.text();
      } else {
        return await response.text(); // HTML 문자열 반환
      }
    } catch (error) {
      console.error("뉴스레터 이메일 생성 실패:", error);
      throw error;
    }
  },

  // 뉴스레터 이메일 미리보기 (GET 요청)
  async previewNewsletterEmail(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(
        `/api/newsletters/email?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
             
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const format = params.format || "html";
      if (format === "text") {
        return await response.text();
      } else {
        return await response.text(); // HTML 문자열 반환
      }
    } catch (error) {
      console.error("뉴스레터 이메일 미리보기 실패:", error);
      throw error;
    }
  },

  // 카테고리별 기사 조회
  async getCategoryArticles(category, limit = 5) {
    try {
      const response = await fetch(
        `/api/newsletters/category/articles?category=${encodeURIComponent(
          category
        )}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
             
          },
          credentials: "include", // 쿠키 포함
        }
      );

      if (!response.ok) {
        console.warn(
          `카테고리별 기사 조회 실패 (${response.status}): ${category}`
        );
        // 401 오류나 기타 오류 시 기본 데이터 반환
        return {
          trendingKeywords: [],
          totalArticles: 0,
          articles: [],
          mainTopics: [],
        };
      }

      const data = await response.json();
      return data.success
        ? data.data
        : {
            trendingKeywords: [],
            totalArticles: 0,
            articles: [],
            mainTopics: [],
          };
    } catch (error) {
      console.error("카테고리별 기사 조회 실패:", error);
      // 에러 발생 시 기본 데이터 반환
      return {
        trendingKeywords: [],
        totalArticles: 0,
        articles: [],
        mainTopics: [],
      };
    }
  },

  // 구독자 통계 조회
  async getSubscriberStats(category = null) {
    try {
      const url = category
        ? `/api/newsletter/stats/subscribers?category=${encodeURIComponent(
            category
          )}`
        : "/api/newsletter/stats/subscribers";

      console.log("🔍 구독자 통계 조회 요청:", { category, url });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
           
        },
        credentials: "include", // 쿠키 포함
      });

      if (!response.ok) {
        console.warn(`구독자 통계 조회 실패 (${response.status}): ${category}`);
        // 401 오류나 기타 오류 시 더미 데이터 반환
        return generateDummySubscriberStats(category);
      }

      const data = await response.json();
      console.log("✅ 구독자 통계 응답:", data);

      // 응답 구조 확인 및 처리
      if (data.success && data.data) {
        return data.data;
      } else if (data.data) {
        return data.data;
      } else {
        console.warn("구독자 통계 응답 구조가 예상과 다름:", data);
        return generateDummySubscriberStats(category);
      }
    } catch (error) {
      console.error("구독자 통계 조회 실패:", error);
      // 에러 발생 시 더미 데이터 반환
      return generateDummySubscriberStats(category);
    }
  },

  // 카테고리별 헤드라인 조회
  async getCategoryHeadlines(category, limit = 5) {
    try {
      console.log("🔍 헤드라인 조회 요청:", { category, limit });

      const response = await fetch(
        `/api/newsletter/category/headlines?category=${encodeURIComponent(
          category
        )}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
             
          },
          credentials: "include", // 쿠키 포함
        }
      );

      if (!response.ok) {
        console.warn(`헤드라인 조회 실패 (${response.status}): ${category}`);
        // 401 오류나 기타 오류 시 빈 배열 반환
        return [];
      }

      const data = await response.json();
      console.log("✅ 헤드라인 응답:", data);

      // 응답 구조 확인 및 처리
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn("헤드라인 응답 구조가 예상과 다름:", data);
        return [];
      }
    } catch (error) {
      console.error("헤드라인 조회 실패:", error);
      // 에러 발생 시 빈 배열 반환
      return [];
    }
  },

  // 카테고리별 트렌드 키워드 조회
  async getTrendingKeywords(category, limit = 8) {
    try {
      console.log("🔍 트렌드 키워드 조회 요청:", { category, limit });

      const response = await fetch(
        `/api/newsletter/category/trending-keywords?category=${encodeURIComponent(
          category
        )}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
             
          },
          credentials: "include", // 쿠키 포함
        }
      );

      if (!response.ok) {
        console.warn(
          `트렌드 키워드 조회 실패 (${response.status}): ${category}`
        );
        // 401 오류나 기타 오류 시 빈 배열 반환
        return [];
      }

      const data = await response.json();
      console.log("✅ 트렌드 키워드 응답:", data);

      // 응답 구조 확인 및 처리
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn("트렌드 키워드 응답 구조가 예상과 다름:", data);
        return [];
      }
    } catch (error) {
      console.error("트렌드 키워드 조회 실패:", error);
      // 에러 발생 시 빈 배열 반환
      return [];
    }
  },
};

// 더미 구독자 통계 생성 함수
function generateDummySubscriberStats(category) {
  const defaultCounts = {
    정치: 15420,
    경제: 8920,
    사회: 18760,
    생활: 12340,
    세계: 9870,
    "IT/과학": 12350,
    "자동차/교통": 11230,
    "여행/음식": 14560,
    예술: 8760,
  };

  if (category) {
    return { [category]: defaultCounts[category] || 10000 };
  }

  return defaultCounts;
}
