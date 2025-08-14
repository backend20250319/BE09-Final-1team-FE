import { z } from "zod";

// 카테고리 ID enum (백엔드 Category enum과 1:1 매칭)
export const CategoryId = z.enum([
  "POLITICS",
  "ECONOMY", 
  "SOCIETY",
  "CULTURE",
  "INTERNATIONAL",
  "IT_SCIENCE",
  "VEHICLE",
  "TRAVEL_FOOD",
  "ART"
]);

// 카테고리 객체 스키마
export const CategorySchema = z.object({
  id: CategoryId,
  categoryName: z.string(),
  icon: z.string()
});

// 카테고리 목록 응답 스키마
export const CategoriesResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.array(CategorySchema),
});

// 회원가입 요청 스키마
export const SignupRequestSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  gender: z.enum(["MALE", "FEMALE"]),
  hobbies: z.array(CategoryId).max(3, "관심사는 최대 3개까지 선택 가능합니다")
});

// 회원가입 응답 스키마
export const SignupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    userId: z.number().optional(),
    email: z.string().optional()
  }).optional()
});

// 뉴스레터 구독 요청 스키마
export const NewsletterSubscriptionSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다")
});

// 뉴스레터 구독 응답 스키마
export const NewsletterSubscriptionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional()
});
