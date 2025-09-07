"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from "date-fns";
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

  
  const activeEntries = payload.filter(entry => entry.value > 0);
  const longestName = activeEntries.reduce((longest, entry) => {
    const member = members.find(m => m.id === entry.dataKey);
    return member && member.name.length > longest ? member.name.length : longest;
  }, 0);

  
  const baseWidth = 120; 
  const charWidth = 8; 
  const dynamicWidth = Math.min(Math.max(baseWidth + (longestName * charWidth), 200), 350);

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
      style={{ minWidth: `${dynamicWidth}px`, maxWidth: '350px' }}
    >
      <div className="flex justify-end mb-2">
        <span className="text-sm font-medium text-gray-700">
          {formatDate(label)}
        </span>
      </div>
      
      <DottedSeparator className="mb-3" />
      
      <div className="space-y-2">
        {activeEntries.map((entry, index) => {
          const member = members.find(m => m.id === entry.dataKey);
          if (!member) return null;
          
          const hours = Math.floor(entry.value / 3600);
          const minutes = Math.round((entry.value % 3600) / 60);
          const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
          
          
          const nameLengthRatio = member.name.length / longestName;
          const dynamicGap = Math.max(1, Math.min(3, 1 + (nameLengthRatio * 2))); 
          
          return (
            <div 
              key={entry.dataKey} 
              className="flex items-center justify-between"
              style={{ gap: `${dynamicGap * 0.25}rem` }}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: memberColorMap.get(entry.dataKey) }}
                />
                <span className="text-sm text-gray-700">{member.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900 flex-shrink-0">{timeDisplay}</span>
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
        subtract: (date: Date, i: number) => subDays(date, 6 - i), 
        format: 'eee' 
      },
      month: { count: 30, subtract: (date: Date, i: number) => subDays(date, 29 - i), format: 'MMM d' },
      year: { count: 5, subtract: (date: Date, i: number) => {
        const year = new Date();
        year.setFullYear(year.getFullYear() - (4 - i));
        year.setMonth(0, 1); 
        return year;
      }, format: 'yyyy' }
    };
    return periods[timePeriod];
  };

  const periodConfig = getDateRange();
  const timeRange = Array.from({ length: periodConfig.count }, (_, i) => {
    const date = periodConfig.subtract(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  
  console.log(`📅 ${timePeriod.toUpperCase()} time range:`, timeRange);

  
  const sortedMembers = [...data.members]
    .map((member) => {
      let totalTime = 0;
      
      if (timePeriod === 'year') {
        
        const yearlyData: Record<string, number> = {};
        
        member.dailyTime.forEach(day => {
          const yearKey = day.date.substring(0, 4); 
          yearlyData[yearKey] = (yearlyData[yearKey] || 0) + day.seconds;
        });
        
        
        timeRange.forEach(timePoint => {
          const yearKey = timePoint.substring(0, 4);
          if (yearlyData[yearKey]) {
            totalTime += yearlyData[yearKey];
          }
        });
        
        console.log(`👤 ${member.name} (YEAR): ${Object.keys(yearlyData).length} years with data, total: ${totalTime} seconds`);
        if (Object.keys(yearlyData).length > 0) {
          console.log(`   Years:`, Object.entries(yearlyData).map(([year, seconds]) => `${year}: ${seconds}s`));
        }
      } else {
        
        const filteredDays = member.dailyTime.filter(day => timeRange.includes(day.date));
        totalTime = filteredDays.reduce((sum, day) => sum + day.seconds, 0);
        
        console.log(`👤 ${member.name} (${timePeriod.toUpperCase()}): ${filteredDays.length} days in range, total: ${totalTime} seconds`);
        if (filteredDays.length > 0) {
          console.log(`   Days:`, filteredDays.map(d => `${d.date}: ${d.seconds}s`));
        }
      }
      
      return { ...member, totalTime };
    })
    .filter((member) => member.totalTime > 0) 
    .sort((a, b) => b.totalTime - a.totalTime); 

  
  const hasActivity = sortedMembers.length > 0;

  const chartData: TimeDataPoint[] = [];
  
  timeRange.forEach(timePoint => {
    const dayData: TimeDataPoint = { date: timePoint };
    
    sortedMembers.forEach((member: MemberAnalytics) => {
      if (timePeriod === 'year') {
        
        const yearKey = timePoint.substring(0, 4); 
        const yearlyTime = member.dailyTime
          .filter(day => day.date.startsWith(yearKey))
          .reduce((sum, day) => sum + day.seconds, 0);
        dayData[member.id] = yearlyTime;
      } else {
        
        const memberDay = member.dailyTime.find((d: { date: string; seconds: number }) => d.date === timePoint);
        dayData[member.id] = memberDay ? memberDay.seconds : 0;
      }
    });
    
    chartData.push(dayData);
  });

  
  
  const memberColorMap = createMemberColorMap(data.members);

  const getDescription = () => {
    const descriptions = {
      week: "Time spent on tasks in the last 7 days", 
      month: "Time spent on tasks in the last 30 days",
      year: "Time spent on tasks in the last 5 years"
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
        <DottedSeparator className="pt-2" />
      </CardHeader>
      <CardContent className="pb-1">
        {hasActivity ? (
          <div className="h-48 mt-5">
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
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No activity data for the selected time period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
