"use client";

import Image from "next/image";
import ActiveUsers from "./users/activeUsers";

const CanvasNavbar = () => {
    //const isActive = (value: string) | Array<ActiveElement> =>
    // (activeElement && activeElement.value === value) ||
    // (Array.isArray(value) && value.some((val) => val?. value === activeElement?.value));

    return (
        <nav className="flex select-none items-center justify-between gap-4 bg-canvas-sidebar px-5">
            <Image src="/main.svg" 
                alt="logo" 
                width={100} 
                height={100}
            />
            <ActiveUsers/>
        </nav>
    );
}

export default CanvasNavbar