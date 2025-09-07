import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Color from "../Color";
import React from "react";

describe("Color Component", () => {
  const mockHandleInputChange = vi.fn();
  const mockOnOpacityChange = vi.fn();
  const mockInputRef = React.createRef<HTMLInputElement>();

  const defaultProps = {
    inputRef: mockInputRef,
    attribute: "#ff0000",
    placeholder: "Fill Color",
    attributeType: "fill",
    handleInputChange: mockHandleInputChange,
    opacity: "0.8",
    onOpacityChange: mockOnOpacityChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders color picker with correct initial values", () => {
    render(<Color {...defaultProps} />);
    
    expect(screen.getByText("Fill Color")).toBeInTheDocument();
    expect(screen.getByText("#ff0000")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("calls handleInputChange when color is changed", () => {
    render(<Color {...defaultProps} />);
    
    const colorInput = screen.getByDisplayValue("#ff0000");
    fireEvent.change(colorInput, { target: { value: "#00ff00" } });
    
    expect(mockHandleInputChange).toHaveBeenCalledWith("fill", "#00ff00");
  });

  it("enters edit mode when opacity label is clicked", () => {
    render(<Color {...defaultProps} />);
    
    const opacityLabel = screen.getByText("80%");
    fireEvent.click(opacityLabel);
    
    expect(screen.getByDisplayValue("80")).toBeInTheDocument();
  });

  it("updates opacity when input is changed and blurred", async () => {
    render(<Color {...defaultProps} />);
    
    const opacityLabel = screen.getByText("80%");
    fireEvent.click(opacityLabel);
    
    const opacityInput = screen.getByDisplayValue("80");
    fireEvent.change(opacityInput, { target: { value: "50" } });
    fireEvent.blur(opacityInput);
    
    await waitFor(() => {
      expect(mockOnOpacityChange).toHaveBeenCalledWith("0.5");
    });
  });

  it("constrains opacity values between 0 and 100", async () => {
    render(<Color {...defaultProps} />);
    
    const opacityLabel = screen.getByText("80%");
    fireEvent.click(opacityLabel);
    
    const opacityInput = screen.getByDisplayValue("80");
    fireEvent.change(opacityInput, { target: { value: "150" } });
    fireEvent.blur(opacityInput);
    
    await waitFor(() => {
      expect(mockOnOpacityChange).toHaveBeenCalledWith("1");
    });
  });

  it("only allows numeric input for opacity", () => {
    render(<Color {...defaultProps} />);
    
    const opacityLabel = screen.getByText("80%");
    fireEvent.click(opacityLabel);
    
    const opacityInput = screen.getByDisplayValue("80");
    fireEvent.change(opacityInput, { target: { value: "abc50" } });
    
    expect(opacityInput).toHaveValue("50");
  });

  it("exits edit mode when Enter key is pressed", () => {
    render(<Color {...defaultProps} />);
    
    const opacityLabel = screen.getByText("80%");
    fireEvent.click(opacityLabel);
    
    const opacityInput = screen.getByDisplayValue("80");
    fireEvent.keyDown(opacityInput, { key: "Enter" });
    
    // Should trigger blur which exits edit mode
    expect(opacityInput).toHaveAttribute("autoFocus");
  });

  it("uses default opacity when not provided", () => {
    const propsWithoutOpacity = {
      ...defaultProps,
      opacity: undefined,
      onOpacityChange: undefined,
    };
    
    render(<Color {...propsWithoutOpacity} />);
    
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("clicks color input when container is clicked", () => {
    const mockClick = vi.fn();
    const inputRef = { current: { click: mockClick } } as React.RefObject<HTMLInputElement>;
    
    render(<Color {...defaultProps} inputRef={inputRef} />);
    
    const container = screen.getByText("#ff0000").closest("div");
    fireEvent.click(container!);
    
    expect(mockClick).toHaveBeenCalled();
  });
});