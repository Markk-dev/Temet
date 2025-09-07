"use client";

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Canvas main area skeleton
export const CanvasSkeleton: React.FC = () => (
  <div className="flex flex-col h-full w-full">
    {/* Top toolbar skeleton */}
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>

    <div className="flex flex-1">
      {/* Left sidebar skeleton */}
      <div className="w-16 border-r p-2 flex flex-col gap-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex-1" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      {/* Main canvas area skeleton */}
      <div className="flex-1 relative bg-muted/20">
        <Skeleton className="absolute inset-4 rounded-lg" />
        
        {/* Floating objects skeleton */}
        <div className="absolute top-20 left-20">
          <Skeleton className="h-16 w-24 rounded-md" />
        </div>
        <div className="absolute top-40 left-32">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <div className="absolute top-32 right-40">
          <Skeleton className="h-20 w-32 rounded-md" />
        </div>
      </div>

      {/* Right sidebar skeleton */}
      <div className="w-64 border-l p-4 flex flex-col gap-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <div className="grid grid-cols-4 gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

// Sidebar skeleton
export const SidebarSkeleton: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  if (side === 'left') {
    return (
      <div className="w-16 border-r p-2 flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 border-l p-4 flex flex-col gap-4">
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    </div>
  );
};

// Toolbar skeleton
export const ToolbarSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 border-b bg-background">
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-24 rounded-md" />
    </div>
    
    <div className="flex items-center gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-8 rounded-md" />
      ))}
    </div>
    
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-16 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

// Comments skeleton
export const CommentsSkeleton: React.FC = () => (
  <div className="absolute top-4 right-4 w-80 bg-background border rounded-lg p-4 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-4 pt-4 border-t">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  </div>
);

// Users presence skeleton
export const UserPresenceSkeleton: React.FC = () => (
  <div className="absolute top-4 right-4 flex items-center gap-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="relative">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="absolute -bottom-1 -right-1">
          <Skeleton className="h-3 w-3 rounded-full" />
        </div>
      </div>
    ))}
    <Skeleton className="h-6 w-8 rounded-full ml-2" />
  </div>
);

// Object properties skeleton
export const ObjectPropertiesSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div>
      <Skeleton className="h-4 w-16 mb-2" />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Skeleton className="h-3 w-8 mb-1" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div>
          <Skeleton className="h-3 w-8 mb-1" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    </div>
    
    <div>
      <Skeleton className="h-4 w-20 mb-2" />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Skeleton className="h-3 w-12 mb-1" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div>
          <Skeleton className="h-3 w-12 mb-1" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    </div>
    
    <div>
      <Skeleton className="h-4 w-12 mb-2" />
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
    
    <div>
      <Skeleton className="h-4 w-16 mb-2" />
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-6 rounded-sm" />
        ))}
      </div>
    </div>
  </div>
);

// Shape menu skeleton
export const ShapeMenuSkeleton: React.FC = () => (
  <div className="absolute top-16 left-4 bg-background border rounded-lg p-2 shadow-lg">
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-10 rounded-md" />
      ))}
    </div>
  </div>
);

export default {
  CanvasSkeleton,
  SidebarSkeleton,
  ToolbarSkeleton,
  CommentsSkeleton,
  UserPresenceSkeleton,
  ObjectPropertiesSkeleton,
  ShapeMenuSkeleton,
};