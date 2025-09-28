const mongoose = require("mongoose");

console.log("🏆 Creating Tournament Data...");

// Define Tournament Schema
const TournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["knockout", "round_robin", "league"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "registration_open",
        "registration_closed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "registration_open",
    },
    maxParticipants: { type: Number, required: true },
    minParticipants: { type: Number, required: true },
    entryFee: { type: Number, default: 0 },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        teamName: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
        eliminated: { type: Boolean, default: false },
        finalPosition: Number,
      },
    ],
    prizes: [
      {
        position: { type: Number, required: true },
        coins: { type: Number, required: true },
        title: String,
        badge: String,
      },
    ],
    rules: {
      allowedRoles: { type: [String], default: ["player", "manager"] },
      minLevel: Number,
      maxLevel: Number,
    },
    schedule: {
      registrationStart: { type: Date, required: true },
      registrationEnd: { type: Date, required: true },
      tournamentStart: { type: Date, required: true },
      tournamentEnd: Date,
    },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Define User Schema (for reference)
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    profilePicture: String,
    bio: String,
    playerInfo: {
      firstName: String,
      lastName: String,
      position: String,
      age: Number,
      height: Number,
      weight: Number,
      nationality: String,
      club: String,
      skills: {
        pace: Number,
        shooting: Number,
        passing: Number,
        dribbling: Number,
        defending: Number,
        physical: Number,
      },
      style: String,
    },
    managerInfo: {
      clubName: String,
      clubLogo: String,
      budget: Number,
      reputation: Number,
      experience: Number,
      level: Number,
    },
    coins: { type: Number, default: 1000 },
    energy: { type: Number, default: 100 },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      cleanSheets: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
      tournamentsWon: { type: Number, default: 0 },
      skillPoints: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Tournament = mongoose.model("Tournament", TournamentSchema);

// Connect to MongoDB
async function populateTournamentData() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/pes-football-management"
    );
    console.log("Connected to MongoDB");

    // Get a super admin user to be the organizer
    const superAdmin = await User.findOne({ role: "super_admin" });
    console.log(
      "Found users with role super_admin:",
      await User.find({ role: "super_admin" }).select("username email role")
    );

    if (!superAdmin) {
      console.log("No super admin found. Checking all admin users...");
      console.log(
        "All users:",
        await User.find({}).select("username email role")
      );
      await mongoose.disconnect();
      return;
    }

    // Check if tournaments already exist
    const existingTournaments = await Tournament.find({
      name: { $in: ["Liga Premier Indonesia", "UEFA Champions League"] },
    });

    if (existingTournaments.length > 0) {
      console.log("Tournaments already exist. Skipping creation.");
      await mongoose.disconnect();
      return;
    }

    // Get some users for participants
    const users = await User.find({
      role: { $in: ["player", "manager"] },
    }).limit(20);
    console.log(`Found ${users.length} users for tournament participants`);

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const twoMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, 1);

    // Create Liga Premier Indonesia
    const ligaPremierParticipants = users.slice(0, 18).map((user, index) => ({
      userId: user._id,
      teamName:
        user.role === "manager"
          ? user.managerInfo?.clubName || `Team ${user.username}`
          : `${user.username} FC`,
      joinedAt: new Date(
        now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ), // Random time in last week
      eliminated: false,
      finalPosition: undefined,
    }));

    const ligaPremier = new Tournament({
      name: "Liga Premier Indonesia",
      description:
        "The premier professional football league in Indonesia, featuring the top clubs competing for the national championship.",
      type: "league",
      status: "in_progress",
      maxParticipants: 18,
      minParticipants: 16,
      entryFee: 100000, // 100k coins
      participants: ligaPremierParticipants,
      prizes: [
        {
          position: 1,
          coins: 2000000,
          title: "Liga Champion",
          badge: "liga_champion",
        },
        {
          position: 2,
          coins: 1500000,
          title: "Liga Runner-up",
          badge: "liga_runner_up",
        },
        {
          position: 3,
          coins: 1000000,
          title: "Liga Third Place",
          badge: "liga_third",
        },
        { position: 4, coins: 750000, title: "European Qualification" },
        { position: 5, coins: 500000, title: "European Qualification" },
        { position: 6, coins: 400000, title: "European Qualification" },
      ],
      rules: {
        allowedRoles: ["manager"],
        minLevel: 1,
        maxLevel: 10,
      },
      schedule: {
        registrationStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        registrationEnd: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        tournamentStart: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        tournamentEnd: twoMonthsLater,
      },
      matches: [],
      organizerId: superAdmin._id,
    });

    // Create UEFA Champions League
    const uclParticipants = users.slice(0, 32).map((user, index) => ({
      userId: user._id,
      teamName:
        user.role === "manager"
          ? user.managerInfo?.clubName || `Team ${user.username}`
          : `${user.username} FC`,
      joinedAt: new Date(
        now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000
      ), // Random time in last 2 weeks
      eliminated: index >= 16, // Half eliminated (Round of 16 completed)
      finalPosition:
        index >= 16 ? 17 + Math.floor(Math.random() * 16) : undefined,
    }));

    const championsLeague = new Tournament({
      name: "UEFA Champions League",
      description:
        "The most prestigious club competition in European football, bringing together the best teams from across the continent.",
      type: "knockout",
      status: "in_progress",
      maxParticipants: 32,
      minParticipants: 32,
      entryFee: 250000, // 250k coins
      participants: uclParticipants,
      prizes: [
        {
          position: 1,
          coins: 5000000,
          title: "European Champion",
          badge: "ucl_champion",
        },
        {
          position: 2,
          coins: 3500000,
          title: "European Runner-up",
          badge: "ucl_runner_up",
        },
        {
          position: 3,
          coins: 2500000,
          title: "European Semi-finalist",
          badge: "ucl_semifinal",
        },
        {
          position: 4,
          coins: 2500000,
          title: "European Semi-finalist",
          badge: "ucl_semifinal",
        },
        {
          position: 8,
          coins: 1500000,
          title: "European Quarter-finalist",
          badge: "ucl_quarterfinal",
        },
        {
          position: 16,
          coins: 1000000,
          title: "Round of 16",
          badge: "ucl_r16",
        },
      ],
      rules: {
        allowedRoles: ["manager"],
        minLevel: 3,
        maxLevel: 10,
      },
      schedule: {
        registrationStart: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        registrationEnd: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        tournamentStart: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        tournamentEnd: nextMonth,
      },
      matches: [],
      organizerId: superAdmin._id,
    });

    // Save tournaments
    await ligaPremier.save();
    await championsLeague.save();

    console.log("✓ Created Liga Premier Indonesia tournament");
    console.log(`  - Type: ${ligaPremier.type}`);
    console.log(`  - Status: ${ligaPremier.status}`);
    console.log(
      `  - Participants: ${ligaPremier.participants.length}/${ligaPremier.maxParticipants}`
    );

    console.log("✓ Created UEFA Champions League tournament");
    console.log(`  - Type: ${championsLeague.type}`);
    console.log(`  - Status: ${championsLeague.status}`);
    console.log(
      `  - Participants: ${championsLeague.participants.length}/${championsLeague.maxParticipants}`
    );
    console.log(
      `  - Eliminated: ${
        championsLeague.participants.filter((p) => p.eliminated).length
      }`
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error populating tournament data:", error);
    process.exit(1);
  }
}

populateTournamentData();
