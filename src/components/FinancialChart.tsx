import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ChartTooltipProps {
  content: React.ReactNode;
  cursor?: boolean | object;
}

// Updated ChartTooltip component to fix the type error
const ChartTooltip: React.FC<ChartTooltipProps> = ({
  content,
  cursor = false,
}) => {
  return <>{cursor}</>;
};

// Chart data for different categories
const allChartData = [
  { month: "January", desktop: 7500 },
  { month: "February", desktop: 9200 },
  { month: "March", desktop: 8100 },
  { month: "April", desktop: 7300 },
  { month: "May", desktop: 8700 },
  { month: "June", desktop: 9400 },
];

const foodChartData = [
  { month: "January", desktop: 1200 },
  { month: "February", desktop: 1450 },
  { month: "March", desktop: 1300 },
  { month: "April", desktop: 1560 },
  { month: "May", desktop: 1850 },
  { month: "June", desktop: 1700 },
];

const transportChartData = [
  { month: "January", desktop: 800 },
  { month: "February", desktop: 950 },
  { month: "March", desktop: 1100 },
  { month: "April", desktop: 870 },
  { month: "May", desktop: 920 },
  { month: "June", desktop: 980 },
];

const subscriptionsChartData = [
  { month: "January", desktop: 450 },
  { month: "February", desktop: 450 },
  { month: "March", desktop: 450 },
  { month: "April", desktop: 450 },
  { month: "May", desktop: 450 },
  { month: "June", desktop: 450 },
];

const shoppingChartData = [
  { month: "January", desktop: 950 },
  { month: "February", desktop: 1200 },
  { month: "March", desktop: 800 },
  { month: "April", desktop: 1100 },
  { month: "May", desktop: 1400 },
  { month: "June", desktop: 1250 },
];

const otherChartData = [
  { month: "January", desktop: 420 },
  { month: "February", desktop: 580 },
  { month: "March", desktop: 390 },
  { month: "April", desktop: 460 },
  { month: "May", desktop: 510 },
  { month: "June", desktop: 430 },
];

const chartConfig = {
  desktop: {
    label: "Portfolio Value",
    color: "hsl(var(--chart-1))",
  },
} as ChartConfig;

// AI insights for each category
const insights = {
  all: "Your overall spending increased by 8.3% this month, mainly driven by Food and Shopping categories.",
  food: "You spent 20% more on Food this month compared to last month. Consider meal prepping to reduce costs.",
  transport: "Transport costs are 6.5% higher than your monthly average. Try carpooling or public transport options.",
  subscriptions: "Subscription spending is stable, but you could save £3 by switching to a student plan for Spotify.",
  shopping: "Shopping expenses increased by 15% this month. Check if any purchases can be returned if unused.",
  other: "Other expenses are down by 5.2% compared to last month. Great job on managing miscellaneous spending!"
};

// Referral opportunities for each category
const referrals = {
  all: {
    title: "Save on all spending categories",
    offers: ["Open a student bank account and get 3% cashback on all purchases", "Refer a friend to our app and both get £15 credit"]
  },
  food: {
    title: "Food delivery & dining offers",
    offers: ["Get 25% off your first 3 orders on FoodApp", "Student discount: 15% off at campus cafes"]
  },
  transport: {
    title: "Travel & commute deals",
    offers: ["Invite a friend to Bolt and both get £20 off your next ride", "Student railcard: Save 1/3 on train tickets"]
  },
  subscriptions: {
    title: "Media & service bundles",
    offers: ["Bundle Spotify, Netflix and YouTube for £15/month", "Refer 3 friends to Spotify and get 3 months free"]
  },
  shopping: {
    title: "Retail & online discount",
    offers: ["Student exclusive: 15% off at major online retailers", "Invite a friend to ASOS and get £10 off"]
  },
  other: {
    title: "Miscellaneous savings",
    offers: ["Join our rewards program and save on utilities", "Student discount on software subscriptions"]
  }
};

export function FinancialChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="shopping">Shopping</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          {/* All spending tab */}
          <TabsContent value="all">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={allChartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
                width={500}
                height={200}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="desktop"
                  type="monotone"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                {insights.all}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">{referrals.all.title}</h4>
              <div className="space-y-2">
                {referrals.all.offers.map((offer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Offer</Badge>
                    <span className="text-sm">{offer}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Food spending tab */}
          <TabsContent value="food">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={foodChartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
                width={500}
                height={200}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="desktop"
                  type="monotone"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
            <div className="mt-4 p-3 bg-orange-50 rounded-md">
              <p className="text-sm text-orange-800">
                {insights.food}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">{referrals.food.title}</h4>
              <div className="space-y-2">
                {referrals.food.offers.map((offer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Offer</Badge>
                    <span className="text-sm">{offer}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Transport spending tab */}
          <TabsContent value="transport">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={transportChartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
                width={500}
                height={200}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="desktop"
                  type="monotone"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
            <div className="mt-4 p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                {insights.transport}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">{referrals.transport.title}</h4>
              <div className="space-y-2">
                {referrals.transport.offers.map((offer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Offer</Badge>
                    <span className="text-sm">{offer}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Subscriptions spending tab */}
          <TabsContent value="subscriptions">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={subscriptionsChartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
                width={500}
                height={200}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="desktop"
                  type="monotone"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
            <div className="mt-4 p-3 bg-purple-50 rounded-md">
              <p className="text-sm text-purple-800">
                {insights.subscriptions}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">{referrals.subscriptions.title}</h4>
              <div className="space-y-2">
                {referrals.subscriptions.offers.map((offer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Offer</Badge>
                    <span className="text-sm">{offer}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Shopping spending tab */}
          <TabsContent value="shopping">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={shoppingChartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
                width={500}
                height={200}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="desktop"
                  type="monotone"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
            <div className="mt-4 p-3 bg-pink-50 rounded-md">
              <p className="text-sm text-pink-800">
                {insights.shopping}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">{referrals.shopping.title}</h4>
              <div className="space-y-2">
                {referrals.shopping.offers.map((offer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Offer</Badge>
                    <span className="text-sm">{offer}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Other spending tab */}
          <TabsContent value="other">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={otherChartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
                width={500}
                height={200}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="desktop"
                  type="monotone"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
            <div className="mt-4 p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                {insights.other}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">{referrals.other.title}</h4>
              <div className="space-y-2">
                {referrals.other.offers.map((offer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Offer</Badge>
                    <span className="text-sm">{offer}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none text-green-600">
          Trending up by 8.3% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing portfolio value in USD for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
