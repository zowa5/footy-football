// Player positions and their base stat allocations
export const PLAYER_POSITIONS = [
  {
    id: "striker",
    name: "Striker",
    description: "Goal-scoring specialist who leads the attack",
    baseStats: {
      finishing: 85,
      offensiveAwareness: 82,
      speed: 80,
      acceleration: 78,
      jump: 75,
    },
  },
  {
    id: "attacking-midfielder",
    name: "Attacking Midfielder",
    description: "Creative playmaker who connects midfield and attack",
    baseStats: {
      lowPass: 85,
      loftedPass: 80,
      dribbling: 82,
      ballControl: 85,
      offensiveAwareness: 78,
    },
  },
  {
    id: "central-midfielder",
    name: "Central Midfielder",
    description: "Box-to-box player who controls the game tempo",
    baseStats: {
      lowPass: 82,
      stamina: 85,
      defensiveAwareness: 75,
      ballControl: 80,
      physicalContact: 78,
    },
  },
  {
    id: "defensive-midfielder",
    name: "Defensive Midfielder",
    description: "Shield for the defense, breaks up opposition play",
    baseStats: {
      defensiveAwareness: 85,
      ballWinning: 82,
      physicalContact: 80,
      lowPass: 78,
      stamina: 75,
    },
  },
  {
    id: "fullback",
    name: "Fullback",
    description: "Versatile defender who supports both defense and attack",
    baseStats: {
      speed: 82,
      stamina: 85,
      defensiveAwareness: 80,
      loftedPass: 75,
      jump: 78,
    },
  },
  {
    id: "centre-back",
    name: "Centre-Back",
    description: "Heart of defense, strong in aerial duels and tackling",
    baseStats: {
      defensiveAwareness: 85,
      ballWinning: 82,
      jump: 85,
      physicalContact: 80,
      goalkeeping: 40,
    },
  },
  {
    id: "goalkeeper",
    name: "Goalkeeper",
    description: "Last line of defense, shot-stopping specialist",
    baseStats: {
      goalkeeping: 85,
      reflexes: 82,
      reach: 80,
      jump: 78,
      lowPass: 65,
    },
  },
];

// 21 Player attributes
export const PLAYER_ATTRIBUTES = [
  {
    id: "offensiveAwareness",
    name: "Offensive Awareness",
    category: "Attack",
    min: 40,
    max: 99,
  },
  {
    id: "ballControl",
    name: "Ball Control",
    category: "Technique",
    min: 40,
    max: 99,
  },
  {
    id: "dribbling",
    name: "Dribbling",
    category: "Technique",
    min: 40,
    max: 99,
  },
  { id: "lowPass", name: "Low Pass", category: "Passing", min: 40, max: 99 },
  {
    id: "loftedPass",
    name: "Lofted Pass",
    category: "Passing",
    min: 40,
    max: 99,
  },
  { id: "finishing", name: "Finishing", category: "Attack", min: 40, max: 99 },
  {
    id: "placeKicking",
    name: "Place Kicking",
    category: "Attack",
    min: 40,
    max: 99,
  },
  { id: "swerve", name: "Swerve", category: "Technique", min: 40, max: 99 },
  { id: "header", name: "Header", category: "Attack", min: 40, max: 99 },
  {
    id: "defensiveAwareness",
    name: "Defensive Awareness",
    category: "Defense",
    min: 40,
    max: 99,
  },
  {
    id: "ballWinning",
    name: "Ball Winning",
    category: "Defense",
    min: 40,
    max: 99,
  },
  {
    id: "goalkeeping",
    name: "Goalkeeping",
    category: "Goalkeeping",
    min: 40,
    max: 99,
  },
  {
    id: "reflexes",
    name: "Reflexes",
    category: "Goalkeeping",
    min: 40,
    max: 99,
  },
  { id: "reach", name: "Reach", category: "Goalkeeping", min: 40, max: 99 },
  { id: "speed", name: "Speed", category: "Physical", min: 40, max: 99 },
  {
    id: "acceleration",
    name: "Acceleration",
    category: "Physical",
    min: 40,
    max: 99,
  },
  {
    id: "kickingPower",
    name: "Kicking Power",
    category: "Physical",
    min: 40,
    max: 99,
  },
  { id: "jump", name: "Jump", category: "Physical", min: 40, max: 99 },
  {
    id: "physicalContact",
    name: "Physical Contact",
    category: "Physical",
    min: 40,
    max: 99,
  },
  { id: "balance", name: "Balance", category: "Physical", min: 40, max: 99 },
  { id: "stamina", name: "Stamina", category: "Physical", min: 40, max: 99 },
];

