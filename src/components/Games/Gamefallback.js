// ============================================================================
// gamesFallback.js
// ----------------------------------------------------------------------------
// Central fallback/config store for "SwiftKeys Arcade" (the typing games
// page). Mirrors the existing Fallback.js pattern used everywhere else in
// the app: every constant here is "static" on purpose — it's what the UI
// uses until the matching API route (see GAME_API_ROUTES) starts returning
// real data. Components should always call it like:
//
//   const avatars = await apiGet(GAME_API_ROUTES.avatars, GAME_AVATARS);
//
// so the live data wins the moment the backend has it, with zero code
// changes anywhere else.
//
// DEV NOTE: this file is intentionally import-free so it can be pasted
// straight into the project's existing Fallback.js and re-exported from
// there if you'd rather keep a single fallback file. Until then, the games
// page imports directly from here.
// ============================================================================

// ---- API routes these fallbacks back up -----------------------------------
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

// ---- Avatars ----------------------------------------------------------
// Pure CSS/DOM characters — no image assets, so they stay crisp at any size
// and are trivial to re-theme or swap for the real (API-driven) versions
// later. `shape` picks the body silhouette rendered by <GameAvatar/>,
// `accessory` adds one small decorative element.
export const GAME_AVATARS = [
  {
    id: "chomp",
    name: "Chomp",
    shape: "round",
    accessory: "none",
    primary: "#ffd23f",
    secondary: "#a86b00",
    tagline: "The classic dot-muncher. Simple. Hungry. Relentless.",
    defaultSoundPack: "arcade",
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
  },
];

// Quick recolor swatches — lets a player keep their favourite character's
// shape/accessory but tint it. `null` (handled in the UI) means "use the
// avatar's own default colour".
export const AVATAR_COLOR_SWATCHES = [
  "#ff4d6d", "#ffb703", "#3ee08e", "#4fd4ff", "#b389ff", "#f5f5f5",
];

// ---- Sound packs ------------------------------------------------------
// Every "pack" is just a set of oscillator parameters consumed by
// useGameAudio — nothing is loaded from disk, so this works fully offline
// and costs nothing to extend. `slide` (optional) glides the frequency from
// `freq` to `freq + slide` over `dur` seconds for a little extra character.
export const SOUND_PACKS = [
  {
    id: "arcade",
    name: "Arcade Classic",
    description: "Crunchy 8-bit beeps — the original cabinet feel.",
    events: {
      bite: { type: "square", freq: 520, dur: 0.05, gain: 0.05 },
      eat: { type: "square", freq: 720, dur: 0.12, gain: 0.07, slide: 280 },
      wrong: { type: "sawtooth", freq: 140, dur: 0.12, gain: 0.06 },
      combo: { type: "square", freq: 880, dur: 0.09, gain: 0.06, slide: 220 },
      levelUp: { type: "square", freq: 660, dur: 0.22, gain: 0.07, slide: 440 },
      gameOver: { type: "sawtooth", freq: 220, dur: 0.5, gain: 0.07, slide: -160 },
      click: { type: "square", freq: 440, dur: 0.04, gain: 0.04 },
    },
  },
  {
    id: "retro",
    name: "Retro Synth",
    description: "Warm sine/triangle tones, softer on the ears.",
    events: {
      bite: { type: "triangle", freq: 460, dur: 0.06, gain: 0.06 },
      eat: { type: "sine", freq: 640, dur: 0.16, gain: 0.08, slide: 200 },
      wrong: { type: "triangle", freq: 160, dur: 0.14, gain: 0.07 },
      combo: { type: "sine", freq: 760, dur: 0.1, gain: 0.07, slide: 180 },
      levelUp: { type: "triangle", freq: 540, dur: 0.26, gain: 0.08, slide: 380 },
      gameOver: { type: "sine", freq: 200, dur: 0.55, gain: 0.08, slide: -140 },
      click: { type: "triangle", freq: 400, dur: 0.04, gain: 0.04 },
    },
  },
  {
    id: "chime",
    name: "Soft Chime",
    description: "Gentle bell-like tones, calm and unobtrusive.",
    events: {
      bite: { type: "sine", freq: 880, dur: 0.07, gain: 0.05 },
      eat: { type: "sine", freq: 1040, dur: 0.18, gain: 0.06, slide: 120 },
      wrong: { type: "sine", freq: 300, dur: 0.1, gain: 0.05 },
      combo: { type: "sine", freq: 1180, dur: 0.12, gain: 0.06, slide: 90 },
      levelUp: { type: "sine", freq: 980, dur: 0.3, gain: 0.07, slide: 260 },
      gameOver: { type: "sine", freq: 260, dur: 0.6, gain: 0.06, slide: -90 },
      click: { type: "sine", freq: 700, dur: 0.03, gain: 0.03 },
    },
  },
  {
    id: "scifi",
    name: "Sci-Fi Pulse",
    description: "Sharper sawtooth textures for a futuristic feel.",
    events: {
      bite: { type: "sawtooth", freq: 600, dur: 0.05, gain: 0.045 },
      eat: { type: "sawtooth", freq: 900, dur: 0.14, gain: 0.06, slide: 360 },
      wrong: { type: "square", freq: 120, dur: 0.13, gain: 0.06 },
      combo: { type: "sawtooth", freq: 1000, dur: 0.1, gain: 0.06, slide: 300 },
      levelUp: { type: "sawtooth", freq: 700, dur: 0.24, gain: 0.07, slide: 520 },
      gameOver: { type: "square", freq: 180, dur: 0.5, gain: 0.07, slide: -120 },
      click: { type: "sawtooth", freq: 460, dur: 0.04, gain: 0.035 },
    },
  },
];

