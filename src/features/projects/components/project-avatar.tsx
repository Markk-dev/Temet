import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProjectAvatarProps {
  image?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export const ProjectAvatar = ({
  image,
  name,
  className,
  fallbackClassName,

}: ProjectAvatarProps) => {
  const hasValidImage = isValidImageUrl(image);

  return hasValidImage ? (
    <div className={cn("size-5 relative rounded-md overflow-hidden", className)}>
      <Image src={image!} alt={name} fill className="object-cover" />
    </div>
  ) : (
    <Avatar className={cn("size-5 rounded-md", className)}>
      <AvatarFallback className={cn("text-white bg-blue-600 font-semibold text-sm uppercase rounded-md",
      fallbackClassName
      )}>
        {name?.[0]}
      </AvatarFallback>
    </Avatar>
  );
};
