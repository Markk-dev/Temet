"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  inputRef: React.RefObject<HTMLInputElement>;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
  opacity?: string;
  onOpacityChange?: (value: string) => void;
};

const Color = ({
  inputRef,
  attribute,
  placeholder,
  attributeType,
  handleInputChange,
  opacity = "0.9",
  onOpacityChange,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(Math.round(Number(opacity) * 100).toString());

  const handleEdit = () => {
    setTempValue(Math.round(Number(opacity) * 100).toString());
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    let num = Math.max(0, Math.min(100, Number(tempValue)));
    onOpacityChange?.((num / 100).toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-border p-5">
      <h3 className="text-xs font-medium uppercase text-muted-foreground">{placeholder}</h3>
      <div 
        className="flex items-center gap-2 rounded-md border border-input bg-background hover:bg-accent/50 transition-colors cursor-pointer" 
        onClick={() => inputRef.current?.click()}
      >
        <div className="relative p-2">
          <input
            type="color"
            value={attribute}
            ref={inputRef}
            onChange={(e) => handleInputChange(attributeType, e.target.value)}
            className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
          />
        </div>
        <Label className="flex-1 text-sm font-mono cursor-pointer">{attribute}</Label>
        <div className="flex items-center gap-1 pr-2">
          {editing ? (
            <Input
              type="text"
              min="0"
              max="100"
              step="1"
              value={tempValue}
              autoFocus
              onChange={(e) => {
                // Only allow numbers between 0 and 100
                const val = e.target.value.replace(/[^0-9]/g, "");
                setTempValue(val.slice(0, 3));
              }}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-16 h-8 text-center text-xs"
            />
          ) : (
            <Label
              className={cn(
                "flex h-8 w-12 items-center justify-center rounded bg-muted text-xs font-medium cursor-pointer",
                "hover:bg-muted/80 transition-colors"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              {Math.round(Number(opacity) * 100)}%
            </Label>
          )}
        </div>
      </div>
    </div>
  );
};

export default Color;