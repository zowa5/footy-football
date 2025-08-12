const mongoose = require("mongoose");

// Define schemas directly since we can't import from TypeScript files
const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    role: String,
    playerInfo: {
      firstName: String,
      lastName: String,
      position: String,
      age: Number,
      height: Number,
      weight: Number,
      nationality: String,
      club: String,
      offensiveAwareness: Number,
      dribbling: Number,
      lowPass: Number,
      finishing: Number,
      placeKicking: Number,
      speed: Number,
      kickingPower: Number,
      physicalContact: Number,
      stamina: Number,
      ballWinning: Number,
      ballControl: Number,
      tightPossession: Number,
      loftedPass: Number,
      heading: Number,
      curl: Number,
      acceleration: Number,
      jump: Number,
      balance: Number,
      defensiveAwareness: Number,
      aggression: Number,
      gkAwareness: Number,
      gkClearing: Number,
      gkReach: Number,
      gkCatching: Number,
      gkReflexes: Number,
      weakFootUsage: Number,
      weakFootAcc: Number,
      form: Number,
      injuryResistance: Number,
      style: String,
    },
    managerInfo: {
      clubName: String,
      budget: Number,
      reputation: Number,
      experience: Number,
      level: Number,
    },
    coins: Number,
    energy: Number,
    stats: {
      matchesPlayed: Number,
      matchesWon: Number,
      goals: Number,
      assists: Number,
      cleanSheets: Number,
      yellowCards: Number,
      redCards: Number,
      tournamentsWon: Number,
      skillPoints: Number,
      totalEarnings: Number,
    },
    isActive: Boolean,
    lastLogin: Date,
  },
  { timestamps: true }
);

