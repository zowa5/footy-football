import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  RotateCcw,
  Save,
  Users,
  ArrowUpDown,
  Settings,
} from "lucide-react";

// Formation templates
const formations = {
  "4-4-2": {
    name: "4-4-2",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "lm", name: "LM", x: 15, y: 45, player: null },
      { id: "cm1", name: "CM", x: 35, y: 45, player: null },
      { id: "cm2", name: "CM", x: 65, y: 45, player: null },
      { id: "rm", name: "RM", x: 85, y: 45, player: null },
      { id: "st1", name: "ST", x: 35, y: 20, player: null },
      { id: "st2", name: "ST", x: 65, y: 20, player: null },
    ],
  },
  "4-3-3": {
    name: "4-3-3",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "cdm", name: "CDM", x: 50, y: 55, player: null },
      { id: "cm1", name: "CM", x: 30, y: 40, player: null },
      { id: "cm2", name: "CM", x: 70, y: 40, player: null },
      { id: "lw", name: "LW", x: 15, y: 20, player: null },
      { id: "st", name: "ST", x: 50, y: 15, player: null },
      { id: "rw", name: "RW", x: 85, y: 20, player: null },
    ],
  },
  "3-5-2": {
    name: "3-5-2",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "cb1", name: "CB", x: 25, y: 70, player: null },
      { id: "cb2", name: "CB", x: 50, y: 75, player: null },
      { id: "cb3", name: "CB", x: 75, y: 70, player: null },
      { id: "lwb", name: "LWB", x: 10, y: 50, player: null },
      { id: "cm1", name: "CM", x: 30, y: 45, player: null },
      { id: "cm2", name: "CM", x: 50, y: 50, player: null },
      { id: "cm3", name: "CM", x: 70, y: 45, player: null },
      { id: "rwb", name: "RWB", x: 90, y: 50, player: null },
      { id: "st1", name: "ST", x: 40, y: 20, player: null },
      { id: "st2", name: "ST", x: 60, y: 20, player: null },
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "cdm1", name: "CDM", x: 35, y: 50, player: null },
      { id: "cdm2", name: "CDM", x: 65, y: 50, player: null },
      { id: "lam", name: "LAM", x: 25, y: 30, player: null },
      { id: "cam", name: "CAM", x: 50, y: 25, player: null },
      { id: "ram", name: "RAM", x: 75, y: 30, player: null },
      { id: "st", name: "ST", x: 50, y: 15, player: null },
    ],
  },
  "5-3-2": {
    name: "5-3-2",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lwb", name: "LWB", x: 10, y: 70, player: null },
      { id: "cb1", name: "CB", x: 25, y: 75, player: null },
      { id: "cb2", name: "CB", x: 50, y: 80, player: null },
      { id: "cb3", name: "CB", x: 75, y: 75, player: null },
      { id: "rwb", name: "RWB", x: 90, y: 70, player: null },
      { id: "cm1", name: "CM", x: 30, y: 45, player: null },
      { id: "cm2", name: "CM", x: 50, y: 50, player: null },
      { id: "cm3", name: "CM", x: 70, y: 45, player: null },
      { id: "st1", name: "ST", x: 40, y: 20, player: null },
      { id: "st2", name: "ST", x: 60, y: 20, player: null },
    ],
  },
  "4-1-4-1": {
    name: "4-1-4-1",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "cdm", name: "CDM", x: 50, y: 55, player: null },
      { id: "lm", name: "LM", x: 15, y: 40, player: null },
      { id: "cm1", name: "CM", x: 35, y: 35, player: null },
      { id: "cm2", name: "CM", x: 65, y: 35, player: null },
      { id: "rm", name: "RM", x: 85, y: 40, player: null },
      { id: "st", name: "ST", x: 50, y: 15, player: null },
    ],
  },
  "3-4-3": {
    name: "3-4-3",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "cb1", name: "CB", x: 25, y: 70, player: null },
      { id: "cb2", name: "CB", x: 50, y: 75, player: null },
      { id: "cb3", name: "CB", x: 75, y: 70, player: null },
      { id: "lm", name: "LM", x: 15, y: 45, player: null },
      { id: "cm1", name: "CM", x: 35, y: 50, player: null },
      { id: "cm2", name: "CM", x: 65, y: 50, player: null },
      { id: "rm", name: "RM", x: 85, y: 45, player: null },
      { id: "lw", name: "LW", x: 20, y: 20, player: null },
      { id: "st", name: "ST", x: 50, y: 15, player: null },
      { id: "rw", name: "RW", x: 80, y: 20, player: null },
    ],
  },
  "4-3-2-1": {
    name: "4-3-2-1",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "cm1", name: "CM", x: 30, y: 50, player: null },
      { id: "cm2", name: "CM", x: 50, y: 55, player: null },
      { id: "cm3", name: "CM", x: 70, y: 50, player: null },
      { id: "cf1", name: "CF", x: 35, y: 25, player: null },
      { id: "cf2", name: "CF", x: 65, y: 25, player: null },
      { id: "st", name: "ST", x: 50, y: 10, player: null },
    ],
  },
  "5-4-1": {
    name: "5-4-1",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lwb", name: "LWB", x: 10, y: 70, player: null },
      { id: "cb1", name: "CB", x: 25, y: 75, player: null },
      { id: "cb2", name: "CB", x: 50, y: 80, player: null },
      { id: "cb3", name: "CB", x: 75, y: 75, player: null },
      { id: "rwb", name: "RWB", x: 90, y: 70, player: null },
      { id: "lm", name: "LM", x: 20, y: 45, player: null },
      { id: "cm1", name: "CM", x: 40, y: 50, player: null },
      { id: "cm2", name: "CM", x: 60, y: 50, player: null },
      { id: "rm", name: "RM", x: 80, y: 45, player: null },
      { id: "st", name: "ST", x: 50, y: 15, player: null },
    ],
  },
  "4-4-1-1": {
    name: "4-4-1-1",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "lm", name: "LM", x: 15, y: 45, player: null },
      { id: "cm1", name: "CM", x: 35, y: 50, player: null },
      { id: "cm2", name: "CM", x: 65, y: 50, player: null },
      { id: "rm", name: "RM", x: 85, y: 45, player: null },
      { id: "cam", name: "CAM", x: 50, y: 30, player: null },
      { id: "st", name: "ST", x: 50, y: 15, player: null },
    ],
  },
  "3-4-2-1": {
    name: "3-4-2-1",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "cb1", name: "CB", x: 25, y: 70, player: null },
      { id: "cb2", name: "CB", x: 50, y: 75, player: null },
      { id: "cb3", name: "CB", x: 75, y: 70, player: null },
      { id: "lm", name: "LM", x: 15, y: 50, player: null },
      { id: "cm1", name: "CM", x: 35, y: 55, player: null },
      { id: "cm2", name: "CM", x: 65, y: 55, player: null },
      { id: "rm", name: "RM", x: 85, y: 50, player: null },
      { id: "cf1", name: "CF", x: 35, y: 25, player: null },
      { id: "cf2", name: "CF", x: 65, y: 25, player: null },
      { id: "st", name: "ST", x: 50, y: 10, player: null },
    ],
  },
  "4-5-1": {
    name: "4-5-1",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "lm", name: "LM", x: 10, y: 45, player: null },
      { id: "cm1", name: "CM", x: 25, y: 50, player: null },
      { id: "cm2", name: "CM", x: 50, y: 55, player: null },
      { id: "cm3", name: "CM", x: 75, y: 50, player: null },
      { id: "rm", name: "RM", x: 90, y: 45, player: null },
      { id: "st", name: "ST", x: 50, y: 15, player: null },
    ],
  },
  "4-1-2-1-2": {
    name: "4-1-2-1-2",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "cdm", name: "CDM", x: 50, y: 55, player: null },
      { id: "cm1", name: "CM", x: 30, y: 40, player: null },
      { id: "cm2", name: "CM", x: 70, y: 40, player: null },
      { id: "cam", name: "CAM", x: 50, y: 25, player: null },
      { id: "st1", name: "ST", x: 35, y: 12, player: null },
      { id: "st2", name: "ST", x: 65, y: 12, player: null },
    ],
  },
  "3-1-4-2": {
    name: "3-1-4-2",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "cb1", name: "CB", x: 25, y: 70, player: null },
      { id: "cb2", name: "CB", x: 50, y: 75, player: null },
      { id: "cb3", name: "CB", x: 75, y: 70, player: null },
      { id: "cdm", name: "CDM", x: 50, y: 55, player: null },
      { id: "lm", name: "LM", x: 15, y: 40, player: null },
      { id: "cm1", name: "CM", x: 35, y: 45, player: null },
      { id: "cm2", name: "CM", x: 65, y: 45, player: null },
      { id: "rm", name: "RM", x: 85, y: 40, player: null },
      { id: "st1", name: "ST", x: 40, y: 20, player: null },
      { id: "st2", name: "ST", x: 60, y: 20, player: null },
    ],
  },
  "4-3-3-CAM": {
    name: "4-3-3 (CAM)",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "cm1", name: "CM", x: 35, y: 50, player: null },
      { id: "cm2", name: "CM", x: 65, y: 50, player: null },
      { id: "cam", name: "CAM", x: 50, y: 35, player: null },
      { id: "lw", name: "LW", x: 20, y: 20, player: null },
      { id: "st", name: "ST", x: 50, y: 15, player: null },
      { id: "rw", name: "RW", x: 80, y: 20, player: null },
    ],
  },
  "4-2-1-3": {
    name: "4-2-1-3",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "cdm1", name: "CDM", x: 35, y: 50, player: null },
      { id: "cdm2", name: "CDM", x: 65, y: 50, player: null },
      { id: "cam", name: "CAM", x: 50, y: 30, player: null },
      { id: "lw", name: "LW", x: 20, y: 15, player: null },
      { id: "st", name: "ST", x: 50, y: 10, player: null },
      { id: "rw", name: "RW", x: 80, y: 15, player: null },
    ],
  },
  "3-4-1-2": {
    name: "3-4-1-2",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "cb1", name: "CB", x: 25, y: 70, player: null },
      { id: "cb2", name: "CB", x: 50, y: 75, player: null },
      { id: "cb3", name: "CB", x: 75, y: 70, player: null },
      { id: "lm", name: "LM", x: 15, y: 50, player: null },
      { id: "cm1", name: "CM", x: 35, y: 55, player: null },
      { id: "cm2", name: "CM", x: 65, y: 55, player: null },
      { id: "rm", name: "RM", x: 85, y: 50, player: null },
      { id: "cam", name: "CAM", x: 50, y: 30, player: null },
      { id: "st1", name: "ST", x: 40, y: 15, player: null },
      { id: "st2", name: "ST", x: 60, y: 15, player: null },
    ],
  },
  "4-1-3-2": {
    name: "4-1-3-2",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "cdm", name: "CDM", x: 50, y: 55, player: null },
      { id: "cm1", name: "CM", x: 30, y: 40, player: null },
      { id: "cam", name: "CAM", x: 50, y: 35, player: null },
      { id: "cm2", name: "CM", x: 70, y: 40, player: null },
      { id: "st1", name: "ST", x: 40, y: 18, player: null },
      { id: "st2", name: "ST", x: 60, y: 18, player: null },
    ],
  },
  "5-2-1-2": {
    name: "5-2-1-2",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lwb", name: "LWB", x: 10, y: 70, player: null },
      { id: "cb1", name: "CB", x: 25, y: 75, player: null },
      { id: "cb2", name: "CB", x: 50, y: 80, player: null },
      { id: "cb3", name: "CB", x: 75, y: 75, player: null },
      { id: "rwb", name: "RWB", x: 90, y: 70, player: null },
      { id: "cm1", name: "CM", x: 35, y: 50, player: null },
      { id: "cm2", name: "CM", x: 65, y: 50, player: null },
      { id: "cam", name: "CAM", x: 50, y: 30, player: null },
      { id: "st1", name: "ST", x: 40, y: 15, player: null },
      { id: "st2", name: "ST", x: 60, y: 15, player: null },
    ],
  },
  "4-3-1-2": {
    name: "4-3-1-2",
    positions: [
      { id: "gk", name: "GK", x: 50, y: 90, player: null },
      { id: "lb", name: "LB", x: 15, y: 70, player: null },
      { id: "cb1", name: "CB", x: 35, y: 70, player: null },
      { id: "cb2", name: "CB", x: 65, y: 70, player: null },
      { id: "rb", name: "RB", x: 85, y: 70, player: null },
      { id: "cm1", name: "CM", x: 25, y: 50, player: null },
      { id: "cm2", name: "CM", x: 50, y: 55, player: null },
      { id: "cm3", name: "CM", x: 75, y: 50, player: null },
      { id: "cam", name: "CAM", x: 50, y: 30, player: null },
      { id: "st1", name: "ST", x: 40, y: 15, player: null },
      { id: "st2", name: "ST", x: 60, y: 15, player: null },
    ],
  },
};

