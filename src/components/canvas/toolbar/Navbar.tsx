"use client";

import Image from "next/image";
import { memo } from "react";
import { useCanvasPermission } from "@/features/canvas/components/canvas-permission-guard";

import { navElements } from "../constants";
import { ActiveElement, NavbarProps } from "../types";
import { Button } from "@/components/ui/button";
import ShapesMenu from "./ShapesMenu";
import ActiveUsers from "../collaboration/users/ActiveUsers";
import { NewThread } from "../collaboration/comments/NewThread";

export const Navbar = ({ 
  activeElement, 
  imageInputRef, 
  handleImageUpload, 
  handleActiveElement,
  roomId 
}: NavbarProps & { roomId: string }) => {
  const { hasPermission: canEdit } = useCanvasPermission({ 
    roomId, 
    requiredPermission: "canEdit" 
  });
  
  type NavItem = { name: string; icon: string; value: string | Array<ActiveElement> };

  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) && value.some((val) => val?.value === activeElement?.value));

  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-white border-b border-neutral-200 px-5 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-neutral-900">Canvas</h1>
      </div>

      <ul className="flex flex-row items-center gap-1">
        {(navElements as NavItem[]).map((item) => {
          // Check if this is an editing tool that requires edit permission
          const isEditingTool = Array.isArray(item.value) || 
            (typeof item.value === 'string' && 
             ['select', 'rectangle', 'circle', 'triangle', 'line', 'text', 'freeform', 'image'].includes(item.value));
          
          // Disable editing tools if user doesn't have edit permission
          const isDisabled = isEditingTool && !canEdit;
          
          return (
            <li
              key={item.name}
              onClick={() => {
                if (Array.isArray(item.value) || isDisabled) return;
                handleActiveElement(item as unknown as ActiveElement);
              }}
              className={`group flex justify-center items-center rounded-md transition-colors
              ${isDisabled 
                ? "opacity-50 cursor-not-allowed" 
                : isActive(item.value) 
                  ? "bg-blue-100 text-blue-600" 
                  : "hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900"
              }
              `}
            >
              {/* If value is an array means it's a nav element with sub options i.e., dropdown */}
              {Array.isArray(item.value) ? (
                <ShapesMenu
                  item={item as unknown as { name: string; icon: string; value: ActiveElement[] }}
                  activeElement={activeElement}
                  imageInputRef={imageInputRef}
                  handleActiveElement={handleActiveElement}
                  handleImageUpload={handleImageUpload}
                  disabled={isDisabled}
                />
              ) : item?.value === "comments" ? (
                // If value is comments, trigger the NewThread component
                <NewThread>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`relative h-10 w-10 ${
                      isActive(item.value) 
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200" 
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={20}
                      height={20}
                      className={isActive(item.value) ? "filter-blue" : ""}
                    />
                  </Button>
                </NewThread>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  disabled={isDisabled}
                  className={`relative h-10 w-10 ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : isActive(item.value) 
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200" 
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                    className={isActive(item.value) ? "filter-blue" : ""}
                  />
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-4">
        <ActiveUsers />
      </div>
    </nav>
  );
};

export default memo(Navbar, (prevProps, nextProps) => 
  prevProps.activeElement === nextProps.activeElement
);