import mongoose, { Document, Schema } from "mongoose";

// Player Stats Interface
export interface IPlayerStats {
  offensiveAwareness: number;
  ballControl: number;
  dribbling: number;
  tightPossession: number;
  lowPass: number;
  loftedPass: number;
  finishing: number;
  heading: number;
  placeKicking: number;
  curl: number;
  speed: number;
  acceleration: number;
  kickingPower: number;
  jump: number;
  physicalContact: number;
  balance: number;
  stamina: number;
  defensiveAwareness: number;
  ballWinning: number;
  aggression: number;
  gkAwareness: number;
  gkCatching: number;
  gkClearing: number;
  gkReflexes: number;
  gkReach: number;
  weakFootUsage: number;
  weakFootAccuracy: number;
  form: number;
  injuryResistance: number;
}

// Player Interface
export interface IPlayer extends Document {
  user: mongoose.Types.ObjectId;
  gp: number;
  fc: number;
  level: number;
  experience: number;
  stats: IPlayerStats;
  skills: Array<{
    skill: mongoose.Types.ObjectId;
    acquiredAt: Date;
  }>;
  comStyles: Array<{
    style: mongoose.Types.ObjectId;
    acquiredAt: Date;
  }>;
  items: Array<{
    item: mongoose.Types.ObjectId;
    quantity: number;
    acquiredAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Default stats values
const defaultStats: IPlayerStats = {
  offensiveAwareness: 40,
  ballControl: 40,
  dribbling: 40,
  tightPossession: 40,
  lowPass: 40,
  loftedPass: 40,
  finishing: 40,
  heading: 40,
  placeKicking: 40,
  curl: 40,
  speed: 40,
  acceleration: 40,
  kickingPower: 40,
  jump: 40,
  physicalContact: 40,
  balance: 40,
  stamina: 40,
  defensiveAwareness: 40,
  ballWinning: 40,
  aggression: 40,
  gkAwareness: 40,
  gkCatching: 40,
  gkClearing: 40,
  gkReflexes: 40,
  gkReach: 40,
  weakFootUsage: 40,
  weakFootAccuracy: 40,
  form: 40,
  injuryResistance: 40,
};

// Player Schema
const playerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gp: {
      type: Number,
      default: 1000,
    },
    fc: {
      type: Number,
      default: 100,
    },
    level: {
      type: Number,
      default: 1,
    },
    experience: {
      type: Number,
      default: 0,
    },
    stats: {
      type: {
        offensiveAwareness: { type: Number, min: 40, max: 99 },
        ballControl: { type: Number, min: 40, max: 99 },
        dribbling: { type: Number, min: 40, max: 99 },
        tightPossession: { type: Number, min: 40, max: 99 },
        lowPass: { type: Number, min: 40, max: 99 },
        loftedPass: { type: Number, min: 40, max: 99 },
        finishing: { type: Number, min: 40, max: 99 },
        heading: { type: Number, min: 40, max: 99 },
        placeKicking: { type: Number, min: 40, max: 99 },
        curl: { type: Number, min: 40, max: 99 },
        speed: { type: Number, min: 40, max: 99 },
        acceleration: { type: Number, min: 40, max: 99 },
        kickingPower: { type: Number, min: 40, max: 99 },
        jump: { type: Number, min: 40, max: 99 },
        physicalContact: { type: Number, min: 40, max: 99 },
        balance: { type: Number, min: 40, max: 99 },
        stamina: { type: Number, min: 40, max: 99 },
        defensiveAwareness: { type: Number, min: 40, max: 99 },
        ballWinning: { type: Number, min: 40, max: 99 },
        aggression: { type: Number, min: 40, max: 99 },
        gkAwareness: { type: Number, min: 40, max: 99 },
        gkCatching: { type: Number, min: 40, max: 99 },
        gkClearing: { type: Number, min: 40, max: 99 },
        gkReflexes: { type: Number, min: 40, max: 99 },
        gkReach: { type: Number, min: 40, max: 99 },
        weakFootUsage: { type: Number, min: 40, max: 99 },
        weakFootAccuracy: { type: Number, min: 40, max: 99 },
        form: { type: Number, min: 40, max: 99 },
        injuryResistance: { type: Number, min: 40, max: 99 },
      },
      default: defaultStats,
    },
    skills: [
      {
        skill: {
          type: Schema.Types.ObjectId,
          ref: "Skill",
        },
        acquiredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comStyles: [
      {
        style: {
          type: Schema.Types.ObjectId,
          ref: "ComStyle",
        },
        acquiredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    items: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: "Item",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        acquiredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Player = mongoose.model<IPlayer>("Player", playerSchema);
