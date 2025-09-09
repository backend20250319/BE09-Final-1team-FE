"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Clock, 
  Shield, 
  X, 
  CheckCircle,
  AlertCircle,
  Mail,
  Bell
} from "lucide-react";

export default function KakaoPermissionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onAlternative,
  category = "뉴스레터",
  isLoading = false 
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleAlternative = () => {
    onAlternative();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto bg-white shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            📱 카카오톡 뉴스레터 구독
          </CardTitle>
          <div className="text-gray-600 text-sm mt-2">
            매일 아침 7시에 <Badge variant="secondary" className="mx-1">{category}</Badge> 맞춤 뉴스를 
            카카오톡으로 보내드립니다.
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 혜택 설명 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">개인 맞춤 뉴스</p>
                <p className="text-xs text-gray-500">관심 카테고리별로 선별된 뉴스</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">매일 아침 7시</p>
                <p className="text-xs text-gray-500">일정한 시간에 편리하게 받아보기</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">언제든 해지 가능</p>
                <p className="text-xs text-gray-500">광고성 메시지 없음, 오직 뉴스만</p>
              </div>
            </div>
          </div>

          {/* 권한 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-blue-800 font-medium">권한이 필요한 이유</p>
                <p className="text-xs text-blue-700 mt-1">
                  카카오톡으로 뉴스레터를 전송하기 위해 메시지 전송 권한이 필요합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  권한 요청 중...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  카카오톡 권한 허용하기
                </div>
              )}
            </Button>
            
            <Button
              onClick={handleAlternative}
              variant="outline"
              className="w-full text-gray-600 hover:text-gray-800 py-3 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                이메일로 구독하기
              </div>
            </Button>
          </div>

          {/* 추가 정보 */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              권한은 언제든지 설정에서 변경할 수 있습니다
            </p>
          </div>
        </CardContent>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </Card>
    </div>
  );
}
