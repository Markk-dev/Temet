import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Export from "../Export";
import React from "react";

// Mock jsPDF
vi.mock("jspdf", () => {
  const mockSave = vi.fn();
  const mockAddImage = vi.fn();
  
  return {
    default: vi.fn().mockImplementation(() => ({
      addImage: mockAddImage,
      save: mockSave,
    })),
  };
});

// Mock fabric canvas
const mockCanvas = {
  getElement: vi.fn(),
  toDataURL: vi.fn(),
};

const mockFabricRef = {
  current: mockCanvas,
} as React.RefObject<fabric.Canvas>;

describe("Export Component", () => {
  const mockCanvasElement = {
    width: 800,
    height: 600,
    toDataURL: vi.fn().mockReturnValue("data:image/png;base64,mockdata"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvas.getElement.mockReturnValue(mockCanvasElement);
    
    // Mock document.querySelector
    Object.defineProperty(document, "querySelector", {
      value: vi.fn().mockReturnValue(mockCanvasElement),
      writable: true,
    });

    // Mock document.createElement and appendChild/removeChild
    const mockLink = {
      download: "",
      href: "",
      click: vi.fn(),
    };
    
    Object.defineProperty(document, "createElement", {
      value: vi.fn().mockReturnValue(mockLink),
      writable: true,
    });
    
    Object.defineProperty(document.body, "appendChild", {
      value: vi.fn(),
      writable: true,
    });
    
    Object.defineProperty(document.body, "removeChild", {
      value: vi.fn(),
      writable: true,
    });

    // Mock console.error
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders export controls", () => {
    render(<Export />);
    
    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByText("Export to PDF")).toBeInTheDocument();
    expect(screen.getByText("Export as PNG")).toBeInTheDocument();
    expect(screen.getByText("Export as JPEG")).toBeInTheDocument();
  });

  it("exports to PDF when PDF button is clicked", () => {
    const jsPDF = require("jspdf").default;
    render(<Export fabricRef={mockFabricRef} />);
    
    const pdfButton = screen.getByText("Export to PDF");
    fireEvent.click(pdfButton);
    
    expect(jsPDF).toHaveBeenCalledWith({
      orientation: "landscape",
      unit: "px",
      format: [800, 600],
    });
  });

  it("exports to PNG when PNG button is clicked", () => {
    render(<Export fabricRef={mockFabricRef} />);
    
    const pngButton = screen.getByText("Export as PNG");
    fireEvent.click(pngButton);
    
    expect(mockCanvasElement.toDataURL).toHaveBeenCalledWith("image/png", 1.0);
    expect(document.createElement).toHaveBeenCalledWith("a");
  });

  it("exports to JPEG when JPEG button is clicked", () => {
    render(<Export fabricRef={mockFabricRef} />);
    
    const jpegButton = screen.getByText("Export as JPEG");
    fireEvent.click(jpegButton);
    
    expect(mockCanvasElement.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.9);
    expect(document.createElement).toHaveBeenCalledWith("a");
  });

  it("uses portrait orientation for tall canvases", () => {
    const tallCanvas = { ...mockCanvasElement, width: 400, height: 800 };
    mockCanvas.getElement.mockReturnValue(tallCanvas);
    
    const jsPDF = require("jspdf").default;
    render(<Export fabricRef={mockFabricRef} />);
    
    const pdfButton = screen.getByText("Export to PDF");
    fireEvent.click(pdfButton);
    
    expect(jsPDF).toHaveBeenCalledWith({
      orientation: "portrait",
      unit: "px",
      format: [400, 800],
    });
  });

  it("falls back to document.querySelector when fabricRef is not provided", () => {
    render(<Export />);
    
    const pdfButton = screen.getByText("Export to PDF");
    fireEvent.click(pdfButton);
    
    expect(document.querySelector).toHaveBeenCalledWith("canvas");
  });

  it("handles missing canvas gracefully", () => {
    mockCanvas.getElement.mockReturnValue(null);
    (document.querySelector as any).mockReturnValue(null);
    
    render(<Export fabricRef={mockFabricRef} />);
    
    const pdfButton = screen.getByText("Export to PDF");
    fireEvent.click(pdfButton);
    
    expect(console.error).toHaveBeenCalledWith("Canvas not found for PDF export");
  });

  it("handles export errors gracefully", () => {
    mockCanvasElement.toDataURL.mockImplementation(() => {
      throw new Error("Canvas error");
    });
    
    render(<Export fabricRef={mockFabricRef} />);
    
    const pngButton = screen.getByText("Export as PNG");
    fireEvent.click(pngButton);
    
    expect(console.error).toHaveBeenCalledWith("Error exporting to PNG:", expect.any(Error));
  });

  it("generates timestamped filenames", () => {
    const mockDate = new Date("2024-01-01T12:00:00Z");
    vi.spyOn(global, "Date").mockImplementation(() => mockDate as any);
    
    render(<Export fabricRef={mockFabricRef} />);
    
    const pngButton = screen.getByText("Export as PNG");
    fireEvent.click(pngButton);
    
    const mockLink = (document.createElement as any).mock.results[0].value;
    expect(mockLink.download).toBe("canvas-2024-01-01T12-00-00.png");
  });
});