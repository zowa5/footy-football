import mongoose, { Document, Schema } from "mongoose";

export interface ICustomFormation extends Document {
  name: string;
  formationType: string;
  positions: Array<{
    positionId: string;
    positionName: string;
    playerId: string | null;
    playerName: string | null;
    playerData: {
      _id: string;
      username: string;
      playerInfo: any;
      stats: any;
      skills: any;
      overallRating: number;
    } | null;
    x: number;
    y: number;
  }>;
  createdBy: mongoose.Types.ObjectId;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playerDataSchema = new Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    playerInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    stats: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    skills: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    overallRating: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const positionSchema = new Schema(
  {
    positionId: {
      type: String,
      required: true,
    },
    positionName: {
      type: String,
      required: true,
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    playerName: {
      type: String,
      default: null,
    },
    playerData: {
      type: playerDataSchema,
      default: null,
    },
    x: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    y: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const customFormationSchema = new Schema<ICustomFormation>(
  {
    name: {
      type: String,
      required: [true, "Formation name is required"],
      trim: true,
      maxlength: [50, "Formation name cannot exceed 50 characters"],
    },
    formationType: {
      type: String,
      required: [true, "Formation type is required"],
    },
    positions: {
      type: [positionSchema],
      required: [true, "Formation positions are required"],
      validate: {
        validator: function (positions: any[]) {
          return positions.length >= 1; // At least one position must be assigned
        },
        message: "Formation must have at least one position assigned",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
customFormationSchema.index({ createdBy: 1 });
customFormationSchema.index({ formationType: 1 });
customFormationSchema.index({ createdAt: -1 });

export const CustomFormation = mongoose.model<ICustomFormation>(
  "CustomFormation",
  customFormationSchema
);
