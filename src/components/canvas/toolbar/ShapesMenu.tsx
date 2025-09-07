"use client";

import Image from "next/image";

import { ShapesMenuProps } from "../types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ShapesMenu = ({
  item,
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef,
  disabled = false,
}: ShapesMenuProps & { disabled?: boolean }) => {
  const isDropdownElem = item.value.some((elem) => elem?.value === activeElement.value);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            disabled={disabled}
            className={`relative h-10 w-10 ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : isDropdownElem 
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200" 
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
            onClick={() => !disabled && handleActiveElement(item)}
          >
            <Image
              src={isDropdownElem ? activeElement.icon : item.icon}
              alt={item.name}
              width={20}
              height={20}
              className={isDropdownElem ? "filter-blue" : ""}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-48 bg-white border border-neutral-200 shadow-lg"
          align="start"
          sideOffset={8}
        >
          {item.value.map((elem) => (
            <DropdownMenuItem
              key={elem?.name}
              onClick={() => {
                if (!disabled) handleActiveElement(elem);
              }}
              className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : activeElement.value === elem?.value 
                    ? "bg-blue-50 text-blue-600 cursor-pointer" 
                    : "text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              }`}
            >
              <Image
                src={elem?.icon as string}
                alt={elem?.name as string}
                width={18}
                height={18}
                className={activeElement.value === elem?.value ? "filter-blue" : ""}
              />
              <span className="text-sm font-medium">
                {elem?.name}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        className="hidden"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload}
      />
    </>
  );
};

export default ShapesMenu;