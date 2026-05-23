import { NextResponse } from 'next/server';
import { getDynamicConfig } from '../../../actions/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return new NextResponse('Missing itemId', { status: 400 });
    }

    const { embyUrl, embyApiKey } = await getDynamicConfig();

    // Construct the secure authenticated URL in the backend
    const embyImageUrl = `${embyUrl}/emby/Items/${itemId}/Images/Primary?X-Emby-Token=${embyApiKey}`;

    const response = await fetch(embyImageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      return new NextResponse('Image not found or access denied', { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();

    // Pass the image directly back to the client without revealing the Emby URL
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
      }
    });
  } catch (error) {
    console.error('Proxy Image Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
