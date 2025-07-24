import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";

const router = Router();

// Get player profile
router.get("/profile", auth, async (req: any, res) => {
  try {
    const player = await prisma.player.findUnique({
      where: { userId: req.user.id },
      include: {
        stats: true,
        skills: {
          include: {
            skill: true,
          },
        },
        comStyles: {
          include: {
            style: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update player stats
router.patch("/stats/:statName", auth, async (req: any, res) => {
  const { statName } = req.params;
  const { value } = req.body;

  try {
    const player = await prisma.player.findUnique({
      where: { userId: req.user.id },
      include: { stats: true },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Validate stat value
    if (value < 40 || value > 99) {
      return res
        .status(400)
        .json({ error: "Stat value must be between 40 and 99" });
    }

    const updatedStats = await prisma.playerStats.update({
      where: { playerId: player.id },
      data: {
        [statName]: value,
      },
    });

    res.json(updatedStats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export { router as playerRouter };
