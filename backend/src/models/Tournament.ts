import mongoose, { Document, Schema } from "mongoose";

export enum TournamentStatus {
  REGISTRATION_OPEN = "registration_open",
  REGISTRATION_CLOSED = "registration_closed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  UPCOMING = "upcoming",
  ACTIVE = "active",
}

// Helper type for status literals
export type TournamentStatusLiteral =
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "upcoming"
  | "active";

export enum TournamentType {
  KNOCKOUT = "knockout",
  ROUND_ROBIN = "round_robin",
  LEAGUE = "league",
  GROUP_STAGE = "group_stage",
}

export interface ITournamentParticipant {
  userId: mongoose.Types.ObjectId;
  teamName: string;
  joinedAt: Date;
  eliminated?: boolean;
  finalPosition?: number;
}

export interface ITournamentPrize {
  position: number;
  coins: number;
  title?: string;
  badge?: string;
}

export interface ITournament extends Document {
  name: string;
  description: string;
  type: TournamentType;
  status: TournamentStatusLiteral;
  maxParticipants: number;
  minParticipants: number;
  entryFee: number;
  participants: ITournamentParticipant[];
  prizes: ITournamentPrize[];
  rules: {
    allowedRoles: string[];
    minLevel?: number;
    maxLevel?: number;
  };
  creator: mongoose.Types.ObjectId;
  actualStartDate: Date;
  actualEndDate: Date;
  prizePool: number;
  schedule: {
    registrationStart: Date;
    registrationEnd: Date;
    tournamentStart: Date;
    tournamentEnd?: Date;
  };
  matches: mongoose.Types.ObjectId[];
  winner?: mongoose.Types.ObjectId;
  organizerId: mongoose.Types.ObjectId; // Super Admin who created
  createdAt: Date;
  updatedAt: Date;
}

const tournamentParticipantSchema = new Schema<ITournamentParticipant>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    eliminated: {
      type: Boolean,
      default: false,
    },
    finalPosition: {
      type: Number,
      min: 1,
    },
  },
  { _id: false }
);

const tournamentPrizeSchema = new Schema<ITournamentPrize>(
  {
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    coins: {
      type: Number,
      required: true,
      min: 0,
    },
    title: String,
    badge: String,
  },
  { _id: false }
);

const tournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: [true, "Tournament name is required"],
      trim: true,
      maxlength: [100, "Tournament name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Tournament description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: Object.values(TournamentType),
      required: [true, "Tournament type is required"],
    },
    status: {
      type: String,
      enum: Object.values(TournamentStatus),
      required: [true, "Tournament status is required"],
      default: TournamentStatus.REGISTRATION_OPEN,
    },
    maxParticipants: {
      type: Number,
      required: [true, "Max participants is required"],
      min: [2, "Tournament must allow at least 2 participants"],
      max: [128, "Tournament cannot exceed 128 participants"],
    },
    minParticipants: {
      type: Number,
      required: [true, "Min participants is required"],
      min: [2, "Tournament must require at least 2 participants"],
    },
    entryFee: {
      type: Number,
      required: [true, "Entry fee is required"],
      min: [0, "Entry fee cannot be negative"],
      default: 0,
    },
    participants: [tournamentParticipantSchema],
    prizes: [tournamentPrizeSchema],
    rules: {
      allowedRoles: {
        type: [String],
        required: true,
        default: ["player", "manager"],
      },
      minLevel: {
        type: Number,
        min: 1,
      },
      maxLevel: {
        type: Number,
        min: 1,
      },
    },
    schedule: {
      registrationStart: {
        type: Date,
        required: true,
      },
      registrationEnd: {
        type: Date,
        required: true,
      },
      tournamentStart: {
        type: Date,
        required: true,
      },
      tournamentEnd: Date,
    },
    matches: [
      {
        type: Schema.Types.ObjectId,
        ref: "Match",
      },
    ],
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ type: 1 });
tournamentSchema.index({ "schedule.registrationStart": 1 });
tournamentSchema.index({ "schedule.tournamentStart": 1 });
tournamentSchema.index({ organizerId: 1 });

export const Tournament = mongoose.model<ITournament>(
  "Tournament",
  tournamentSchema
);
