// ============================================================================
// Gamefallback.js  —  v4  FINAL  (all 14 games)
// ============================================================================

export const GAME_API_ROUTES = {
  avatars:      "/games/avatars",
  soundPacks:   "/games/sound-packs",
  gameList:     "/games/list",
  wordBank:     "/games/words",
  difficulties: "/games/difficulties",
  leaderboard:  (id) => `/games/leaderboard/${id}`,
  saveSettings: "/games/settings",
  saveResult:   (id) => `/games/${id}/result`,
};

// ── All 14 avatars ────────────────────────────────────────────────────────────
export const GAME_AVATARS = [
  { id:"chomp",   name:"Chomp",   category:"classic", primary:"#ffd23f", secondary:"#a86b00", projectile:"bullet",   weapon:"Chomping",    aura:null,        tagline:"The classic dot-muncher. Hungry. Relentless.",               defaultSoundPack:"arcade" },
  { id:"byte",    name:"Byte",    category:"classic", primary:"#3ee08e", secondary:"#0c7a4a", projectile:"bullet",   weapon:"Laser Gun",   aura:null,        tagline:"A pixel-robot that treats every word like a snack chip.",    defaultSoundPack:"scifi"  },
  { id:"nova",    name:"Nova",    category:"classic", primary:"#b389ff", secondary:"#5b21b6", projectile:"star",     weapon:"Star Burst",  aura:"void",      tagline:"A small star burning brighter with every correct word.",      defaultSoundPack:"chime"  },
  { id:"ember",   name:"Ember",   category:"classic", primary:"#ff7849", secondary:"#9a2a17", projectile:"fireball", weapon:"Fire Throw",  aura:"fire",      tagline:"Breathes fire once the combo gets spicy.",                   defaultSoundPack:"retro"  },
  { id:"glitch",  name:"Glitch",  category:"classic", primary:"#4fd4ff", secondary:"#0a6b8a", projectile:"bullet",   weapon:"Glitch Shot", aura:"cyber",     tagline:"A data-ghost that phases through anything typed right.",      defaultSoundPack:"scifi"  },
  { id:"ryuu",    name:"Ryuu",    category:"anime",   primary:"#ff3c5a", secondary:"#7a0018", projectile:"fireball", weapon:"Dragon Fire", aura:"fire",      tagline:"A tiny dragon who devours words with ancient fury.",          defaultSoundPack:"epic"   },
  { id:"sakura",  name:"Sakura",  category:"anime",   primary:"#ffb7d5", secondary:"#c0185a", projectile:"petal",    weapon:"Petal Storm", aura:"petal",     tagline:"Petals fall when she types. Petals bloom when she scores.",   defaultSoundPack:"chime"  },
  { id:"kumo",    name:"Kumo",    category:"anime",   primary:"#a0cfff", secondary:"#2563a8", projectile:"bolt",     weapon:"Thunder Bolt",aura:"lightning", tagline:"Born in storm clouds. Eats words like thunder.",             defaultSoundPack:"storm"  },
  { id:"oni",     name:"Oni",     category:"anime",   primary:"#ff6b2b", secondary:"#2d0a00", projectile:"fireball", weapon:"Oni Club",    aura:"dark",      tagline:"An oni demon with a taste for rare kanji.",                  defaultSoundPack:"taiko"  },
  { id:"cosmo",   name:"Cosmo",   category:"scifi",   primary:"#c8f564", secondary:"#3d6000", projectile:"bullet",   weapon:"Laser Rifle", aura:"space",     tagline:"Space explorer. Types at the speed of light.",               defaultSoundPack:"scifi"  },
  { id:"zara",    name:"Zara",    category:"scifi",   primary:"#ff2d6b", secondary:"#60001f", projectile:"magic",    weapon:"Energy Whip", aura:"cyber",     tagline:"She hacked the mainframe. Now she's here for your words.",   defaultSoundPack:"scifi"  },
  { id:"glacius", name:"Glacius", category:"fantasy", primary:"#88f0ff", secondary:"#003a52", projectile:"crystal",  weapon:"Freeze Ray",  aura:"ice",       tagline:"Every keystroke forms another ice crystal.",                 defaultSoundPack:"chime"  },
  { id:"solaris", name:"Solaris", category:"fantasy", primary:"#ffe566", secondary:"#b45400", projectile:"beam",     weapon:"Solar Beam",  aura:"solar",     tagline:"A sun deity that feeds on language itself.",                  defaultSoundPack:"epic"   },
  { id:"phantom", name:"Phantom", category:"fantasy", primary:"#9d8fff", secondary:"#1a0038", projectile:"magic",    weapon:"Void Staff",  aura:"void",      tagline:"Moves between keystrokes. Exists only in the gaps.",          defaultSoundPack:"chime"  },
];

