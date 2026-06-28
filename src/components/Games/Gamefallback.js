// ============================================================================
// Gamefallback.js  —  SwiftKeys Arcade v2
// ============================================================================

export const GAME_API_ROUTES = {
  avatars: "/games/avatars",
  soundPacks: "/games/sound-packs",
  gameList: "/games/list",
  wordBank: "/games/words",
  difficulties: "/games/difficulties",
  leaderboard: (gameId) => `/games/leaderboard/${gameId}`,
  saveSettings: "/games/settings",
  saveResult: (gameId) => `/games/${gameId}/result`,
};

// ============================================================================
// AVATARS  — every avatar has a rich personality + unique feel
// ============================================================================
export const GAME_AVATARS = [
  // ---- Original crew (upgraded) -------------------------------------------
  {
    id: "chomp",
    name: "Chomp",
    shape: "round",
    accessory: "none",
    primary: "#ffd23f",
    secondary: "#a86b00",
    tagline: "The classic dot-muncher. Simple. Hungry. Relentless.",
    defaultSoundPack: "arcade",
    eatAnimation: "stretch",
    category: "classic",
  },
  {
    id: "byte",
    name: "Byte",
    shape: "square",
    accessory: "antenna",
    primary: "#3ee08e",
    secondary: "#0c7a4a",
    tagline: "A pixel-pet that treats every word like a snack chip.",
    defaultSoundPack: "scifi",
    eatAnimation: "glitch",
    category: "classic",
  },
  {
    id: "nova",
    name: "Nova",
    shape: "hex",
    accessory: "spark",
    primary: "#b389ff",
    secondary: "#5b21b6",
    tagline: "A small star that burns brighter with every correct word.",
    defaultSoundPack: "chime",
    eatAnimation: "implode",
    category: "classic",
  },
  {
    id: "ember",
    name: "Ember",
    shape: "drop",
    accessory: "spikes",
    primary: "#ff7849",
    secondary: "#9a2a17",
    tagline: "Breathes a little fire once the combo gets spicy.",
    defaultSoundPack: "retro",
    eatAnimation: "burst",
    category: "classic",
  },
  {
    id: "glitch",
    name: "Glitch",
    shape: "wisp",
    accessory: "trail",
    primary: "#4fd4ff",
    secondary: "#0a6b8a",
    tagline: "A data-ghost that phases through anything typed right.",
    defaultSoundPack: "scifi",
    eatAnimation: "phase",
    category: "classic",
  },

  // ---- Anime-inspired -----------------------------------------------------
  {
    id: "ryuu",
    name: "Ryuu",
    shape: "dragon",
    accessory: "horns",
    primary: "#ff3c5a",
    secondary: "#7a0018",
    tagline: "A tiny dragon who devours words with ancient fury.",
    defaultSoundPack: "epic",
    eatAnimation: "flame",
    category: "anime",
    aura: "fire",
  },
  {
    id: "sakura",
    name: "Sakura",
    shape: "petal",
    accessory: "blossom",
    primary: "#ffb7d5",
    secondary: "#c0185a",
    tagline: "Petals fall when she types. Petals bloom when she scores.",
    defaultSoundPack: "chime",
    eatAnimation: "bloom",
    category: "anime",
    aura: "petal",
  },
  {
    id: "kumo",
    name: "Kumo",
    shape: "cloud",
    accessory: "lightning",
    primary: "#a0cfff",
    secondary: "#2563a8",
    tagline: "Born in storm clouds. Eats words like thunder.",
    defaultSoundPack: "storm",
    eatAnimation: "zap",
    category: "anime",
    aura: "lightning",
  },
  {
    id: "oni",
    name: "Oni",
    shape: "mask",
    accessory: "horns",
    primary: "#ff6b2b",
    secondary: "#2d0a00",
    tagline: "An oni demon with a taste for rare kanji.",
    defaultSoundPack: "taiko",
    eatAnimation: "roar",
    category: "anime",
    aura: "dark",
  },

  // ---- Movie/Pop Culture-inspired (stylised, no IP) -----------------------
  {
    id: "cosmo",
    name: "Cosmo",
    shape: "round",
    accessory: "visor",
    primary: "#c8f564",
    secondary: "#3d6000",
    tagline: "Space explorer. Types at the speed of light.",
    defaultSoundPack: "scifi",
    eatAnimation: "orbit",
    category: "scifi",
    aura: "space",
  },
  {
    id: "zara",
    name: "Zara",
    shape: "hex",
    accessory: "eyepatch",
    primary: "#ff2d6b",
    secondary: "#60001f",
    tagline: "She hacked the mainframe. Now she's here for your words.",
    defaultSoundPack: "scifi",
    eatAnimation: "glitch",
    category: "scifi",
    aura: "cyber",
  },
  {
    id: "glacius",
    name: "Glacius",
    shape: "crystal",
    accessory: "crown",
    primary: "#88f0ff",
    secondary: "#003a52",
    tagline: "Every correct keystroke forms another ice crystal.",
    defaultSoundPack: "chime",
    eatAnimation: "freeze",
    category: "fantasy",
    aura: "ice",
  },
  {
    id: "solaris",
    name: "Solaris",
    shape: "star",
    accessory: "rays",
    primary: "#ffe566",
    secondary: "#b45400",
    tagline: "A sun deity that feeds on language itself.",
    defaultSoundPack: "epic",
    eatAnimation: "flare",
    category: "fantasy",
    aura: "solar",
  },
  {
    id: "phantom",
    name: "Phantom",
    shape: "wisp",
    accessory: "cloak",
    primary: "#9d8fff",
    secondary: "#1a0038",
    tagline: "Moves between keystrokes. Exists only in the gaps.",
    defaultSoundPack: "chime",
    eatAnimation: "phase",
    category: "fantasy",
    aura: "void",
  },
];

