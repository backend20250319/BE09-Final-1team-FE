"use client";

import React, { Component, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Server, 
  Clock,
  Home,
  Mail
} from 'lucide-react';

/**
 * 뉴스레터 에러 바운더리 컴포넌트
 */
class NewsletterErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 에러 로깅
    console.error('Newsletter Error Boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackUI 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 에러 폴백 UI 컴포넌트
 */
function ErrorFallbackUI({ error, errorInfo, retryCount, onRetry }) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('online');

  // 네트워크 상태 감지
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorType = () => {
    if (networkStatus === 'offline') return 'network';
    if (error?.message?.includes('fetch')) return 'api';
    if (error?.message?.includes('timeout')) return 'timeout';
    return 'unknown';
  };

  const errorType = getErrorType();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-red-200 bg-white shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">
            뉴스레터를 불러올 수 없습니다
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="destructive" className="bg-red-100 text-red-700">
              {errorType === 'network' && '네트워크 오류'}
              {errorType === 'api' && 'API 오류'}
              {errorType === 'timeout' && '시간 초과'}
              {errorType === 'unknown' && '알 수 없는 오류'}
            </Badge>
            {retryCount > 0 && (
              <Badge variant="outline" className="text-gray-600">
                재시도 {retryCount}회
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 네트워크 상태 표시 */}
          <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
            {networkStatus === 'online' ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">인터넷 연결됨</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                <span className="text-red-700 font-medium">인터넷 연결 끊김</span>
              </>
            )}
          </div>

          {/* 에러 메시지 */}
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              {errorType === 'network' && '인터넷 연결을 확인하고 다시 시도해주세요.'}
              {errorType === 'api' && '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'}
              {errorType === 'timeout' && '요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.'}
              {errorType === 'unknown' && '예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.'}
            </p>
            
            {error?.message && (
              <details className="text-left bg-gray-50 p-3 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 mb-2">
                  기술적 세부사항
                </summary>
                <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                  {error.message}
                </pre>
              </details>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRetry}
              disabled={isRetrying || networkStatus === 'offline'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? '재시도 중...' : '다시 시도'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              페이지 새로고침
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Home className="h-4 w-4 mr-2" />
              홈으로 이동
            </Button>
          </div>

          {/* 도움말 섹션 */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">문제가 지속되나요?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Server className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-700">서버 상태 확인</div>
                  <div className="text-gray-500">백엔드 서버가 실행 중인지 확인해주세요</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-700">잠시 후 재시도</div>
                  <div className="text-gray-500">서버 점검 중일 수 있습니다</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * API 에러 처리 컴포넌트
 */
export function APIErrorHandler({ error, onRetry, className = "" }) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorMessage = () => {
    if (!error) return '알 수 없는 오류가 발생했습니다.';
    
    if (error.message?.includes('401')) {
      return '인증이 필요합니다. 로그인해주세요.';
    }
    if (error.message?.includes('403')) {
      return '접근 권한이 없습니다.';
    }
    if (error.message?.includes('404')) {
      return '요청한 리소스를 찾을 수 없습니다.';
    }
    if (error.message?.includes('500')) {
      return '서버에 일시적인 문제가 발생했습니다.';
    }
    if (error.message?.includes('timeout')) {
      return '요청 시간이 초과되었습니다.';
    }
    if (error.message?.includes('network')) {
      return '네트워크 연결을 확인해주세요.';
    }
    
    return error.message || '알 수 없는 오류가 발생했습니다.';
  };

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          ⚠️ 오류가 발생했습니다
        </h3>
        <p className="text-red-700 mb-4">
          {getErrorMessage()}
        </p>
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? '재시도 중...' : '다시 시도'}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * 로딩 에러 처리 컴포넌트
 */
export function LoadingErrorHandler({ error, onRetry, className = "" }) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        뉴스레터를 불러올 수 없습니다
      </h3>
      <p className="text-gray-600 mb-4">
        {error?.message || '잠시 후 다시 시도해주세요.'}
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        다시 시도
      </Button>
    </div>
  );
}

/**
 * 네트워크 상태 표시 컴포넌트
 */
export function NetworkStatusIndicator({ className = "" }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <Card className={`border-2 ${
        isOnline 
          ? 'border-green-300 bg-green-50' 
          : 'border-red-300 bg-red-50'
      }`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-green-700 text-sm font-medium">연결됨</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-red-700 text-sm font-medium">오프라인</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewsletterErrorBoundary;
