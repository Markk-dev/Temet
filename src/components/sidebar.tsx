import Image from "next/image";
import Link from "next/link";

import { Projects } from "./projects";
import { Navigation } from "./navigation";
import { DottedSeparator } from "./dotted-line";
import WorkspaceSwitcher from "./workspace-switcher";
import { TemBox } from "./tembox";


export const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-3.5 w-full">
            <Link href="/">
            <Image
                src="/main.svg"
                alt="logo"
                width={100} 
                height={90}
                />
            </Link>
            <DottedSeparator className="my-4"/>
            <WorkspaceSwitcher/>
            <DottedSeparator className="my-4"/>
            <TemBox/>
            <DottedSeparator className="my-4"/>
            <Navigation/>
            <DottedSeparator className="my-4"/>
            <Projects/>
        </aside>
    )
};