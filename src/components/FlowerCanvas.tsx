
import React, { useRef, useEffect } from 'react';
import type { FlowerInstance } from '../types.ts';

interface FlowerCanvasProps {
  flowers: FlowerInstance[];
  isWrapping: boolean;
}

const FlowerCanvas: React.FC<FlowerCanvasProps> = ({ flowers, isWrapping }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawFlowerHead = (ctx: CanvasRenderingContext2D, flower: FlowerInstance, x: number, y: number, size: number) => {
    const { palette, angle } = flower;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';

    switch (palette.type) {
      case 'rose':
        for (let i = 0; i < 18; i++) {
          ctx.rotate(Math.PI / 4.5);
          const layerSize = size * (1 - (i / 25));
          ctx.fillStyle = palette.petals[i % palette.petals.length];
          ctx.beginPath();
          ctx.ellipse(i * 0.4, 0, layerSize, layerSize * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'tulip':
        for (let i = -1; i <= 1; i++) {
          ctx.save();
          ctx.rotate(i * 0.18);
          const gradient = ctx.createLinearGradient(0, -size, 0, 0);
          gradient.addColorStop(0, palette.petals[0]);
          gradient.addColorStop(1, palette.petals[palette.petals.length - 1]);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.ellipse(i * size * 0.28, -size * 0.45, size * 0.55, size * 0.95, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      case 'daisy':
        const petals = 20;
        ctx.fillStyle = palette.petals[0];
        for (let i = 0; i < petals; i++) {
          ctx.rotate((Math.PI * 2) / petals);
          ctx.beginPath();
          ctx.ellipse(size * 0.95, 0, size * 1.05, size * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = palette.center;
        ctx.fill();
        break;
      case 'lily':
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.2);
          grad.addColorStop(0, palette.center);
          grad.addColorStop(1, palette.petals[0]);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(size * 1.4, -size * 0.7, size * 2.6, 0);
          ctx.quadraticCurveTo(size * 1.4, size * 0.7, 0, 0);
          ctx.fill();
        }
        break;
      case 'sunflower':
        const count = 28;
        for (let i = 0; i < count; i++) {
          ctx.rotate((Math.PI * 2) / count);
          ctx.fillStyle = palette.petals[0];
          ctx.beginPath();
          ctx.ellipse(size * 1.1, 0, size * 0.95, size * 0.14, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.78, 0, Math.PI * 2);
        ctx.fillStyle = palette.center;
        ctx.fill();
        break;
    }
    ctx.restore();
  };

  const drawSpikyPaper = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    ctx.save();
    ctx.fillStyle = '#880e4f'; // Dark Pink 900
    ctx.shadowBlur = 50;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';

    ctx.beginPath();
    // Create a spiky shape behind
    const spikes = 12;
    const outerRadius = 280;
    const innerRadius = 240;

    // Shift up slightly to center behind bouquet
    const cY = centerY + 100;

    for (let i = 0; i < spikes * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const a = (Math.PI * i) / spikes - Math.PI / 2; // Start from top
      const x = centerX + Math.cos(a) * r;
      const y = cY + Math.sin(a) * r * 0.8; // Flatten slightly
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawWrapBack = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    ctx.save();
    ctx.fillStyle = '#fce4ec';
    ctx.shadowBlur = 40;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY + 180);
    ctx.lineTo(centerX - 220, centerY - 100);
    ctx.quadraticCurveTo(centerX, centerY + 60, centerX + 220, centerY - 100);
    ctx.lineTo(centerX + 80, centerY + 180);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawWrapFront = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    ctx.save();

    // 1. Skirt
    const skirtGradient = ctx.createLinearGradient(centerX, centerY + 170, centerX, centerY + 550);
    skirtGradient.addColorStop(0, '#fce4ec');
    skirtGradient.addColorStop(1, '#f8bbd0');
    ctx.fillStyle = skirtGradient;
    ctx.shadowBlur = 25;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';

    ctx.beginPath();
    ctx.moveTo(centerX - 85, centerY + 170);
    ctx.bezierCurveTo(centerX - 130, centerY + 250, centerX - 200, centerY + 300, centerX - 180, centerY + 580);
    ctx.lineTo(centerX + 180, centerY + 580);
    ctx.bezierCurveTo(centerX + 200, centerY + 300, centerX + 130, centerY + 250, centerX + 85, centerY + 170);
    ctx.fill();

    // Folds
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    for (let i = -150; i <= 150; i += 75) {
      ctx.beginPath();
      ctx.moveTo(centerX + i / 3, centerY + 175);
      ctx.lineTo(centerX + i, centerY + 580);
      ctx.stroke();
    }

    // 2. Framing Front Flaps
    ctx.fillStyle = '#f8bbd0';
    ctx.beginPath();
    ctx.moveTo(centerX - 90, centerY + 175);
    ctx.bezierCurveTo(centerX - 170, centerY + 140, centerX - 140, centerY + 40, centerX, centerY + 110);
    ctx.bezierCurveTo(centerX + 140, centerY + 40, centerX + 170, centerY + 140, centerX + 90, centerY + 175);
    ctx.closePath();
    ctx.fill();

    // 3. Ribbon Bow
    ctx.fillStyle = '#ad1457';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';

    ctx.beginPath();
    ctx.ellipse(centerX - 40, centerY + 165, 48, 28, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(centerX + 40, centerY + 165, 48, 28, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY + 170);
    ctx.lineTo(centerX - 70, centerY + 350);
    ctx.lineTo(centerX - 25, centerY + 330);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(centerX + 10, centerY + 170);
    ctx.lineTo(centerX + 70, centerY + 350);
    ctx.lineTo(centerX + 25, centerY + 330);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY + 165, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };



  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height * 0.35; // Matches App.tsx dome center

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. STEMS (Gathered at the center bow)
      flowers.forEach(flower => {
        const { vinePath, progress, palette, currentX, currentY, targetX, targetY, startX, startY } = flower;
        const drawX = isWrapping ? currentX : targetX;
        const drawY = isWrapping ? currentY : targetY;

        ctx.beginPath();
        const sX = isWrapping ? centerX : startX;
        const sY = isWrapping ? centerY + 175 : startY;

        ctx.moveTo(sX, sY);
        ctx.strokeStyle = palette.stem;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';

        const visiblePoints = Math.floor(vinePath.length * Math.min(1, progress * 1.2));
        for (let i = 0; i < visiblePoints; i++) {
          const point = vinePath[i];
          const pf = i / vinePath.length;
          const dx = (drawX - targetX) * pf;
          const dy = (drawY - targetY) * pf;
          ctx.lineTo(point.x + dx, point.y + dy);
        }
        ctx.stroke();
      });

      // 2. SPIKY PAPER BACK (Darker, decorative layer)
      if (isWrapping) drawSpikyPaper(ctx, centerX, centerY);

      // 3. WRAP BACK
      if (isWrapping) drawWrapBack(ctx, centerX, centerY);


      // 4. FLOWER HEADS
      flowers.forEach(flower => {
        const { progress, size, currentX, currentY, targetX, targetY } = flower;
        const dX = isWrapping ? currentX : targetX;
        const dY = isWrapping ? currentY : targetY;

        if (progress > 0.8) {
          const bloomT = Math.min(1, (progress - 0.8) / 0.2);
          drawFlowerHead(ctx, flower, dX, dY, size * bloomT);
        }
      });

      // 5. WRAP FRONT
      if (isWrapping) drawWrapFront(ctx, centerX, centerY);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [flowers, isWrapping]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-10" />;
};

export default FlowerCanvas;
