"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useKakaoPermission } from "@/hooks/useKakaoPermission";
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Info
} from "lucide-react";

export default function KakaoPermissionDebug() {
  const { 
    hasPermission, 
    checkTalkMessagePermission, 
    requestPermissionFlow,
    isLoading,
    sessionBackup,
    getCurrentSession,
    restoreOrReauth
  } = useKakaoPermission();
  
  const [debugInfo, setDebugInfo] = useState({});
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    updateDebugInfo();
  }, [hasPermission]);

  const updateDebugInfo = () => {
    const info = {
      hasKakaoSDK: typeof window !== 'undefined' && !!window.Kakao,
      hasAccessToken: typeof window !== 'undefined' && window.Kakao && !!window.Kakao.Auth.getAccessToken(),
      permissionStatus: hasPermission,
      timestamp: new Date().toLocaleString(),
      kakaoVersion: typeof window !== 'undefined' && window.Kakao ? 'v2' : 'N/A',
      hasSessionBackup: !!sessionBackup,
      sessionBackupTime: sessionBackup ? new Date(sessionBackup.timestamp).toLocaleString() : 'N/A'
    };
    setDebugInfo(info);
  };

  const handleCheckPermission = async () => {
    setIsChecking(true);
    try {
      await checkTalkMessagePermission();
      updateDebugInfo();
    } catch (error) {
      console.error('권한 확인 실패:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      await requestPermissionFlow('디버그');
      updateDebugInfo();
    } catch (error) {
      console.error('권한 요청 실패:', error);
    }
  };

  const handleBackupSession = async () => {
    try {
      await getCurrentSession();
      updateDebugInfo();
    } catch (error) {
      console.error('세션 백업 실패:', error);
    }
  };

  const handleRestoreSession = async () => {
    try {
      if (sessionBackup) {
        await restoreOrReauth(sessionBackup);
        updateDebugInfo();
      }
    } catch (error) {
      console.error('세션 복구 실패:', error);
    }
  };

  const getPermissionStatusBadge = () => {
    if (hasPermission === null) {
      return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />미확인</Badge>;
    } else if (hasPermission === true) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />권한 있음</Badge>;
    } else {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />권한 없음</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-orange-600" />
          카카오 권한 디버그 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 현재 상태 */}
        <div className="space-y-2">
          <h3 className="font-medium">현재 상태</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">권한 상태:</span>
            {getPermissionStatusBadge()}
          </div>
          <div className="text-xs text-gray-500">
            마지막 확인: {debugInfo.timestamp}
          </div>
        </div>

        {/* 디버그 정보 */}
        <div className="space-y-2">
          <h3 className="font-medium">디버그 정보</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span>카카오 SDK:</span>
              {debugInfo.hasKakaoSDK ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>액세스 토큰:</span>
              {debugInfo.hasAccessToken ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>API 버전:</span>
              <Badge variant="outline" className="text-xs">{debugInfo.kakaoVersion}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>세션 백업:</span>
              {debugInfo.hasSessionBackup ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          {debugInfo.hasSessionBackup && (
            <div className="text-xs text-gray-500 mt-2">
              백업 시간: {debugInfo.sessionBackupTime}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-2">
          <h3 className="font-medium">테스트 액션</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleCheckPermission}
              disabled={isChecking || isLoading}
              variant="outline"
              size="sm"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              권한 확인
            </Button>
            <Button
              onClick={handleRequestPermission}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              권한 요청
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleBackupSession}
              variant="outline"
              size="sm"
            >
              세션 백업
            </Button>
            <Button
              onClick={handleRestoreSession}
              disabled={!sessionBackup}
              variant="outline"
              size="sm"
            >
              세션 복구
            </Button>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">디버그 안내</p>
              <ul className="text-xs text-blue-800 mt-1 space-y-1">
                <li>• 이 컴포넌트는 개발 환경에서만 사용하세요</li>
                <li>• 카카오 SDK 로드 상태와 권한 상태를 확인할 수 있습니다</li>
                <li>• 권한 확인이 실패하면 서버 사이드로 대체됩니다</li>
                <li>• 실제 권한 요청은 카카오 로그인 창이 열립니다</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
