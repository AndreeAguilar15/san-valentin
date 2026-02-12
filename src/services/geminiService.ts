import type { GeminiMessage } from "../types.ts";

const ROMANTIC_MESSAGES = [
  "Cada flor es un latido de mi corazón por ti. ¡Feliz San Valentín!",
  "Tu amor hace florecer mi mundo cada día. Te amo infinitamente.",
  "Como estas flores, mi amor por ti crece sin parar. ¡Siempre tuyo/a!",
  "Eres mi jardín favorito y mi sol de cada mañana. ¡Feliz día, mi amor!",
  "Ni todas las flores del mundo se comparan con tu belleza. Te adoro."
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
