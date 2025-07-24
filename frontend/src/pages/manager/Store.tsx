import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  TrendingUp,
  Clock,
  Shirt,
  Flag,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

// Mock store data
const mockStoreItems = [
  {
    id: 1,
    name: "Elite Training Facility",
    description: "Boost player development speed by 20%",
    cost: 5000,
    type: "facility",
    duration: "Permanent",
    bonus: "+20% Training Speed",
  },
  {
    id: 2,
    name: "Advanced Scouting Network",
    description: "Improve player discovery and analysis",
    cost: 3000,
    type: "facility",
    duration: "Permanent",
    bonus: "+15% Scouting Accuracy",
  },
  {
    id: 3,
    name: "Youth Academy Upgrade",
    description: "Better youth player generation",
    cost: 4000,
    type: "facility",
    duration: "Permanent",
    bonus: "+25% Youth Quality",
  },
  {
    id: 4,
    name: "Recovery Center",
    description: "Faster player injury recovery",
    cost: 2500,
    type: "facility",
    duration: "Permanent",
    bonus: "-30% Recovery Time",
  },
  {
    id: 5,
    name: "Premium Training Session",
    description: "Temporary boost to all training",
    cost: 1000,
    type: "boost",
    duration: "7 Days",
    bonus: "+50% Training Effect",
  },
  {
    id: 6,
    name: "Match Day Preparation",
    description: "Boost team performance for next match",
    cost: 800,
    type: "boost",
    duration: "1 Match",
    bonus: "+10% Team Stats",
  },
];

export default function ManagerStore() {
  // Mock manager data
  const managerData = {
    clubFunds: 10000,
    facilities: ["Basic Training Ground", "Scout Network Level 1"],
  };

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">Club Store</h1>
            <p className="text-muted-foreground">
              Upgrade your facilities and boost team performance
            </p>
          </div>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">
                  {managerData.clubFunds.toLocaleString()} FC
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockStoreItems.map((item) => (
            <Card
              key={item.id}
              className="stat-card transition-all duration-300 hover:scale-[1.02]"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-primary/5">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.duration}
                      </Badge>
                      <Badge variant="outline" className="bg-primary/5">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {item.bonus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-bold text-lg">
                      {item.cost.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">FC</span>
                  </div>

                  <Button
                    size="sm"
                    disabled={managerData.clubFunds < item.cost}
                    className={
                      managerData.clubFunds >= item.cost
                        ? "football-button"
                        : ""
                    }
                  >
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-6 w-6 text-primary" />
                Current Facilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {managerData.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-6 w-6 text-primary" />
                Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span>Upgrade Training Facility</span>
                </div>
                <Badge variant="outline" className="bg-primary/5">
                  +2000 FC
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span>Improve Youth Academy</span>
                </div>
                <Badge variant="outline" className="bg-primary/5">
                  +3000 FC
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