export const AVATAR_COLOR_SWATCHES = [
  "#ff4d6d","#ffb703","#3ee08e","#4fd4ff",
  "#b389ff","#f5f5f5","#ff6b2b","#c8f564",
  "#ff2d6b","#88f0ff","#ffe566","#aaaaaa",
];

// ── Sound packs ───────────────────────────────────────────────────────────────
export const SOUND_PACKS = [
  {
    id:"arcade", name:"Arcade Classic", description:"Crunchy 8-bit beeps.",
    events:{ bite:{type:"square",freq:520,dur:0.05,gain:0.05}, eat:{type:"square",freq:720,dur:0.14,gain:0.07,slide:320}, wrong:{type:"sawtooth",freq:130,dur:0.14,gain:0.07}, combo:{type:"square",freq:880,dur:0.1,gain:0.07,slide:260}, levelUp:{type:"square",freq:660,dur:0.24,gain:0.08,slide:440}, gameOver:{type:"sawtooth",freq:220,dur:0.55,gain:0.08,slide:-160}, click:{type:"square",freq:440,dur:0.04,gain:0.04} },
  },
  {
    id:"retro", name:"Retro Synth", description:"Warm sine/triangle tones.",
    events:{ bite:{type:"triangle",freq:460,dur:0.07,gain:0.06}, eat:{type:"sine",freq:640,dur:0.18,gain:0.09,slide:220}, wrong:{type:"triangle",freq:150,dur:0.16,gain:0.07}, combo:{type:"sine",freq:760,dur:0.12,gain:0.08,slide:200}, levelUp:{type:"triangle",freq:540,dur:0.28,gain:0.09,slide:400}, gameOver:{type:"sine",freq:200,dur:0.6,gain:0.09,slide:-150}, click:{type:"triangle",freq:400,dur:0.04,gain:0.04} },
  },
  {
    id:"chime", name:"Soft Chime", description:"Gentle bell tones.",
    events:{ bite:{type:"sine",freq:880,dur:0.08,gain:0.05}, eat:{type:"sine",freq:1040,dur:0.2,gain:0.06,slide:140}, wrong:{type:"sine",freq:290,dur:0.12,gain:0.05}, combo:{type:"sine",freq:1180,dur:0.14,gain:0.06,slide:100}, levelUp:{type:"sine",freq:980,dur:0.32,gain:0.07,slide:280}, gameOver:{type:"sine",freq:250,dur:0.65,gain:0.06,slide:-100}, click:{type:"sine",freq:700,dur:0.03,gain:0.03} },
  },
  {
    id:"scifi", name:"Sci-Fi Pulse", description:"Sharp sawtooth textures.",
    events:{ bite:{type:"sawtooth",freq:600,dur:0.06,gain:0.045}, eat:{type:"sawtooth",freq:900,dur:0.16,gain:0.065,slide:380}, wrong:{type:"square",freq:110,dur:0.15,gain:0.065}, combo:{type:"sawtooth",freq:1000,dur:0.11,gain:0.065,slide:320}, levelUp:{type:"sawtooth",freq:700,dur:0.26,gain:0.075,slide:540}, gameOver:{type:"square",freq:170,dur:0.55,gain:0.075,slide:-130}, click:{type:"sawtooth",freq:460,dur:0.04,gain:0.035} },
  },
  {
    id:"epic", name:"Epic Fantasy", description:"Big orchestral stabs.",
    events:{ bite:{type:"triangle",freq:380,dur:0.09,gain:0.07}, eat:{type:"sine",freq:520,dur:0.22,gain:0.1,slide:280}, wrong:{type:"sawtooth",freq:90,dur:0.2,gain:0.09}, combo:{type:"triangle",freq:660,dur:0.16,gain:0.1,slide:280}, levelUp:{type:"sine",freq:440,dur:0.4,gain:0.1,slide:660}, gameOver:{type:"sawtooth",freq:110,dur:0.8,gain:0.1,slide:-90}, click:{type:"triangle",freq:320,dur:0.05,gain:0.05} },
  },
  {
    id:"storm", name:"Thunder Storm", description:"Crackling electric rumbles.",
    events:{ bite:{type:"square",freq:340,dur:0.06,gain:0.06}, eat:{type:"sawtooth",freq:800,dur:0.18,gain:0.08,slide:-400}, wrong:{type:"sawtooth",freq:80,dur:0.18,gain:0.09}, combo:{type:"square",freq:920,dur:0.12,gain:0.08,slide:-200}, levelUp:{type:"sawtooth",freq:600,dur:0.3,gain:0.09,slide:600}, gameOver:{type:"sawtooth",freq:60,dur:0.7,gain:0.1}, click:{type:"square",freq:380,dur:0.04,gain:0.04} },
  },
  {
    id:"taiko", name:"Taiko Drums", description:"Deep percussive hits.",
    events:{ bite:{type:"triangle",freq:200,dur:0.1,gain:0.08}, eat:{type:"sine",freq:120,dur:0.25,gain:0.12,slide:-60}, wrong:{type:"sawtooth",freq:70,dur:0.2,gain:0.1}, combo:{type:"triangle",freq:300,dur:0.15,gain:0.09}, levelUp:{type:"sine",freq:240,dur:0.4,gain:0.11,slide:120}, gameOver:{type:"sawtooth",freq:60,dur:0.9,gain:0.12,slide:-30}, click:{type:"triangle",freq:260,dur:0.05,gain:0.06} },
  },
];