// ---- Game registry ----------------------------------------------------
// Adding a new game later: drop one entry here (purely metadata/marketing
// copy) + register the component in TypingGamesHub.jsx's GAME_COMPONENTS
// map. Nothing else needs to know about it.
export const GAME_DEFS = [
  {
    id: "word-muncher",
    name: "Word Muncher",
    tagline: "Clear the pellet trail one correct letter at a time.",
    iconKey: "circle-dot",
    accent: "#ffd23f",
  },
  {
    id: "falling-feast",
    name: "Falling Feast",
    tagline: "Catch words before they hit the floor.",
    iconKey: "cloud-rain",
    accent: "#3ee08e",
  },
  {
    id: "bubble-buffet",
    name: "Bubble Buffet",
    tagline: "Pop rising bubbles before they drift out of reach.",
    iconKey: "circle",
    accent: "#b389ff",
  },
  {
    id: "runner-rush",
    name: "Runner Rush",
    tagline: "Keep pace and snack your way down the track.",
    iconKey: "wind",
    accent: "#ff7849",
  },
];

// ---- Difficulty presets -------------------------------------------------
export const DIFFICULTIES = [
  { id: "easy", label: "Easy", maxWordLen: 5, speed: 0.75, spawnMs: 1900, lives: 5 },
  { id: "medium", label: "Medium", maxWordLen: 7, speed: 1.0, spawnMs: 1500, lives: 4 },
  { id: "hard", label: "Hard", maxWordLen: 9, speed: 1.35, spawnMs: 1150, lives: 3 },
  { id: "insane", label: "Insane", maxWordLen: 99, speed: 1.8, spawnMs: 850, lives: 2 },
];

export const SESSION_LENGTHS = [30, 60, 90, 120];

// ---- Word bank -------------------------------------------------------------
// Small curated pools, roughly grouped by length, so each difficulty draws
// fairly. Swap with the real FB word lists or the live API any time.
export const WORD_BANK = {
  short: ["cat", "dog", "run", "sun", "key", "red", "fox", "jam", "bee", "owl", "ink", "fan", "leaf", "pie", "wave", "gold", "note", "rain", "blue", "jump"],
  medium: ["planet", "window", "candle", "forest", "puzzle", "ribbon", "castle", "mirror", "garden", "pencil", "silver", "bottle", "button", "cloudy", "engine", "velvet", "wonder", "yellow", "basket", "ladder"],
  long: ["adventure", "chocolate", "wonderful", "butterfly", "fireworks", "keyboard", "triangle", "umbrella", "mountain", "whisper", "sandwich", "calendar", "dinosaur", "elephant", "treasure"],
};

export function pickWords(count, difficultyId = "medium") {
  const diff = DIFFICULTIES.find((d) => d.id === difficultyId) || DIFFICULTIES[1];
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

// ---- Default per-user game settings ---------------------------------------
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
};

// ---- Guest/local-storage key (used if a Fallback.js LS_KEY isn't reused) --
export const GAMES_LS_KEY = "swiftkeys_games_data_v1";