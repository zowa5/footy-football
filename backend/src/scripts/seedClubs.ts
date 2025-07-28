// Manual script to seed club data
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/pes-football-management");
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const generateClubData = () => {
  const clubNames = [
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

  const playerFirstNames = [
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

  const playerLastNames = [
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
    "Young",
    "Bennett",
    "Cooper",
    "Mitchell",
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

  const clubs = [];

  for (let i = 0; i < clubNames.length; i++) {
    const clubName = clubNames[i];

    // Generate manager
    const managerFirstName =
      playerFirstNames[Math.floor(Math.random() * playerFirstNames.length)];
    const managerLastName =
      playerLastNames[Math.floor(Math.random() * playerLastNames.length)];
    const managerUsername = `${managerFirstName.toLowerCase()}_${managerLastName.toLowerCase()}_mgr`;

    const manager = {
      username: managerUsername,
      email: `${managerUsername}@${clubName
        .toLowerCase()
        .replace(/\s+/g, "")}.com`,
      password: "password123",
      role: "manager",
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${managerUsername}`,
      bio: `Manager of ${clubName}`,
      clubName: clubName,
      clubBadge: `https://api.dicebear.com/7.x/shapes/svg?seed=${clubName}`,
      clubEstablished: new Date(1900 + Math.floor(Math.random() * 100), 0, 1),
      managerSince: new Date(2020 + Math.floor(Math.random() * 4), 0, 1),
      achievements: [
        `${clubName} Manager of the Year`,
        "Championship Winner",
        "Cup Final Appearance",
      ],
      coins: 50000,
      stats: {
        matchesWon: Math.floor(Math.random() * 50) + 10,
        matchesLost: Math.floor(Math.random() * 30) + 5,
        tournamentsWon: Math.floor(Math.random() * 5),
        playersManaged: 15,
      },
    };

    // Generate 15 players for this club
    const players = [];
    for (let j = 0; j < 15; j++) {
      const firstName =
        playerFirstNames[Math.floor(Math.random() * playerFirstNames.length)];
      const lastName =
        playerLastNames[Math.floor(Math.random() * playerLastNames.length)];
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}_${j}`;
      const position = positions[Math.floor(Math.random() * positions.length)];

      const player = {
        username: username,
        email: `${username}@${clubName.toLowerCase().replace(/\s+/g, "")}.com`,
        password: "password123",
        role: "player",
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        bio: `Professional player at ${clubName}`,
        playerInfo: {
          firstName: firstName,
          lastName: lastName,
          position: position,
          age: Math.floor(Math.random() * 15) + 18, // 18-32 years old
          height: Math.floor(Math.random() * 30) + 170, // 170-200 cm
          weight: Math.floor(Math.random() * 30) + 65, // 65-95 kg
          nationality: [
            "England",
            "Spain",
            "France",
            "Brazil",
            "Argentina",
            "Germany",
            "Italy",
          ][Math.floor(Math.random() * 7)],
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
          style: [
            "aggressive",
            "technical",
            "balanced",
            "defensive",
            "attacking",
          ][Math.floor(Math.random() * 5)],
        },
        coins: Math.floor(Math.random() * 20000) + 5000, // 5000-25000 coins
        energy: Math.floor(Math.random() * 50) + 50, // 50-100 energy
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

      players.push(player);
    }

    clubs.push({
      manager,
      players,
      clubName,
    });
  }

  return clubs;
};

const seedClubsData = async () => {
  try {
    console.log("🌱 Seeding clubs data...");

    // Check if users already exist (skip if we have substantial data)
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount > 10) {
      console.log("✅ Club data already exists, skipping seed");
      return;
    }

    const clubs = generateClubData();
    const allUsers = [];

    // Hash password once for all users
    const hashedPassword = await bcrypt.hash("password123", 10);

    for (const club of clubs) {
      // Prepare manager data
      const managerData = {
        ...club.manager,
        password: hashedPassword,
      };
      allUsers.push(managerData);

      // Prepare players data
      for (const player of club.players) {
        const playerData = {
          ...player,
          password: hashedPassword,
        };
        allUsers.push(playerData);
      }
    }

    // Insert all users at once for better performance
    await User.insertMany(allUsers);

    console.log(
      `✅ Successfully seeded ${clubs.length} clubs with ${allUsers.length} total users`
    );
    console.log(`   - ${clubs.length} managers`);
    console.log(`   - ${clubs.length * 15} players`);
  } catch (error) {
    console.error("❌ Error seeding clubs data:", error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await seedClubsData();
  console.log("🎉 Seeding completed!");
  process.exit(0);
};

main();