// Color swatches for recoloring any avatar
export const AVATAR_COLOR_SWATCHES = [
  "#ff4d6d",
  "#ffb703",
  "#3ee08e",
  "#4fd4ff",
  "#b389ff",
  "#f5f5f5",
  "#ff6b2b",
  "#c8f564",
  "#ff2d6b",
  "#88f0ff",
  "#ffe566",
  "#aaaaaa",
];

// ============================================================================
// SOUND PACKS — every pack has a unique character arc
// ============================================================================
export const SOUND_PACKS = [
  {
    id: "arcade",
    name: "Arcade Classic",
    description: "Crunchy 8-bit beeps — original cabinet feel.",
    events: {
      bite: { type: "square", freq: 520, dur: 0.05, gain: 0.05 },
      eat: { type: "square", freq: 720, dur: 0.14, gain: 0.07, slide: 320 },
      wrong: { type: "sawtooth", freq: 130, dur: 0.14, gain: 0.07 },
      combo: { type: "square", freq: 880, dur: 0.1, gain: 0.07, slide: 260 },
      levelUp: { type: "square", freq: 660, dur: 0.24, gain: 0.08, slide: 440 },
      gameOver: {
        type: "sawtooth",
        freq: 220,
        dur: 0.55,
        gain: 0.08,
        slide: -160,
      },
      click: { type: "square", freq: 440, dur: 0.04, gain: 0.04 },
    },
  },
  {
    id: "retro",
    name: "Retro Synth",
    description: "Warm sine/triangle tones — soft on the ears.",
    events: {
      bite: { type: "triangle", freq: 460, dur: 0.07, gain: 0.06 },
      eat: { type: "sine", freq: 640, dur: 0.18, gain: 0.09, slide: 220 },
      wrong: { type: "triangle", freq: 150, dur: 0.16, gain: 0.07 },
      combo: { type: "sine", freq: 760, dur: 0.12, gain: 0.08, slide: 200 },
      levelUp: {
        type: "triangle",
        freq: 540,
        dur: 0.28,
        gain: 0.09,
        slide: 400,
      },
      gameOver: { type: "sine", freq: 200, dur: 0.6, gain: 0.09, slide: -150 },
      click: { type: "triangle", freq: 400, dur: 0.04, gain: 0.04 },
    },
  },
  {
    id: "chime",
    name: "Soft Chime",
    description: "Gentle bell tones — calm and unobtrusive.",
    events: {
      bite: { type: "sine", freq: 880, dur: 0.08, gain: 0.05 },
      eat: { type: "sine", freq: 1040, dur: 0.2, gain: 0.06, slide: 140 },
      wrong: { type: "sine", freq: 290, dur: 0.12, gain: 0.05 },
      combo: { type: "sine", freq: 1180, dur: 0.14, gain: 0.06, slide: 100 },
      levelUp: { type: "sine", freq: 980, dur: 0.32, gain: 0.07, slide: 280 },
      gameOver: { type: "sine", freq: 250, dur: 0.65, gain: 0.06, slide: -100 },
      click: { type: "sine", freq: 700, dur: 0.03, gain: 0.03 },
    },
  },
  {
    id: "scifi",
    name: "Sci-Fi Pulse",
    description: "Sharp sawtooth textures — futuristic feel.",
    events: {
      bite: { type: "sawtooth", freq: 600, dur: 0.06, gain: 0.045 },
      eat: { type: "sawtooth", freq: 900, dur: 0.16, gain: 0.065, slide: 380 },
      wrong: { type: "square", freq: 110, dur: 0.15, gain: 0.065 },
      combo: {
        type: "sawtooth",
        freq: 1000,
        dur: 0.11,
        gain: 0.065,
        slide: 320,
      },
      levelUp: {
        type: "sawtooth",
        freq: 700,
        dur: 0.26,
        gain: 0.075,
        slide: 540,
      },
      gameOver: {
        type: "square",
        freq: 170,
        dur: 0.55,
        gain: 0.075,
        slide: -130,
      },
      click: { type: "sawtooth", freq: 460, dur: 0.04, gain: 0.035 },
    },
  },
  {
    id: "epic",
    name: "Epic Fantasy",
    description: "Big orchestral stabs — feel like a hero.",
    events: {
      bite: { type: "triangle", freq: 380, dur: 0.09, gain: 0.07 },
      eat: { type: "sine", freq: 520, dur: 0.22, gain: 0.1, slide: 280 },
      wrong: { type: "sawtooth", freq: 90, dur: 0.2, gain: 0.09 },
      combo: { type: "triangle", freq: 660, dur: 0.16, gain: 0.1, slide: 280 },
      levelUp: { type: "sine", freq: 440, dur: 0.4, gain: 0.1, slide: 660 },
      gameOver: {
        type: "sawtooth",
        freq: 110,
        dur: 0.8,
        gain: 0.1,
        slide: -90,
      },
      click: { type: "triangle", freq: 320, dur: 0.05, gain: 0.05 },
    },
  },
  {
    id: "storm",
    name: "Thunder Storm",
    description: "Crackling low rumbles with sharp electric highs.",
    events: {
      bite: { type: "square", freq: 340, dur: 0.06, gain: 0.06 },
      eat: { type: "sawtooth", freq: 800, dur: 0.18, gain: 0.08, slide: -400 },
      wrong: { type: "sawtooth", freq: 80, dur: 0.18, gain: 0.09 },
      combo: { type: "square", freq: 920, dur: 0.12, gain: 0.08, slide: -200 },
      levelUp: {
        type: "sawtooth",
        freq: 600,
        dur: 0.3,
        gain: 0.09,
        slide: 600,
      },
      gameOver: { type: "sawtooth", freq: 60, dur: 0.7, gain: 0.1 },
      click: { type: "square", freq: 380, dur: 0.04, gain: 0.04 },
    },
  },
  {
    id: "taiko",
    name: "Taiko Drums",
    description: "Deep percussive hits — ancient and powerful.",
    events: {
      bite: { type: "triangle", freq: 200, dur: 0.1, gain: 0.08 },
      eat: { type: "sine", freq: 120, dur: 0.25, gain: 0.12, slide: -60 },
      wrong: { type: "sawtooth", freq: 70, dur: 0.2, gain: 0.1 },
      combo: { type: "triangle", freq: 300, dur: 0.15, gain: 0.09 },
      levelUp: { type: "sine", freq: 240, dur: 0.4, gain: 0.11, slide: 120 },
      gameOver: {
        type: "sawtooth",
        freq: 60,
        dur: 0.9,
        gain: 0.12,
        slide: -30,
      },
      click: { type: "triangle", freq: 260, dur: 0.05, gain: 0.06 },
    },
  },
];

