"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface ChartDataPoint {
    month: string;
    revenue: number;
    sold_count: number;
}

interface AnalyticsChartProps {
    data: ChartDataPoint[];
    title?: string;
    description?: string;
}

const chartConfig = {
    revenue: {
        label: "Revenue (RM)",
        color: "var(--chart-1)",
    },
    sold_count: {
        label: "Items Sold",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

export function AnalyticsChart({
    data,
    title = "Revenue & Sales Analytics",
    description,
}: AnalyticsChartProps) {
    // Calculate trend (compare last two months if available)
    const trend =
        data.length >= 2
            ? ((data[data.length - 1].revenue - data[data.length - 2].revenue) /
                (data[data.length - 2].revenue || 1)) *
            100
            : 0;

    const isPositive = trend >= 0;

    // Generate description based on data range
    const dateRange =
        data.length > 0
            ? `${data[0].month} - ${data[data.length - 1].month}`
            : "No data";

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                    {title}
                    {data.length >= 2 && (
                        <Badge
                            variant="outline"
                            className={`${isPositive
                                    ? "text-green-500 bg-green-500/10"
                                    : "text-red-500 bg-red-500/10"
                                } border-none`}
                        >
                            {isPositive ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            <span>{isPositive ? "+" : ""}{trend.toFixed(1)}%</span>
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>{description || dateRange}</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={data}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                                yAxisId="left"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `RM${value}`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                            />
                            <Line
                                yAxisId="left"
                                dataKey="revenue"
                                type="monotone"
                                stroke="var(--color-revenue)"
                                strokeWidth={2}
                                dot={true}
                            />
                            <Line
                                yAxisId="right"
                                dataKey="sold_count"
                                type="monotone"
                                stroke="var(--color-sold_count)"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        No analytics data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
