import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "@/lib/utils";

type UserInfo = {
  name?: string;
  avatar?: string;
  color?: string;
} | null | undefined;

type Props = {
  name: string;
  userInfo?: UserInfo;
  className?: string;
};

export const UserAvatar = ({ name, userInfo, className }: Props) => {
  const displayName = userInfo?.name || name;
  const avatarUrl = userInfo?.avatar;
  const userColor = userInfo?.color || "#3B82F6";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("relative", className)}>
            <Avatar className="h-9 w-9 cursor-pointer transition-all duration-200 hover:shadow-lg">
              <AvatarImage 
                src={avatarUrl} 
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback 
                className="text-xs font-medium text-white"
                style={{ backgroundColor: userColor }}
              >
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Online indicator */}
            <div 
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full",
                "bg-green-500 border-2 border-white shadow-sm"
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className={cn(
            "border-none px-2.5 py-1.5 text-xs font-medium",
            "bg-gray-900 text-white shadow-lg"
          )}
          sideOffset={5}
        >
          {displayName}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserAvatar;