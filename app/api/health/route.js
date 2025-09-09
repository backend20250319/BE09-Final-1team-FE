// 백엔드 연결 상태 확인 API
export async function GET() {
  try {
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/health`;
    
    console.log('🔍 백엔드 헬스 체크 요청:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 5초 타임아웃
      signal: AbortSignal.timeout(5000)
    });

    const isHealthy = response.ok;
    const status = response.status;
    
    console.log('📡 백엔드 헬스 체크 응답:', { 
      isHealthy, 
      status, 
      statusText: response.statusText 
    });

    return Response.json({
      success: true,
      backend: {
        url: backendUrl,
        healthy: isHealthy,
        status: status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      },
      frontend: {
        healthy: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 백엔드 헬스 체크 실패:', error);
    
    return Response.json({
      success: false,
      backend: {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      frontend: {
        healthy: true,
        timestamp: new Date().toISOString()
      }
    }, { status: 503 });
  }
}