// ── All 14 games ──────────────────────────────────────────────────────────────
export const GAME_DEFS = [
  { id:"word-muncher",      name:"Word Muncher",      tagline:"Clear the pellet trail one letter at a time.",            iconKey:"circle-dot", accent:"#ffd23f", tags:["classic","pressure"],            description:"Pac-Man style. Ghost pressure builds on mistakes."          },
  { id:"falling-feast",     name:"Falling Feast",     tagline:"Catch words before they hit the floor.",                  iconKey:"cloud-rain", accent:"#3ee08e", tags:["reflex","vertical"],             description:"Words rain down. Type before they land."                     },
  { id:"bubble-buffet",     name:"Bubble Buffet",     tagline:"Pop rising bubbles before they drift out of reach.",      iconKey:"circle",     accent:"#b389ff", tags:["chill","vertical"],              description:"Bubbles float up. Type to pop before they escape."           },
  { id:"runner-rush",       name:"Runner Rush",       tagline:"Keep pace and snack your way down the track.",            iconKey:"wind",       accent:"#ff7849", tags:["speed","horizontal"],            description:"Words approach from right. Type fast or get left behind."    },
  { id:"type-racer",        name:"Type Racer",        tagline:"Race AI opponents. Faster typing = faster car.",          iconKey:"car",        accent:"#22e6c5", tags:["racing","competitive"],          description:"Your WPM drives your car. Beat all opponents.",  isNew:true },
  { id:"word-invasion",     name:"Word Invasion",     tagline:"Defend the planet from word-asteroids.",                  iconKey:"zap",        accent:"#ff4d6d", tags:["shooter","waves"],               description:"Words descend in waves. Type to destroy.",       isNew:true },
  { id:"typing-detective",  name:"Typing Detective",  tagline:"Solve a mystery by typing clues and accusations.",        iconKey:"search",     accent:"#fbbf24", tags:["puzzle","story"],                description:"Search rooms, crack safes, question suspects.",   isNew:true },
  { id:"typing-wizard",     name:"Wizard Duel",       tagline:"Type spells to cast them. Beat the enemy wizard.",        iconKey:"wand",       accent:"#a78bfa", tags:["battle","strategy"],             description:"Fast words = quick spells. Long words = devastation.", isNew:true },
  { id:"zombie-survival",   name:"Zombie Survival",   tagline:"Type actions to defend your base from waves.",            iconKey:"shield",     accent:"#4ade80", tags:["survival","strategy"],           description:"Repair, reload, heal. Wrong choices overwhelm you.", isNew:true },
  { id:"typing-restaurant", name:"Restaurant Rush",   tagline:"Cook orders by typing ingredients before customers leave.",iconKey:"utensils",   accent:"#fb923c", tags:["management","time"],             description:"Rush hours, kitchen fires, impatient customers.",  isNew:true },
  { id:"type-runner",       name:"Type Runner",       tagline:"Type to jump, dash and attack in this platformer!",       iconKey:"gamepad",    accent:"#86efac", tags:["platformer","action"],           description:"Short=jump, Medium=dash, Long=attack obstacles.",  isNew:true },
  { id:"spell-brawler",     name:"Spell Brawler",     tagline:"Type fighting moves to battle AI opponents.",             iconKey:"swords",     accent:"#f43f5e", tags:["fighting","competitive"],        description:"Type punch, kick, special to fight. Win rounds!",  isNew:true },
  { id:"gravity-typer",     name:"Gravity Typer",     tagline:"Pilot a ship through asteroid fields by typing.",         iconKey:"rocket",     accent:"#c8f564", tags:["space","action"],                description:"Type to thrust, rotate and shoot asteroids.",      isNew:true },
  { id:"word-tower-defense",name:"Word Tower Defense",tagline:"Type tower names to place and defend against waves.",     iconKey:"castle",     accent:"#fb923c", tags:["strategy","defense"],            description:"Place towers, earn gold, use abilities.",          isNew:true },
];

