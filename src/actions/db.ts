import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'applied_overlays.json');

export function getAppliedOverlays(): Record<string, string> {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading applied_overlays.json:', error);
  }
  return {};
}

export function saveAppliedOverlay(embyItemId: string, overlayType: string | null) {
  try {
    const overlays = getAppliedOverlays();
    if (overlayType && overlayType !== 'Sin Overlay') {
      overlays[embyItemId] = overlayType;
    } else {
      delete overlays[embyItemId];
    }
    fs.writeFileSync(dbPath, JSON.stringify(overlays, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing applied_overlays.json:', error);
  }
}
