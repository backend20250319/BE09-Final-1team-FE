// 더미 데이터 - 백엔드 서버가 연결되지 않을 때 사용

export const dummyUserData = {
  success: true,
  data: {
    id: 1,
    name: "테스트 사용자",
    email: "test@example.com",
    profileImageUrl: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    letterOk: true,
    hobbies: [1, 2], // 관심사 ID 배열
    role: "user"
  }
};

export const dummyCategories = {
  success: true,
  data: [
    { id: 1, name: "정치", description: "정치 관련 뉴스" },
    { id: 2, name: "경제", description: "경제 관련 뉴스" },
    { id: 3, name: "사회", description: "사회 관련 뉴스" },
    { id: 4, name: "국제", description: "국제 관련 뉴스" },
    { id: 5, name: "문화", description: "문화 관련 뉴스" },
    { id: 6, name: "스포츠", description: "스포츠 관련 뉴스" },
    { id: 7, name: "기술", description: "기술 관련 뉴스" },
    { id: 8, name: "건강", description: "건강 관련 뉴스" }
  ]
};

// 더미 API 응답을 시뮬레이션하는 함수
export const createDummyResponse = (data) => {
  return {
    ok: true,
    status: 200,
    json: async () => data
  };
};
