// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";


// interface WorkspaceAvatarProps {
//     image?: string;
//     name: string;
//     className?: string;
// }

// export const WorkspaceAvatar = ({
//     image,
//     name,
//     className,

// }: WorkspaceAvatarProps) => {   
//     if( image ) {
//         return (
//             <div className={cn("size-10 relative rounded-md overflow-hidden", className)}>
//                 <Image src={image} alt={name} fill className="object-cover"/>
//             </div>
//         )
//     }

//     return (
//         <Avatar className={cn("size-10 rounded-md", className)}> 
//             <AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
//                 {name[0]}
//             </AvatarFallback>
//         </Avatar>
//     );
// };

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WorkspaceAvatarProps {
  image?: string;
  name: string;
  className?: string;
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

export const WorkspaceAvatar = ({
  image,
  name,
  className,
}: WorkspaceAvatarProps) => {
  const hasValidImage = isValidImageUrl(image);

  return hasValidImage ? (
    <div className={cn("size-10 relative rounded-md overflow-hidden", className)}>
      <Image src={image!} alt={name} fill className="object-cover" />
    </div>
  ) : (
    <Avatar className={cn("size-10 rounded-md", className)}>
      <AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
        {name?.[0]}
      </AvatarFallback>
    </Avatar>
  );
};
