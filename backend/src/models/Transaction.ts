import mongoose, { Document, Schema } from "mongoose";

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum TransactionType {
  STORE_PURCHASE = "store_purchase",
  MATCH_REWARD = "match_reward",
  DAILY_BONUS = "daily_bonus",
  LEVEL_REWARD = "level_reward",
  ADMIN_ADJUSTMENT = "admin_adjustment",
}

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // Positive for income, negative for expense
  description: string;
  metadata?: {
    storeItemId?: mongoose.Types.ObjectId;
    matchId?: mongoose.Types.ObjectId;
    level?: number;
    adminNote?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  storeItemId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: TransactionStatus;
  appliedAt?: Date; // When the purchased item was applied to user
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, "Transaction type is required"],
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: [true, "Transaction status is required"],
      default: TransactionStatus.COMPLETED,
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
    },
    description: {
      type: String,
      required: [true, "Transaction description is required"],
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    metadata: {
      storeItemId: {
        type: Schema.Types.ObjectId,
        ref: "StoreItem",
      },
      matchId: {
        type: Schema.Types.ObjectId,
        ref: "Match",
      },
      level: Number,
      adminNote: String,
    },
  },
  {
    timestamps: true,
  }
);

const purchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    storeItemId: {
      type: Schema.Types.ObjectId,
      ref: "StoreItem",
      required: [true, "Store item ID is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: [true, "Purchase status is required"],
      default: TransactionStatus.PENDING,
    },
    appliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });

purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ status: 1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
export const Purchase = mongoose.model<IPurchase>("Purchase", purchaseSchema);
