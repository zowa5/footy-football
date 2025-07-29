// Simple test to create tournaments via API
const mongoose = require("mongoose");

// Define simplified schemas for testing
const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    role: String,
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
    lastLogin: Date,
    managerInfo: {
      clubName: String,
      clubLogo: String,
      budget: { type: Number, default: 1000000 },
      reputation: { type: Number, default: 50 },
      experience: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

const TournamentSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    type: { type: String, enum: ["knockout", "round_robin", "league"] },
    status: {
      type: String,
      enum: [
        "registration_open",
        "registration_closed",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
    maxParticipants: Number,
    minParticipants: Number,
    entryFee: Number,
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        teamName: String,
        joinedAt: { type: Date, default: Date.now },
        eliminated: { type: Boolean, default: false },
        finalPosition: Number,
      },
    ],
    prizes: [
      {
        position: Number,
        coins: Number,
        title: String,
        badge: String,
      },
    ],
    rules: {
      allowedRoles: [String],
      minLevel: Number,
      maxLevel: Number,
    },
    schedule: {
      registrationStart: Date,
      registrationEnd: Date,
      tournamentStart: Date,
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

const User = mongoose.model("User", UserSchema);
const Tournament = mongoose.model("Tournament", TournamentSchema);

async function createData() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/pes-football"
    );
    console.log("Connected to MongoDB");

    // Create super admin if not exists
    let superAdmin = await User.findOne({ role: "super_admin" });
    if (!superAdmin) {
      console.log("Creating super admin...");
      superAdmin = await User.create({
        username: "superadmin",
        email: "admin@footyclub.com",
        password:
          "$2a$10$EixZaYVK1fOdKz7kD/MnOOi1i.Vh7H0z6C6KFwG8a2Ks.w1SqpCLe", // admin123
        role: "super_admin",
        coins: 1000000,
        stats: {
          matchesPlayed: 0,
          matchesWon: 0,
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          yellowCards: 0,
          redCards: 0,
          tournamentsWon: 0,
          skillPoints: 9999,
          totalEarnings: 0,
        },
      });
      console.log("✅ Super admin created");
    }

    // Create some sample users for participants
    const sampleUsers = [];
    for (let i = 1; i <= 20; i++) {
      const existingUser = await User.findOne({ username: `manager${i}` });
      if (!existingUser) {
        const user = await User.create({
          username: `manager${i}`,
          email: `manager${i}@example.com`,
          password:
            "$2a$10$EixZaYVK1fOdKz7kD/MnOOi1i.Vh7H0z6C6KFwG8a2Ks.w1SqpCLe",
          role: "manager",
          managerInfo: {
            clubName: `FC Club ${i}`,
            clubLogo: `https://api.dicebear.com/7.x/identicon/svg?seed=club${i}`,
            budget: 1000000,
            reputation: 50 + Math.floor(Math.random() * 50),
            experience: Math.floor(Math.random() * 1000),
            level: Math.floor(Math.random() * 5) + 1,
          },
        });
        sampleUsers.push(user);
      } else {
        sampleUsers.push(existingUser);
      }
    }

    console.log(`✅ Created/found ${sampleUsers.length} sample users`);

    // Check if tournaments already exist
    const existingTournaments = await Tournament.find({
      name: { $in: ["Liga Premier Indonesia", "UEFA Champions League"] },
    });

    if (existingTournaments.length > 0) {
      console.log("✅ Tournaments already exist:");
      existingTournaments.forEach((t) => console.log(`   - ${t.name}`));
      await mongoose.disconnect();
      return;
    }

    const now = new Date();

    // Create Liga Premier Indonesia
    const ligaParticipants = sampleUsers.slice(0, 18).map((user) => ({
      userId: user._id,
      teamName: user.managerInfo?.clubName || `${user.username} FC`,
      joinedAt: new Date(
        now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ),
      eliminated: false,
    }));

    const ligaPremier = await Tournament.create({
      name: "Liga Premier Indonesia",
      description: "The premier professional football league in Indonesia.",
      type: "league",
      status: "in_progress",
      maxParticipants: 18,
      minParticipants: 16,
      entryFee: 100000,
      participants: ligaParticipants,
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
      ],
      rules: {
        allowedRoles: ["manager"],
        minLevel: 1,
        maxLevel: 10,
      },
      schedule: {
        registrationStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        tournamentStart: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        tournamentEnd: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      },
      organizerId: superAdmin._id,
    });

    // Create UEFA Champions League
    const uclParticipants = sampleUsers.slice(0, 16).map((user, index) => ({
      userId: user._id,
      teamName: user.managerInfo?.clubName || `${user.username} FC`,
      joinedAt: new Date(
        now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000
      ),
      eliminated: index >= 8, // Half eliminated
      finalPosition: index >= 8 ? 9 + Math.floor(Math.random() * 8) : undefined,
    }));

    const championsLeague = await Tournament.create({
      name: "UEFA Champions League",
      description:
        "The most prestigious club competition in European football.",
      type: "knockout",
      status: "in_progress",
      maxParticipants: 32,
      minParticipants: 32,
      entryFee: 250000,
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
      ],
      rules: {
        allowedRoles: ["manager"],
        minLevel: 3,
        maxLevel: 10,
      },
      schedule: {
        registrationStart: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        tournamentStart: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        tournamentEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      organizerId: superAdmin._id,
    });

    console.log("✅ Created Liga Premier Indonesia");
    console.log(
      `   - Participants: ${ligaPremier.participants.length}/${ligaPremier.maxParticipants}`
    );
    console.log("✅ Created UEFA Champions League");
    console.log(
      `   - Participants: ${championsLeague.participants.length}/${championsLeague.maxParticipants}`
    );
    console.log(
      `   - Eliminated: ${
        championsLeague.participants.filter((p) => p.eliminated).length
      }`
    );

    await mongoose.disconnect();
    console.log("🏆 Tournament data created successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createData();
