"use client";

import React, { useMemo, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCanvasPermission } from "@/features/canvas/components/canvas-permission-guard";

import { RightSidebarProps } from "../types";
import { modifyShape } from "../utils/shapes";

// Import settings components (these will be migrated in later tasks)
// For now, we'll create placeholder components
const Text = ({ fontFamily, fontSize, fontWeight, handleInputChange }: any) => (
  <div className="p-4">
    <h4 className="text-sm font-medium mb-2">Text Properties</h4>
    <p className="text-xs text-neutral-500">Text controls will be implemented in task 7.4</p>
  </div>
);

const Color = ({ inputRef, attribute, placeholder, attributeType, handleInputChange, opacity, onOpacityChange }: any) => (
  <div className="p-4">
    <h4 className="text-sm font-medium mb-2">Color Properties</h4>
    <p className="text-xs text-neutral-500">Color controls will be implemented in task 7.1</p>
  </div>
);

const Export = () => (
  <div className="p-4">
    <h4 className="text-sm font-medium mb-2">Export</h4>
    <p className="text-xs text-neutral-500">Export functionality will be implemented in task 7.3</p>
  </div>
);

const Dimensions = ({ isEditingRef, width, height, handleInputChange }: any) => (
  <div className="p-4">
    <h4 className="text-sm font-medium mb-2">Dimensions</h4>
    <p className="text-xs text-neutral-500">Dimension controls will be implemented in task 7.2</p>
  </div>
);

const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,
  roomId,
}: RightSidebarProps & { roomId: string }) => {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);
  
  const { hasPermission: canEdit } = useCanvasPermission({ 
    roomId, 
    requiredPermission: "canEdit" 
  });

  const handleInputChange = (property: string, value: string) => {
    if (!canEdit) return; // Prevent editing if user doesn't have permission
    
    if (!isEditingRef.current) isEditingRef.current = true;

    setElementAttributes((prev) => ({ ...prev, [property]: value }));

    // Only update the shape if not opacity
    if (property !== "fillOpacity" && property !== "strokeOpacity") {
      modifyShape({
        canvas: fabricRef.current as fabric.Canvas,
        property,
        value,
        activeObjectRef,
        syncShapeInStorage,
      });
    } else {
      // For opacity, update the selected object's opacity
      const selectedElement = fabricRef.current?.getActiveObject();
      if (selectedElement && property === "fillOpacity") {
        selectedElement.set("opacity", Number(value));
        syncShapeInStorage(selectedElement);
      }
      if (selectedElement && property === "strokeOpacity") {
        // Convert hex stroke color to rgba and set as stroke
        const hex = selectedElement.stroke || "#000000";
        const alpha = Number(value);
        function hexToRgba(hex: string, alpha: number) {
          let c = hex.replace('#', '');
          if (c.length === 3) c = c.split('').map(x => x + x).join('');
          const num = parseInt(c, 16);
          return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
        }
        selectedElement.set("stroke", hexToRgba(hex, alpha));
        syncShapeInStorage(selectedElement);
      }
    }
  };
  
  // memoize the content of the right sidebar to avoid re-rendering on every mouse actions
  const memoizedContent = useMemo(
    () => (
      <Card className="w-[280px] h-full border-l rounded-none bg-neutral-50">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
            Design
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Make changes to canvas as you like
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-120px)]">
            {!canEdit ? (
              <div className="p-4 text-center">
                <p className="text-sm text-neutral-500">
                  You don't have permission to edit this canvas.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Dimensions
                  isEditingRef={isEditingRef}
                  width={elementAttributes.width}
                  height={elementAttributes.height}
                  handleInputChange={handleInputChange}
                />

                <Separator />

                <Text
                  fontFamily={elementAttributes.fontFamily}
                  fontSize={elementAttributes.fontSize}
                  fontWeight={elementAttributes.fontWeight}
                  handleInputChange={handleInputChange}
                />

                <Separator />

                <Color
                  inputRef={colorInputRef}
                  attribute={elementAttributes.fill}
                  placeholder="color"
                  attributeType="fill"
                  handleInputChange={handleInputChange}
                  opacity={elementAttributes.fillOpacity}
                  onOpacityChange={(value: string) => handleInputChange("fillOpacity", value)}
                />

                <Separator />

                <Color
                  inputRef={strokeInputRef}
                  attribute={elementAttributes.stroke}
                  placeholder="stroke"
                  attributeType="stroke"
                  handleInputChange={handleInputChange}
                  opacity={elementAttributes.strokeOpacity}
                  onOpacityChange={(value: string) => handleInputChange("strokeOpacity", value)}
                />

                <Separator />

                <Export />
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    ),
    [elementAttributes]
  ); // only re-render when elementAttributes changes

  return memoizedContent;
};

export default RightSidebar;