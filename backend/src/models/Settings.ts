import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  siteName: string;
  timezone: string;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    siteName: {
      type: String,
      required: [true, "Site name is required"],
      default: "PES Manager",
      maxlength: [100, "Site name cannot exceed 100 characters"],
    },
    timezone: {
      type: String,
      required: [true, "Timezone is required"],
      default: "UTC+7",
      enum: [
        "UTC-12",
        "UTC-11",
        "UTC-10",
        "UTC-9",
        "UTC-8",
        "UTC-7",
        "UTC-6",
        "UTC-5",
        "UTC-4",
        "UTC-3",
        "UTC-2",
        "UTC-1",
        "UTC+0",
        "UTC+1",
        "UTC+2",
        "UTC+3",
        "UTC+4",
        "UTC+5",
        "UTC+6",
        "UTC+7",
        "UTC+8",
        "UTC+9",
        "UTC+10",
        "UTC+11",
        "UTC+12",
      ],
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
