import { ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import React from "react";
import { useNavigate } from "react-router-dom";

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

// Helper to highlight numbers in a string and ensure pound sign
function highlightNumbers(text: string) {
  // Replace all $ with £ for consistency
  const poundText = text.replace(/\$/g, '£');
  // Highlight numbers (with or without £)
  return poundText.split(/(£?\d+[.,]?\d*)/g).map((part, i) => {
    if (/^£?\d+[.,]?\d*$/.test(part)) {
      // Ensure the pound sign is present
      const value = part.startsWith('£') ? part : `£${part}`;
      return (
        <span key={i} className="font-bold text-green-700 dark:text-green-400">{value}</span>
      );
    }
    return part;
  });
}

function cleanTipTitle(title: string) {
  // Remove leading '£<number>' or '<number>.' or similar from the title
  return title.replace(/^£?\d+\.?\s*/, "").trim();
}

function cleanTipText(text: string) {
  // Remove leading '£<number>.' or '<number>.' or similar from the text
  return text.replace(/^£?\d+\.?\s*/, "").trim();
}

export function ExpertTips() {
  const [openAlerts, setOpenAlerts] = useState(true);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTips = async () => {
      try {
        setLoading(true);
        const response = await apiClient.ai.getInsights();
        if (response.success && response.data.tips) {
          // Convert the tips array to the required format
          const formattedTips = response.data.tips.map((tip: string, index: number) => {
            // Use the first sentence as title, cleaned
            const firstSentence = cleanTipText(tip.split('.')[0]);
            return {
              id: index + 1,
              title: firstSentence,
              description: cleanTipText(tip)
            };
          });
          setTips(formattedTips);
        }
      } catch (err) {
        setError('Failed to load expert tips');
        console.error('Error fetching tips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  const handleTipClick = async (tip: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/ai/marketplace-for-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip }),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error("API error:", response.status, text);
        alert("Failed to fetch offers for this tip.");
        return;
      }
      const data = await response.json();
      navigate("/marketplace", { state: { offers: data.offers } });
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch offers for this tip.");
    }
  };

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
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          tips.map((tip) => (
            <div
              key={tip.id}
              className="flex items-start justify-between border-b pb-4 last:border-0 bg-muted/40 rounded-lg px-3 py-2 mb-2 shadow-sm"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">{tip.id}</span>
                  <h3 className="font-semibold text-base text-primary">{tip.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {highlightNumbers(tip.description)}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="text-primary shrink-0 mt-2" onClick={() => handleTipClick(tip.description)}>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
