import type { DetailingConfiguration, LayoutResult } from '../types';
import { getProduct, getVehicleCategory } from '../data/detailingCatalog';

/**
 * Two-dimensional image fallback for browsers without WebGL or when GPU capture fails.
 * A truthful schematic (rather than a fabricated photorealistic product picture).
 */
export function createConfigurationFallbackImage(
  configuration: DetailingConfiguration,
  layout: LayoutResult,
): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1120;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const { width, height } = canvas;

    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#202832');
    background.addColorStop(1, '#0e141b');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.font = '700 24px system-ui, sans-serif';
    ctx.fillStyle = '#57c6f5';
    ctx.fillText('RS CAR DETAILING', 58, 67);
    ctx.font = '600 36px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('JOUW MOBIELE INSTALLATIE', 58, 125);
    ctx.fillStyle = '#a9b8c6';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('2D schematische visualisatie — werkelijke plaatsing wordt gecontroleerd', 58, 162);

    const floorX = 65, floorY = 240, floorW = 600, floorH = 410;
    ctx.fillStyle = '#111922';
    ctx.strokeStyle = '#73808d';
    ctx.lineWidth = 6;
    ctx.fillRect(floorX, floorY, floorW, floorH);
    ctx.strokeRect(floorX, floorY, floorW, floorH);
    ctx.strokeStyle = '#394655';
    ctx.lineWidth = 1;
    for (let x = floorX + 45; x < floorX + floorW; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x, floorY + floorH); ctx.stroke();
    }
    for (let y = floorY + 45; y < floorY + floorH; y += 45) {
      ctx.beginPath(); ctx.moveTo(floorX, y); ctx.lineTo(floorX + floorW, y); ctx.stroke();
    }
    ctx.fillStyle = '#a9b8c6';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText('VOORZIJDE', floorX + 12, floorY - 14);
    ctx.fillText('ACHTER / TOEGANG', floorX + 12, floorY + floorH + 25);

    const palette = ['#e2e8f0', '#7dd3fc', '#fbba5a', '#82d7b6', '#b0b7ec'];
    const columnWidth = 180;
    const chosen = layout.placements.slice(0, 15);
    for (const [index, item] of chosen.entries()) {
      const product = getProduct(item.productId);
      const col = index % 3, row = Math.floor(index / 3);
      const x = floorX + 18 + col * (columnWidth + 10);
      const y = floorY + 24 + row * 75;
      ctx.fillStyle = palette[index % palette.length];
      ctx.globalAlpha = 0.88;
      ctx.fillRect(x, y, columnWidth, 58);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#101821';
      ctx.font = '600 14px system-ui, sans-serif';
      const label = product?.name || item.productId;
      ctx.fillText(label.length > 22 ? label.slice(0, 20) + '…' : label, x + 9, y + 32);
    }

    const selected = [
      getProduct(configuration.tankId)?.name,
      getProduct(configuration.pressureWasherId)?.name,
      getProduct(configuration.compressorId)?.name,
      getProduct(configuration.generatorId)?.name,
      getProduct(configuration.vacuumId)?.name,
      getProduct(configuration.frameComboId)?.name,
    ].filter(Boolean) as string[];
    const vehicle = getVehicleCategory(configuration.vehicleCategory);
    ctx.fillStyle = '#263543';
    ctx.fillRect(695, 220, 365, 440);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 23px system-ui, sans-serif';
    ctx.fillText(vehicle?.name || 'Configuratie', 718, 261);
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillStyle = '#57c6f5';
    ctx.fillText('GEKOZEN ONDERDELEN', 718, 303);
    ctx.fillStyle = '#e5ebf0';
    ctx.font = '16px system-ui, sans-serif';
    selected.slice(0, 9).forEach((name, i) => {
      const line = name.length > 34 ? name.slice(0, 32) + '…' : name;
      ctx.fillText('• ' + line, 718, 344 + i * 42);
    });
    ctx.fillStyle = '#8c9cac';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Indicatieve weergave · geen technische bouwtekening', 58, 695);

    return canvas.toDataURL('image/jpeg', 0.78);
  } catch {
    return null;
  }
}

