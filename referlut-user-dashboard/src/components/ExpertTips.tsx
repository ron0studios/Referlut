
import { ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface Tip {
  id: number;
  title: string;
  description: string;
}

interface Alert {
  id: number;
  title: string;
  type: "referral" | "discount" | "info"
}

const tips: Tip[] = [
  {
    id: 1,
    title: "Diversify Your Portfolio",
    description: "Spread investments across asset classes to reduce risk."
  },
  {
    id: 2,
    title: "Emergency Fund First",
    description: "Save 3-6 months of expenses before heavy investing."
  },
  {
    id: 3,
    title: "Tax-Advantaged Accounts",
    description: "Maximize contributions to retirement accounts for tax benefits."
  }
];

const alerts: Alert[] = [
  {
    id: 1,
    title: "You have 1 unused referral bonus for Spotify",
    type: "referral"
  },
  {
    id: 2,
    title: "New student discount at Starbucks - 15% off",
    type: "discount"
  },
  {
    id: 3,
    title: "Your subscription to Netflix renews in 2 days",
    type: "info"
  }
];

export function ExpertTips() {
  const [openAlerts, setOpenAlerts] = useState(true);

  return (
    <Card className="h-full flex flex-col">
      {/* Alerts Section */}
      <Collapsible 
        open={openAlerts} 
        onOpenChange={setOpenAlerts} 
        className="border-b border-border/40"
      >
        <CollapsibleTrigger className="flex w-full justify-between items-center p-4 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
              {alerts.length}
            </Badge>
            <h3 className="text-sm font-medium">Quick Alerts</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <TrendingUp className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-2">
          <div className="space-y-2 pt-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between rounded-md p-2 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-2">
                  <Badge 
                    variant={alert.type === "referral" ? "default" : (alert.type === "discount" ? "secondary" : "outline")}
                    className="mt-0.5"
                  >
                    {alert.type === "referral" ? "Refer" : alert.type === "discount" ? "Save" : "Info"}
                  </Badge>
                  <p className="text-sm">{alert.title}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Expert Tips Section */}
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg">Expert Tips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 flex-grow">
        {tips.map((tip) => (
          <div key={tip.id} className="flex items-start justify-between border-b pb-3 last:border-0">
            <div className="space-y-1">
              <h3 className="font-medium">{tip.title}</h3>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-primary shrink-0">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
