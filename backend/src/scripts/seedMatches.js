const mongoose = require("mongoose");

require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/pes-football-management";

// Define schemas directly in the script
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,
  playerInfo: {
    club: String,
  },
  managerInfo: {
    clubName: String,
  },
});

const matchEventSchema = new mongoose.Schema(
  {
    minute: Number,
    type: {
      type: String,
      enum: ["goal", "yellow_card", "red_card", "substitution"],
    },
    playerId: String,
    description: String,
  },
  { _id: false }
);

const matchResultSchema = new mongoose.Schema(
  {
    homeScore: Number,
    awayScore: Number,
    winner: String,
    duration: Number,
    events: [matchEventSchema],
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    homeTeam: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      teamName: String,
    },
    awayTeam: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      teamName: String,
    },
    type: {
      type: String,
      enum: ["friendly", "ranked", "tournament", "practice"],
      default: "friendly",
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    scheduledAt: Date,
    startedAt: Date,
    completedAt: Date,
    result: matchResultSchema,
    rewards: {
      homeTeam: {
        coins: Number,
        experience: Number,
      },
      awayTeam: {
        coins: Number,
        experience: Number,
      },
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
const Match = mongoose.model("Match", matchSchema);

async function seedMatches() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all players and managers
    const players = await User.find({ role: "player" }).limit(50);
    const managers = await User.find({ role: "manager" }).limit(10);

    if (players.length < 4) {
      console.log("❌ Need at least 4 players to create matches");
      return;
    }

    console.log(
      `Found ${players.length} players and ${managers.length} managers`
    );

    // Generate match events
    const generateMatchEvents = (homeScore, awayScore) => {
      const events = [];
      const totalGoals = homeScore + awayScore;

      // Generate goal events
      for (let i = 0; i < totalGoals; i++) {
        const minute = Math.floor(Math.random() * 90) + 1;
        const isHomeGoal = Math.random() < homeScore / totalGoals;
        events.push({
          minute,
          type: "goal",
          playerId: null,
          description: isHomeGoal
            ? `Goal scored by home team at minute ${minute}`
            : `Goal scored by away team at minute ${minute}`,
        });
      }

      // Generate yellow cards (0-4 per match)
      const yellowCards = Math.floor(Math.random() * 5);
      for (let i = 0; i < yellowCards; i++) {
        const minute = Math.floor(Math.random() * 90) + 1;
        events.push({
          minute,
          type: "yellow_card",
          playerId: null,
          description: `Yellow card shown at minute ${minute}`,
        });
      }

      // Generate red cards (0-1 per match)
      if (Math.random() < 0.1) {
        // 10% chance of red card
        const minute = Math.floor(Math.random() * 90) + 1;
        events.push({
          minute,
          type: "red_card",
          playerId: null,
          description: `Red card shown at minute ${minute}`,
        });
      }

      // Generate substitutions (0-3 per team)
      const substitutions = Math.floor(Math.random() * 7); // 0-6 total subs
      for (let i = 0; i < substitutions; i++) {
        const minute = Math.floor(Math.random() * 45) + 45; // Usually in second half
        events.push({
          minute,
          type: "substitution",
          playerId: null,
          description: `Substitution made at minute ${minute}`,
        });
      }

      // Sort events by minute
      return events.sort((a, b) => a.minute - b.minute);
    };

    // Delete existing matches
    await Match.deleteMany({});
    console.log("🗑️ Cleared existing matches");

    const matches = [];
    const matchTypes = ["friendly", "ranked", "tournament"];
    const statuses = ["completed", "in_progress", "scheduled"];

    // Get all unique clubs for creating club vs club matches
    const playerClubs = players
      .filter((p) => p.playerInfo?.club)
      .map((p) => p.playerInfo.club);
    const managerClubs = managers
      .filter((m) => m.managerInfo?.clubName)
      .map((m) => m.managerInfo.clubName);

    const allClubs = [...new Set([...playerClubs, ...managerClubs])];
    console.log(`Found ${allClubs.length} unique clubs:`, allClubs);

    // Generate matches for the last 30 days
    for (let day = 0; day < 30; day++) {
      const matchDate = new Date();
      matchDate.setDate(matchDate.getDate() - day);

      // Generate 2-6 matches per day
      const matchesPerDay = Math.floor(Math.random() * 5) + 2;

      for (let match = 0; match < matchesPerDay; match++) {
        // Random clubs for home and away teams
        const homeClub = allClubs[Math.floor(Math.random() * allClubs.length)];
        const awayClub = allClubs[Math.floor(Math.random() * allClubs.length)];

        if (homeClub === awayClub) continue; // Skip same club

        // Find a representative player/manager for each club
        const homeRepresentative = [...players, ...managers].find(
          (p) =>
            p.playerInfo?.club === homeClub ||
            p.managerInfo?.clubName === homeClub
        );
        const awayRepresentative = [...players, ...managers].find(
          (p) =>
            p.playerInfo?.club === awayClub ||
            p.managerInfo?.clubName === awayClub
        );

        if (!homeRepresentative || !awayRepresentative) continue;

        const homeScore = Math.floor(Math.random() * 6); // 0-5 goals
        const awayScore = Math.floor(Math.random() * 6); // 0-5 goals
        const duration = Math.floor(Math.random() * 30) + 90; // 90-120 minutes

        const matchType =
          matchTypes[Math.floor(Math.random() * matchTypes.length)];
        let status = statuses[Math.floor(Math.random() * statuses.length)];

        // Only future matches can be scheduled
        if (matchDate > new Date()) {
          status = "scheduled";
        }

        // Set specific time for the match
        const matchTime = new Date(matchDate);
        matchTime.setHours(
          Math.floor(Math.random() * 12) + 10, // 10 AM to 10 PM
          Math.floor(Math.random() * 60), // Random minutes
          0,
          0
        );

        const newMatch = {
          homeTeam: {
            userId: homeRepresentative._id,
            teamName: homeClub,
          },
          awayTeam: {
            userId: awayRepresentative._id,
            teamName: awayClub,
          },
          type: matchType,
          status: status,
          scheduledAt: matchTime,
          startedAt: status !== "scheduled" ? matchTime : undefined,
          completedAt:
            status === "completed"
              ? new Date(matchTime.getTime() + duration * 60000)
              : undefined,
        };

        // Add result for completed matches
        if (status === "completed") {
          const events = generateMatchEvents(homeScore, awayScore);
          let winner = "draw";
          if (homeScore > awayScore) winner = "home";
          else if (awayScore > homeScore) winner = "away";

          newMatch.result = {
            homeScore,
            awayScore,
            winner,
            duration,
            events,
          };

          // Add rewards for completed matches
          newMatch.rewards = {
            homeTeam: {
              coins: winner === "home" ? 100 : winner === "draw" ? 50 : 25,
              experience: winner === "home" ? 50 : winner === "draw" ? 25 : 10,
            },
            awayTeam: {
              coins: winner === "away" ? 100 : winner === "draw" ? 50 : 25,
              experience: winner === "away" ? 50 : winner === "draw" ? 25 : 10,
            },
          };
        }

        matches.push(newMatch);
      }
    }

    // Insert all matches
    await Match.insertMany(matches);
    console.log(`✅ Created ${matches.length} matches`);

    // Show statistics
    const totalMatches = await Match.countDocuments();
    const completedMatches = await Match.countDocuments({
      status: "completed",
    });
    const inProgressMatches = await Match.countDocuments({
      status: "in_progress",
    });
    const scheduledMatches = await Match.countDocuments({
      status: "scheduled",
    });

    console.log("\n📊 Match Statistics:");
    console.log(`Total Matches: ${totalMatches}`);
    console.log(`Completed: ${completedMatches}`);
    console.log(`In Progress: ${inProgressMatches}`);
    console.log(`Scheduled: ${scheduledMatches}`);

    // Show match events statistics
    const matchesWithEvents = await Match.find({
      "result.events": { $exists: true, $ne: [] },
    });
    let totalGoals = 0;
    let totalYellowCards = 0;
    let totalRedCards = 0;
    let totalSubstitutions = 0;

    matchesWithEvents.forEach((match) => {
      if (match.result && match.result.events) {
        totalGoals += match.result.events.filter(
          (e) => e.type === "goal"
        ).length;
        totalYellowCards += match.result.events.filter(
          (e) => e.type === "yellow_card"
        ).length;
        totalRedCards += match.result.events.filter(
          (e) => e.type === "red_card"
        ).length;
        totalSubstitutions += match.result.events.filter(
          (e) => e.type === "substitution"
        ).length;
      }
    });

    console.log("\n⚽ Events Statistics:");
    console.log(`Total Goals: ${totalGoals}`);
    console.log(`Total Yellow Cards: ${totalYellowCards}`);
    console.log(`Total Red Cards: ${totalRedCards}`);
    console.log(`Total Substitutions: ${totalSubstitutions}`);

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding matches:", error);
    process.exit(1);
  }
}

seedMatches();