// ============================================================================
// GAME REGISTRY — 10 games total (6 original + 4 new)
// ============================================================================
export const GAME_DEFS = [
  // --- Original 6 games ---
  {
    id: "word-muncher",
    name: "Word Muncher",
    tagline: "Clear the pellet trail one correct letter at a time.",
    iconKey: "circle-dot",
    accent: "#ffd23f",
    description:
      "Pac-Man style. Ghost pressure builds on mistakes. Eat every word before the ghosts catch you.",
    tags: ["classic", "pressure"],
  },
  {
    id: "falling-feast",
    name: "Falling Feast",
    tagline: "Catch words before they hit the floor.",
    iconKey: "cloud-rain",
    accent: "#3ee08e",
    description:
      "Words rain down from above. Type them before they land or lose a life.",
    tags: ["reflex", "vertical"],
  },
  {
    id: "bubble-buffet",
    name: "Bubble Buffet",
    tagline: "Pop rising bubbles before they drift out of reach.",
    iconKey: "circle",
    accent: "#b389ff",
    description:
      "Bubbles float upward. Pop them by typing the word inside before they escape.",
    tags: ["chill", "vertical"],
  },
  {
    id: "runner-rush",
    name: "Runner Rush",
    tagline: "Keep pace and snack your way down the track.",
    iconKey: "wind",
    accent: "#ff7849",
    description: "Words approach from the right. Type fast or get left behind.",
    tags: ["speed", "horizontal"],
  },
  {
    id: "type-racer",
    name: "Type Racer",
    tagline: "Race 3 AI opponents across 5 laps. Faster typing = faster car.",
    iconKey: "car",
    accent: "#22e6c5",
    description:
      "Your WPM drives your car. Beat all three AI racers to win the championship.",
    tags: ["racing", "competitive"],
  },
  {
    id: "word-invasion",
    name: "Word Invasion",
    tagline: "Defend the planet from incoming word-asteroids.",
    iconKey: "zap",
    accent: "#ff4d6d",
    description:
      "Words descend in formation from space. Type them to destroy before they reach you.",
    tags: ["shooter", "waves"],
  },

  // --- NEW 4 games ---
  {
    id: "typing-detective",
    name: "Typing Detective",
    tagline: "Solve the mystery by typing the clues!",
    iconKey: "search",
    accent: "#4a90d9",
    description:
      "You're a detective solving cases. Type witness statements and evidence to uncover the truth before time runs out!",
    tags: ["strategy", "detective", "story"],
    isNew: true,
  },
  {
    id: "typing-wizard-duel",
    name: "Wizard Duel",
    tagline: "Cast spells with your keyboard!",
    iconKey: "brain",
    accent: "#8b5cf6",
    description:
      "Battle enemy wizards by typing spell words. The faster you type, the more powerful your magic!",
    tags: ["strategy", "wizard", "competitive"],
    isNew: true,
  },
  {
    id: "zombie-survival",
    name: "Zombie Survival",
    tagline: "Type action words to defend your base!",
    iconKey: "heart",
    accent: "#ef4444",
    description:
      "Repair walls, heal, reload, and fight zombie waves. Every decision matters in this survival typing game!",
    tags: ["survival", "zombie", "defense"],
    isNew: true,
  },
  {
    id: "typing-restaurant",
    name: "Typing Restaurant",
    tagline: "Cook up a storm by typing orders!",
    iconKey: "coffee",
    accent: "#f59e0b",
    description:
      "Run a busy restaurant! Type customer orders quickly to serve meals, earn tips, and keep everyone happy!",
    tags: ["strategy", "restaurant", "speed"],
    isNew: true,
  },
];