// ── Difficulty presets ────────────────────────────────────────────────────────
export const DIFFICULTIES = [
  { id:"easy",   label:"Easy 🌱",   maxWordLen:5,  speed:0.75, spawnMs:1900, lives:5 },
  { id:"medium", label:"Medium ⚡", maxWordLen:7,  speed:1.0,  spawnMs:1500, lives:4 },
  { id:"hard",   label:"Hard 🔥",   maxWordLen:9,  speed:1.35, spawnMs:1150, lives:3 },
  { id:"insane", label:"Insane 💀", maxWordLen:99, speed:1.8,  spawnMs:850,  lives:2 },
];

export const SESSION_LENGTHS = [30, 60, 90, 120];

// ── Projectile options ────────────────────────────────────────────────────────
export const PROJECTILE_OPTIONS = [
  { id:"bullet",   label:"💛 Bullet",    desc:"Fast, reliable"  },
  { id:"arrow",    label:"🏹 Arrow",     desc:"Classic feel"    },
  { id:"magic",    label:"✦ Magic Orb",  desc:"Arcane energy"   },
  { id:"fireball", label:"🔥 Fireball",  desc:"Blazing hot"     },
  { id:"star",     label:"⭐ Star",      desc:"Shining burst"   },
  { id:"bolt",     label:"⚡ Lightning", desc:"Electric speed"  },
  { id:"petal",    label:"🌸 Petal",     desc:"Soft and swift"  },
  { id:"crystal",  label:"💠 Crystal",   desc:"Ice shard"       },
  { id:"beam",     label:"━ Beam",       desc:"Solar blast"     },
];

// ── Word bank ─────────────────────────────────────────────────────────────────
export const WORD_BANK = {
  short:  ["cat","dog","run","sun","key","red","fox","jam","bee","owl","ink","fan","leaf","pie","wave","gold","note","rain","blue","jump","type","fast","word","hit","ace","win","top","pro","aim"],
  medium: ["planet","window","candle","forest","puzzle","ribbon","castle","mirror","garden","pencil","silver","bottle","button","cloudy","engine","velvet","wonder","yellow","basket","ladder","rocket","sprint","target","method","bridge","camera","dancer","falcon","gentle","humble"],
  long:   ["adventure","chocolate","wonderful","butterfly","fireworks","keyboard","triangle","umbrella","mountain","whisper","sandwich","calendar","dinosaur","elephant","treasure","champion","brilliant","lightning","marathon","obstacle","practice","sequence","velocity"],
};

export function pickWords(count, difficultyId = "medium") {
  const diff = DIFFICULTIES.find(d => d.id === difficultyId) || DIFFICULTIES[1];
  const pool = [
    ...WORD_BANK.short,
    ...(diff.maxWordLen > 5 ? WORD_BANK.medium : []),
    ...(diff.maxWordLen > 7 ? WORD_BANK.long   : []),
  ].filter(w => w.length <= diff.maxWordLen);
  const safe = pool.length ? pool : WORD_BANK.short;
  return Array.from({ length: count }, () => safe[Math.floor(Math.random() * safe.length)]);
}

// ── Default settings ──────────────────────────────────────────────────────────
export const DEFAULT_GAME_SETTINGS = {
  avatarId:        "chomp",
  avatarColor:     null,
  projectileType:  "bullet",
  soundPackId:     "arcade",
  masterVolume:    0.7,
  soundOn:         true,
  particlesOn:     true,
  beaconOn:        true,
  reduceMotion:    false,
  difficulty:      "medium",
  sessionSeconds:  60,
  bgTheme:         "space",
  customBgUrl:     null,
  showBestScore:   true,
  showNextTarget:  true,
};

export const GAMES_LS_KEY = "swiftkeys_games_data_v4";