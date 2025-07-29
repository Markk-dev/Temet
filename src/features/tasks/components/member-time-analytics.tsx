"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, subWeeks, subMonths, subYears } from "date-fns";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { getMemberTimeAnalytics, MemberAnalytics } from "@/lib/api/analytics";
import { Loader2 } from "lucide-react";

interface TimeDataPoint {
  date: string;
  [memberId: string]: number | string; // Number will be time in seconds
}

type TimePeriod = "day" | "week" | "month" | "year";

export function MemberTimeAnalytics() {
  const workspaceId = useWorkspaceId();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("day");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["member-time-analytics", workspaceId],
    queryFn: () => getMemberTimeAnalytics({ workspaceId }),
    enabled: !!workspaceId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load analytics data
      </div>
    );
  }

  // Generate date range based on selected period
  const getDateRange = () => {
    const periods = {
      day: { count: 24, subtract: (date: Date, i: number) => new Date(date.getTime() - i * 60 * 60 * 1000), format: 'HH:mm' },
      week: { count: 7, subtract: (date: Date, i: number) => subDays(date, 6 - i), format: 'MMM d' },
      month: { count: 30, subtract: (date: Date, i: number) => subDays(date, 29 - i), format: 'MMM d' },
      year: { count: 12, subtract: (date: Date, i: number) => subMonths(date, 11 - i), format: 'MMM yyyy' }
    };
    return periods[timePeriod];
  };

  const periodConfig = getDateRange();
  const timeRange = Array.from({ length: periodConfig.count }, (_, i) => {
    const date = periodConfig.subtract(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  // Transform data for the chart
  const chartData: TimeDataPoint[] = [];
  
  timeRange.forEach(date => {
    const dayData: TimeDataPoint = { date };
    
    data.members.forEach((member: MemberAnalytics) => {
      const memberDay = member.dailyTime.find((d: { date: string; seconds: number }) => d.date === date);
      dayData[member.id] = memberDay ? memberDay.seconds : 0;
    });
    
    chartData.push(dayData);
  });

  // Generate colors for lines
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
  ];

  const getDescription = () => {
    const descriptions = {
      day: "Time spent on tasks in the last 24 hours",
      week: "Time spent on tasks in the last 7 days", 
      month: "Time spent on tasks in the last 30 days",
      year: "Time spent on tasks in the last 12 months"
    };
    return descriptions[timePeriod];
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Members Activity</CardTitle>
            <CardDescription className="text-xs">{getDescription()}</CardDescription>
          </div>
          <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <TabsList className="h-7">
              <TabsTrigger value="day" className="text-xs px-2 py-1">Day</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-2 py-1">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2 py-1">Month</TabsTrigger>
              <TabsTrigger value="year" className="text-xs px-2 py-1">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), periodConfig.format)}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                height={20}
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (value >= 3600) return `${Math.round(value / 3600)}h`;
                  return `${Math.round(value / 60)}m`;
                }}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                width={30}
              />
              <Tooltip 
                formatter={(value: number) => {
                  const hours = Math.floor(value / 3600);
                  const minutes = Math.round((value % 3600) / 60);
                  if (hours > 0) return `${hours}h ${minutes}m`;
                  return `${minutes}m`;
                }}
                labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
              {data.members.map((member: MemberAnalytics, index: number) => (
                <Line
                  key={member.id}
                  type="monotone"
                  dataKey={member.id}
                  name={member.name}
                  stroke={colors[index % colors.length]}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
