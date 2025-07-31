/**
 * 관심사 관리 탭 컴포넌트
 * - 관심 분야 선택/해제 기능
 * - 선택된 관심사 목록 표시
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

export default function InterestsTab() {
  const [selectedInterests, setSelectedInterests] = useState([
    "정치",
    "경제",
    "IT/과학",
  ]);

  // 관심사 카테고리 목록
  const interests = [
    { id: "politics", label: "정치", icon: "🏛️" },
    { id: "economy", label: "경제", icon: "💰" },
    { id: "society", label: "사회", icon: "👥" },
    { id: "it", label: "IT/과학", icon: "💻" },
    { id: "sports", label: "스포츠", icon: "⚽" },
    { id: "culture", label: "문화", icon: "🎭" },
    { id: "international", label: "국제", icon: "🌍" },
    { id: "entertainment", label: "연예", icon: "🎬" },
  ];

  /**
   * 관심사 선택/해제 토글 함수
   * @param {string} interest - 선택/해제할 관심사 라벨
   */
  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="space-y-6">
      {/* 관심 분야 선택 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            관심 분야 설정
          </CardTitle>
          <CardDescription>
            관심 있는 분야를 선택하면 맞춤 뉴스를 제공받을 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 관심사 선택 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {interests.map((interest) => (
              <div
                key={interest.id}
                onClick={() => toggleInterest(interest.label)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedInterests.includes(interest.label)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{interest.icon}</div>
                  <div className="text-sm font-medium">{interest.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 관심사 저장 버튼 */}
          <div className="mt-6">
            <Button>관심사 저장</Button>
          </div>
        </CardContent>
      </Card>

      {/* 선택된 관심사 표시 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>선택된 관심사</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <Badge key={interest} variant="default" className="px-3 py-1">
                {interest}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
