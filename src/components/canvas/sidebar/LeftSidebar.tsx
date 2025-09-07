"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { getShapeInfo } from "@/lib/utils";

interface LeftSidebarProps {
  allShapes: Array<any>;
  onShapeSelect?: (shapeId: string) => void;
  selectedShapeId?: string;
}

const LeftSidebar = ({ 
  allShapes, 
  onShapeSelect,
  selectedShapeId 
}: LeftSidebarProps) => {
  // memoize the result of this function so that it doesn't change on every render but only when there are new shapes
  const memoizedShapes = useMemo(
    () => (
      <Card className="w-[240px] h-full border-r rounded-none bg-neutral-50">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
            Layers
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-1 p-3">
              {allShapes?.length === 0 ? (
                <div className="text-center text-neutral-500 py-8">
                  <p className="text-sm">No layers yet</p>
                  <p className="text-xs text-neutral-400">
                    Add shapes to see them here
                  </p>
                </div>
              ) : (
                allShapes?.map((shape: any) => {
                  const info = getShapeInfo(shape[1]?.type);
                  const isSelected = selectedShapeId === shape[1]?.objectId;

                  return (
                    <Button
                      key={shape[1]?.objectId}
                      variant="ghost"
                      className={`w-full justify-start h-auto p-2 text-left transition-colors ${
                        isSelected 
                          ? 'bg-blue-100 text-blue-900 hover:bg-blue-200' 
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      onClick={() => onShapeSelect?.(shape[1]?.objectId)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex-shrink-0">
                          <Image
                            src={info?.icon}
                            alt={info?.name || 'Layer'}
                            width={16}
                            height={16}
                            className={`transition-all ${
                              isSelected ? 'opacity-100' : 'opacity-70'
                            }`}
                          />
                        </div>
                        <span className="text-sm font-medium truncate flex-1">
                          {info?.name || 'Unknown Shape'}
                        </span>
                      </div>
                    </Button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    ),
    [allShapes?.length, selectedShapeId, onShapeSelect]
  );

  return memoizedShapes;
};

export default LeftSidebar;