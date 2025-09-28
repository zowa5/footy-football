import { Formation } from "../models/Formation";
import { StoreItem } from "../models/StoreItem";
import { FormationType } from "../types/common";

export const defaultFormations = [
  {
    name: "4-4-2",
    type: FormationType.BALANCED,
    description: "Classic balanced formation with two strikers",
    price: 0,
    isDefault: true,
    popularity: 100,
    positions: [
      { x: 50, y: 95 }, // GK
      { x: 20, y: 75 }, // LB
      { x: 40, y: 75 }, // CB
      { x: 60, y: 75 }, // CB
      { x: 80, y: 75 }, // RB
      { x: 20, y: 45 }, // LM
      { x: 40, y: 45 }, // CM
      { x: 60, y: 45 }, // CM
      { x: 80, y: 45 }, // RM
      { x: 35, y: 15 }, // ST
      { x: 65, y: 15 }, // ST
    ],
  },
  {
    name: "4-3-3",
    type: FormationType.ATTACKING,
    description: "Attacking formation with wingers and central striker",
    price: 5000,
    isDefault: false,
    popularity: 85,
    positions: [
      { x: 50, y: 95 }, // GK
      { x: 20, y: 75 }, // LB
      { x: 40, y: 75 }, // CB
      { x: 60, y: 75 }, // CB
      { x: 80, y: 75 }, // RB
      { x: 30, y: 55 }, // CM
      { x: 50, y: 55 }, // CM
      { x: 70, y: 55 }, // CM
      { x: 20, y: 25 }, // LW
      { x: 50, y: 15 }, // ST
      { x: 80, y: 25 }, // RW
    ],
  },
  {
    name: "5-3-2",
    type: FormationType.DEFENSIVE,
    description: "Defensive formation with wing-backs",
    price: 3000,
    isDefault: false,
    popularity: 70,
    positions: [
      { x: 50, y: 95 }, // GK
      { x: 15, y: 75 }, // LWB
      { x: 30, y: 85 }, // CB
      { x: 50, y: 85 }, // CB
      { x: 70, y: 85 }, // CB
      { x: 85, y: 75 }, // RWB
      { x: 30, y: 55 }, // CM
      { x: 50, y: 55 }, // CM
      { x: 70, y: 55 }, // CM
      { x: 40, y: 25 }, // ST
      { x: 60, y: 25 }, // ST
    ],
  },
];

export const defaultStoreItems = [
  {
    name: "Energy Boost",
    type: "boost",
    description: "Restores 50 energy points instantly",
    price: 1000,
    category: "consumable",
    icon: "⚡",
    isActive: true,
    metadata: {
      boostType: "energy",
      value: 50,
    },
  },
  {
    name: "Premium Formation Pack",
    type: "formation",
    description: "Unlock a random premium formation",
    price: 10000,
    category: "formation",
    icon: "📋",
    isActive: true,
    metadata: {
      formations: 1,
    },
  },
  {
    name: "Coin Doubler",
    type: "boost",
    description: "Double your match rewards for 24 hours",
    price: 15000,
    category: "boost",
    icon: "💰",
    isActive: true,
    metadata: {
      boostType: "coins",
      multiplier: 2,
      duration: 24,
    },
  },
];

export const seedFormations = async (): Promise<void> => {
  try {
    console.log("🌱 Seeding formations...");

    // Check if formations already exist
    const existingCount = await Formation.countDocuments();
    if (existingCount > 0) {
      console.log("✅ Formations already exist, skipping seed");
      return;
    }

    // Insert default formations
    await Formation.insertMany(defaultFormations);
    console.log(
      `✅ Successfully seeded ${defaultFormations.length} formations`
    );
  } catch (error) {
    console.error("❌ Error seeding formations:", error);
    throw error;
  }
};

export const seedStoreItems = async (): Promise<void> => {
  try {
    console.log("🌱 Seeding store items...");

    // Check if store items already exist
    const existingCount = await StoreItem.countDocuments();
    if (existingCount > 0) {
      console.log("✅ Store items already exist, skipping seed");
      return;
    }

    // Insert default store items
    await StoreItem.insertMany(defaultStoreItems);
    console.log(
      `✅ Successfully seeded ${defaultStoreItems.length} store items`
    );
  } catch (error) {
    console.error("❌ Error seeding store items:", error);
    throw error;
  }
};
