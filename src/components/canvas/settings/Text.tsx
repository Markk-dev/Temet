"use client";

import {
  fontFamilyOptions,
  fontSizeOptions,
  fontWeightOptions,
} from "@/components/canvas/constants";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

const selectConfigs = [
  {
    property: "fontFamily",
    placeholder: "Choose a font",
    options: fontFamilyOptions,
    label: "Font Family",
  },
  { 
    property: "fontSize", 
    placeholder: "30", 
    options: fontSizeOptions,
    label: "Font Size",
  },
  {
    property: "fontWeight",
    placeholder: "Semibold",
    options: fontWeightOptions,
    label: "Font Weight",
  },
];

type TextProps = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  handleInputChange: (property: string, value: string) => void;
};

const Text = ({
  fontFamily,
  fontSize,
  fontWeight,
  handleInputChange,
}: TextProps) => (
  <div className="flex flex-col gap-4 border-b border-border px-5 py-4">
    <h3 className="text-xs font-medium uppercase text-muted-foreground">Text</h3>

    <div className="flex flex-col gap-3">
      {/* Font Family - Full width */}
      <RenderSelect
        config={selectConfigs[0]}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fontFamily={fontFamily}
        handleInputChange={handleInputChange}
      />

      {/* Font Size and Weight - Side by side */}
      <div className="flex gap-2">
        {selectConfigs.slice(1).map((config) => (
          <RenderSelect
            key={config.property}
            config={config}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontFamily={fontFamily}
            handleInputChange={handleInputChange}
          />
        ))}
      </div>
    </div>
  </div>
);

type Props = {
  config: {
    property: string;
    placeholder: string;
    options: { label: string; value: string }[];
    label: string;
  };
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  handleInputChange: (property: string, value: string) => void;
};

const RenderSelect = ({
  config,
  fontSize,
  fontWeight,
  fontFamily,
  handleInputChange,
}: Props) => {
  const getCurrentValue = () => {
    switch (config.property) {
      case "fontFamily":
        return fontFamily;
      case "fontSize":
        return fontSize;
      case "fontWeight":
        return fontWeight;
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">
        {config.label}
      </label>
      <Select
        onValueChange={(value) => handleInputChange(config.property, value)}
        value={getCurrentValue()}
      >
        <SelectTrigger className="w-full h-10">
          <SelectValue placeholder={config.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {config.options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Text;