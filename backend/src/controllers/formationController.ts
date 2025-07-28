import { Request, Response } from "express";
import { Formation } from "../models/Formation";
import { asyncHandler, createError } from "../middleware/errorHandler";
import {
  createFormationSchema,
  updateFormationSchema,
  formationQuerySchema,
} from "../utils/validation";
import { FormationType } from "../types/common";

export const getAllFormations = asyncHandler(
  async (req: Request, res: Response) => {
    const query = formationQuerySchema.parse(req.query);
    const {
      page,
      limit,
      sort = "popularity",
      order = "desc",
      type,
      search,
    } = query;

    // Build filter
    const filter: any = {};
    if (type) {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sortField = sort || "popularity";
    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj: any = { [sortField]: sortOrder };

    const skip = (page - 1) * limit;

    const [formations, total] = await Promise.all([
      Formation.find(filter).sort(sortObj).skip(skip).limit(limit),
      Formation.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        formations,
        pagination: {
          current: page,
          totalPages,
          total,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }
);

export const getFormationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const formation = await Formation.findById(id);

    if (!formation) {
      throw createError("Formation not found", 404);
    }

    res.json({
      success: true,
      data: {
        formation,
      },
    });
  }
);

export const createFormation = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = createFormationSchema.parse(req.body);

    // Check if formation name already exists
    const existingFormation = await Formation.findOne({
      name: validatedData.name,
    });
    if (existingFormation) {
      throw createError("Formation name already exists", 400);
    }

    const formation = await Formation.create(validatedData);

    res.status(201).json({
      success: true,
      message: "Formation created successfully",
      data: {
        formation,
      },
    });
  }
);

export const updateFormation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = updateFormationSchema.parse(req.body);

    const formation = await Formation.findById(id);

    if (!formation) {
      throw createError("Formation not found", 404);
    }

    // Check if new name already exists (if name is being updated)
    if (validatedData.name && validatedData.name !== formation.name) {
      const existingFormation = await Formation.findOne({
        name: validatedData.name,
      });
      if (existingFormation) {
        throw createError("Formation name already exists", 400);
      }
    }

    const updatedFormation = await Formation.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Formation updated successfully",
      data: {
        formation: updatedFormation,
      },
    });
  }
);

export const deleteFormation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const formation = await Formation.findById(id);

    if (!formation) {
      throw createError("Formation not found", 404);
    }

    if (formation.isDefault) {
      throw createError("Cannot delete default formation", 400);
    }

    await Formation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Formation deleted successfully",
    });
  }
);

export const getFormationsByType = asyncHandler(
  async (req: Request, res: Response) => {
    const { type } = req.params;

    if (!Object.values(FormationType).includes(type as FormationType)) {
      throw createError("Invalid formation type", 400);
    }

    const formations = await Formation.find({ type }).sort({
      popularity: -1,
      name: 1,
    });

    res.json({
      success: true,
      data: {
        formations,
      },
    });
  }
);

export const incrementFormationPopularity = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const formation = await Formation.findByIdAndUpdate(
      id,
      { $inc: { popularity: 1 } },
      { new: true }
    );

    if (!formation) {
      throw createError("Formation not found", 404);
    }

    res.json({
      success: true,
      message: "Formation popularity updated",
      data: {
        formation,
      },
    });
  }
);
