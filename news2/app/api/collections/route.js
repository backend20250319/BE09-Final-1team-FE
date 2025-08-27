import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/api-url';

// app/api/collections/route.js
/**
 * @swagger
 * /api/collections:
 *   get:
 *     summary: Get all collections for the user
 *     description: Retrieves all news collections for the authenticated user by proxying the backend.
 *     responses:
 *       200:
 *         description: Successfully retrieved collections.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request) {
  const authToken = request.headers.get('Authorization');

  if (!authToken) {
    return NextResponse.json({ success: false, message: 'Authorization header is required.' }, { status: 401 });
  }

  try {
    const response = await fetch(apiUrl('/api/news/collections'), {
      method: 'GET',
      headers: {
        'Authorization': authToken,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, message: data.message || 'Failed to fetch collections' }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy Error (GET /api/collections):', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/collections:
 *   post:
 *     summary: Create a new collection
 *     description: Creates a new news collection by proxying the backend.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Collection created successfully.
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized.
 */
export async function POST(request) {
  const authToken = request.headers.get('Authorization');

  if (!authToken) {
    return NextResponse.json({ success: false, message: 'Authorization header is required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch(apiUrl('/api/news/collections'), {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy Error (POST /api/collections):', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}