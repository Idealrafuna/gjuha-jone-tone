export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'language' | 'culture' | 'family';
  xp: number;
  premium: boolean;
  icon: string;
}

export const QUESTS: Quest[] = [
  {
    id: "proverb",
    title: "Ask gjyshja for a proverb",
    description: "Write down or record a traditional Albanian proverb your gjyshja shares with you.",
    category: "family",
    xp: 50,
    premium: false,
    icon: "MessageCircle"
  },
  {
    id: "map",
    title: "Find Albania on a map",
    description: "Take a screenshot or photo of Albania on a world map and learn about its neighbors.",
    category: "culture",
    xp: 30,
    premium: true,
    icon: "Map"
  },
  {
    id: "food_words",
    title: "Learn 5 food words",
    description: "Practice 5 vocabulary words about traditional Albanian food and their meanings.",
    category: "language",
    xp: 25,
    premium: false,
    icon: "UtensilsCrossed"
  },
  {
    id: "flag_colors",
    title: "Draw the Albanian flag",
    description: "Draw or create the Albanian flag and learn about its symbolism.",
    category: "culture",
    xp: 35,
    premium: false,
    icon: "Flag"
  },
  {
    id: "family_tree",
    title: "Add 3 relatives to your tree",
    description: "Use the Kinship Tree feature to add 3 new family members with photos.",
    category: "family",
    xp: 40,
    premium: true,
    icon: "Users"
  },
  {
    id: "greeting_practice",
    title: "Practice daily greetings",
    description: "Learn and practice saying 'Mirëmëngjes', 'Mirëdita', and 'Mirëmbrëma' with family.",
    category: "language",
    xp: 20,
    premium: false,
    icon: "Hand"
  },
  {
    id: "traditional_game",
    title: "Play a traditional game",
    description: "Learn about and play a traditional Albanian children's game like 'Hajde Valle'.",
    category: "culture",
    xp: 45,
    premium: true,
    icon: "Gamepad2"
  },
  {
    id: "counting_practice",
    title: "Count to 20 in Albanian",
    description: "Practice counting from 1 to 20 in Albanian and teach someone else.",
    category: "language",
    xp: 30,
    premium: false,
    icon: "Calculator"
  },
  {
    id: "recipe_collection",
    title: "Collect a family recipe",
    description: "Ask a family member for a traditional Albanian recipe and write it down.",
    category: "family",
    xp: 55,
    premium: true,
    icon: "ChefHat"
  },
  {
    id: "music_discovery",
    title: "Listen to Albanian folk music",
    description: "Discover and listen to traditional Albanian folk songs. Name your favorite.",
    category: "culture",
    xp: 25,
    premium: false,
    icon: "Music"
  }
];

export const QUEST_CATEGORIES = {
  language: { label: 'Language', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  culture: { label: 'Culture', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  family: { label: 'Family', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
} as const;