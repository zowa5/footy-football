import mongoose, { Document, Schema } from "mongoose";

export interface IPlayerSkill extends Document {
  playerId: mongoose.Types.ObjectId;
  skillId: string;
  skillName: string;
  skillType: "playerSkill" | "style";
  isActive: boolean;
  acquiredAt: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const playerSkillSchema = new Schema<IPlayerSkill>(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillId: {
      type: String,
      required: true,
    },
    skillName: {
      type: String,
      required: true,
    },
    skillType: {
      type: String,
      enum: ["playerSkill", "style"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    acquiredAt: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

playerSkillSchema.index({ playerId: 1, skillId: 1 }, { unique: true });
playerSkillSchema.index({ playerId: 1, isActive: 1 });

export const PlayerSkill = mongoose.model<IPlayerSkill>(
  "PlayerSkill",
  playerSkillSchema
);
