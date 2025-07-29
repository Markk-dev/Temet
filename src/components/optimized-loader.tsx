import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Optimized loading components that match the actual content structure
 * This provides better perceived performance by showing content-aware skeletons
 */

export const AnalyticsLoader = () => (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </Card>
    ))}
  </div>
);

export const TaskListLoader = () => (
  <div className="bg-muted rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    <div className="border-t border-dashed border-neutral-300 my-3" />
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="shadow-none">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="flex items-center gap-x-2">
              <div className="flex items-center gap-x-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-1 w-1 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const ProjectListLoader = () => (
  <div className="bg-white border rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    <div className="border-t border-dashed border-neutral-300 my-3" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-none">
          <CardContent className="p-4 flex items-center gap-x-2.5">
            <Skeleton className="h-12 w-12 rounded" />
            <Skeleton className="h-5 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const MembersListLoader = () => (
  <div className="bg-white border rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    <div className="border-t border-dashed border-neutral-300 my-3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="shadow-none">
          <CardContent className="p-3 flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="text-center space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const DashboardLoader = () => (
  <div className="h-full flex flex-col space-y-4">
    <AnalyticsLoader />
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <TaskListLoader />
      <div className="flex flex-col gap-4">
        <ProjectListLoader />
        <MembersListLoader />
      </div>
    </div>
  </div>
);
