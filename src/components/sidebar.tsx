import Image from "next/image";
import Link from "next/link";

import { Projects } from "./projects";
import { Navigation } from "./navigation";
import { DottedSeparator } from "./dotted-line";
import WorkspaceSwitcher from "./workspace-switcher";


export const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <Link href="/">
            <Image
                src="/main.svg"
                alt="logo"
                width={120} 
                height={108} 
                />
            </Link>
            <DottedSeparator className="my-4"/>
            <WorkspaceSwitcher/>
            <DottedSeparator className="my-4"/>
            <Navigation/>
            <DottedSeparator className="my-4"/>
            <Projects/>
        </aside>
    )
};