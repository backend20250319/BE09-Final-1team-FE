"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // 에러가 발생하면 상태를 업데이트하여 다음 렌더링에서 폴백 UI를 보여줍니다
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 프로덕션에서는 에러 리포팅 서비스로 전송
    if (process.env.NODE_ENV === "production") {
      // 예: Sentry, LogRocket 등
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                문제가 발생했습니다
              </CardTitle>
              <CardDescription className="text-gray-600">
                예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  다시 시도
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    홈으로 돌아가기
                  </Link>
                </Button>
              </div>
              
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    개발자 정보 (클릭하여 확장)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 함수형 컴포넌트용 훅 기반 에러 바운더리
export function withErrorBoundary(Component, fallback = null) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// 특정 컴포넌트용 에러 폴백
export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <h3 className="font-medium text-red-800">컴포넌트 오류</h3>
      </div>
      <p className="text-sm text-red-700 mb-3">
        이 컴포넌트에서 문제가 발생했습니다.
      </p>
      <Button 
        onClick={resetErrorBoundary}
        size="sm"
        variant="outline"
      >
        다시 시도
      </Button>
    </div>
  );
}

export default ErrorBoundary;
