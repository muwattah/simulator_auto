import * as THREE from 'three';
export function makeCheckerPlateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#89939b'; ctx.fillRect(0, 0, 256, 256);
  for (let x = -20; x < 280; x += 26) for (let y = -20; y < 280; y += 30) {
    ctx.save(); ctx.translate(x + (Math.floor(y / 30) % 2 ? 13 : 0), y); ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#d0d7dc'; ctx.fillRect(-9, -2.5, 18, 4);
    ctx.fillStyle = '#59656e'; ctx.fillRect(-9, 2, 18, 1.5); ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(5, 7);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
  return texture;
}