/**
 * Mail-ready composition: actual 3D view next to a compact equipment legend.
 * No external image service, logos or invented details. The customer sees this exact image.
 */
export async function composeConfigurationPreviewImage(
  sceneDataUrl: string,
  configuration: DetailingConfiguration,
  layout: LayoutResult,
): Promise<string | null> {
  try {
    const source = new Image();
    source.src = sceneDataUrl;
    await source.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 820;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, '#2b333d');
    bg.addColorStop(1, '#111820');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#61c7f3';
    ctx.font = '700 20px system-ui, sans-serif';
    ctx.fillText('RS CAR DETAILING', 42, 51);
    ctx.fillStyle = '#f9fafb';
    ctx.font = '700 31px system-ui, sans-serif';
    ctx.fillText('JOUW MOBIELE INSTALLATIE', 42, 103);

    const leftX = 28, topY = 137, leftW = 825, sceneH = 618;
    // Crop like a professional product photo instead of distorting the rendered scene.
    const zoom = Math.max(leftW / source.width, sceneH / source.height);
    const cropW = leftW / zoom, cropH = sceneH / zoom;
    const sx = (source.width - cropW) / 2, sy = (source.height - cropH) / 2;
    ctx.drawImage(source, sx, sy, cropW, cropH, leftX, topY, leftW, sceneH);
    ctx.strokeStyle = '#586573';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX, topY, leftW, sceneH);

    const panelX = 881, panelY = 137, panelW = 369;
    ctx.fillStyle = 'rgba(12, 18, 25, 0.95)';
    ctx.fillRect(panelX, panelY, panelW, sceneH);
    ctx.strokeStyle = '#3b4a59';
    ctx.strokeRect(panelX, panelY, panelW, sceneH);

    const vehicle = getVehicleCategory(configuration.vehicleCategory);
    ctx.fillStyle = '#69d0fb';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillText('VOERTUIG', panelX + 24, panelY + 38);
    ctx.fillStyle = '#eff5fa';
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillText(vehicle?.name || 'Werkbusinstallatie', panelX + 24, panelY + 66);
    ctx.fillStyle = '#99aabd';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillText('GESELECTEERDE ONDERDELEN', panelX + 24, panelY + 111);

    const allParts: string[] = layout.placements
      .map(item => getProduct(item.productId)?.name || item.productId);
    const selectedLining = getProduct(configuration.liningId);
    if (selectedLining && selectedLining.id !== 'lining_none') allParts.push(selectedLining.name);
    if (configuration.floatValve === true) allParts.push('Vlotter op watertank');
    if (configuration.installationType === 'installed') allParts.push('Montage door RS Car Detailing');
    if (configuration.installationType === 'pickup') allParts.push('Zelfmontage / ophaalpakket');
    const textMaxWidth = panelW - 70;
    let y = panelY + 146;
    // Responsive to the number of selected elements; no entries are intentionally omitted.
    const lineSpacing = allParts.length > 15 ? 23 : allParts.length > 11 ? 28 : 36;
    const fontSize = allParts.length > 15 ? 12 : allParts.length > 11 ? 13 : 15;
    for (const name of allParts) {
      ctx.font = `500 ${fontSize}px system-ui, sans-serif`;
      let label = name;
      while (label.length > 5 && ctx.measureText(label).width > textMaxWidth) {
        label = label.slice(0, -2);
      }
      if (label !== name) label += '…';
      ctx.fillStyle = '#57c6f5';
      ctx.fillText('✓', panelX + 24, y);
      ctx.fillStyle = '#e5edf4';
      ctx.fillText(label, panelX + 47, y);
      y += lineSpacing;
    }

    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#9eabb9';
    ctx.fillText('Indicatieve 3D-visualisatie · montage na controle', 42, 794);
    return canvas.toDataURL('image/jpeg', 0.80);
  } catch {
    return null;
  }
}
