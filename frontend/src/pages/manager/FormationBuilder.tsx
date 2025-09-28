import { useState, useRef, useEffect } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useFormationData } from "@/hooks/useFormationData";
import { useSquadData } from "@/hooks/useSquadData";
import { apiClient } from "@/lib/api";

// Formation templates
const formationTemplates = {
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

export default function FormationBuilder() {
  const {
    formations: availableFormations,
    loading: formationsLoading,
    error: formationsError,
  } = useFormationData();
  const { squad, loading: squadLoading, error: squadError } = useSquadData();

  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [currentFormation, setCurrentFormation] = useState(
    formationTemplates["4-4-2"]
  );
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [savedFormations, setSavedFormations] = useState<any[]>([]);
  const [showSavedFormations, setShowSavedFormations] = useState(false);
  const [lastSavedFormation, setLastSavedFormation] = useState<any>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load saved formations
  const loadSavedFormations = async () => {
    try {
      console.log("🔄 Loading saved formations...");
      const response = await apiClient.getManagerFormations();
      console.log("📡 API Response:", response);

      if (response.success && response.data) {
        console.log("✅ API call successful");
        console.log("📋 Custom formations:", response.data.customFormations);

        if (response.data.customFormations) {
          setSavedFormations(response.data.customFormations);
          console.log(
            "💾 Saved formations updated:",
            response.data.customFormations.length
          );
        } else {
          console.log("⚠️ No custom formations in response");
          setSavedFormations([]);
        }
      } else {
        console.log("❌ API call failed:", response);
        setSavedFormations([]);
      }
    } catch (error) {
      console.error("❌ Error loading saved formations:", error);
      setSavedFormations([]);
    }
  };

  // Load formation to formation builder
  const loadFormationToBuilder = (formation: any) => {
    console.log("🔄 Loading formation to builder:", formation);
    console.log("📋 Formation positions:", formation.positions);

    // Set formation type
    setSelectedFormation(formation.formationType);

    // Convert saved formation positions to builder format
    const builderPositions = formation.positions.map((pos: any) => {
      console.log(`🔍 Processing position ${pos.positionName}:`, pos);

      const playerData = pos.playerData
        ? {
            _id: pos.playerData._id,
            username: pos.playerData.username,
            playerInfo: pos.playerData.playerInfo,
            stats: pos.playerData.stats,
            skills: pos.playerData.skills,
            overallRating: pos.playerData.overallRating,
          }
        : null;

      console.log(`👤 Player data for ${pos.positionName}:`, playerData);

      return {
        id: pos.positionId,
        name: pos.positionName,
        x: pos.x,
        y: pos.y,
        player: playerData,
      };
    });

    console.log("🏗️ Builder positions created:", builderPositions);

    // Update current formation
    setCurrentFormation({
      name: formation.name,
      positions: builderPositions,
    });

    setLastSavedFormation(formation);
    console.log("✅ Formation loaded to builder:", builderPositions);
  };

  // Load saved formations when component mounts
  useEffect(() => {
    console.log("🔄 Component mounted, loading saved formations...");
    loadSavedFormations();
  }, []);

  // Auto-load latest formation after saved formations are loaded
  useEffect(() => {
    if (savedFormations.length > 0) {
      console.log("🔄 Auto-loading latest formation...");
      const latestFormation = savedFormations[0]; // Assuming latest is first in array
      console.log("📋 Latest formation:", latestFormation);
      loadFormationToBuilder(latestFormation);
    }
  }, [savedFormations]);

  // Debug: Log saved formations state changes
  useEffect(() => {
    console.log("📋 Saved formations state updated:", savedFormations);
  }, [savedFormations]);

  // Function to get player's full name
  const getPlayerFullName = (player: any) => {
    if (player?.playerInfo?.firstName && player?.playerInfo?.lastName) {
      return `${player.playerInfo.firstName} ${player.playerInfo.lastName}`;
    }
    return player?.username || "Unknown Player";
  };

  const loading = formationsLoading || squadLoading;
  const error = formationsError || squadError;

  if (loading) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Memuat data formation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!squad || !availableFormations) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg text-yellow-600">Data tidak tersedia</p>
        </div>
      </div>
    );
  }

  const handleFormationChange = (formationKey: string) => {
    setSelectedFormation(formationKey);
    setCurrentFormation(
      formationTemplates[formationKey as keyof typeof formationTemplates]
    );
  };

  const handleDragStart = (e: React.DragEvent, player: any) => {
    e.dataTransfer.setData("player", JSON.stringify(player));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, positionId: string) => {
    e.preventDefault();
    const playerData = JSON.parse(e.dataTransfer.getData("player"));

    console.log("Dropping player:", playerData, "to position:", positionId);

    setCurrentFormation((prev) => {
      const newFormation = {
        ...prev,
        positions: prev.positions.map((pos) =>
          pos.id === positionId ? { ...pos, player: playerData } : pos
        ),
      };

      console.log("New formation state:", newFormation);
      setForceUpdate((prev) => prev + 1); // Force re-render
      return newFormation;
    });

    setDragOverPosition(null);
  };

  const handleDragEnter = (positionId: string) => {
    setDragOverPosition(positionId);
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  const removePlayerFromPosition = (positionId: string) => {
    setCurrentFormation((prev) => ({
      ...prev,
      positions: prev.positions.map((pos) =>
        pos.id === positionId ? { ...pos, player: null } : pos
      ),
    }));
  };

  const resetFormation = () => {
    setCurrentFormation(
      formationTemplates[selectedFormation as keyof typeof formationTemplates]
    );
  };

  const getAssignedPlayers = () => {
    return currentFormation.positions
      .filter((pos) => pos.player)
      .map((pos) => pos.player);
  };

  const getUnassignedPlayers = () => {
    const assignedPlayerIds = getAssignedPlayers().map((p) => p._id);
    return squad.filter((player) => !assignedPlayerIds.includes(player._id));
  };

  const calculateOverallRating = () => {
    const assignedPlayers = getAssignedPlayers();
    if (assignedPlayers.length === 0) return 0;

    const totalRating = assignedPlayers.reduce((sum, player) => {
      const playerInfo = player.playerInfo;
      if (!playerInfo) return sum + 70;

      const rating = Math.round(
        (playerInfo.offensiveAwareness +
          playerInfo.dribbling +
          playerInfo.finishing +
          playerInfo.speed +
          playerInfo.physicalContact +
          playerInfo.stamina) /
          6
      );
      return sum + rating;
    }, 0);

    return Math.round(totalRating / assignedPlayers.length);
  };

  const saveFormation = async () => {
    try {
      // Check if at least one player is assigned
      const assignedPlayers = currentFormation.positions.filter(
        (pos) => pos.player
      );
      if (assignedPlayers.length === 0) {
        alert(
          "Please assign at least one player to the formation before saving."
        );
        return;
      }

      // Generate a unique formation name with timestamp
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const formationName = `${selectedFormation} - ${timestamp}`;

      const formationData = {
        name: formationName,
        positions: currentFormation.positions.map((pos: any) => ({
          id: pos.id,
          name: pos.name,
          x: pos.x,
          y: pos.y,
          player: pos.player, // Send the full player object
        })),
        formationType: selectedFormation,
      };

      console.log("Current formation state:", currentFormation);
      console.log("Formation data to save:", formationData);
      console.log("Assigned players count:", assignedPlayers.length);

      // Call API to save formation
      const response = await apiClient.saveCustomFormation(formationData);
      if (response.success) {
        alert(`Formation "${formationName}" saved successfully!`);

        // Create formation object to load to builder
        const savedFormation = {
          name: formationName,
          formationType: selectedFormation,
          positions: currentFormation.positions.map((pos: any) => {
            console.log(`💾 Saving position ${pos.name}:`, pos);
            return {
              positionId: pos.id,
              positionName: pos.name,
              playerId: pos.player?._id || null,
              playerName: pos.player ? getPlayerFullName(pos.player) : null,
              playerData: pos.player
                ? {
                    _id: pos.player._id,
                    username: pos.player.username,
                    playerInfo: pos.player.playerInfo,
                    stats: pos.player.stats,
                    skills: pos.player.skills,
                    overallRating: pos.player.overallRating,
                  }
                : null,
              x: pos.x,
              y: pos.y,
            };
          }),
        };

        console.log("💾 Saved formation object:", savedFormation);

        // Load the saved formation to builder
        loadFormationToBuilder(savedFormation);

        // Reload saved formations list
        await loadSavedFormations();
      } else {
        // If formation name already exists, try with a different name
        if (response.message && response.message.includes("already exists")) {
          const uniqueName = `${selectedFormation} - ${Date.now()}`;
          const retryData = {
            name: uniqueName,
            positions: currentFormation.positions.map((pos: any) => ({
              id: pos.id,
              name: pos.name,
              x: pos.x,
              y: pos.y,
              player: pos.player, // Send the full player object
            })),
            formationType: selectedFormation,
          };

          const retryResponse = await apiClient.saveCustomFormation(retryData);
          if (retryResponse.success) {
            alert(`Formation "${uniqueName}" saved successfully!`);

            // Create formation object to load to builder
            const savedFormation = {
              name: uniqueName,
              formationType: selectedFormation,
              positions: currentFormation.positions.map((pos: any) => ({
                positionId: pos.id,
                positionName: pos.name,
                playerId: pos.player?._id || null,
                playerName: pos.player ? getPlayerFullName(pos.player) : null,
                playerData: pos.player
                  ? {
                      _id: pos.player._id,
                      username: pos.player.username,
                      playerInfo: pos.player.playerInfo,
                      stats: pos.player.stats,
                      skills: pos.player.skills,
                      overallRating: pos.player.overallRating,
                    }
                  : null,
                x: pos.x,
                y: pos.y,
              })),
            };

            // Load the saved formation to builder
            loadFormationToBuilder(savedFormation);

            // Reload saved formations list
            await loadSavedFormations();
          } else {
            alert("Failed to save formation: " + retryResponse.message);
          }
        } else {
          alert("Failed to save formation: " + response.message);
        }
      }
    } catch (error) {
      console.error("Error saving formation:", error);
      if (error.message && error.message.includes("already exists")) {
        // Try with a unique name
        try {
          const uniqueName = `${selectedFormation} - ${Date.now()}`;
          const retryData = {
            name: uniqueName,
            positions: currentFormation.positions.map((pos: any) => ({
              id: pos.id,
              name: pos.name,
              x: pos.x,
              y: pos.y,
              player: pos.player, // Send the full player object
            })),
            formationType: selectedFormation,
          };

          const retryResponse = await apiClient.saveCustomFormation(retryData);
          if (retryResponse.success) {
            alert(`Formation "${uniqueName}" saved successfully!`);

            // Create formation object to load to builder
            const savedFormation = {
              name: uniqueName,
              formationType: selectedFormation,
              positions: currentFormation.positions.map((pos: any) => ({
                positionId: pos.id,
                positionName: pos.name,
                playerId: pos.player?._id || null,
                playerName: pos.player ? getPlayerFullName(pos.player) : null,
                playerData: pos.player
                  ? {
                      _id: pos.player._id,
                      username: pos.player.username,
                      playerInfo: pos.player.playerInfo,
                      stats: pos.player.stats,
                      skills: pos.player.skills,
                      overallRating: pos.player.overallRating,
                    }
                  : null,
                x: pos.x,
                y: pos.y,
              })),
            };

            // Load the saved formation to builder
            loadFormationToBuilder(savedFormation);

            // Reload saved formations list
            await loadSavedFormations();
          } else {
            alert("Failed to save formation: " + retryResponse.message);
          }
        } catch (retryError) {
          alert("Error saving formation. Please try again.");
        }
      } else {
        alert("Error saving formation. Please try again.");
      }
    }
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
              Build and customize your team formation
            </p>
            {lastSavedFormation && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">Active Formation:</span>{" "}
                  {lastSavedFormation.name}
                </p>
                <p className="text-xs text-green-600">
                  Last saved: {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={resetFormation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveFormation} className="football-button">
              <Save className="h-4 w-4 mr-2" />
              Save Formation
            </Button>
          </div>
        </div>

        {/* Formation Selection */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Select Formation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.keys(formationTemplates).map((formation) => (
                <Button
                  key={formation}
                  variant={
                    selectedFormation === formation ? "default" : "outline"
                  }
                  onClick={() => handleFormationChange(formation)}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <span className="text-lg font-bold">{formation}</span>
                  <span className="text-xs text-muted-foreground">
                    {
                      formationTemplates[
                        formation as keyof typeof formationTemplates
                      ].positions.length
                    }{" "}
                    Players
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formation Canvas */}
          <div className="lg:col-span-2">
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Formation: {selectedFormation}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Overall Rating:
                    </span>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/50"
                    >
                      {calculateOverallRating()}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={canvasRef}
                  className="relative w-full h-96 bg-gradient-to-b from-green-800 to-green-600 rounded-lg border-2 border-white/20 overflow-hidden"
                  style={{
                    backgroundImage: "url('/stadium-hero.jpg')",
                    backgroundSize: "cover",
                  }}
                >
                  {/* Field markings */}
                  <div className="absolute inset-0 border-2 border-white/30 border-dashed"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30"></div>
                  <div className="absolute top-1/4 left-0 right-0 h-px bg-white/20"></div>
                  <div className="absolute top-3/4 left-0 right-0 h-px bg-white/20"></div>

                  {/* Player positions */}
                  {currentFormation.positions.map((position) => (
                    <div
                      key={position.id}
                      className={`absolute w-16 h-16 flex items-center justify-center transition-all duration-200 ${
                        dragOverPosition === position.id
                          ? "scale-110 bg-primary/20 border-2 border-primary rounded-full"
                          : "bg-white/10 border border-white/30 rounded-full hover:bg-white/20"
                      }`}
                      style={{
                        left: `calc(${position.x}% - 2rem)`,
                        top: `calc(${position.y}% - 2rem)`,
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, position.id)}
                      onDragEnter={() => handleDragEnter(position.id)}
                      onDragLeave={handleDragLeave}
                    >
                      {position.player ? (
                        <div className="text-center">
                          <div className="text-xs font-bold text-white">
                            {getPlayerFullName(position.player)}
                          </div>
                          <div className="text-xs text-white/80">
                            {position.player.playerInfo?.position || "Unknown"}
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-4 w-4 p-0 text-xs mt-1"
                            onClick={() =>
                              removePlayerFromPosition(position.id)
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-white/60">
                          <div className="text-xs">{position.name}</div>
                          <div className="text-xs opacity-50">Drop player</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Players */}
          <div className="space-y-6">
            {/* Squad Overview */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Squad Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Players:
                    </span>
                    <span className="font-semibold">{squad.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Assigned:
                    </span>
                    <span className="font-semibold text-green-500">
                      {getAssignedPlayers().length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Available:
                    </span>
                    <span className="font-semibold text-blue-500">
                      {getUnassignedPlayers().length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Players */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Available Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getUnassignedPlayers().map((player) => {
                    const playerInfo = player.playerInfo;
                    const overall = playerInfo
                      ? Math.round(
                          (playerInfo.offensiveAwareness +
                            playerInfo.dribbling +
                            playerInfo.finishing +
                            playerInfo.speed +
                            playerInfo.physicalContact +
                            playerInfo.stamina) /
                            6
                        )
                      : 70;

                    return (
                      <div
                        key={player._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, player)}
                        className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-secondary/50 cursor-move transition-colors"
                      >
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">
                          {overall}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {getPlayerFullName(player)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {playerInfo?.position || "Unknown Position"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Formation Info */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Formation Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <div className="font-semibold">{selectedFormation}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Players:
                    </span>
                    <div className="font-semibold">
                      {currentFormation.positions.length}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Style:
                    </span>
                    <div className="font-semibold">
                      {selectedFormation === "4-4-2" && "Balanced"}
                      {selectedFormation === "4-3-3" && "Attacking"}
                      {selectedFormation === "3-5-2" && "Wing Play"}
                      {selectedFormation === "4-2-3-1" && "Counter Attack"}
                      {selectedFormation === "5-3-2" && "Defensive"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
