"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Star, 
  Zap, 
  Shield, 
  X,
  CheckCircle,
  Lock,
  Unlock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SERVICE_LEVELS, getServiceLevelIcon, getServiceLevelColor } from "@/lib/utils/serviceLevels";

/**
 * 서비스 레벨별 업그레이드 프롬프트 컴포넌트
 */
export default function ServiceLevelUpgradePrompt({ 
  serviceLevel, 
  onUpgrade, 
  onDismiss,
  className = "" 
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  if (isDismissed || serviceLevel === SERVICE_LEVELS.PERSONALIZED) {
    return null;
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade(serviceLevel);
    } else {
      // 기본 업그레이드 동작
      if (serviceLevel === SERVICE_LEVELS.PUBLIC) {
        window.location.href = '/auth';
      } else if (serviceLevel === SERVICE_LEVELS.AUTHENTICATED_BASIC) {
        // 구독 모달 열기 또는 구독 페이지로 이동
        toast({
          title: "구독 기능",
          description: "구독 기능을 준비 중입니다.",
        });
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss(serviceLevel);
    }
  };

  const getUpgradeContent = () => {
    switch (serviceLevel) {
      case SERVICE_LEVELS.PUBLIC:
        return {
          title: "🔐 로그인하면 더 많은 뉴스를 받아보세요!",
          description: "로그인하시면 관심사 기반 맞춤 뉴스와 더 많은 콘텐츠를 받아보실 수 있어요.",
          buttonText: "로그인하기",
          buttonIcon: <Unlock className="w-4 h-4" />,
          features: [
            "더 많은 뉴스 제공",
            "관심사 기반 맞춤 뉴스",
            "구독 관리 기능",
            "개인화 준비"
          ],
          color: "blue"
        };
      case SERVICE_LEVELS.AUTHENTICATED_BASIC:
        return {
          title: "🎯 관심 카테고리를 구독해보세요!",
          description: "관심 카테고리를 구독하면 맞춤 뉴스와 AI 추천을 받아보실 수 있어요.",
          buttonText: "카테고리 구독하기",
          buttonIcon: <Star className="w-4 h-4" />,
          features: [
            "완전 개인화된 뉴스",
            "AI 맞춤 추천",
            "읽기 패턴 분석",
            "맞춤 통계 제공"
          ],
          color: "green"
        };
      default:
        return null;
    }
  };

  const content = getUpgradeContent();
  if (!content) return null;

  return (
    <Card className={`border-l-4 border-l-${content.color}-500 bg-gradient-to-r from-${content.color}-50 to-white ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-${content.color}-100 flex items-center justify-center`}>
              {getServiceLevelIcon(serviceLevel)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {content.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {content.description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* 기능 목록 */}
          <div className="grid grid-cols-2 gap-2">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          {/* 업그레이드 버튼 */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {serviceLevel === SERVICE_LEVELS.PUBLIC ? "무료" : "프리미엄"}
              </Badge>
              <span className="text-xs text-gray-500">
                {serviceLevel === SERVICE_LEVELS.PUBLIC ? "로그인 필요" : "구독 필요"}
              </span>
            </div>
            
            <Button
              onClick={handleUpgrade}
              className={`bg-${content.color}-600 hover:bg-${content.color}-700 text-white`}
              size="sm"
            >
              {content.buttonIcon}
              <span className="ml-2">{content.buttonText}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 서비스 레벨 표시 컴포넌트
 */
export function ServiceLevelBadge({ serviceLevel, className = "" }) {
  const icon = getServiceLevelIcon(serviceLevel);
  const color = getServiceLevelColor(serviceLevel);
  
  const getLevelName = () => {
    switch (serviceLevel) {
      case SERVICE_LEVELS.PUBLIC:
        return "공개";
      case SERVICE_LEVELS.AUTHENTICATED_BASIC:
        return "로그인";
      case SERVICE_LEVELS.PERSONALIZED:
        return "개인화";
      default:
        return "알 수 없음";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`border-${color}-200 text-${color}-700 bg-${color}-50 ${className}`}
    >
      <span className="mr-1">{icon}</span>
      {getLevelName()}
    </Badge>
  );
}

/**
 * 서비스 레벨별 기능 비교 컴포넌트
 */
export function ServiceLevelComparison({ currentLevel, className = "" }) {
  const levels = [
    SERVICE_LEVELS.PUBLIC,
    SERVICE_LEVELS.AUTHENTICATED_BASIC,
    SERVICE_LEVELS.PERSONALIZED
  ];

  const getLevelInfo = (level) => {
    switch (level) {
      case SERVICE_LEVELS.PUBLIC:
        return {
          name: "공개",
          icon: "📰",
          color: "gray",
          features: ["기본 뉴스", "트렌딩 키워드"]
        };
      case SERVICE_LEVELS.AUTHENTICATED_BASIC:
        return {
          name: "로그인",
          icon: "🔐",
          color: "blue",
          features: ["확장 뉴스", "구독 관리", "개인화 준비"]
        };
      case SERVICE_LEVELS.PERSONALIZED:
        return {
          name: "개인화",
          icon: "🎯",
          color: "green",
          features: ["완전 개인화", "AI 추천", "맞춤 통계"]
        };
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700">서비스 레벨 비교</h3>
      <div className="grid grid-cols-3 gap-2">
        {levels.map((level) => {
          const info = getLevelInfo(level);
          if (!info) return null;
          
          const isCurrent = level === currentLevel;
          const isUnlocked = level === currentLevel || 
            (currentLevel === SERVICE_LEVELS.AUTHENTICATED_BASIC && level === SERVICE_LEVELS.PERSONALIZED);
          
          return (
            <div
              key={level}
              className={`p-3 rounded-lg border-2 ${
                isCurrent 
                  ? `border-${info.color}-500 bg-${info.color}-50` 
                  : isUnlocked
                  ? `border-${info.color}-200 bg-${info.color}-25`
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className={`text-xs font-medium ${
                  isCurrent ? `text-${info.color}-700` : 'text-gray-600'
                }`}>
                  {info.name}
                </div>
                {isCurrent && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    현재
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
