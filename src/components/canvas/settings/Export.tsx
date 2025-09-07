"use client";

import { Button } from "@/components/ui/button";
import { Download, FileImage } from "lucide-react";
import jsPDF from "jspdf";
import React from "react";

type Props = {
  fabricRef?: React.RefObject<fabric.Canvas | null>;
};

const Export = ({ fabricRef }: Props) => {
  const exportToPdf = () => {
    const canvas = fabricRef?.current?.getElement() || document.querySelector("canvas");

    if (!canvas) {
      console.error("Canvas not found for PDF export");
      return;
    }

    try {
      // use jspdf
      const doc = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      // get the canvas data url
      const data = canvas.toDataURL("image/png", 1.0);

      // add the image to the pdf
      doc.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);

      // download the pdf with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      doc.save(`canvas-${timestamp}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    }
  };

  const exportToImage = (format: "png" | "jpeg" = "png") => {
    const canvas = fabricRef?.current?.getElement() || document.querySelector("canvas");

    if (!canvas) {
      console.error("Canvas not found for image export");
      return;
    }

    try {
      // get the canvas data url
      const quality = format === "jpeg" ? 0.9 : 1.0;
      const dataURL = canvas.toDataURL(`image/${format}`, quality);

      // create download link
      const link = document.createElement("a");
      link.download = `canvas-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.${format}`;
      link.href = dataURL;
      
      // trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error exporting to ${format.toUpperCase()}:`, error);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
      <h3 className="text-xs font-medium uppercase text-muted-foreground">Export</h3>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={exportToPdf}
        >
          <Download className="h-4 w-4" />
          Export to PDF
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => exportToImage("png")}
        >
          <FileImage className="h-4 w-4" />
          Export as PNG
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => exportToImage("jpeg")}
        >
          <FileImage className="h-4 w-4" />
          Export as JPEG
        </Button>
      </div>
    </div>
  );
};

export default Export;