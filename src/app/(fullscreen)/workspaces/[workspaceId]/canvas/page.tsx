"use client";

import { useEffect, useRef } from "react";
import fabric from "fabric";
import Live from "@/components/Live";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import CanvasNavbar from "@/components/canvas-Navbar";
import { handleCanvasMouseDown, handleResize, initializeFabric } from "@/lib/extentions/canvas";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas, 
        isDrawing,
        shapeRef,
        selectedShapeRef,
      })
    })

      window.addEventListener("resize", () => {
      handleResize({ canvas: fabricRef.current }); 
      //handleResize({ fabricRef }); 
    })

  }, []);


  return (
      <main className="h-screen overflow-hidden ">
        <CanvasNavbar/>

        <section className="flex h-full flex-row">  
        <LeftSidebar/>

        <Live canvasRef={canvasRef} />
        <RightSidebar/>
        </section>
      </main>
  );
}