// Mock player data
const availablePlayers = [
  { id: "1", name: "Alex Rodriguez", position: "CM", overall: 78, energy: 85 },
  { id: "2", name: "Marcus Silva", position: "ST", overall: 82, energy: 90 },
  { id: "3", name: "Sarah Johnson", position: "LB", overall: 75, energy: 70 },
  { id: "4", name: "David Chen", position: "CB", overall: 80, energy: 95 },
  { id: "5", name: "Emma Wilson", position: "GK", overall: 77, energy: 100 },
  { id: "6", name: "Luis Garcia", position: "RM", overall: 76, energy: 80 },
  { id: "7", name: "Anna Kowalski", position: "CDM", overall: 74, energy: 85 },
  { id: "8", name: "Carlos Lopez", position: "ST", overall: 79, energy: 75 },
  { id: "9", name: "Nina Petrov", position: "CB", overall: 73, energy: 90 },
  { id: "10", name: "Tom Anderson", position: "RB", overall: 71, energy: 88 },
  { id: "11", name: "Lisa Zhang", position: "LW", overall: 77, energy: 82 },
];

export default function FormationBuilder() {
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [currentFormation, setCurrentFormation] = useState(formations["4-4-2"]);
  const [draggedPlayer, setDraggedPlayer] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);

  const handleFormationChange = (formationKey: string) => {
    setSelectedFormation(formationKey);
    setCurrentFormation(formations[formationKey as keyof typeof formations]);
  };

  const handleDragStart = (e: React.DragEvent, player: any) => {
    setDraggedPlayer(player);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, positionId: string) => {
    e.preventDefault();
    if (!draggedPlayer) return;

    const newFormation = { ...currentFormation };

    // Remove player from previous position
    newFormation.positions = newFormation.positions.map((pos) => ({
      ...pos,
      player: pos.player?.id === draggedPlayer.id ? null : pos.player,
    }));

    // Add player to new position
    const targetPosition = newFormation.positions.find(
      (pos) => pos.id === positionId
    );
    if (targetPosition) {
      targetPosition.player = draggedPlayer;
    }

    setCurrentFormation(newFormation);
    setDraggedPlayer(null);
    setIsDragging(false);
  };

  const removePlayerFromPosition = (positionId: string) => {
    const newFormation = { ...currentFormation };
    const position = newFormation.positions.find(
      (pos) => pos.id === positionId
    );
    if (position) {
      position.player = null;
    }
    setCurrentFormation(newFormation);
  };

  const resetFormation = () => {
    const freshFormation =
      formations[selectedFormation as keyof typeof formations];
    setCurrentFormation({
      ...freshFormation,
      positions: freshFormation.positions.map((pos) => ({
        ...pos,
        player: null,
      })),
    });
  };

  const getAssignedPlayers = () => {
    return currentFormation.positions
      .filter((pos) => pos.player)
      .map((pos) => pos.player.id);
  };

  const getUnassignedPlayers = () => {
    const assignedIds = getAssignedPlayers();
    return availablePlayers.filter(
      (player) => !assignedIds.includes(player.id)
    );
  };

  const calculateOverallRating = () => {
    const assignedPlayers = currentFormation.positions
      .filter((pos) => pos.player)
      .map((pos) => pos.player);

    if (assignedPlayers.length === 0) return 0;

    const totalRating = assignedPlayers.reduce(
      (sum, player) => sum + player.overall,
      0
    );
    return Math.round(totalRating / assignedPlayers.length);
  };

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">
              Formation Builder
            </h1>
            <p className="text-muted-foreground">
              Design your tactical setup and assign players
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={resetFormation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button className="football-button">
              <Save className="h-4 w-4 mr-2" />
              Save Formation
            </Button>
          </div>
        </div>

        {/* Formation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Formation</p>
                  <p className="text-xl font-bold">{currentFormation.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Players Set</p>
                  <p className="text-xl font-bold">
                    {getAssignedPlayers().length}/11
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ArrowUpDown className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Team Rating</p>
                  <p className="text-xl font-bold">
                    {calculateOverallRating()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Formation</p>
                  <Select
                    value={selectedFormation}
                    onValueChange={handleFormationChange}
                  >
                    <SelectTrigger className="bg-secondary/50 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                          ATTACKING
                        </div>
                        <SelectItem value="4-3-3">4-3-3</SelectItem>
                        <SelectItem value="3-4-3">3-4-3</SelectItem>
                        <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                        <SelectItem value="4-3-3-CAM">4-3-3 (CAM)</SelectItem>
                        <SelectItem value="4-2-1-3">4-2-1-3</SelectItem>
                        <SelectItem value="4-3-2-1">4-3-2-1</SelectItem>
                        <SelectItem value="3-4-2-1">3-4-2-1</SelectItem>

                        <div className="text-xs font-semibold text-muted-foreground mb-2 mt-4 px-2">
                          BALANCED
                        </div>
                        <SelectItem value="4-4-2">4-4-2</SelectItem>
                        <SelectItem value="4-1-4-1">4-1-4-1</SelectItem>
                        <SelectItem value="4-4-1-1">4-4-1-1</SelectItem>
                        <SelectItem value="4-1-2-1-2">4-1-2-1-2</SelectItem>
                        <SelectItem value="3-4-1-2">3-4-1-2</SelectItem>
                        <SelectItem value="4-3-1-2">4-3-1-2</SelectItem>

                        <div className="text-xs font-semibold text-muted-foreground mb-2 mt-4 px-2">
                          DEFENSIVE
                        </div>
                        <SelectItem value="5-3-2">5-3-2</SelectItem>
                        <SelectItem value="5-4-1">5-4-1</SelectItem>
                        <SelectItem value="4-5-1">4-5-1</SelectItem>
                        <SelectItem value="5-2-1-2">5-2-1-2</SelectItem>
                        <SelectItem value="3-1-4-2">3-1-4-2</SelectItem>

                        <div className="text-xs font-semibold text-muted-foreground mb-2 mt-4 px-2">
                          🚀 WING PLAY
                        </div>
                        <SelectItem value="3-5-2">3-5-2</SelectItem>
                        <SelectItem value="4-1-3-2">4-1-3-2</SelectItem>
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Football Field */}
          <Card className="lg:col-span-2 stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tactical Field - {currentFormation.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div
                ref={fieldRef}
                className="relative w-full aspect-[2/3] bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden field-gradient"
                style={{
                  backgroundImage: `
                    linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "10% 10%",
                }}
                onDragOver={handleDragOver}
              >
                {/* Field markings */}
                <div className="absolute inset-4 border-2 border-white/30 rounded">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-16 border-2 border-white/30 border-t-0"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-16 border-2 border-white/30 border-b-0"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/30 rounded-full"></div>
                </div>

                {/* Player positions */}
                {currentFormation.positions.map((position) => (
                  <div
                    key={position.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                    onDrop={(e) => handleDrop(e, position.id)}
                    onDragOver={handleDragOver}
                  >
                    {position.player ? (
                      <div className="group relative flex items-center justify-center">
                        <div className="w-16 h-16 bg-primary rounded-full flex flex-col items-center justify-center text-xs font-bold text-primary-foreground shadow-lg border-2 border-white hover:scale-110 transition-transform relative">
                          <div className="flex flex-col items-center justify-center h-full w-full">
                            <span className="text-[10px] leading-tight text-center">
                              {position.player.name.split(" ")[0]}
                            </span>
                            <span className="text-[8px] opacity-80 leading-tight">
                              {position.player.overall}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground border-destructive"
                          onClick={() => removePlayerFromPosition(position.id)}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-white border-dashed rounded-full flex items-center justify-center text-white/70 text-xs font-bold hover:bg-white/10 transition-colors">
                        <span className="text-center leading-tight">
                          {position.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Players */}
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Players
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getUnassignedPlayers().map((player) => (
                  <div
                    key={player.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, player)}
                    className="p-3 bg-secondary/30 rounded-lg cursor-move hover:bg-secondary/50 transition-colors border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{player.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {player.position}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="text-primary border-primary/50"
                        >
                          {player.overall}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Energy: {player.energy}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {getUnassignedPlayers().length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      All players assigned
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formation Instructions */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Formation Guide & Tactics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Instructions */}
              <div>
                <h4 className="font-semibold text-primary mb-3">
                  How to Use Formation Builder
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="space-y-1">
                    <h5 className="font-semibold">1. Choose Formation</h5>
                    <p className="text-muted-foreground">
                      Select your preferred tactical formation from the
                      categorized dropdown menu.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-semibold">2. Drag & Drop Players</h5>
                    <p className="text-muted-foreground">
                      Drag players from the available list to position slots on
                      the field.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-semibold">3. Save & Deploy</h5>
                    <p className="text-muted-foreground">
                      Once satisfied with your lineup, save the formation for
                      upcoming matches.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tactical Categories */}
              <div>
                <h4 className="font-semibold text-primary mb-3">
                  Tactical Categories
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="space-y-1">
                    <h5 className="font-semibold flex items-center gap-1">
                      🔥 Attacking Formations
                    </h5>
                    <p className="text-muted-foreground">
                      High pressing, multiple attacking options. Great for teams
                      with skilled forwards and creative midfielders.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-semibold flex items-center gap-1">
                      ⚖️ Balanced Formations
                    </h5>
                    <p className="text-muted-foreground">
                      Equal focus on attack and defense. Perfect for versatile
                      squads and adapting to different opponents.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-semibold flex items-center gap-1">
                      🛡️ Defensive Formations
                    </h5>
                    <p className="text-muted-foreground">
                      Solid defense with counter-attacking focus. Ideal when
                      facing stronger opponents or protecting a lead.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-semibold flex items-center gap-1">
                      🚀 Wing Play Formations
                    </h5>
                    <p className="text-muted-foreground">
                      Utilizes wide areas effectively. Perfect for teams with
                      fast wingers and overlapping fullbacks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
