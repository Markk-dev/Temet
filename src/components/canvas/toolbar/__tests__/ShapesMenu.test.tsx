import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShapesMenu from '../ShapesMenu';
import { shapeElements } from '../../constants';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('ShapesMenu', () => {
  const mockHandleActiveElement = vi.fn();
  const mockHandleImageUpload = vi.fn();
  const mockImageInputRef = { current: null };

  const mockItem = {
    name: "Rectangle",
    icon: "/assets/rectangle.svg",
    value: shapeElements,
  };

  const mockActiveElement = {
    name: "Select",
    value: "select",
    icon: "/assets/select.svg",
  };

  const defaultProps = {
    item: mockItem,
    activeElement: mockActiveElement,
    handleActiveElement: mockHandleActiveElement,
    handleImageUpload: mockHandleImageUpload,
    imageInputRef: mockImageInputRef,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dropdown trigger button', () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button');
    expect(triggerButton).toBeInTheDocument();
  });

  it('displays the correct icon when no dropdown element is active', () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const icon = screen.getByAltText('Rectangle');
    expect(icon).toHaveAttribute('src', '/assets/rectangle.svg');
  });

  it('displays the active element icon when a dropdown element is active', () => {
    const activeRectangleElement = {
      name: "Rectangle",
      value: "rectangle",
      icon: "/assets/rectangle.svg",
    };

    render(
      <ShapesMenu 
        {...defaultProps} 
        activeElement={activeRectangleElement}
      />
    );
    
    const icon = screen.getByAltText('Rectangle');
    expect(icon).toHaveAttribute('src', '/assets/rectangle.svg');
  });

  it('applies active styling when dropdown element is active', () => {
    const activeRectangleElement = {
      name: "Rectangle",
      value: "rectangle",
      icon: "/assets/rectangle.svg",
    };

    render(
      <ShapesMenu 
        {...defaultProps} 
        activeElement={activeRectangleElement}
      />
    );
    
    const triggerButton = screen.getByRole('button');
    expect(triggerButton).toHaveClass('bg-blue-100', 'text-blue-600');
  });

  it('applies inactive styling when no dropdown element is active', () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button');
    expect(triggerButton).toHaveClass('text-neutral-600');
    expect(triggerButton).not.toHaveClass('bg-blue-100');
  });

  it('calls handleActiveElement when trigger is clicked', () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    expect(mockHandleActiveElement).toHaveBeenCalledWith(mockItem);
  });

  it('opens dropdown menu when trigger is clicked', async () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    // Check if dropdown items are rendered
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
    expect(screen.getByText('Circle')).toBeInTheDocument();
    expect(screen.getByText('Triangle')).toBeInTheDocument();
    expect(screen.getByText('Line')).toBeInTheDocument();
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Free Drawing')).toBeInTheDocument();
  });

  it('calls handleActiveElement when dropdown item is clicked', async () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    const rectangleItem = screen.getByText('Rectangle');
    fireEvent.click(rectangleItem);
    
    expect(mockHandleActiveElement).toHaveBeenCalledWith(shapeElements[0]);
  });

  it('applies active styling to dropdown item when it is active', async () => {
    const activeRectangleElement = {
      name: "Rectangle",
      value: "rectangle",
      icon: "/assets/rectangle.svg",
    };

    render(
      <ShapesMenu 
        {...defaultProps} 
        activeElement={activeRectangleElement}
      />
    );
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    const rectangleItem = screen.getByText('Rectangle').closest('[role="menuitem"]');
    expect(rectangleItem).toHaveClass('bg-blue-50', 'text-blue-600');
  });

  it('applies inactive styling to dropdown item when it is not active', async () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    const rectangleItem = screen.getByText('Rectangle').closest('[role="menuitem"]');
    expect(rectangleItem).toHaveClass('text-neutral-700');
    expect(rectangleItem).not.toHaveClass('bg-blue-50');
  });

  it('renders hidden file input for image upload', () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const fileInput = screen.getByRole('textbox', { hidden: true }) || 
                     document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveClass('hidden');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('calls handleImageUpload when file input changes', () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    expect(mockHandleImageUpload).toHaveBeenCalled();
  });

  it('renders all shape elements in dropdown', async () => {
    render(<ShapesMenu {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button');
    fireEvent.click(triggerButton);
    
    shapeElements.forEach((element) => {
      expect(screen.getByText(element.name)).toBeInTheDocument();
      expect(screen.getByAltText(element.name)).toHaveAttribute('src', element.icon);
    });
  });
});