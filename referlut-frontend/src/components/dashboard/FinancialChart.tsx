import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/components/auth/SupabaseAuth";
import { apiClient } from "@/lib/apiClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps {
  children: React.ReactNode;
  config: ChartConfig;
}

interface ChartData {
  month: string;
  total: number;
  categories: {
    [key: string]: number;
  };
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  config,
}) => {
  return (
    <div
      className="h-[200px] w-full"
      style={
        {
          "--color-desktop": config.desktop.color,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  hideLabel?: boolean;
}

const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
  active,
  payload,
  label,
  hideLabel = false,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && <div className="text-xs font-medium">{label}</div>}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: entry.color,
              }}
            />
            <span className="font-medium">£{entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatWeekRange = (weekStartStr: string) => {
  // weekStartStr is YYYY-MM-DD (Monday)
  const start = new Date(weekStartStr);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startStr = `${start.toLocaleString("default", {
    month: "short",
    day: "numeric",
  })}`;
  const endStr = `${end.toLocaleString("default", {
    month: "short",
    day: "numeric",
  })}`;
  return `${startStr} – ${endStr}`;
};

const chartConfig = {
  desktop: {
    label: "Spending",
    color: "hsl(var(--chart-1))",
  },
} as ChartConfig;

export function FinancialChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);

        // Get access token if authenticated
        let token = undefined;
        if (isAuthenticated && session) {
          try {
            token = session.access_token;
          } catch (err) {
            console.error("Error getting access token:", err);
          }
        }

        // Use apiClient instead of direct fetch
        const data = await apiClient.statistics.getSpendingChart(
          selectedCategory
        );

        if (data.success) {
          setChartData(data.data);
        } else {
          setError(data.error || "Failed to fetch chart data");
        }
      } catch (err) {
        setError("Failed to fetch chart data");
        console.error("Error fetching chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedCategory, isAuthenticated, session]);

  const calculateTrend = () => {
    if (chartData.length < 2) return 0;
    const lastWeek = chartData[chartData.length - 1].total;
    const previousWeek = chartData[chartData.length - 2].total;
    return ((lastWeek - previousWeek) / previousWeek) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>Weekly spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="all"
          className="w-full px-4"
          onValueChange={setSelectedCategory}
        >
          <TabsList className="grid grid-cols-7 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="groceries">Groceries</TabsTrigger>
            <TabsTrigger value="transportation">Transport</TabsTrigger>
            <TabsTrigger value="dining out">Dining</TabsTrigger>
            <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
            <TabsTrigger value="shopping">Shopping</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory}>
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                Loading chart data...
              </div>
            ) : error ? (
              <div className="h-[200px] flex items-center justify-center text-red-500">
                {error}
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <LineChart
                  data={chartData}
                  margin={{
                    left: 80,
                    right: 80,
                    top: 10,
                    bottom: 50,
                  }}
                  width={800}
                  height={260}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatWeekRange}
                    interval={2} // Show every 3rd week label for clarity
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `£${value.toFixed(2)}`,
                      "Spending",
                    ]}
                    labelFormatter={(label: string) =>
                      `Week: ${formatWeekRange(label)}`
                    }
                  />
                  <Line
                    dataKey="total"
                    type="monotone"
                    stroke="var(--color-desktop)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 mt-6">
        <div className="flex gap-2 font-medium leading-none text-green-600">
          Trending {calculateTrend() > 0 ? "up" : "down"} by{" "}
          {Math.abs(calculateTrend()).toFixed(1)}% this week{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing spending in GBP for the last 90 days
        </div>
      </CardFooter>
    </Card>
  );
}
