import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/api-url';

/**
 * @swagger
 * /api/collections/{collectionId}/news:
 *   post:
 *     summary: Add news to a collection
 *     description: Adds a news item to a specific collection by proxying the backend.
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newsId:
 *                 type: string
 *     responses:
 *       200:
 *         description: News added successfully.
 */
export async function POST(request, { params }) {
  const authToken = request.headers.get('Authorization');
  const { collectionId } = params;
  const body = await request.json();
  const { newsId } = body;

  if (!authToken) {
    return NextResponse.json({ success: false, message: 'Authorization header is required.' }, { status: 401 });
  }

  if (!newsId) {
    return NextResponse.json({ success: false, message: 'newsId is required.' }, { status: 400 });
  }

  try {
    const response = await fetch(apiUrl(`/api/news/collections/${collectionId}/news`), {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newsId: newsId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ success: false, message: errorData.message || 'Failed to add news to collection' }, { status: response.status });
    }

    // 성공 시, 백엔드 응답 본문이 비어있을 수 있으므로 직접 성공 응답을 생성합니다.
    return NextResponse.json({ success: true, message: 'News added to collection successfully.' }, { status: 200 });

  } catch (error) {
    console.error(`Proxy Error (POST /api/collections/${collectionId}/news):`, error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}