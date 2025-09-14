"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Info,
  Star,
  Zap,
  Shield
} from "lucide-react";
import { 
  SERVICE_LEVELS, 
  getServiceLevelIcon, 
  getServiceLevelColor,
  getServiceLevelFeatures,
  getSubscriptionBenefits,
  getAIRecommendations
} from "@/lib/utils/serviceLevels";

/**
 * 서비스 레벨 표시기 컴포넌트
 */
export default function ServiceLevelIndicator({ 
  serviceLevel, 
  userInfo = null,
  onUpgrade = null,
  className = "" 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // 로컬 스토리지에서 닫힌 상태 확인
  useEffect(() => {
    const dismissed = localStorage.getItem(`service-level-${serviceLevel}-dismissed`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [serviceLevel]);

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`service-level-${serviceLevel}-dismissed`, 'true');
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade(serviceLevel);
    }
  };

  const icon = getServiceLevelIcon(serviceLevel);
  const color = getServiceLevelColor(serviceLevel);
  const features = getServiceLevelFeatures(serviceLevel);
  const benefits = getSubscriptionBenefits(serviceLevel);
  const aiRecommendations = getAIRecommendations(serviceLevel);

  const getLevelTitle = () => {
    switch (serviceLevel) {
      case SERVICE_LEVELS.PUBLIC:
        return "공개 사용자";
      case SERVICE_LEVELS.AUTHENTICATED_BASIC:
        return "로그인 사용자";
      case SERVICE_LEVELS.PERSONALIZED:
        return "개인화 사용자";
      default:
        return "알 수 없음";
    }
  };

  const getLevelDescription = () => {
    switch (serviceLevel) {
      case SERVICE_LEVELS.PUBLIC:
        return "기본 뉴스와 트렌딩 키워드를 제공합니다";
      case SERVICE_LEVELS.AUTHENTICATED_BASIC:
        return "확장된 뉴스와 구독 관리 기능을 제공합니다";
      case SERVICE_LEVELS.PERSONALIZED:
        return "완전 개인화된 뉴스와 AI 추천을 제공합니다";
      default:
        return "뉴스를 제공합니다";
    }
  };

  const getUpgradeButton = () => {
    if (serviceLevel === SERVICE_LEVELS.PERSONALIZED) {
      return null;
    }

    const buttonText = serviceLevel === SERVICE_LEVELS.PUBLIC ? "로그인하기" : "구독하기";
    const buttonIcon = serviceLevel === SERVICE_LEVELS.PUBLIC ? <Shield className="w-4 h-4" /> : <Star className="w-4 h-4" />;

    return (
      <Button
        onClick={handleUpgrade}
        size="sm"
        className={`bg-${color}-600 hover:bg-${color}-700 text-white`}
      >
        {buttonIcon}
        <span className="ml-2">{buttonText}</span>
      </Button>
    );
  };

  return (
    <Card className={`border-l-4 border-l-${color}-500 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
              <span className="text-lg">{icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{getLevelTitle()}</h3>
                <Badge variant="outline" className={`text-${color}-700 border-${color}-200`}>
                  {serviceLevel}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{getLevelDescription()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getUpgradeButton()}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* 기능 목록 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                제공 기능
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {features.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 제한사항 */}
            {features.limitations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  제한사항
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {features.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 구독 혜택 */}
            {benefits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  구독 혜택
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI 추천 정보 */}
            {aiRecommendations && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  AI 추천
                </h4>
                <p className="text-sm text-gray-600 mb-2">{aiRecommendations.message}</p>
                <div className="grid grid-cols-2 gap-2">
                  {aiRecommendations.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 닫기 버튼 */}
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600"
              >
                이 알림 닫기
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 간단한 서비스 레벨 배지
 */
export function SimpleServiceLevelBadge({ serviceLevel, className = "" }) {
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
