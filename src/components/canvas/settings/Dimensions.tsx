"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";

const dimensionsOptions = [
  { label: "W", property: "width", placeholder: "Width" },
  { label: "H", property: "height", placeholder: "Height" },
];

type Props = {
  width: string;
  height: string;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

const Dimensions = ({ width, height, isEditingRef, handleInputChange }: Props) => {
  const handleBlur = () => {
    isEditingRef.current = false;
  };

  const handleFocus = () => {
    isEditingRef.current = true;
  };

  return (
    <section className="flex flex-col border-b border-border">
      <div className="flex flex-col gap-4 px-6 py-4">
        <h3 className="text-xs font-medium uppercase text-muted-foreground">Dimensions</h3>
        {dimensionsOptions.map((item) => (
          <div
            key={item.label}
            className="flex flex-1 items-center gap-3"
          >
            <Label 
              htmlFor={item.property} 
              className="text-sm font-medium min-w-[12px] text-foreground"
            >
              {item.label}
            </Label>
            <Input
              type="number"
              id={item.property}
              placeholder="100"
              value={item.property === "width" ? width : height}
              className="flex-1 h-10"
              min={1}
              max={10000}
              step={1}
              onChange={(e) => handleInputChange(item.property, e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Dimensions;