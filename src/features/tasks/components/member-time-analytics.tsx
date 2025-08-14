"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, subMonths } from "date-fns";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { getMemberTimeAnalytics, MemberAnalytics } from "@/lib/api/analytics";
import { Loader2 } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-line";
import { createMemberColorMap } from "@/lib/colors";

interface TimeDataPoint {
  date: string;
  [memberId: string]: number | string; 
}

type TimePeriod = "week" | "month" | "year";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  timePeriod: TimePeriod;
  members: MemberAnalytics[];
  memberColorMap: Map<string, string>;
}

const CustomTooltip = ({ active, payload, label, timePeriod, members, memberColorMap }: CustomTooltipProps) => {
  if (!active || !payload || !label) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timePeriod === 'week') {
      return format(date, 'eee'); 
    } else if (timePeriod === 'year') {
      return format(date, 'MM/dd/yy'); 
    }
    return format(date, 'MMM d'); 
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">

      <div className="flex justify-end mb-2">
        <span className="text-sm font-medium text-gray-700">
          {formatDate(label)}
        </span>
      </div>
      
      <DottedSeparator className="mb-3" />
      
      <div className="space-y-2">
        {payload
          .filter(entry => entry.value > 0) 
          .map((entry, index) => {
            const member = members.find(m => m.id === entry.dataKey);
            if (!member) return null;
            
            const hours = Math.floor(entry.value / 3600);
            const minutes = Math.round((entry.value % 3600) / 60);
            const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            
            return (
              <div key={entry.dataKey} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: memberColorMap.get(entry.dataKey) }}
                  />
                  <span className="text-sm text-gray-700">{member.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{timeDisplay}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export function MemberTimeAnalytics() {
  const workspaceId = useWorkspaceId();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week");
  
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

  
  const getDateRange = () => {
    const periods = {
      week: { 
        count: 7, 
        subtract: (date: Date, i: number) => {
          const today = new Date();
          const currentDay = today.getDay(); 
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - currentDay); 
          return new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000); 
        }, 
        format: 'eee' 
      },
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

  
  const sortedMembers = [...data.members]
    .map((member) => {
      
      const totalTime = member.dailyTime
        .filter(day => timeRange.includes(day.date))
        .reduce((sum, day) => sum + day.seconds, 0);
      return { ...member, totalTime };
    })
    .filter((member) => member.totalTime > 0) 
    .sort((a, b) => b.totalTime - a.totalTime); 

  
  const hasActivity = sortedMembers.length > 0;

  const chartData: TimeDataPoint[] = [];
  
  timeRange.forEach(timePoint => {
    const dayData: TimeDataPoint = { date: timePoint };
    
    sortedMembers.forEach((member: MemberAnalytics) => {
      const memberDay = member.dailyTime.find((d: { date: string; seconds: number }) => d.date === timePoint);
      dayData[member.id] = memberDay ? memberDay.seconds : 0;
    });
    
    chartData.push(dayData);
  });

  
  
  const memberColorMap = createMemberColorMap(data.members);

  const getDescription = () => {
    const descriptions = {
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
              <TabsTrigger value="week" className="text-xs px-2 py-1">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2 py-1">Month</TabsTrigger>
              <TabsTrigger value="year" className="text-xs px-2 py-1">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {hasActivity ? (
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
                  content={<CustomTooltip timePeriod={timePeriod} members={sortedMembers} memberColorMap={memberColorMap} />}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                {sortedMembers.map((member: MemberAnalytics, index: number) => (
                  <Line
                    key={member.id}
                    type="monotone"
                    dataKey={member.id}
                    name={member.name}
                    stroke={memberColorMap.get(member.id)}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            No activity data for the selected time period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