const MatchSchema = new mongoose.Schema(
  {
    homeTeam: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      clubName: String,
      formation: String,
      players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    awayTeam: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      clubName: String,
      formation: String,
      players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    scheduledAt: Date,
    completedAt: Date,
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
    result: {
      homeScore: Number,
      awayScore: Number,
      winner: {
        type: String,
        enum: ["home", "away", "draw"],
      },
    },
    events: [
      {
        type: {
          type: String,
          enum: ["goal", "yellow_card", "red_card", "substitution", "own_goal"],
        },
        minute: Number,
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        playerName: String,
        team: {
          type: String,
          enum: ["home", "away"],
        },
        description: String,
        additionalInfo: String,
      },
    ],
    competition: String,
    matchday: Number,
    venue: String,
    weather: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Match = mongoose.model("Match", MatchSchema);

// Connect to MongoDB
async function createMatchData() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/pes-football-management"
    );
    console.log("Connected to MongoDB");

    // Get all players and their clubs
    const players = await User.find({
      role: "player",
      "playerInfo.club": { $exists: true, $ne: null },
    });

    console.log(`Found ${players.length} players with clubs`);

    if (players.length === 0) {
      console.log("No players with clubs found.");
      await mongoose.disconnect();
      return;
    }

    // Clear existing matches
    await Match.deleteMany({});
    console.log("Cleared existing matches");

    // Get all unique clubs
    const clubs = [...new Set(players.map((p) => p.playerInfo.club))];
    console.log(`Found ${clubs.length} clubs:`, clubs);

    // Competitions available
    const competitions = [
      "Premier League",
      "Champions League",
      "FA Cup",
      "EFL Cup",
      "Community Shield",
    ];

    // Match statuses
    const statuses = ["completed", "scheduled"];

    let matches = [];

    // Create matches for each club
    for (const homeClub of clubs) {
      const otherClubs = clubs.filter((c) => c !== homeClub);

      // Create 10 matches per club (5 completed, 5 scheduled)
      for (let i = 0; i < 10; i++) {
        const isCompleted = i < 5;
        const awayClub =
          otherClubs[Math.floor(Math.random() * otherClubs.length)];
        const competition =
          competitions[Math.floor(Math.random() * competitions.length)];

        // Get home and away teams with player info
        const homeTeamPlayers = players.filter(
          (p) => p.playerInfo.club === homeClub
        );
        const awayTeamPlayers = players.filter(
          (p) => p.playerInfo.club === awayClub
        );

        if (homeTeamPlayers.length === 0 || awayTeamPlayers.length === 0)
          continue;

        const homeTeamUser = homeTeamPlayers[0];
        const awayTeamUser = awayTeamPlayers[0];

        // Create match date
        const now = new Date();
        let matchDate;

        if (isCompleted) {
          // Past dates (last 30 days)
          const daysAgo = Math.floor(Math.random() * 30) + 1;
          matchDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        } else {
          // Future dates (next 30 days)
          const daysAhead = Math.floor(Math.random() * 30) + 1;
          matchDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
        }

        const match = {
          homeTeam: {
            userId: homeTeamUser._id,
            clubName: homeClub,
            formation: "4-4-2", // Default formation
            players: homeTeamPlayers.slice(0, 11).map((p) => p._id), // Take first 11 players
          },
          awayTeam: {
            userId: awayTeamUser._id,
            clubName: awayClub,
            formation: "4-3-3", // Default formation
            players: awayTeamPlayers.slice(0, 11).map((p) => p._id), // Take first 11 players
          },
          scheduledAt: matchDate,
          status: isCompleted ? "completed" : "scheduled",
          competition: competition,
          matchday: Math.floor(Math.random() * 38) + 1,
          venue: `${homeClub} Stadium`,
          weather: "Clear",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add result for completed matches
        if (isCompleted) {
          const homeScore = Math.floor(Math.random() * 5);
          const awayScore = Math.floor(Math.random() * 5);

          match.result = {
            homeScore: homeScore,
            awayScore: awayScore,
            winner:
              homeScore > awayScore
                ? "home"
                : awayScore > homeScore
                ? "away"
                : "draw",
          };

          match.completedAt = matchDate;

          // Add some match events
          match.events = [];

          // Add goals
          for (let g = 0; g < homeScore; g++) {
            const randomPlayer =
              homeTeamPlayers[
                Math.floor(Math.random() * homeTeamPlayers.length)
              ];
            match.events.push({
              type: "goal",
              minute: Math.floor(Math.random() * 90) + 1,
              playerId: randomPlayer._id,
              playerName: `${randomPlayer.playerInfo.firstName} ${randomPlayer.playerInfo.lastName}`,
              team: "home",
              description: "Goal",
            });
          }

          for (let g = 0; g < awayScore; g++) {
            const randomPlayer =
              awayTeamPlayers[
                Math.floor(Math.random() * awayTeamPlayers.length)
              ];
            match.events.push({
              type: "goal",
              minute: Math.floor(Math.random() * 90) + 1,
              playerId: randomPlayer._id,
              playerName: `${randomPlayer.playerInfo.firstName} ${randomPlayer.playerInfo.lastName}`,
              team: "away",
              description: "Goal",
            });
          }

          // Add some cards
          const totalCards = Math.floor(Math.random() * 6);
          for (let c = 0; c < totalCards; c++) {
            const isHome = Math.random() > 0.5;
            const teamPlayers = isHome ? homeTeamPlayers : awayTeamPlayers;
            const randomPlayer =
              teamPlayers[Math.floor(Math.random() * teamPlayers.length)];

            match.events.push({
              type: Math.random() > 0.8 ? "red_card" : "yellow_card",
              minute: Math.floor(Math.random() * 90) + 1,
              playerId: randomPlayer._id,
              playerName: `${randomPlayer.playerInfo.firstName} ${randomPlayer.playerInfo.lastName}`,
              team: isHome ? "home" : "away",
              description: Math.random() > 0.8 ? "Red Card" : "Yellow Card",
            });
          }

          // Sort events by minute
          match.events.sort((a, b) => a.minute - b.minute);
        }

        matches.push(match);
      }
    }

    // Insert matches
    const result = await Match.insertMany(matches);
    console.log(`✅ Created ${result.length} matches`);

    // Show breakdown by status
    const completedMatches = await Match.countDocuments({
      status: "completed",
    });
    const scheduledMatches = await Match.countDocuments({
      status: "scheduled",
    });

    console.log(`📊 Match breakdown:`);
    console.log(`   - Completed: ${completedMatches}`);
    console.log(`   - Scheduled: ${scheduledMatches}`);
    console.log(`   - Total: ${result.length}`);

    // Show some sample matches
    const sampleMatches = await Match.find({})
      .populate("homeTeam.userId", "playerInfo.club")
      .populate("awayTeam.userId", "playerInfo.club")
      .limit(5);

    console.log(`\n🏆 Sample matches:`);
    sampleMatches.forEach((match, index) => {
      const homeClub =
        match.homeTeam.clubName ||
        match.homeTeam.userId?.playerInfo?.club ||
        "Unknown";
      const awayClub =
        match.awayTeam.clubName ||
        match.awayTeam.userId?.playerInfo?.club ||
        "Unknown";
      const result = match.result
        ? `${match.result.homeScore}-${match.result.awayScore}`
        : "TBD";
      console.log(
        `   ${index + 1}. ${homeClub} vs ${awayClub} [${result}] - ${
          match.status
        }`
      );
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createMatchData();
