/**
 * 서비스 레벨 관리 유틸리티
 * 
 * 서비스 레벨:
 * - PUBLIC: 비로그인 사용자 (기본 뉴스 + 로그인 유도)
 * - AUTHENTICATED_BASIC: 로그인 사용자 (확장 뉴스 + 구독 유도)
 * - PERSONALIZED: 구독자 (완전 개인화 + AI 추천)
 */

export const SERVICE_LEVELS = {
  PUBLIC: 'PUBLIC',
  AUTHENTICATED_BASIC: 'AUTHENTICATED_BASIC',
  PERSONALIZED: 'PERSONALIZED'
};

export const SERVICE_LEVEL_CONFIG = {
  [SERVICE_LEVELS.PUBLIC]: {
    name: '공개 사용자',
    description: '기본 뉴스와 트렌딩 키워드 제공',
    icon: '📰',
    color: 'gray',
    features: ['기본 뉴스', '트렌딩 키워드', '인기 카테고리'],
    limitations: ['제한된 뉴스 수', '개인화 없음', '구독 관리 불가'],
    newsPerCategory: 5,
    categories: ['정치', '경제', '사회', 'IT/과학', '세계'],
    upgradePrompt: {
      title: '🔐 로그인하면 더 많은 뉴스를 받아보세요!',
      description: '로그인하시면 관심사 기반 맞춤 뉴스와 더 많은 콘텐츠를 받아보실 수 있어요.',
      buttonText: '로그인하기',
      action: 'login'
    }
  },
  [SERVICE_LEVELS.AUTHENTICATED_BASIC]: {
    name: '로그인 사용자',
    description: '확장된 뉴스와 구독 관리 기능',
    icon: '🔐',
    color: 'blue',
    features: ['확장 뉴스', '구독 관리', '개인화 준비'],
    limitations: ['제한된 개인화', 'AI 추천 없음'],
    newsPerCategory: 7,
    categories: ['정치', '경제', '사회', '생활', 'IT/과학', '세계'],
    upgradePrompt: {
      title: '🎯 관심 카테고리를 구독해보세요!',
      description: '관심 카테고리를 구독하면 맞춤 뉴스와 AI 추천을 받아보실 수 있어요.',
      buttonText: '카테고리 구독하기',
      action: 'subscribe'
    }
  },
  [SERVICE_LEVELS.PERSONALIZED]: {
    name: '구독자',
    description: '완전 개인화된 뉴스와 AI 추천',
    icon: '🎯',
    color: 'green',
    features: ['완전 개인화', 'AI 추천', '맞춤 통계'],
    limitations: [],
    newsPerCategory: 10,
    categories: ['정치', '경제', '사회', '생활', 'IT/과학', '세계', '자동차/교통', '여행/음식', '예술'],
    upgradePrompt: null
  }
};

/**
 * 사용자의 서비스 레벨을 결정하는 함수
 * @param {Object} userInfo - 사용자 정보
 * @param {Array} subscriptions - 사용자 구독 목록
 * @returns {string} 서비스 레벨
 */
export function determineServiceLevel(userInfo, subscriptions = []) {
  // 사용자 정보가 없으면 공개 레벨
  if (!userInfo) {
    return SERVICE_LEVELS.PUBLIC;
  }
  
  // 구독이 있으면 개인화 레벨
  if (subscriptions && subscriptions.length > 0) {
    return SERVICE_LEVELS.PERSONALIZED;
  }
  
  // 로그인했지만 구독이 없으면 기본 인증 레벨
  return SERVICE_LEVELS.AUTHENTICATED_BASIC;
}

/**
 * 서비스 레벨별 메시지 생성
 * @param {string} serviceLevel - 서비스 레벨
 * @param {Object} userInfo - 사용자 정보
 * @returns {string} 메시지
 */
export function getServiceLevelMessage(serviceLevel, userInfo = null) {
  switch (serviceLevel) {
    case SERVICE_LEVELS.PUBLIC:
      return '📰 일반 뉴스를 제공합니다';
    case SERVICE_LEVELS.AUTHENTICATED_BASIC:
      return '🔐 로그인하셨습니다. 카테고리를 구독하면 맞춤 뉴스를 받아보실 수 있어요!';
    case SERVICE_LEVELS.PERSONALIZED:
      return `🎯 ${userInfo?.name || '사용자'}님을 위한 맞춤형 뉴스를 제공합니다`;
    default:
      return '📰 뉴스를 제공합니다';
  }
}

/**
 * 서비스 레벨별 업그레이드 프롬프트 생성
 * @param {string} serviceLevel - 서비스 레벨
 * @returns {Object|null} 업그레이드 프롬프트
 */
