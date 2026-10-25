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
