// Full seed script with 10 clubs and 15 players each
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

console.log("🚀 Starting full club seeding...");

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
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

const main = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/pes-football-management");
    console.log("✅ MongoDB Connected");

    console.log("🧹 Clearing existing users...");
    await User.deleteMany({});
    console.log("✅ Users cleared");

    console.log("🌱 Creating club data for 10 clubs...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const clubs = [
      "Arsenal FC",
      "Manchester United",
      "Liverpool FC",
      "Chelsea FC",
      "Manchester City",
      "Tottenham Hotspur",
      "Newcastle United",
      "Brighton FC",
      "West Ham United",
      "Aston Villa",
    ];

    const firstNames = [
      "Alexander",
      "Benjamin",
      "Christopher",
      "Daniel",
      "Ethan",
      "Felix",
      "Gabriel",
      "Henry",
      "Isaac",
      "James",
      "Kevin",
      "Liam",
      "Mason",
      "Nathan",
      "Oliver",
      "Patrick",
      "Quinn",
      "Ryan",
      "Samuel",
      "Thomas",
      "Victor",
      "William",
      "Xavier",
      "Yusuf",
      "Zachary",
    ];

    const lastNames = [
      "Anderson",
      "Brown",
      "Clark",
      "Davis",
      "Evans",
      "Foster",
      "Green",
      "Harris",
      "Johnson",
      "King",
      "Lewis",
      "Martin",
      "Nelson",
      "O'Connor",
      "Parker",
      "Roberts",
      "Smith",
      "Taylor",
      "Walker",
      "Wilson",
    ];

    const positions = [
      "GK",
      "CB",
      "LB",
      "RB",
      "CDM",
      "CM",
      "CAM",
      "LM",
      "RM",
      "LW",
      "RW",
      "ST",
    ];
    const styles = [
      "aggressive",
      "technical",
      "balanced",
      "defensive",
      "attacking",
    ];
    const nationalities = [
      "England",
      "Spain",
      "France",
      "Brazil",
      "Argentina",
      "Germany",
      "Italy",
    ];

    let usersToCreate = [];

    for (let i = 0; i < clubs.length; i++) {
      const clubName = clubs[i];
      console.log(`   Creating ${clubName}...`);

      // Create manager
      const manager = {
        username: `manager_${clubName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")}`,
        email: `manager@${clubName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")}.com`,
        password: hashedPassword,
        role: "manager",
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=manager_${i}`,
        bio: `Manager of ${clubName}`,
        managerInfo: {
          clubName: clubName,
          budget: Math.floor(Math.random() * 50000000) + 30000000, // 30M-80M
          reputation: Math.floor(Math.random() * 40) + 60, // 60-100
          experience: Math.floor(Math.random() * 20) + 5, // 5-25 years
          level: Math.floor(Math.random() * 8) + 3, // 3-10
        },
        coins: Math.floor(Math.random() * 100000) + 50000, // 50K-150K
        energy: 100,
        stats: {
          matchesPlayed: Math.floor(Math.random() * 200) + 100,
          matchesWon: Math.floor(Math.random() * 120) + 50,
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          yellowCards: 0,
          redCards: 0,
          tournamentsWon: Math.floor(Math.random() * 5),
          skillPoints: Math.floor(Math.random() * 1000) + 500,
        },
      };
      usersToCreate.push(manager);

      // Create 15 players for this club
      for (let j = 0; j < 15; j++) {
        const firstName =
          firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName =
          lastNames[Math.floor(Math.random() * lastNames.length)];
        const position =
          positions[Math.floor(Math.random() * positions.length)];
        const style = styles[Math.floor(Math.random() * styles.length)];
        const nationality =
          nationalities[Math.floor(Math.random() * nationalities.length)];

        const player = {
          username: `${firstName}_${lastName}_${clubName.replace(
            /[^a-zA-Z0-9]/g,
            ""
          )}_${j}`.toLowerCase(),
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${j}@${clubName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")}.com`,
          password: hashedPassword,
          role: "player",
          profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}_${lastName}_${j}`,
          bio: `Professional player at ${clubName}`,
          playerInfo: {
            firstName: firstName,
            lastName: lastName,
            position: position,
            age: Math.floor(Math.random() * 15) + 18, // 18-32 years
            height: Math.floor(Math.random() * 30) + 170, // 170-200 cm
            weight: Math.floor(Math.random() * 30) + 65, // 65-95 kg
            nationality: nationality,
            club: clubName,
            skills: {
              pace: Math.floor(Math.random() * 40) + 60, // 60-99
              shooting: Math.floor(Math.random() * 40) + 60,
              passing: Math.floor(Math.random() * 40) + 60,
              dribbling: Math.floor(Math.random() * 40) + 60,
              defending:
                position.includes("CB") ||
                position.includes("B") ||
                position === "CDM"
                  ? Math.floor(Math.random() * 40) + 60
                  : Math.floor(Math.random() * 30) + 40,
              physical: Math.floor(Math.random() * 40) + 60,
            },
            style: style,
          },
          coins: Math.floor(Math.random() * 20000) + 5000, // 5K-25K
          energy: Math.floor(Math.random() * 50) + 50, // 50-100
          stats: {
            matchesPlayed: Math.floor(Math.random() * 100) + 10,
            matchesWon: Math.floor(Math.random() * 60) + 5,
            goals:
              position === "ST" || position.includes("W")
                ? Math.floor(Math.random() * 50) + 5
                : Math.floor(Math.random() * 20),
            assists: Math.floor(Math.random() * 30),
            cleanSheets: position === "GK" ? Math.floor(Math.random() * 20) : 0,
            yellowCards: Math.floor(Math.random() * 10),
            redCards: Math.floor(Math.random() * 3),
            tournamentsWon: Math.floor(Math.random() * 3),
            skillPoints: Math.floor(Math.random() * 100) + 50,
          },
        };
        usersToCreate.push(player);
      }
    }

    console.log(
      `📥 Inserting ${usersToCreate.length} users (10 managers + 150 players)...`
    );
    await User.insertMany(usersToCreate);

    const finalCount = await User.countDocuments();
    console.log(`✅ Successfully created ${finalCount} users!`);

    const managers = await User.countDocuments({ role: "manager" });
    const players = await User.countDocuments({ role: "player" });
    console.log(`   - ${managers} managers (1 per club)`);
    console.log(`   - ${players} players (15 per club)`);

    console.log("🎉 Full seeding completed successfully!");
    console.log("📋 Clubs created:");
    for (let i = 0; i < clubs.length; i++) {
      console.log(`   ${i + 1}. ${clubs[i]}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

main();
