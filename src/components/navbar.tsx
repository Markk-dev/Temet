"use client";

import { usePathname } from "next/navigation";

import { MobileSidebar } from "./mobile-sidebar"

import { UserButton } from "@/features/auth/components/user-button"

const pathnameMap = {
  "tasks": {
    title: "My Tasks",
    description: "Manage your tasks here", 
  },
  "projects": {
    title: "My Project",
    description: "View and manage tasks projects", 
  },
}

const defaultMap = {
  title: "Home",
  description: "Monitor your projects and tasks here",
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

const {title, description} = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
        <div className="flex-col hidden lg:flex gap-y-1">
            <h1 className="text-2xl font-semibold">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {description}
            </p>
        </div>
        <MobileSidebar/>
        <UserButton/>
    </nav>
  )
}

export default Navbar