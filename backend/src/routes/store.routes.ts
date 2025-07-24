import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";

const router = Router();

// Get store items (skills, styles, items)
router.get("/items", auth, async (req, res) => {
  try {
    const [skills, comStyles, items] = await Promise.all([
      prisma.skill.findMany(),
      prisma.comStyle.findMany(),
      prisma.item.findMany(),
    ]);

    res.json({
      skills,
      comStyles,
      items,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Purchase item
router.post("/purchase", auth, async (req: any, res) => {
  const { itemType, itemId } = req.body;

  try {
    const player = await prisma.player.findUnique({
      where: { userId: req.user.id },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    let item;
    let cost;
    let currency;

    switch (itemType) {
      case "skill":
        item = await prisma.skill.findUnique({ where: { id: itemId } });
        cost = item?.cost;
        currency = "gp";
        break;
      case "style":
        item = await prisma.comStyle.findUnique({ where: { id: itemId } });
        cost = item?.cost;
        currency = "gp";
        break;
      case "item":
        item = await prisma.item.findUnique({ where: { id: itemId } });
        cost = item?.cost;
        currency = item?.currency;
        break;
      default:
        return res.status(400).json({ error: "Invalid item type" });
    }

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if player can afford the item
    if (currency === "gp" && player.gp < cost!) {
      return res.status(400).json({ error: "Insufficient GP" });
    }
    if (currency === "fc" && player.fc < cost!) {
      return res.status(400).json({ error: "Insufficient FC" });
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Deduct currency
      await tx.player.update({
        where: { id: player.id },
        data: {
          [currency === "gp" ? "gp" : "fc"]: {
            decrement: cost,
          },
        },
      });

      // Add item to player's inventory
      switch (itemType) {
        case "skill":
          await tx.playerSkill.create({
            data: {
              playerId: player.id,
              skillId: itemId,
            },
          });
          break;
        case "style":
          await tx.playerComStyle.create({
            data: {
              playerId: player.id,
              styleId: itemId,
            },
          });
          break;
        case "item":
          await tx.playerItem.upsert({
            where: {
              playerId_itemId: {
                playerId: player.id,
                itemId: itemId,
              },
            },
            create: {
              playerId: player.id,
              itemId: itemId,
              quantity: 1,
            },
            update: {
              quantity: {
                increment: 1,
              },
            },
          });
          break;
      }

      // Record transaction
      await tx.transaction.create({
        data: {
          playerId: player.id,
          type: "purchase",
          currency,
          amount: -cost!,
          description: `Purchased ${item.name}`,
        },
      });
    });

    res.json({ message: "Purchase successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export { router as storeRouter };
