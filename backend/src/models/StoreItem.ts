import mongoose, { Document, Schema } from "mongoose";

export enum StoreItemType {
  SKILL_UPGRADE = "skill_upgrade",
  STYLE = "style",
  FORMATION = "formation",
  CLUB_UPGRADE = "club_upgrade",
  AVATAR = "avatar",
  BOOST = "boost",
}

export enum BoostType {
  ENERGY = "energy",
  EXPERIENCE = "experience",
  COINS = "coins",
  DOUBLE_XP = "double_xp",
}

export interface IStoreItem extends Document {
  name: string;
  description: string;
  type: StoreItemType;
  price: number;
  icon?: string;
  image?: string;
  category: string;
  isActive: boolean;
  stock?: number; // For limited items
  metadata: {
    // For skill upgrades
    skillType?: string;
    skillValue?: number;

    // For styles/avatars
    styleId?: string;

    // For formations (reference to Formation)
    formationId?: mongoose.Types.ObjectId;

    // For boosts
    boostType?: BoostType;
    boostValue?: number;
    duration?: number; // in hours

    // For club upgrades
    upgradeType?: string;
    upgradeValue?: number;
  };
  requirements?: {
    level?: number;
    role?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const storeItemSchema = new Schema<IStoreItem>(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Item description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: Object.values(StoreItemType),
      required: [true, "Item type is required"],
    },
    price: {
      type: Number,
      required: [true, "Item price is required"],
      min: [0, "Price cannot be negative"],
    },
    icon: {
      type: String,
      maxlength: [200, "Icon URL cannot exceed 200 characters"],
    },
    image: {
      type: String,
      maxlength: [200, "Image URL cannot exceed 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Item category is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      min: [0, "Stock cannot be negative"],
    },
    metadata: {
      skillType: String,
      skillValue: Number,
      styleId: String,
      formationId: {
        type: Schema.Types.ObjectId,
        ref: "Formation",
      },
      boostType: {
        type: String,
        enum: Object.values(BoostType),
      },
      boostValue: Number,
      duration: Number,
      upgradeType: String,
      upgradeValue: Number,
    },
    requirements: {
      level: {
        type: Number,
        min: 1,
      },
      role: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
storeItemSchema.index({ type: 1 });
storeItemSchema.index({ category: 1 });
storeItemSchema.index({ price: 1 });
storeItemSchema.index({ isActive: 1 });

export const StoreItem = mongoose.model<IStoreItem>(
  "StoreItem",
  storeItemSchema
);
