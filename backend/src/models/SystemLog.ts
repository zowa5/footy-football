import mongoose, { Document, Schema } from "mongoose";

export enum LogLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export enum LogCategory {
  AUTH = "auth",
  USER_MANAGEMENT = "user_management",
  TOURNAMENT = "tournament",
  MATCH = "match",
  STORE = "store",
  SYSTEM = "system",
  SECURITY = "security",
}

export interface ISystemLog extends Document {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: string;
  userId?: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  metadata?: {
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    [key: string]: any;
  };
  createdAt: Date;
}

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  description: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

const systemLogSchema = new Schema<ISystemLog>(
  {
    level: {
      type: String,
      enum: Object.values(LogLevel),
      required: [true, "Log level is required"],
    },
    category: {
      type: String,
      enum: Object.values(LogCategory),
      required: [true, "Log category is required"],
    },
    message: {
      type: String,
      required: [true, "Log message is required"],
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    details: {
      type: String,
      maxlength: [2000, "Details cannot exceed 2000 characters"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      maxlength: [100, "Action cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
systemLogSchema.index({ level: 1, createdAt: -1 });
systemLogSchema.index({ category: 1, createdAt: -1 });
systemLogSchema.index({ userId: 1, createdAt: -1 });
systemLogSchema.index({ adminId: 1, createdAt: -1 });
systemLogSchema.index({ createdAt: -1 });

userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ action: 1, createdAt: -1 });
userActivitySchema.index({ createdAt: -1 });

// TTL for logs (auto-delete after 6 months)
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 }); // 6 months
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 3 months

export const SystemLog = mongoose.model<ISystemLog>(
  "SystemLog",
  systemLogSchema
);
export const UserActivity = mongoose.model<IUserActivity>(
  "UserActivity",
  userActivitySchema
);
