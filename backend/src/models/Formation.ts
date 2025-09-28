import mongoose, { Document, Schema } from "mongoose";
import { FormationType, Position } from "../types/common";

export interface IFormation extends Document {
  name: string;
  type: FormationType;
  positions: Position[];
  description?: string;
  price: number;
  isDefault: boolean;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}

const positionSchema = new Schema<Position>(
  {
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

const formationSchema = new Schema<IFormation>(
  {
    name: {
      type: String,
      required: [true, "Formation name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Formation name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      enum: Object.values(FormationType),
      required: [true, "Formation type is required"],
    },
    positions: {
      type: [positionSchema],
      required: [true, "Formation positions are required"],
      validate: {
        validator: function (positions: Position[]) {
          return positions.length >= 11 && positions.length <= 11;
        },
        message: "Formation must have exactly 11 positions",
      },
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Formation price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    popularity: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
formationSchema.index({ type: 1 });
formationSchema.index({ price: 1 });
formationSchema.index({ isDefault: 1 });
formationSchema.index({ popularity: -1 });

export const Formation = mongoose.model<IFormation>(
  "Formation",
  formationSchema
);
