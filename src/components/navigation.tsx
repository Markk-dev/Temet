"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsIcon, UsersIcon, Palette } from "lucide-react";

import { cn } from "@/lib/utils";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";

import { GoCheckCircleFill, GoCheckCircle, GoHome, GoHomeFill} from "react-icons/go";

const routes = [
    {
        label: "Home",
        href: "/",
        icon: GoHome,
        activeIcon: GoHomeFill,
    },
    {
        label: "My Tasks",
        href: "/tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
    },
    {
        label: "Canvas",
        href: "/canvas",
        icon: Palette,
        activeIcon: Palette,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        activeIcon: SettingsIcon,
    },
    {
        label: "Members",
        href: "/members",
        icon: UsersIcon,
        activeIcon: UsersIcon,
    }
];

export const Navigation = () => {
    const workspaceId = useWorkspaceId();
    const pathname = usePathname();


    return (
        <ul className="flex flex-col">
            {routes.map((item) => {
                const fullHref = `/workspaces/${workspaceId}${item.href}`;
                
                // Handle canvas sub-routes (e.g., /canvas/[roomId])
                const isActive = item.href === "/canvas" 
                    ? pathname.includes(`/workspaces/${workspaceId}/canvas`)
                    : pathname.replace(/\/$/, "") === fullHref.replace(/\/$/, "");
                const Icon = isActive ? item.activeIcon : item.icon;

                return (
                    <Link key={item.href} href={fullHref}>
                        <div className={cn("flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                            isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                        )}>
                            <Icon className={cn("size-5", isActive ? "text-blue-600" : "text-neutral-500")}/>
                            {item.label}
                        </div>
                    </Link>     
                )
            })}
        </ul>
    );
};