// ============================================================================
// DIFFICULTY PRESETS
// ============================================================================
export const DIFFICULTIES = [
  {
    id: "easy",
    label: "Easy 🌱",
    maxWordLen: 5,
    speed: 0.75,
    spawnMs: 1900,
    lives: 5,
  },
  {
    id: "medium",
    label: "Medium ⚡",
    maxWordLen: 7,
    speed: 1.0,
    spawnMs: 1500,
    lives: 4,
  },
  {
    id: "hard",
    label: "Hard 🔥",
    maxWordLen: 9,
    speed: 1.35,
    spawnMs: 1150,
    lives: 3,
  },
  {
    id: "insane",
    label: "Insane 💀",
    maxWordLen: 99,
    speed: 1.8,
    spawnMs: 850,
    lives: 2,
  },
];

export const SESSION_LENGTHS = [30, 60, 90, 120];

// ============================================================================
// WORD BANK
// ============================================================================
export const WORD_BANK = {
  short: [
    "cat",
    "dog",
    "run",
    "sun",
    "key",
    "red",
    "fox",
    "jam",
    "bee",
    "owl",
    "ink",
    "fan",
    "leaf",
    "pie",
    "wave",
    "gold",
    "note",
    "rain",
    "blue",
    "jump",
    "type",
    "fast",
    "word",
    "key",
    "hit",
    "ace",
    "win",
    "top",
    "pro",
    "aim",
  ],
  medium: [
    "planet",
    "window",
    "candle",
    "forest",
    "puzzle",
    "ribbon",
    "castle",
    "mirror",
    "garden",
    "pencil",
    "silver",
    "bottle",
    "button",
    "cloudy",
    "engine",
    "velvet",
    "wonder",
    "yellow",
    "basket",
    "ladder",
    "rocket",
    "sprint",
    "target",
    "method",
    "bridge",
    "camera",
    "dancer",
    "falcon",
    "gentle",
    "humble",
    "impact",
    "jungle",
  ],
  long: [
    "adventure",
    "chocolate",
    "wonderful",
    "butterfly",
    "fireworks",
    "keyboard",
    "triangle",
    "umbrella",
    "mountain",
    "whisper",
    "sandwich",
    "calendar",
    "dinosaur",
    "elephant",
    "treasure",
    "champion",
    "brilliant",
    "lightning",
    "marathon",
    "obstacle",
    "practice",
    "sequence",
    "velocity",
    "wonderful",
  ],
};

export function pickWords(count, difficultyId = "medium") {
  const diff =
    DIFFICULTIES.find((d) => d.id === difficultyId) || DIFFICULTIES[1];
  const pool = [
    ...WORD_BANK.short,
    ...(diff.maxWordLen > 5 ? WORD_BANK.medium : []),
    ...(diff.maxWordLen > 7 ? WORD_BANK.long : []),
  ].filter((w) => w.length <= diff.maxWordLen);
  const safePool = pool.length ? pool : WORD_BANK.short;
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(safePool[Math.floor(Math.random() * safePool.length)]);
  }
  return out;
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================
export const DEFAULT_GAME_SETTINGS = {
  avatarId: "chomp",
  avatarColor: null,
  soundPackId: "arcade",
  masterVolume: 0.7,
  soundOn: true,
  particlesOn: true,
  beaconOn: true,
  reduceMotion: false,
  difficulty: "medium",
  sessionSeconds: 60,
  showBestScore: true,
  showNextTarget: true,
};

export const GAMES_LS_KEY = "swiftkeys_games_data_v2";