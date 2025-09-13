/**
 * 중앙화된 API 클라이언트
 * 모든 API 요청을 통합 관리하고 일관된 에러 처리 제공
 */

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 기본 HTTP 요청 메서드
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // 쿠키 자동 전송
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(
          `API Error: ${response.status} ${response.statusText}`,
          response.status,
          errorText
        );
      }

      const contentType = response.headers.get('content-type');
      
      // JSON 응답 처리
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return data;
      }
      
      // 텍스트 응답 처리
      if (contentType?.includes('text/')) {
        return response.text() as T;
      }
      
      // 기타 응답 처리
      return response as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // 네트워크 오류 등
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * GET 요청
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search, {
      method: 'GET',
    });
  }

  /**
   * POST 요청
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * PATCH 요청
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * 인증 토큰 설정
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * 인증 토큰 제거
   */
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * 기본 헤더 설정
   */
  setDefaultHeader(key: string, value: string) {
    this.defaultHeaders[key] = value;
  }

  /**
   * 기본 헤더 제거
   */
  removeDefaultHeader(key: string) {
    delete this.defaultHeaders[key];
  }
}

// API 에러 클래스
class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();
export { ApiError };
export type { ApiResponse };
