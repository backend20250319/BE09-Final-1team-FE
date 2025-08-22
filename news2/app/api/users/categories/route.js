import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 백엔드 Category enum과 1:1 매칭되는 카테고리 목록
    const categories = [
      { id: "POLITICS", icon: "🏛️", categoryName: "정치" },
      { id: "ECONOMY", icon: "💰", categoryName: "경제" },
      { id: "SOCIETY", icon: "👥", categoryName: "사회" },
      { id: "CULTURE", icon: "🎭", categoryName: "생활" },
      { id: "INTERNATIONAL", icon: "🌍", categoryName: "세계" },
      { id: "IT_SCIENCE", icon: "💻", categoryName: "IT/과학" },
      { id: "VEHICLE", icon: "🚗", categoryName: "자동차/교통" },
      { id: "TRAVEL_FOOD", icon: "🧳", categoryName: "여행/음식" },
      { id: "ART", icon: "🎨", categoryName: "예술" },
    ];

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('카테고리 API 에러:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
