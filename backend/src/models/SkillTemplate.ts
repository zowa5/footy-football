import mongoose, { Document, Schema } from "mongoose";

export interface ISkillTemplate extends Document {
  skillId: string;
  skillName: string;
  skillType: "playerSkill" | "style";
  description: string;
  longDescription: string;
  cost: number;
  currency: "skillPoints" | "stylePoints";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillTemplateSchema = new Schema<ISkillTemplate>(
  {
    skillId: { type: String, required: true, unique: true },
    skillName: { type: String, required: true },
    skillType: { type: String, enum: ["playerSkill", "style"], required: true },
    description: { type: String, required: true },
    longDescription: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: ["skillPoints", "stylePoints"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SkillTemplate = mongoose.model<ISkillTemplate>(
  "SkillTemplate",
  skillTemplateSchema
);
