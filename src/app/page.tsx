"use client"

import { useCurrent } from "@/features/auth/api/use-current";
import { useLogout } from "@/features/auth/api/use-logout";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter(); 
  const { data, isLoading } = useCurrent();
  const { mutate } = useLogout();


  useEffect(() => {
    if (!data && !isLoading) {
      router.push("sign-in");
    }
  }, [data]);


  return (

    <div>
      Visible to authorized users only
      <Button variant="primary" onClick={() => mutate()}>
        Logout
      </Button>
    </div>

  );
}
