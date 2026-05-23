import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { getDynamicConfig } from '../../../actions/config';
import { saveAppliedOverlay } from '../../../actions/db';

export async function POST(req: Request) {
  try {
    const { tmdbPosterUrl, overlayType, embyItemId } = await req.json();

    if (!tmdbPosterUrl) {
      return NextResponse.json({ error: 'tmdbPosterUrl is required' }, { status: 400 });
    }

    if (!embyItemId) {
      return NextResponse.json({ error: 'embyItemId is required to update Emby' }, { status: 400 });
    }

    // 1. Download Base Poster
    let baseImageBuffer: Buffer;
    let fetchUrl = tmdbPosterUrl;
    
    const { embyUrl, embyApiKey } = await getDynamicConfig();

    // Si la URL es relativa (ej: el proxy local de Emby), atacamos directo a Emby
    if (tmdbPosterUrl.startsWith('/')) {
      fetchUrl = `${embyUrl}/emby/Items/${embyItemId}/Images/Primary`;
    }

    const resp = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!resp.ok) throw new Error(`Failed to fetch remote poster: ${resp.status}`);
    const arrayBuffer = await resp.arrayBuffer();
    baseImageBuffer = Buffer.from(arrayBuffer);

    // 2. Resize base poster to exactly 1000x1500 px
    let sharpInstance = sharp(baseImageBuffer).resize(1000, 1500, {
      fit: 'cover',
    });

    // 3. Composite Overlay if provided and not "Sin Overlay"
    if (overlayType && overlayType !== "Sin Overlay") {
      const cleanName = overlayType
        .toLowerCase()
        .replace(/ with /g, "-")
        .replace(/ and /g, "-")
        .replace(/\s+/g, "-");
      
      const overlayPath = path.join(process.cwd(), 'public', 'overlays', `${cleanName}.png`);
      
      if (fs.existsSync(overlayPath)) {
        // Forzamos el ancho a exactamente 1000px, dejando que el alto fluya proporcionalmente.
        // Esto asegura que si es un banner o una capa 1000x1500, se expanda al borde perfecto.
        const overlayBuffer = await sharp(overlayPath).resize({ width: 1000 }).toBuffer();
        
        sharpInstance = sharpInstance.composite([
          { input: overlayBuffer, top: 0, left: 0 }
        ]);
      } else {
        console.warn(`Overlay file not found: ${overlayPath}`);
      }
    }

    // Generate Final Output in JPEG format
    const finalBuffer = await sharpInstance.jpeg({ quality: 90 }).toBuffer();
    const base64Image = finalBuffer.toString('base64');

    // 4. Send the result to Emby Server API
    try {
      const embyResponse = await fetch(`${embyUrl}/emby/Items/${embyItemId}/Images/Primary`, {
        method: 'POST',
        headers: {
          'X-Emby-Token': embyApiKey,
          'Content-Type': 'image/jpeg',
        },
        body: base64Image
      });

      if (!embyResponse.ok) {
        const errorText = await embyResponse.text();
        console.error(`Emby API Error: ${embyResponse.status} - ${errorText}`);
        try { fs.writeFileSync(path.join(process.cwd(), 'error.log'), `Emby API Error: ${embyResponse.status} - ${errorText}`); } catch(e) {}
        return NextResponse.json({ error: "Failed to upload to Emby" }, { status: 500 });
      }

      // Save overlay status in the local DB
      saveAppliedOverlay(embyItemId, overlayType);

      // Success
      return NextResponse.json({ 
        success: true, 
        message: 'Image processed and sent to Emby successfully'
      });

    } catch (embyFetchError) {
      console.warn("Emby server unreachable.", embyFetchError);
      return NextResponse.json({ error: "Emby server unreachable" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Image processing error:", error);
    try {
      fs.writeFileSync(path.join(process.cwd(), 'error.log'), error.stack || error.toString());
    } catch(e) {}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
