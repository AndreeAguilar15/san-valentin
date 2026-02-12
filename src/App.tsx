
import React, { useState, useEffect, useMemo } from 'react';
import type { FlowerInstance, FlowerPalette, GeminiMessage, Point } from './types.ts';
import { PALETTES } from './constants.tsx';
import FlowerCanvas from './components/FlowerCanvas';
import { generateRomanticMessage } from './services/geminiService';

const App: React.FC = () => {
  const [flowers, setFlowers] = useState<FlowerInstance[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<FlowerPalette>(PALETTES[0]);
  const [isWrapping, setIsWrapping] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [aiMessage, setAiMessage] = useState<GeminiMessage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sorting for depth: we want core flowers (roses/tulips) to be slightly more central/top
  const arrangedFlowers = useMemo(() => {
    return [...flowers].sort((a, b) => {
      const isACore = a.palette.name === 'Rosas Rojas' || a.palette.name === 'Tulipanes Azules';
      const isBCore = b.palette.name === 'Rosas Rojas' || b.palette.name === 'Tulipanes Azules';
      if (isACore && !isBCore) return 1;
      if (!isACore && isBCore) return -1;
      return 0;
    });
  }, [flowers]);

  const mixedIndices = useMemo(() => {
    const cores = flowers.filter(f => f.palette.name === 'Rosas Rojas' || f.palette.name === 'Tulipanes Azules')
      .sort((a, b) => a.id.localeCompare(b.id));
    const others = flowers.filter(f => !(f.palette.name === 'Rosas Rojas' || f.palette.name === 'Tulipanes Azules'))
      .sort((a, b) => a.id.localeCompare(b.id));
    return { cores, others };
  }, [flowers]);

  const generateVinePath = (start: Point, end: Point): Point[] => {
    const points: Point[] = [];
    const segments = 25;
    const dist = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const freq = 1 + Math.random();
    const phase = Math.random() * Math.PI * 2;
    const maxAmp = Math.min(20, dist * 0.05);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let x = start.x + (end.x - start.x) * t;
      let y = start.y + (end.y - start.y) * t;
      const curve = Math.sin(t * Math.PI * freq + phase) * Math.sin(t * Math.PI) * maxAmp;
      x += Math.cos(angle + Math.PI / 2) * curve;
      y += Math.sin(angle + Math.PI / 2) * curve;
      points.push({ x, y });
    }
    return points;
  };

  useEffect(() => {
    let animationFrame: number;
    const update = () => {
      setFlowers(prev => {
        let changed = false;
        const next = prev.map(f => {
          let updated = { ...f };
          let fChanged = false;

          if (updated.progress < 1) {
            updated.progress = Math.min(1, updated.progress + 0.025);
            fChanged = true;
          }

          if (isWrapping) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight * 0.35;

            const isCore = f.palette.name === 'Rosas Rojas' || f.palette.name === 'Tulipanes Azules';
            const hash = f.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

            const collection = isCore ? mixedIndices.cores : mixedIndices.others;
            const idx = collection.findIndex(item => item.id === f.id);
            const total = collection.length;

            const goldenAngle = 2.39996;
            const angle = idx * goldenAngle + (hash % 10) * 0.05;
            const spreadRadius = Math.sqrt((idx + 1) / (total + 1));

            // Tightened height to keep the bouquet compact
            const ellipseWidth = isCore ? 90 : 200;
            const ellipseHeight = isCore ? 55 : 95; // Reduced from 70/150 to keep them grouped

            const verticalForce = Math.sin(angle);
            // squashFactor reduced on the top (negative verticalForce) to prevent stray flowers
            const squashFactor = verticalForce > 0 ? 0.4 : 0.8;

            const targetX = centerX + Math.cos(angle) * spreadRadius * ellipseWidth;
            // Vertical offset adjusted for the new compact height
            const targetY = (centerY - 80) + (verticalForce * spreadRadius * ellipseHeight * squashFactor);

            const dx = (targetX - updated.currentX);
            const dy = (targetY - updated.currentY);

            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
              updated.currentX += dx * 0.12;
              updated.currentY += dy * 0.12;
              fChanged = true;
            }
          }

          if (fChanged) changed = true;
          return fChanged ? updated : f;
        });
        return changed ? next : prev;
      });
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [isWrapping, mixedIndices]);

  const handleClick = (e: React.MouseEvent) => {
    if (showConfig || isWrapping) return;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight + 80;

    const newFlower: FlowerInstance = {
      id: Math.random().toString(36).substr(2, 9),
      startX, startY,
      targetX: e.clientX,
      targetY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      palette: selectedPalette,
      size: 14 + Math.random() * 10,
      progress: 0,
      angle: (Math.random() - 0.5) * 0.8,
      vinePath: generateVinePath({ x: startX, y: startY }, { x: e.clientX, y: e.clientY })
    };
    setFlowers(prev => [...prev, newFlower]);
  };

  const downloadImage = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mi-ramo-valentin-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleWrap = async () => {
    if (flowers.length === 0) return;
    setIsWrapping(true);
    setIsGenerating(true);
    const typesUsed = Array.from(new Set(flowers.map(f => f.palette.name))).join(", ");
    const msg = await generateRomanticMessage(flowers.length, typesUsed);
    setAiMessage(msg);
    setIsGenerating(false);
  };

  const reset = () => {
    setFlowers([]);
    setIsWrapping(false);
    setAiMessage(null);
    setShowConfig(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0d0204] cursor-crosshair select-none" onClick={handleClick}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none z-0"></div>

      <FlowerCanvas flowers={arrangedFlowers} isWrapping={isWrapping} />

      {!showConfig && !isWrapping && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 bg-black/70 backdrop-blur-2xl p-5 rounded-[2.5rem] shadow-2xl border border-white/10 animate-slide-in">
          <p className="text-[9px] uppercase tracking-[0.3em] text-pink-300 font-black mb-3 text-center opacity-40">Selecciona</p>
          {PALETTES.map(p => (
            <button key={p.name} onClick={(e) => { e.stopPropagation(); setSelectedPalette(p); }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${selectedPalette.name === p.name ? 'bg-pink-600 text-white shadow-pink-500/50 shadow-lg' : 'bg-white/5 text-pink-200 hover:bg-white/10'
                }`}>
              <i className={`fas ${p.type === 'rose' ? 'fa-leaf' : p.type === 'tulip' ? 'fa-eye' : p.type === 'daisy' ? 'fa-sun' : p.type === 'lily' ? 'fa-spa' : 'fa-certificate'} text-xl`}></i>
            </button>
          ))}
        </div>
      )}

      {showConfig && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
          <div className="bg-[#1a050a]/90 p-12 rounded-[60px] shadow-2xl max-w-sm w-full text-center border border-pink-900/30">
            <h1 className="text-6xl dancing text-pink-400 mb-6 drop-shadow-2xl">Tu Jardín</h1>
            <p className="text-pink-100/60 mb-12 font-medium tracking-wide">Siembra flores tocando la pantalla y crea un ramo eterno.</p>
            <button onClick={() => setShowConfig(false)}
              className="w-full py-6 bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-95 transition-all">
              Comenzar
            </button>
          </div>
        </div>
      )}

      {!showConfig && !isWrapping && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
          <h2 className="text-5xl dancing text-pink-400/90 drop-shadow-xl animate-pulse">
            {flowers.length === 0 ? 'Toca para sembrar...' : `${flowers.length} Flores`}
          </h2>
        </div>
      )}

      {!showConfig && !isWrapping && flowers.length > 0 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-6 items-center animate-fade-in">
          <button onClick={(e) => { e.stopPropagation(); reset(); }}
            className="w-14 h-14 bg-black/60 backdrop-blur-xl text-pink-300 rounded-full border border-white/10 hover:text-white transition-all shadow-xl flex items-center justify-center">
            <i className="fas fa-trash-alt text-lg"></i>
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleWrap(); }}
            className="px-12 py-5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full font-black uppercase tracking-widest shadow-[0_10px_40px_rgba(236,72,153,0.3)] hover:scale-105 transition-all flex items-center gap-3">
            <i className="fas fa-gift"></i> Armar Ramo
          </button>
        </div>
      )}

      {isWrapping && aiMessage && !isGenerating && (
        <div className="absolute inset-0 z-[60] flex items-end justify-center p-10 animate-fade-in pointer-events-none">
          <div className="bg-[#050102]/65 backdrop-blur-3xl p-12 rounded-[60px] shadow-[0_0_150px_rgba(0,0,0,1)] max-w-md w-full text-center border border-pink-900/30 pointer-events-auto transition-all">
            <h3 className="text-5xl dancing text-pink-300 mb-6 drop-shadow-md">Para Ti</h3>
            <p className="text-pink-50 font-medium mb-12 leading-relaxed italic text-xl dancing drop-shadow-sm">"{aiMessage.text}"</p>
            <div className="flex gap-4">
              <button onClick={reset} className="flex-1 py-5 bg-pink-700 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-pink-800 transition-all shadow-lg active:scale-95">Nuevo Ramo</button>
              <button onClick={(e) => { e.stopPropagation(); downloadImage(); }} className="w-16 h-16 bg-white/10 text-pink-400 rounded-full hover:bg-white/20 transition-all flex items-center justify-center border border-white/20 active:scale-95"><i className="fas fa-camera text-2xl"></i></button>
            </div>
          </div>
        </div>
      )}

      {!showConfig && isWrapping && !isGenerating && (
        <button onClick={(e) => { e.stopPropagation(); downloadImage(); }}
          className="absolute top-8 right-8 z-[100] w-16 h-16 bg-black/50 backdrop-blur-2xl text-white rounded-3xl flex items-center justify-center border border-white/10 hover:bg-pink-600 transition-all shadow-2xl group active:scale-95">
          <i className="fas fa-file-download text-2xl group-hover:scale-110 transition-transform"></i>
        </button>
      )}

      {isGenerating && (
        <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-pink-900/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
          <p className="dancing text-4xl text-pink-400 mt-10 animate-pulse">Envolviendo tu regalo...</p>
        </div>
      )}

      <style>{`
        @keyframes slide-in { from { transform: translateX(-150%) translateY(-50%); opacity: 0; } to { transform: translateX(0) translateY(-50%); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in { animation: slide-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