// 36 Playing styles (12 per category)
export const PLAYING_STYLES = [
  // Attack Styles
  {
    id: "goalPoacher",
    name: "Goal Poacher",
    category: "Attack",
    description: "Clinical finisher in the box",
  },
  {
    id: "targetMan",
    name: "Target Man",
    category: "Attack",
    description: "Physical striker who holds up play",
  },
  {
    id: "dummyRunner",
    name: "Dummy Runner",
    category: "Attack",
    description: "Creates space with intelligent runs",
  },
  {
    id: "foxInTheBox",
    name: "Fox in the Box",
    category: "Attack",
    description: "Opportunistic goalscorer",
  },
  {
    id: "falseNine",
    name: "False 9",
    category: "Attack",
    description: "Drops deep to create plays",
  },
  {
    id: "crossSpecialist",
    name: "Cross Specialist",
    category: "Attack",
    description: "Delivers dangerous crosses",
  },
  {
    id: "cutInsideWinger",
    name: "Cut Inside Winger",
    category: "Attack",
    description: "Cuts inside from wide positions",
  },
  {
    id: "winger",
    name: "Classic Winger",
    category: "Attack",
    description: "Hugs the touchline and crosses",
  },
  {
    id: "shadowStriker",
    name: "Shadow Striker",
    category: "Attack",
    description: "Second striker who finds space",
  },
  {
    id: "trequartista",
    name: "Trequartista",
    category: "Attack",
    description: "Creative playmaker behind striker",
  },
  {
    id: "insideForward",
    name: "Inside Forward",
    category: "Attack",
    description: "Winger who drifts centrally",
  },
  {
    id: "poacher",
    name: "Poacher",
    category: "Attack",
    description: "Pure goalscorer in the penalty area",
  },

  // Midfield Styles
  {
    id: "playmaker",
    name: "Playmaker",
    category: "Midfield",
    description: "Orchestrates team's attacking play",
  },
  {
    id: "boxToBox",
    name: "Box-to-Box",
    category: "Midfield",
    description: "Covers entire pitch defensively and offensively",
  },
  {
    id: "anchorMan",
    name: "Anchor Man",
    category: "Midfield",
    description: "Sits deep and shields defense",
  },
  {
    id: "destroyer",
    name: "Destroyer",
    category: "Midfield",
    description: "Aggressive ball winner",
  },
  {
    id: "deepLyingPlaymaker",
    name: "Deep Lying Playmaker",
    category: "Midfield",
    description: "Dictates play from deep",
  },
  {
    id: "roamingPlaymaker",
    name: "Roaming Playmaker",
    category: "Midfield",
    description: "Finds space all over the pitch",
  },
  {
    id: "ballWinner",
    name: "Ball Winner",
    category: "Midfield",
    description: "Specializes in regaining possession",
  },
  {
    id: "engineRoom",
    name: "Engine Room",
    category: "Midfield",
    description: "Tireless central midfielder",
  },
  {
    id: "regista",
    name: "Regista",
    category: "Midfield",
    description: "Deep-lying creative midfielder",
  },
  {
    id: "carrierPasser",
    name: "Carrier Passer",
    category: "Midfield",
    description: "Carries ball forward and distributes",
  },
  {
    id: "centralMedian",
    name: "Central Median",
    category: "Midfield",
    description: "Balanced central midfielder",
  },
  {
    id: "shuttler",
    name: "Shuttler",
    category: "Midfield",
    description: "Covers ground between boxes",
  },

  // Defense Styles
  {
    id: "sweeper",
    name: "Sweeper",
    category: "Defense",
    description: "Clears danger behind defensive line",
  },
  {
    id: "stopper",
    name: "Stopper",
    category: "Defense",
    description: "Aggressive center-back who steps up",
  },
  {
    id: "ballPlayingDefender",
    name: "Ball Playing Defender",
    category: "Defense",
    description: "Comfortable on the ball",
  },
  {
    id: "fullBackFinisher",
    name: "Fullback Finisher",
    category: "Defense",
    description: "Attacking fullback who gets forward",
  },
  {
    id: "defensiveMinded",
    name: "Defensive Minded",
    category: "Defense",
    description: "Focuses purely on defending",
  },
  {
    id: "wingBack",
    name: "Wing Back",
    category: "Defense",
    description: "Provides width in attack and defense",
  },
  {
    id: "manMarker",
    name: "Man Marker",
    category: "Defense",
    description: "Shadows specific opposition player",
  },
  {
    id: "libero",
    name: "Libero",
    category: "Defense",
    description: "Free-roaming sweeper who joins attack",
  },
  {
    id: "overlappingFullback",
    name: "Overlapping Fullback",
    category: "Defense",
    description: "Runs beyond winger in attack",
  },
  {
    id: "defensiveFullback",
    name: "Defensive Fullback",
    category: "Defense",
    description: "Stays back to defend",
  },
  {
    id: "aerialDefender",
    name: "Aerial Defender",
    category: "Defense",
    description: "Dominates in the air",
  },
  {
    id: "speedster",
    name: "Speedster",
    category: "Defense",
    description: "Uses pace to track runners",
  },
];

