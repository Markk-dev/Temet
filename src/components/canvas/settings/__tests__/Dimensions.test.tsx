import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Dimensions from "../Dimensions";
import React from "react";

describe("Dimensions Component", () => {
  const mockHandleInputChange = vi.fn();
  const mockIsEditingRef = { current: false };

  const defaultProps = {
    width: "100",
    height: "200",
    isEditingRef: mockIsEditingRef,
    handleInputChange: mockHandleInputChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsEditingRef.current = false;
  });

  it("renders dimensions controls with correct initial values", () => {
    render(<Dimensions {...defaultProps} />);
    
    expect(screen.getByText("Dimensions")).toBeInTheDocument();
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("H")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    expect(screen.getByDisplayValue("200")).toBeInTheDocument();
  });

  it("calls handleInputChange when width is changed", () => {
    render(<Dimensions {...defaultProps} />);
    
    const widthInput = screen.getByDisplayValue("100");
    fireEvent.change(widthInput, { target: { value: "150" } });
    
    expect(mockHandleInputChange).toHaveBeenCalledWith("width", "150");
  });

  it("calls handleInputChange when height is changed", () => {
    render(<Dimensions {...defaultProps} />);
    
    const heightInput = screen.getByDisplayValue("200");
    fireEvent.change(heightInput, { target: { value: "250" } });
    
    expect(mockHandleInputChange).toHaveBeenCalledWith("height", "250");
  });

  it("sets isEditingRef to true when input is focused", () => {
    render(<Dimensions {...defaultProps} />);
    
    const widthInput = screen.getByDisplayValue("100");
    fireEvent.focus(widthInput);
    
    expect(mockIsEditingRef.current).toBe(true);
  });

  it("sets isEditingRef to false when input is blurred", () => {
    mockIsEditingRef.current = true;
    render(<Dimensions {...defaultProps} />);
    
    const widthInput = screen.getByDisplayValue("100");
    fireEvent.blur(widthInput);
    
    expect(mockIsEditingRef.current).toBe(false);
  });

  it("has proper input attributes for number validation", () => {
    render(<Dimensions {...defaultProps} />);
    
    const widthInput = screen.getByDisplayValue("100");
    const heightInput = screen.getByDisplayValue("200");
    
    expect(widthInput).toHaveAttribute("type", "number");
    expect(widthInput).toHaveAttribute("min", "1");
    expect(widthInput).toHaveAttribute("max", "10000");
    expect(widthInput).toHaveAttribute("step", "1");
    
    expect(heightInput).toHaveAttribute("type", "number");
    expect(heightInput).toHaveAttribute("min", "1");
    expect(heightInput).toHaveAttribute("max", "10000");
    expect(heightInput).toHaveAttribute("step", "1");
  });

  it("renders with empty values", () => {
    const propsWithEmptyValues = {
      ...defaultProps,
      width: "",
      height: "",
    };
    
    render(<Dimensions {...propsWithEmptyValues} />);
    
    const inputs = screen.getAllByPlaceholderText("100");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue(null);
    expect(inputs[1]).toHaveValue(null);
  });

  it("has proper labels associated with inputs", () => {
    render(<Dimensions {...defaultProps} />);
    
    const widthLabel = screen.getByText("W");
    const heightLabel = screen.getByText("H");
    const widthInput = screen.getByDisplayValue("100");
    const heightInput = screen.getByDisplayValue("200");
    
    expect(widthLabel).toHaveAttribute("for", "width");
    expect(heightLabel).toHaveAttribute("for", "height");
    expect(widthInput).toHaveAttribute("id", "width");
    expect(heightInput).toHaveAttribute("id", "height");
  });
});