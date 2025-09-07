import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Text from "../Text";
import React from "react";

describe("Text Component", () => {
  const mockHandleInputChange = vi.fn();

  const defaultProps = {
    fontFamily: "Helvetica",
    fontSize: "16",
    fontWeight: "400",
    handleInputChange: mockHandleInputChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders text formatting controls", () => {
    render(<Text {...defaultProps} />);
    
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Font Family")).toBeInTheDocument();
    expect(screen.getByText("Font Size")).toBeInTheDocument();
    expect(screen.getByText("Font Weight")).toBeInTheDocument();
  });

  it("displays current font family value", () => {
    render(<Text {...defaultProps} />);
    
    // The select should show the current value
    expect(screen.getByDisplayValue("Helvetica")).toBeInTheDocument();
  });

  it("displays current font size value", () => {
    render(<Text {...defaultProps} />);
    
    expect(screen.getByDisplayValue("16")).toBeInTheDocument();
  });

  it("displays current font weight value", () => {
    render(<Text {...defaultProps} />);
    
    expect(screen.getByDisplayValue("400")).toBeInTheDocument();
  });

  it("calls handleInputChange when font family is changed", async () => {
    render(<Text {...defaultProps} />);
    
    const fontFamilyTrigger = screen.getByRole("combobox", { name: /font family/i });
    fireEvent.click(fontFamilyTrigger);
    
    const timesNewRomanOption = await screen.findByText("Times New Roman");
    fireEvent.click(timesNewRomanOption);
    
    expect(mockHandleInputChange).toHaveBeenCalledWith("fontFamily", "Times New Roman");
  });

  it("calls handleInputChange when font size is changed", async () => {
    render(<Text {...defaultProps} />);
    
    const fontSizeTrigger = screen.getByRole("combobox", { name: /font size/i });
    fireEvent.click(fontSizeTrigger);
    
    const size24Option = await screen.findByText("24");
    fireEvent.click(size24Option);
    
    expect(mockHandleInputChange).toHaveBeenCalledWith("fontSize", "24");
  });

  it("calls handleInputChange when font weight is changed", async () => {
    render(<Text {...defaultProps} />);
    
    const fontWeightTrigger = screen.getByRole("combobox", { name: /font weight/i });
    fireEvent.click(fontWeightTrigger);
    
    const boldOption = await screen.findByText("Bold");
    fireEvent.click(boldOption);
    
    expect(mockHandleInputChange).toHaveBeenCalledWith("fontWeight", "600");
  });

  it("renders with empty values", () => {
    const propsWithEmptyValues = {
      ...defaultProps,
      fontFamily: "",
      fontSize: "",
      fontWeight: "",
    };
    
    render(<Text {...propsWithEmptyValues} />);
    
    // Should render without errors and show placeholders
    expect(screen.getByText("Font Family")).toBeInTheDocument();
    expect(screen.getByText("Font Size")).toBeInTheDocument();
    expect(screen.getByText("Font Weight")).toBeInTheDocument();
  });

  it("has proper layout structure", () => {
    render(<Text {...defaultProps} />);
    
    // Font family should be full width (first select)
    const fontFamilyContainer = screen.getByText("Font Family").closest("div");
    expect(fontFamilyContainer).toBeInTheDocument();
    
    // Font size and weight should be in a flex container
    const fontSizeContainer = screen.getByText("Font Size").closest("div");
    const fontWeightContainer = screen.getByText("Font Weight").closest("div");
    
    expect(fontSizeContainer?.parentElement).toBe(fontWeightContainer?.parentElement);
  });

  it("shows correct placeholder values", () => {
    const propsWithEmptyValues = {
      fontFamily: "",
      fontSize: "",
      fontWeight: "",
      handleInputChange: mockHandleInputChange,
    };
    
    render(<Text {...propsWithEmptyValues} />);
    
    // Check that placeholders are accessible
    expect(screen.getByText("Font Family")).toBeInTheDocument();
    expect(screen.getByText("Font Size")).toBeInTheDocument();
    expect(screen.getByText("Font Weight")).toBeInTheDocument();
  });

  it("renders all font family options", async () => {
    render(<Text {...defaultProps} />);
    
    const fontFamilyTrigger = screen.getByRole("combobox", { name: /font family/i });
    fireEvent.click(fontFamilyTrigger);
    
    // Check that all font family options are available
    expect(await screen.findByText("Helvetica")).toBeInTheDocument();
    expect(await screen.findByText("Times New Roman")).toBeInTheDocument();
    expect(await screen.findByText("Comic Sans MS")).toBeInTheDocument();
    expect(await screen.findByText("Brush Script MT")).toBeInTheDocument();
  });

  it("renders all font weight options", async () => {
    render(<Text {...defaultProps} />);
    
    const fontWeightTrigger = screen.getByRole("combobox", { name: /font weight/i });
    fireEvent.click(fontWeightTrigger);
    
    // Check that all font weight options are available
    expect(await screen.findByText("Normal")).toBeInTheDocument();
    expect(await screen.findByText("Semibold")).toBeInTheDocument();
    expect(await screen.findByText("Bold")).toBeInTheDocument();
  });
});