// Player skills (more than 3, player chooses 3)
export const PLAYER_SKILLS = [
  {
    id: "scissorsFeint",
    name: "Scissors Feint",
    description: "Gerakan tipu dengan kaki bergantian untuk melewati lawan",
    cost: 400,
  },
  {
    id: "doubleTouch",
    name: "Double Touch",
    description: "Kontrol bola cepat dua kali untuk mengecoh lawan",
    cost: 450,
  },
  {
    id: "flipFlap",
    name: "Flip Flap",
    description: "Gerakan dribel cepat untuk menggoyang bek lawan",
    cost: 500,
  },
  {
    id: "marseilleTurn",
    name: "Marseille Turn",
    description: "Putaran elegan 360 derajat untuk lewati lawan",
    cost: 500,
  },
  {
    id: "sombrero",
    name: "Sombrero",
    description: "Mengangkat bola melewati kepala lawan",
    cost: 450,
  },
  {
    id: "crossOverTurn",
    name: "Cross Over Turn",
    description: "Putaran dengan kaki menyilang untuk ubah arah cepat",
    cost: 400,
  },
  {
    id: "cutBehindTurn",
    name: "Cut Behind & Turn",
    description: "Memotong bola ke belakang lalu putar arah",
    cost: 400,
  },
  {
    id: "scotchMove",
    name: "Scotch Move",
    description: "Gerakan mengecoh dengan stop-go tiba-tiba",
    cost: 400,
  },
  {
    id: "stepOnControl",
    name: "Step On Skill Control",
    description: "Kontrol bola dengan menahan di atas kaki untuk ubah arah",
    cost: 350,
  },
  {
    id: "heading",
    name: "Heading",
    description: "Kemampuan menyundul bola dengan presisi",
    cost: 400,
  },
  {
    id: "longRangeDrive",
    name: "Long Range Drive",
    description: "Tembakan jarak jauh yang bertenaga dan akurat",
    cost: 500,
  },
  {
    id: "chipShot",
    name: "Chip Shot Control",
    description: "Tendangan cungkil dengan kontrol tinggi",
    cost: 450,
  },
  {
    id: "longRangeShooting",
    name: "Long Range Shooting",
    description: "Kemampuan menembak dari luar kotak penalti",
    cost: 450,
  },
  {
    id: "knuckleShot",
    name: "Knuckle Shot",
    description: "Tembakan tanpa spin dengan arah tidak terduga",
    cost: 600,
  },
  {
    id: "dippingShot",
    name: "Dipping Shot",
    description: "Tembakan yang menukik tajam di akhir lintasan",
    cost: 500,
  },
  {
    id: "risingShots",
    name: "Rising Shots",
    description: "Tendangan mendatar yang naik cepat ke atas",
    cost: 500,
  },
  {
    id: "acrobaticFinishing",
    name: "Acrobatic Finishing",
    description: "Finishing spektakuler dengan gaya akrobatik",
    cost: 600,
  },
  {
    id: "heelTrick",
    name: "Heel Trick",
    description: "Gerakan mengecoh menggunakan tumit",
    cost: 400,
  },
  {
    id: "firstTimeShot",
    name: "First-time Shot",
    description: "Langsung menembak tanpa kontrol bola terlebih dahulu",
    cost: 450,
  },
  {
    id: "oneTouchPass",
    name: "One-touch Pass",
    description: "Operan cepat tanpa kontrol bola dulu",
    cost: 450,
  },
  {
    id: "throughPassing",
    name: "Through Passing",
    description: "Umpan terobosan yang akurat di antara pertahanan lawan",
    cost: 500,
  },
  {
    id: "weightedPass",
    name: "Weighted Pass",
    description: "Umpan dengan kekuatan ideal untuk rekan tim",
    cost: 450,
  },
  {
    id: "pinpointCrossing",
    name: "Pinpoint Crossing",
    description: "Umpan silang yang sangat akurat",
    cost: 500,
  },
  {
    id: "outsideCurler",
    name: "Outside Curler",
    description: "Tendangan melengkung menggunakan sisi luar kaki",
    cost: 550,
  },
  {
    id: "rabona",
    name: "Rabona",
    description: "Menendang bola dengan kaki menyilang di belakang",
    cost: 500,
  },
  {
    id: "noLookPass",
    name: "No Look Pass",
    description: "Mengumpan bola tanpa melihat arah target",
    cost: 450,
  },
  {
    id: "lowLoftedPass",
    name: "Low Lofted Pass",
    description: "Umpan lambung rendah yang cepat",
    cost: 400,
  },
  {
    id: "gkLowPunt",
    name: "GK Low Punt",
    description: "Tendangan jarak jauh rendah dari kiper",
    cost: 350,
  },
  {
    id: "gkHighPunt",
    name: "GK High Punt",
    description: "Tendangan tinggi dari kiper untuk jarak jauh",
    cost: 350,
  },
  {
    id: "longThrow",
    name: "Long Throw",
    description: "Spesialis lemparan jauh ke dalam area penalti",
    cost: 300,
  },
  {
    id: "gkLongThrow",
    name: "GK Long Throw",
    description: "Lemparan tangan jauh dari penjaga gawang",
    cost: 300,
  },
  {
    id: "penaltySpecialist",
    name: "Penalty Specialist",
    description: "Kemampuan eksekusi penalti yang tinggi",
    cost: 600,
  },
  {
    id: "gkPenaltySaver",
    name: "GK Penalty Saver",
    description: "Kemampuan kiper dalam menggagalkan penalti",
    cost: 600,
  },
  {
    id: "gamesmanship",
    name: "Gamesmanship",
    description: "Cerdas mengatur tempo dan mengganggu lawan secara sah",
    cost: 450,
  },
  {
    id: "manMarking",
    name: "Man Marking",
    description: "Kemampuan menjaga pergerakan lawan satu lawan satu",
    cost: 450,
  },
  {
    id: "trackBack",
    name: "Track Back",
    description: "Kebiasaan cepat kembali bertahan saat kehilangan bola",
    cost: 400,
  },
  {
    id: "interception",
    name: "Interception",
    description: "Kemampuan membaca dan memotong operan lawan",
    cost: 450,
  },
  {
    id: "acrobaticClear",
    name: "Acrobatic Clear",
    description: "Pembersihan bola secara akrobatik dari area berbahaya",
    cost: 400,
  },
  {
    id: "captaincy",
    name: "Captaincy",
    description: "Kepemimpinan di lapangan dan memotivasi tim",
    cost: 500,
  },
  {
    id: "superSub",
    name: "Super-sub",
    description: "Efektif saat masuk sebagai pemain pengganti",
    cost: 500,
  },
  {
    id: "fightingSpirit",
    name: "Fighting Spirit",
    description: "Semangat juang tinggi hingga menit akhir",
    cost: 500,
  },
];

