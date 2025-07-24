import mongoose, { Document, Schema } from "mongoose";

// User Interface
export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
