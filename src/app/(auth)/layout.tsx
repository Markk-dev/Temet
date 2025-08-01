"use client"

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

import Link from "next/link";


interface AuthProps{
    children: React.ReactNode;
}

const AuthLayout = ({children}:AuthProps ) => {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";

  return (
    <main className="bg-neutral-100 min-h-screen">
        <div className="mx-auto max-w-screen-2xl p-4">
            <nav className="flex justify-between items-center">          
                <Image src="/main.svg" alt="logo" width={120} height={108}/>
                <Button asChild variant="secondary">
                  <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
                    {isSignIn ? "Sign Up" : "Login"}</Link>
                </Button>  
            </nav>
            <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
            {children}
            </div>
        </div>
    </main>
  )
}

export default AuthLayout