export function getUpgradePrompt(serviceLevel) {
  const config = SERVICE_LEVEL_CONFIG[serviceLevel];
  return config?.upgradePrompt || null;
}

/**
 * 서비스 레벨별 기능 목록 가져오기
 * @param {string} serviceLevel - 서비스 레벨
 * @returns {Object} 기능 정보
 */
export function getServiceLevelFeatures(serviceLevel) {
  const config = SERVICE_LEVEL_CONFIG[serviceLevel];
  return {
    features: config?.features || [],
    limitations: config?.limitations || [],
    newsPerCategory: config?.newsPerCategory || 5,
    categories: config?.categories || []
  };
}

/**
 * 서비스 레벨별 뉴스 수 제한
 * @param {string} serviceLevel - 서비스 레벨
 * @param {string} category - 카테고리
 * @returns {number} 뉴스 수
 */
export function getNewsLimitForServiceLevel(serviceLevel, category = null) {
  const config = SERVICE_LEVEL_CONFIG[serviceLevel];
  return config?.newsPerCategory || 5;
}

/**
 * 서비스 레벨별 카테고리 목록
 * @param {string} serviceLevel - 서비스 레벨
 * @returns {Array} 카테고리 목록
 */
export function getCategoriesForServiceLevel(serviceLevel) {
  const config = SERVICE_LEVEL_CONFIG[serviceLevel];
  return config?.categories || [];
}

/**
 * 서비스 레벨별 색상
 * @param {string} serviceLevel - 서비스 레벨
 * @returns {string} 색상
 */
export function getServiceLevelColor(serviceLevel) {
  const config = SERVICE_LEVEL_CONFIG[serviceLevel];
  return config?.color || 'gray';
}

/**
 * 서비스 레벨별 아이콘
 * @param {string} serviceLevel - 서비스 레벨
 * @returns {string} 아이콘
 */
export function getServiceLevelIcon(serviceLevel) {
  const config = SERVICE_LEVEL_CONFIG[serviceLevel];
  return config?.icon || '📰';
}

/**
 * 서비스 레벨별 구독 혜택 목록
 * @param {string} serviceLevel - 서비스 레벨
 * @returns {Array} 혜택 목록
 */
export function getSubscriptionBenefits(serviceLevel) {
  switch (serviceLevel) {
    case SERVICE_LEVELS.AUTHENTICATED_BASIC:
      return [
        '관심 카테고리 맞춤 뉴스',
        'AI 개인화 추천',
        '최적 발송 시간 설정',
        '읽기 기록 관리'
      ];
    case SERVICE_LEVELS.PERSONALIZED:
      return [
        '완전 개인화된 뉴스',
        'AI 맞춤 추천',
        '읽기 패턴 분석',
        '맞춤 통계 제공'
      ];
    default:
      return [];
  }
}

/**
 * 서비스 레벨별 AI 추천 정보
 * @param {string} serviceLevel - 서비스 레벨
 * @returns {Object|null} AI 추천 정보
 */
export function getAIRecommendations(serviceLevel) {
  if (serviceLevel === SERVICE_LEVELS.PERSONALIZED) {
    return {
      status: 'available',
      message: 'AI 맞춤 추천 기능이 준비되어 있습니다',
      features: [
        '개인화된 뉴스 추천',
        '읽기 패턴 분석',
        '관심사 기반 키워드 추천',
        '최적 발송 시간 추천'
      ]
    };
  }
  return null;
}

/**
 * 서비스 레벨 비교 함수
 * @param {string} level1 - 첫 번째 서비스 레벨
 * @param {string} level2 - 두 번째 서비스 레벨
 * @returns {number} 비교 결과 (-1, 0, 1)
 */
export function compareServiceLevels(level1, level2) {
  const levels = [SERVICE_LEVELS.PUBLIC, SERVICE_LEVELS.AUTHENTICATED_BASIC, SERVICE_LEVELS.PERSONALIZED];
  const index1 = levels.indexOf(level1);
  const index2 = levels.indexOf(level2);
  
  if (index1 < index2) return -1;
  if (index1 > index2) return 1;
  return 0;
}

/**
 * 서비스 레벨이 특정 레벨 이상인지 확인
 * @param {string} currentLevel - 현재 서비스 레벨
 * @param {string} requiredLevel - 필요한 서비스 레벨
 * @returns {boolean} 레벨 충족 여부
 */
export function hasServiceLevel(currentLevel, requiredLevel) {
  return compareServiceLevels(currentLevel, requiredLevel) >= 0;
}
