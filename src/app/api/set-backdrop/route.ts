import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getDynamicConfig } from '../../../actions/config';

export async function POST(req: Request) {
  try {
    const { embyItemId, tmdbBackdropUrl } = await req.json();

    if (!embyItemId || !tmdbBackdropUrl) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const { embyUrl, embyApiKey } = await getDynamicConfig();

    if (!embyUrl || !embyApiKey) {
      return new NextResponse('Emby config not found', { status: 500 });
    }

    // 1. Download Base Backdrop from TMDb
    const tmdbResp = await fetch(tmdbBackdropUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*'
      }
    });

    if (!tmdbResp.ok) {
      throw new Error('Failed to download backdrop from TMDb');
    }

    const arrayBuffer = await tmdbResp.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Convert to JPEG format and optimize using sharp (prevents corrupt uploads and optimizes size)
    const jpegBuffer = await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer();
    const base64Image = jpegBuffer.toString('base64');

    // 2. Upload to Emby as Backdrop/0
    // Note: Emby expects the image body to be sent as a Base64 string
    const embyResponse = await fetch(`${embyUrl}/emby/Items/${embyItemId}/Images/Backdrop/0`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': embyApiKey,
        'Content-Type': 'image/jpeg',
      },
      body: base64Image
    });

    if (!embyResponse.ok) {
      const errorText = await embyResponse.text();
      console.error('Emby Error Response:', embyResponse.status, errorText);
      throw new Error(`Emby Server responded with ${embyResponse.status}`);
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('API /set-backdrop error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
