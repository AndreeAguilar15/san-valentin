import type { GeminiMessage } from "../types.ts";

const ROMANTIC_MESSAGES = [
  "¡Feliz San Valentín!"
];

export const generateRomanticMessage = async (flowerCount: number, paletteName: string): Promise<GeminiMessage> => {
  // Simulate a short delay for effect, or return immediately
  await new Promise(resolve => setTimeout(resolve, 1500));

  const randomText = ROMANTIC_MESSAGES[Math.floor(Math.random() * ROMANTIC_MESSAGES.length)];

  return {
    text: randomText,
    meaning: `Un ramo de ${flowerCount} flores en tonos ${paletteName}, creado con todo mi cariño para ti.`
  };
};
