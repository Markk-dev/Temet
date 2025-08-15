"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const TasksLoadingSkeleton = () => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center mb-4">
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-20" />
            </div>
            
            <div className="border-t mb-4" />
            
            <div className="flex gap-4 mb-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
            
            <div className="border-t mb-4" />
            
            <div className="flex-1">
                <div className="grid gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}; 