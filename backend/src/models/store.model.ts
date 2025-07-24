import mongoose, { Document, Schema } from "mongoose";

// Skill Interface
export interface ISkill extends Document {
  name: string;
  description: string;
  cost: number;
}

// COM Style Interface
export interface IComStyle extends Document {
  name: string;
  description: string;
  cost: number;
}

// Item Interface
export interface IItem extends Document {
  name: string;
  description: string;
  cost: number;
  currency: "gp" | "fc";
  type: "consumable" | "special";
}

// Skill Schema
const skillSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
});

// COM Style Schema
const comStyleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
});

// Item Schema
const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ["gp", "fc"],
    required: true,
  },
  type: {
    type: String,
    enum: ["consumable", "special"],
    required: true,
  },
});

export const Skill = mongoose.model<ISkill>("Skill", skillSchema);
export const ComStyle = mongoose.model<IComStyle>("ComStyle", comStyleSchema);
export const Item = mongoose.model<IItem>("Item", itemSchema);
