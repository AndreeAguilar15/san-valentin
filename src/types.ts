
export type FlowerType = 'rose' | 'tulip' | 'daisy' | 'lily' | 'sunflower';

export type FlowerPalette = {
  name: string;
  type: FlowerType;
  petals: string[];
  stem: string;
  center: string;
};

export type Point = { x: number; y: number };

export type FlowerInstance = {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number; // For wrapping animation
  currentY: number; // For wrapping animation
  palette: FlowerPalette;
  size: number;
  progress: number;
  angle: number;
  vinePath: Point[]; // Pre-calculated organic path
};

export interface GeminiMessage {
  text: string;
  meaning: string;
}