// COM Playing styles (more than 3, player chooses 3)
export const COM_STYLES = [
  {
    id: "trickster",
    name: "Trickster",
    description:
      "Ahli “step-over” dan skill moves, pemain ini sering menggunakan trik untuk melewati lawan",
    cost: 400,
  },
  {
    id: "mazingRun",
    name: "Mazing Run",
    description:
      "Pemain yang kerap melakukan dribel lewat putaran cepat untuk menpenetrasi daerah lawan",
    cost: 350,
  },
  {
    id: "incisiveRun",
    name: "Incisive Run",
    description:
      "Sangat mahir melakukan potongan ke dalam, terutama dari sayap, untuk menciptakan peluang mencetak gol",
    cost: 300,
  },
  {
    id: "earlyCross",
    name: "Early Cross",
    description:
      "Pemain ini memiliki penglihatan dan timing yang baik untuk mengirim umpan silang sejak awal sebelum lawan siap",
    cost: 350,
  },
  {
    id: "speedingBullet",
    name: "Speeding Bullet",
    description:
      "Sangat cepat dan agresif maju ke depan, memanfaatkan pace untuk menerobos lini belakang",
    cost: 350,
  },
  {
    id: "longBallExpert",
    name: "Long Ball Expert",
    description:
      "Ahli dalam memainkan umpan panjang, sering menggunakan bola jauh untuk membuka pertahanan lawan",
    cost: 450,
  },
  {
    id: "longRanger",
    name: "Long Ranger",
    description:
      "Sering mencetak gol dari luar kotak, dengan tembakan jarak jauh sebagai kekuatan utamanya",
    cost: 300,
  },
];

export const CURRENCIES = {
  gp: "GP", // General Points
  fc: "FC", // Football Coins
};
