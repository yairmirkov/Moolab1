export interface UserStats {
  bossWins: number;
  level: number;
  streak: number;
  moolies: number;
  subjectsMastered: number;
  totalXp: number;
}

export interface Title {
  id: string;
  emoji: string;
  label: { en: string; es: string };
  condition: (stats: UserStats) => boolean;
  hint: { en: string; es: string };
}

export const TITLES: Title[] = [
  {
    id: "analyst",
    emoji: "💼",
    label: { en: "The Analyst", es: "El Analista" },
    condition: (s) => s.subjectsMastered >= 1,
    hint: { en: "Master your first subject", es: "Domina tu primer tema" },
  },
  {
    id: "bull",
    emoji: "📈",
    label: { en: "Bull", es: "Toro" },
    condition: (s) => s.bossWins >= 3,
    hint: { en: "Win 3 boss fights", es: "Gana 3 peleas de jefe" },
  },
  {
    id: "banker",
    emoji: "🏦",
    label: { en: "Banker", es: "Banquero" },
    condition: (s) => s.level >= 5,
    hint: { en: "Reach level 5", es: "Alcanza nivel 5" },
  },
  {
    id: "big_brain",
    emoji: "🧠",
    label: { en: "Big Brain", es: "Cerebrito" },
    condition: (s) => s.totalXp >= 500,
    hint: { en: "Earn 500 total XP", es: "Gana 500 XP en total" },
  },
  {
    id: "whale",
    emoji: "🐋",
    label: { en: "Whale", es: "Ballena" },
    condition: (s) => s.moolies >= 1000,
    hint: { en: "Accumulate 1,000 moolies", es: "Acumula 1,000 moolies" },
  },
  {
    id: "moon_chaser",
    emoji: "🚀",
    label: { en: "Moon Chaser", es: "Cazaluna" },
    condition: (s) => s.streak >= 7,
    hint: { en: "Reach a 7-day streak", es: "Alcanza una racha de 7 días" },
  },
  {
    id: "money_moves",
    emoji: "💰",
    label: { en: "Money Moves", es: "Jugadas de Dinero" },
    condition: (s) => s.subjectsMastered >= 3,
    hint: { en: "Master 3 subjects", es: "Domina 3 temas" },
  },
  {
    id: "top_shark",
    emoji: "🦈",
    label: { en: "Top Shark", es: "Tiburón Mayor" },
    condition: (s) => s.bossWins >= 10,
    hint: { en: "Win 10 boss fights", es: "Gana 10 peleas de jefe" },
  },
  {
    id: "megalodon",
    emoji: "🦷",
    label: { en: "Megalodon", es: "Megalodón" },
    condition: (s) => s.bossWins >= 25,
    hint: { en: "Win 25 boss fights", es: "Gana 25 peleas de jefe" },
  },
  {
    id: "legend",
    emoji: "⚡",
    label: { en: "Legend", es: "Leyenda" },
    condition: (s) => s.level >= 10 && s.subjectsMastered >= 5,
    hint: {
      en: "Reach level 10 and master 5 subjects",
      es: "Alcanza nivel 10 y domina 5 temas",
    },
  },
  {
    id: "compound_king",
    emoji: "📊",
    label: { en: "Compound King", es: "Rey del Interés Compuesto" },
    condition: (s) => s.totalXp >= 2000,
    hint: { en: "Earn 2,000 total XP", es: "Gana 2,000 XP en total" },
  },
  {
    id: "hodler",
    emoji: "💎",
    label: { en: "Diamond Hands", es: "Manos de Diamante" },
    condition: (s) => s.streak >= 30,
    hint: { en: "30-day streak", es: "Racha de 30 días" },
  },
];

export const titleEquipKey = (id: string) => `title_${id}`;

export function findEquippedTitle(equippedItems: string[]): Title | undefined {
  const equippedKey = equippedItems.find((x) => x.startsWith("title_"));
  if (!equippedKey) return undefined;
  const id = equippedKey.slice(6);
  return TITLES.find((t) => t.id === id);
}
