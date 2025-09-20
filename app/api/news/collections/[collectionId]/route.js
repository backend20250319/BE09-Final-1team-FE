import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

export async function GET(request, { params }) {
  try {
    const { collectionId } = params;
    
    if (!collectionId) {
      return NextResponse.json({ 
        error: 'Collection ID is required' 
      }, { status: 400 });
    }

    console.log('🔍 Collection Detail API Debug:', {
      collectionId,
      originalUrl: request.url
    });

    // 게이트웨이를 통해 컬렉션 상세 조회
    const backendUrl = getApiUrl(`/api/news/collections/${collectionId}`);
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Collection Detail API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Backend Collection Detail API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend Collection Detail API 실패:', { 
        status: backendResponse.status, 
        statusText: backendResponse.statusText,
        errorText,
        url: backendUrl
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorText || `Backend API error (${backendResponse.status})`,
          status: backendResponse.status 
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ Backend Collection Detail 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Collection Detail API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { collectionId } = params;
    const body = await request.json();
    
    if (!collectionId) {
      return NextResponse.json({ 
        error: 'Collection ID is required' 
      }, { status: 400 });
    }

    console.log('🔍 Update Collection API Debug:', {
      collectionId,
      body,
      originalUrl: request.url
    });

    // 게이트웨이를 통해 컬렉션 수정
    const backendUrl = getApiUrl(`/api/news/collections/${collectionId}`);
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Update Collection API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(body),
    });

    console.log('📡 Backend Update Collection API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend Update Collection API 실패:', { 
        status: backendResponse.status, 
        statusText: backendResponse.statusText,
        errorText,
        url: backendUrl
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorText || `Backend API error (${backendResponse.status})`,
          status: backendResponse.status 
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ Backend Update Collection 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Update Collection API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { collectionId } = params;
    
    if (!collectionId) {
      return NextResponse.json({ 
        error: 'Collection ID is required' 
      }, { status: 400 });
    }

    console.log('🔍 Delete Collection API Debug:', {
      collectionId,
      originalUrl: request.url
    });

    // 게이트웨이를 통해 컬렉션 삭제
    const backendUrl = getApiUrl(`/api/news/collections/${collectionId}`);
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Delete Collection API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'DELETE',
      headers: headers,
    });

    console.log('📡 Backend Delete Collection API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend Delete Collection API 실패:', { 
        status: backendResponse.status, 
        statusText: backendResponse.statusText,
        errorText,
        url: backendUrl
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorText || `Backend API error (${backendResponse.status})`,
          status: backendResponse.status 
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ Backend Delete Collection 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Delete Collection API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
