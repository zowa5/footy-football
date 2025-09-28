import mongoose, { Document, Schema } from "mongoose";

export enum MatchType {
  FRIENDLY = "friendly",
  RANKED = "ranked",
  TOURNAMENT = "tournament",
  PRACTICE = "practice",
}

export enum MatchStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface IMatchResult {
  homeScore: number;
  awayScore: number;
  winner?: "home" | "away" | "draw";
  duration: number; // in minutes
  events: IMatchEvent[];
}

export interface IMatchEvent {
  minute: number;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
  playerId?: string;
  description: string;
}

export interface IMatch extends Document {
  homeTeam: {
    userId: mongoose.Types.ObjectId;
    formation?: mongoose.Types.ObjectId;
    teamName: string;
  };
  awayTeam: {
    userId: mongoose.Types.ObjectId;
    formation?: mongoose.Types.ObjectId;
    teamName: string;
  };
  type: MatchType;
  status: MatchStatus;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: IMatchResult;
  rewards?: {
    homeTeam: {
      coins: number;
      experience: number;
    };
    awayTeam: {
      coins: number;
      experience: number;
    };
  };
  tournamentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const matchEventSchema = new Schema<IMatchEvent>(
  {
    minute: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },
    type: {
      type: String,
      enum: ["goal", "yellow_card", "red_card", "substitution"],
      required: true,
    },
    playerId: String,
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
  },
  { _id: false }
);

const matchResultSchema = new Schema<IMatchResult>(
  {
    homeScore: {
      type: Number,
      required: true,
      min: 0,
    },
    awayScore: {
      type: Number,
      required: true,
      min: 0,
    },
    winner: {
      type: String,
      enum: ["home", "away", "draw"],
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      default: 90,
    },
    events: [matchEventSchema],
  },
  { _id: false }
);

const matchSchema = new Schema<IMatch>(
  {
    homeTeam: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      formation: {
        type: Schema.Types.ObjectId,
        ref: "Formation",
      },
      teamName: {
        type: String,
        required: true,
        trim: true,
      },
    },
    awayTeam: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      formation: {
        type: Schema.Types.ObjectId,
        ref: "Formation",
      },
      teamName: {
        type: String,
        required: true,
        trim: true,
      },
    },
    type: {
      type: String,
      enum: Object.values(MatchType),
      required: true,
      default: MatchType.FRIENDLY,
    },
    status: {
      type: String,
      enum: Object.values(MatchStatus),
      required: true,
      default: MatchStatus.SCHEDULED,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    startedAt: Date,
    completedAt: Date,
    result: matchResultSchema,
    rewards: {
      homeTeam: {
        coins: {
          type: Number,
          min: 0,
          default: 0,
        },
        experience: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
      awayTeam: {
        coins: {
          type: Number,
          min: 0,
          default: 0,
        },
        experience: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    },
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
matchSchema.index({ "homeTeam.userId": 1, createdAt: -1 });
matchSchema.index({ "awayTeam.userId": 1, createdAt: -1 });
matchSchema.index({ status: 1 });
matchSchema.index({ type: 1 });
matchSchema.index({ scheduledAt: 1 });

export const Match = mongoose.model<IMatch>("Match", matchSchema);
