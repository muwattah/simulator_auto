import { presentationItems } from '../lib/doorMounts';
import { Component, lazy, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { computeLayout, getCargoSpace, collectProducts } from '../lib/layoutEngine';
import { setupParts } from '../lib/setupPresentation';
import { getProduct } from '../data/detailingCatalog';
import type { DetailingConfiguration, PlacedItem } from '../types';

const VanScene3D = lazy(() => import('../components/three/VanScene3D'));

class RenderBoundary extends Component<{ children: ReactNode; failed: () => void }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch() { this.props.failed(); }
  render() { return this.state.error ? null : this.props.children; }
}

// Render requests share one temporary context, even when a customer clicks twice.
let queue: Promise<unknown> = Promise.resolve();
let cached: { key: string; value: Promise<string | null> } | undefined;
function schedule(task: () => Promise<string | null>) {
  const result = queue.then(task, task);
  queue = result.catch(() => null);
  return result;
}

function render(config: DetailingConfiguration, productId?: string): Promise<string | null> {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    if (!gl) return Promise.resolve(null);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch { return Promise.resolve(null); }
  return new Promise(resolve => {
    const host = document.createElement('div');
    Object.assign(host.style, { position: 'fixed', left: '-12000px', top: '0', width: productId ? '512px' : '1100px', height: productId ? '400px' : '850px', pointerEvents: 'none' });
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
    const root = createRoot(host);
    let finished = false;
    let capture: (() => string | null) | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (value: string | null) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      const canvas = host.querySelector('canvas');
      // Release the temporary GPU context; thumbnails never leave dozens alive.
      const gl = canvas?.getContext('webgl2') ?? canvas?.getContext('webgl');
      root.unmount();
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      host.remove();
      resolve(value);
    };
    const space = getCargoSpace(config.vehicleCategory, config.cabType, config.vehicleLength, config.vehicleRoof, config.vehicleModelId);
    let placements = computeLayout(config).placements;
    if (!productId && (collectProducts(config).some(p => !placements.some(i => i.productId === p.id)) || (config.airReelId && !config.compressorId))) {
      finish(null); return;
    }
    if (productId) {
      const p = getProduct(productId);
      if (!p) { finish(null); return; }
      const size: [number, number, number] = [p.dimensions.width || 0.7, p.dimensions.height || 0.5, p.dimensions.depth || 0.4];
      placements = [{ productId, zone: 'floor', position: [0, size[1] / 2, 0], size } as PlacedItem];
    }
    if (!productId) placements = presentationItems(placements);
    const deadline = performance.now() + 30000;
    const poll = () => {
      if (finished) return;
      const value = capture?.();
      if (value) { finish(value); return; }
      if (performance.now() > deadline) { finish(null); return; }
      timer = setTimeout(poll, 200);
    };
    root.render(<RenderBoundary failed={() => setTimeout(() => finish(null), 0)}><Suspense fallback={null}>
      <VanScene3D space={space} placements={placements} liningVariant={(config.liningId ?? 'lining_none').replace('lining_', '')}
        selectedProductId={null} onSelectProduct={() => {}} cameraPreset="overview"
        presentationMode={!productId} productPreview={!!productId} floatValve={!productId && !!config.floatValve}
        onCaptureReady={fn => { capture = fn; }} />
    </Suspense></RenderBoundary>);
    // Allow softboxes and contact shadows to finish their first frame.
    timer = setTimeout(poll, 1200);
  });
}

/** The exact selected meshes, isolated from the van; no image generation or invented products. */
export function renderSetupImage(config: DetailingConfiguration): Promise<string | null> {
  const snapshot = structuredClone(config);
  const key = JSON.stringify(snapshot);
  if (cached?.key === key) return cached.value;
  const value = schedule(() => render(snapshot));
  cached = { key, value };
  void value.then(image => { if (!image && cached?.key === key) cached = undefined; });
  return value;
}

/** Used offline to bake lightweight cards from the very same meshes as the installation. */
export function renderProductImage(config: DetailingConfiguration, id: string) {
  return schedule(() => render(structuredClone(config), id));
}

export async function summaryImage(config: DetailingConfiguration, reference: string, vehicleDescription = 'Algemene voorbeeldbestelwagen'): Promise<string | null> {
  const image = await renderSetupImage(config);
  if (!image) return null;
  const source = new Image();
  source.src = image;
  await source.decode();
  const canvas = document.createElement('canvas');
  const closed=computeLayout(config).placements;
  const names=setupParts(config,closed);
  const ids=closed.map(i=>i.productId);
  if(config.floatValve && config.tankId) ids.push('float-valve');
  if(config.liningId && config.liningId!=='lining_none')ids.push(config.liningId);
  const thumbnails=await Promise.all(names.map(async(_,i)=>{
    if(ids[i]==='float-valve')return null;
    const thumb=new Image();thumb.src=`${import.meta.env.BASE_URL}product-renders/${ids[i]}.jpg`;
    try {await thumb.decode();return thumb;}catch{return null;}
  }));
  canvas.width=1500;
  const ctx=canvas.getContext('2d');if(!ctx)return image;
  ctx.font='16px Arial';
  const rows=names.map((name,i)=>{
    const lines:string[]=[];let line='';
    for(const word of name.split(' ')) {
      if(line && ctx.measureText(line+word).width>228){lines.push(line.trim());line='';}
      line+=word+' ';
    }
    if(line)lines.push(line.trim());
    return {lines,thumb:thumbnails[i],height:Math.max(60,lines.length*20+12)};
  });
  canvas.height=Math.max(1000,220+rows.reduce((sum,row)=>sum+row.height+8,0));
  ctx.fillStyle='#e6e8e9';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(source,0,110,1100,850);
  ctx.fillStyle='#121b25';ctx.font='bold 30px Arial';ctx.fillText('Jouw mobiele detailinginstallatie',36,48);
  ctx.font='17px Arial';ctx.fillText(reference+' • 3D-onderdelenoverzicht',36,76);
  ctx.font='16px Arial';ctx.fillText('Bestelwagen: '+vehicleDescription.slice(0,130),36,101);
  ctx.fillStyle='#15202c';ctx.fillRect(1110,110,360,canvas.height-180);
  ctx.fillStyle='#ffffff';ctx.font='bold 21px Arial';ctx.fillText('Jouw gekozen onderdelen',1130,148);
  ctx.font='16px Arial';let y=170;
  for(const row of rows) {
    if(row.thumb)ctx.drawImage(row.thumb,1123,y,78,60);
    else {ctx.fillStyle='#7bd244';ctx.fillText('✓',1150,y+32);}
    ctx.fillStyle='#ffffff';row.lines.forEach((line,i)=>ctx.fillText(line,1210,y+20+i*20));
    y+=row.height+8;
  }
  ctx.fillStyle='#344250';ctx.font='16px Arial';
  ctx.fillText('3D-visualisatie • Maatvoering en definitieve inbouw worden gecontroleerd bij de offerte.',36,canvas.height-28);
  return canvas.toDataURL('image/jpeg',.93);
}
