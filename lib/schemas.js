import { z } from "zod";

// 카테고리 ID enum (백엔드 Category enum과 1:1 매칭)
export const CategoryId = z.enum([
  "POLITICS",
  "ECONOMY",
  "SOCIETY",
  "LIFE",
  "INTERNATIONAL",
  "IT_SCIENCE",
  "VEHICLE",
  "TRAVEL_FOOD",
  "ART",
]);

// 카테고리 객체 스키마
export const CategorySchema = z.object({
  id: CategoryId,
  categoryName: z.string(),
  icon: z.string(),
});

// 카테고리 목록 응답 스키마
export const CategoriesResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.array(CategorySchema),
});

// 강화된 비밀번호 스키마
export const PasswordSchema = z
  .string()
  .min(10, "비밀번호는 최소 10자 이상이어야 합니다")
  .regex(/[a-zA-Z]/, "영문자를 포함해야 합니다")
  .regex(/\d/, "숫자를 포함해야 합니다")
  .regex(/[@$!%*?&]/, "특수문자(@$!%*?&)를 포함해야 합니다");

// 회원가입 요청 스키마
export const SignupRequestSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: PasswordSchema,
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  gender: z.enum(["MALE", "FEMALE"]),
  hobbies: z.array(CategoryId).max(3, "관심사는 최대 3개까지 선택 가능합니다"),
  deviceId: z.string().uuid("올바른 디바이스 ID 형식이 아닙니다").optional(),
});

// 회원가입 응답 스키마
export const SignupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      userId: z.number().optional(),
      email: z.string().optional(),
    })
    .optional(),
});

// 로그인 요청 스키마
export const LoginRequestSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
  deviceId: z.string().uuid("올바른 디바이스 ID 형식이 아닙니다").optional(),
});

// 로그인 응답 스키마
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
      user: z
        .object({
          id: z.number(),
          email: z.string(),
          name: z.string(),
          role: z.enum(["USER", "ADMIN"]).optional(),
        })
        .optional(),
    })
    .optional(),
});

// 뉴스레터 구독 요청 스키마
export const NewsletterSubscriptionSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
});

// 뉴스레터 구독 응답 스키마
export const NewsletterSubscriptionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// 뉴스 아이템 스키마
export const NewsItemSchema = z.object({
  newsId: z.string(),
  title: z.string(),
  content: z.string().optional(),
  category: z.string(),
  source: z.string().optional(),
  sourceLogo: z.string().optional(),
  url: z.string().optional(),
  imageUrl: z.string().optional(),
  publishedAt: z.string().optional(),
  views: z.number().optional(),
  tags: z.array(z.string()).optional(),
  reporter: z
    .object({
      name: z.string(),
      email: z.string().optional(),
      avatar: z.string().optional(),
    })
    .optional(),
  dedupState: z.string().optional(),
  dedupStateDescription: z.string().optional(),
});

// 뉴스 목록 응답 스키마
export const NewsListResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z
    .object({
      content: z.array(NewsItemSchema),
      totalElements: z.number(),
      totalPages: z.number(),
      currentPage: z.number(),
      size: z.number(),
      first: z.boolean(),
      last: z.boolean(),
    })
    .optional(),
});

// 사용자 프로필 스키마
export const UserProfileSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  birthYear: z.number().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  hobbies: z.array(CategoryId).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// 사용자 프로필 응답 스키마
export const UserProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: UserProfileSchema.optional(),
});

// 에러 응답 스키마
export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
  status: z.number().optional(),
});

// 날씨 데이터 스키마
export const WeatherDataSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
  city: z.string(),
});

// 날씨 응답 스키마
export const WeatherResponseSchema = z.object({
  success: z.boolean(),
  data: WeatherDataSchema.optional(),
  message: z.string().optional(),
});

// AI 요약 응답 스키마
export const AiSummaryResponseSchema = z.object({
  success: z.boolean(),
  summary_text: z.string(),
  message: z.string().optional(),
});

// 검색 제안 스키마
export const SearchSuggestionSchema = z.object({
  keyword: z.string(),
  count: z.number().optional(),
});

// 검색 제안 응답 스키마
export const SearchSuggestionsResponseSchema = z.object({
  content: z.array(SearchSuggestionSchema),
  totalElements: z.number().optional(),
});

// 트렌딩 키워드 스키마
export const TrendingKeywordSchema = z.object({
  keyword: z.string(),
  rank: z.number(),
  diff: z.number(),
});

// 트렌딩 키워드 응답 스키마
export const TrendingKeywordsResponseSchema = z.object({
  keywords: z.array(TrendingKeywordSchema),
  period: z.string().optional(),
});

// 소셜 로그인 후 추가 정보 입력 요청 스키마
export const AdditionalInfoRequestSchema = z.object({
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  gender: z.enum(["MALE", "FEMALE"], {
    required_error: "성별을 선택해주세요.",
  }),
  hobbies: z.array(CategoryId).max(3, "관심사는 최대 3개까지 선택 가능합니다"),
  deviceId: z.string().uuid("올바른 디바이스 ID 형식이 아닙니다").optional(),
});

// 소셜 로그인 추가 정보 응답 스키마
export const AdditionalInfoResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      accessToken: z.string(),
      refreshToken: z.string(),
      user: z
        .object({
          id: z.number(),
          email: z.string(),
          name: z.string(),
        })
        .optional(),
    })
    .optional(),
});

// 컬렉션 스키마
export const CollectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  userId: z.number(),
  newsCount: z.number().optional(), // 컬렉션에 포함된 뉴스 개수
});

// 컬렉션 생성 요청 스키마
export const CollectionCreateRequestSchema = z.object({
  name: z.string().min(1, "컬렉션 이름을 입력해주세요."),
});

// 컬렉션 목록 응답 스키마
export const CollectionsResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.array(CollectionSchema),
});

// 컬렉션에 뉴스 추가 요청 스키마
export const AddNewsToCollectionRequestSchema = z.object({
  newsId: z.string(),
});
