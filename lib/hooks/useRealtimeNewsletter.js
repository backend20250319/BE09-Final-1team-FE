import { useState, useEffect, useCallback, useRef } from 'react';
import { useEnhancedNewsletterData, useHybridNewsletterData, useSmartRecommendations } from './useNewsletter';
import { useServiceLevel } from './useServiceLevel';

/**
 * 실시간 뉴스레터 업데이트 훅
 */
export function useRealtimeNewsletter(options = {}) {
  const {
    updateInterval = 5 * 60 * 1000, // 5분마다 업데이트
    enableAutoRefresh = true,
    enableNotifications = true,
    category = null,
    limit = 5
  } = options;

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const intervalRef = useRef(null);
  const notificationPermissionRef = useRef(null);

  // 서비스 레벨 관리
  const { serviceLevel, userInfo } = useServiceLevel();

  // Enhanced API 데이터
  const enhancedData = useEnhancedNewsletterData({
    headlinesPerCategory: 5,
    trendingKeywordsLimit: 8,
    category,
    enabled: true
  });

  // Hybrid API 데이터
  const hybridData = useHybridNewsletterData({
    category,
    limit,
    personalized: serviceLevel === 'PERSONALIZED',
    enabled: true
  });

  // Smart Recommendations 데이터
  const smartRecommendations = useSmartRecommendations({
    category,
    limit: 10,
    type: serviceLevel === 'PERSONALIZED' ? 'personalized' : 'trending',
    enabled: true
  });

  // 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if (!enableNotifications || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    notificationPermissionRef.current = permission === 'granted';
    return notificationPermissionRef.current;
  }, [enableNotifications]);

  // 알림 표시
  const showNotification = useCallback((title, body, icon = null) => {
    if (!enableNotifications || !notificationPermissionRef.current) {
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'newsletter-update',
        requireInteraction: false,
        silent: false
      });

      // 5초 후 자동으로 닫기
      setTimeout(() => {
        notification.close();
      }, 5000);

      // 클릭 시 포커스
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.warn('알림 표시 실패:', error);
    }
  }, [enableNotifications]);

  // 데이터 새로고침
  const refreshData = useCallback(async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    setConnectionStatus('updating');

    try {
      // 모든 API 데이터 새로고침
      await Promise.all([
        enhancedData.refetch(),
        hybridData.refetch(),
        smartRecommendations.refetch()
      ]);

      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      setConnectionStatus('connected');

      // 새 뉴스 알림
      if (updateCount > 0) {
        showNotification(
          '📰 새로운 뉴스가 도착했습니다!',
          '최신 뉴스를 확인해보세요.',
          '/images/news-icon.png'
        );
      }
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
      setConnectionStatus('error');
      
      showNotification(
        '⚠️ 뉴스 업데이트 실패',
        '네트워크 연결을 확인해주세요.',
        '/images/error-icon.png'
      );
    } finally {
      setIsUpdating(false);
    }
  }, [
    isUpdating,
    enhancedData,
    hybridData,
    smartRecommendations,
    updateCount,
    showNotification
  ]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (!enableAutoRefresh) return;

    // 초기 알림 권한 요청
    requestNotificationPermission();

    // 주기적 업데이트 설정
    intervalRef.current = setInterval(() => {
      refreshData();
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableAutoRefresh, updateInterval, refreshData, requestNotificationPermission]);

  // 페이지 가시성 변경 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enableAutoRefresh) {
        // 페이지가 다시 보이면 데이터 새로고침
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData, enableAutoRefresh]);

  // 네트워크 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('connected');
      if (enableAutoRefresh) {
        refreshData();
      }
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshData, enableAutoRefresh]);

  // 수동 새로고침
  const manualRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // 자동 새로고침 토글
  const toggleAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else {
      intervalRef.current = setInterval(() => {
        refreshData();
      }, updateInterval);
    }
  }, [updateInterval, refreshData]);

  // 연결 상태별 아이콘
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢';
      case 'updating':
        return '🟡';
      case 'offline':
        return '🔴';
      case 'error':
        return '⚠️';
      default:
        return '⚪';
    }
  };

  // 연결 상태별 메시지
  const getConnectionMessage = () => {
    switch (connectionStatus) {
      case 'connected':
        return '연결됨';
      case 'updating':
        return '업데이트 중...';
      case 'offline':
        return '오프라인';
      case 'error':
        return '연결 오류';
      default:
        return '알 수 없음';
    }
  };

  return {
    // 데이터
    enhancedData: enhancedData.data,
    hybridData: hybridData.data,
    smartRecommendations: smartRecommendations.data,
    
    // 로딩 상태
    isLoading: enhancedData.isLoading || hybridData.isLoading || smartRecommendations.isLoading,
    isUpdating,
    
    // 에러 상태
    isError: enhancedData.isError || hybridData.isError || smartRecommendations.isError,
    error: enhancedData.error || hybridData.error || smartRecommendations.error,
    
    // 업데이트 정보
    lastUpdate,
    updateCount,
    connectionStatus,
    connectionIcon: getConnectionIcon(),
    connectionMessage: getConnectionMessage(),
    
    // 액션
    refreshData: manualRefresh,
    toggleAutoRefresh,
    requestNotificationPermission,
    
    // 설정
    updateInterval,
    enableAutoRefresh: !!intervalRef.current,
    enableNotifications: notificationPermissionRef.current
  };
}

/**
 * 실시간 뉴스 알림 훅
 */
export function useRealtimeNotifications(options = {}) {
  const {
    enableBreakingNews = true,
    enablePersonalizedAlerts = true,
    enableTrendingAlerts = true
  } = options;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 알림 추가
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // 최대 50개 유지
    setUnreadCount(prev => prev + 1);

    // 브라우저 알림 표시
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        tag: notification.type || 'newsletter'
      });
    }
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // 알림 삭제
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // 긴급 뉴스 알림
  const addBreakingNewsAlert = useCallback((news) => {
    addNotification({
      type: 'breaking',
      title: '🚨 긴급 뉴스',
      message: news.title,
      icon: '/images/breaking-news-icon.png',
      data: news
    });
  }, [addNotification]);

  // 개인화 알림
  const addPersonalizedAlert = useCallback((recommendation) => {
    addNotification({
      type: 'personalized',
      title: '🎯 맞춤 추천',
      message: recommendation.title,
      icon: '/images/personalized-icon.png',
      data: recommendation
    });
  }, [addNotification]);

  // 트렌딩 알림
  const addTrendingAlert = useCallback((trend) => {
    addNotification({
      type: 'trending',
      title: '🔥 트렌딩',
      message: `${trend.keyword}이(가) 인기 급상승 중입니다`,
      icon: '/images/trending-icon.png',
      data: trend
    });
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addBreakingNewsAlert,
    addPersonalizedAlert,
    addTrendingAlert
  };
}
