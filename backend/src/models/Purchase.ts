import mongoose, { Document, Schema } from "mongoose";

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  purchaseDate: Date;
  status: "completed" | "pending" | "failed";
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreItem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
    transactionId: {
      type: String,
      sparse: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
purchaseSchema.index({ user: 1, purchaseDate: -1 });
purchaseSchema.index({ item: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ transactionId: 1 }, { sparse: true });

export const Purchase =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", purchaseSchema);
