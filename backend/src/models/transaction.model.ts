import mongoose, { Document, Schema } from "mongoose";

// Transaction Interface
export interface ITransaction extends Document {
  player: mongoose.Types.ObjectId;
  type: "purchase" | "reward" | "use";
  currency: "gp" | "fc";
  amount: number;
  description: string;
  createdAt: Date;
}

// Transaction Schema
const transactionSchema = new Schema(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    type: {
      type: String,
      enum: ["purchase", "reward", "use"],
      required: true,
    },
    currency: {
      type: String,
      enum: ["gp", "fc"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
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

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
