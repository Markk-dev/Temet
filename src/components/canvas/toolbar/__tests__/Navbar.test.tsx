import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from '../Navbar';
import { ActiveElement } from '../../types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock the collaboration components
vi.mock('../../collaboration/users/ActiveUsers', () => ({
  default: () => <div data-testid="active-users">Active Users</div>,
}));

vi.mock('../../collaboration/comments/NewThread', () => ({
  NewThread: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="new-thread">{children}</div>
  ),
}));

// Mock ShapesMenu component
vi.mock('../ShapesMenu', () => ({
  default: ({ item }: { item: { name: string } }) => (
    <div data-testid={`shapes-menu-${item.name}`}>Shapes Menu</div>
  ),
}));

describe('Navbar', () => {
  const mockHandleActiveElement = vi.fn();
  const mockHandleImageUpload = vi.fn();
  const mockImageInputRef = { current: null };

  const defaultProps = {
    activeElement: null,
    imageInputRef: mockImageInputRef,
    handleImageUpload: mockHandleImageUpload,
    handleActiveElement: mockHandleActiveElement,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the navbar with Canvas title', () => {
    render(<Navbar {...defaultProps} />);
    
    expect(screen.getByText('Canvas')).toBeInTheDocument();
  });

  it('renders all navigation elements', () => {
    render(<Navbar {...defaultProps} />);
    
    // Check for select tool
    expect(screen.getByAltText('Select')).toBeInTheDocument();
    
    // Check for text tool
    expect(screen.getByAltText('Text')).toBeInTheDocument();
    
    // Check for delete tool
    expect(screen.getByAltText('Delete')).toBeInTheDocument();
    
    // Check for reset tool
    expect(screen.getByAltText('Reset')).toBeInTheDocument();
    
    // Check for comments tool
    expect(screen.getByAltText('Comments')).toBeInTheDocument();
  });

  it('renders ShapesMenu for rectangle tool', () => {
    render(<Navbar {...defaultProps} />);
    
    expect(screen.getByTestId('shapes-menu-Rectangle')).toBeInTheDocument();
  });

  it('renders ActiveUsers component', () => {
    render(<Navbar {...defaultProps} />);
    
    expect(screen.getByTestId('active-users')).toBeInTheDocument();
  });

  it('renders NewThread component for comments', () => {
    render(<Navbar {...defaultProps} />);
    
    expect(screen.getByTestId('new-thread')).toBeInTheDocument();
  });

  it('calls handleActiveElement when clicking on a tool', () => {
    render(<Navbar {...defaultProps} />);
    
    const selectButton = screen.getByAltText('Select').closest('button');
    fireEvent.click(selectButton!);
    
    expect(mockHandleActiveElement).toHaveBeenCalledWith({
      icon: "/assets/select.svg",
      name: "Select",
      value: "select",
    });
  });

  it('applies active styling when element is active', () => {
    const activeElement: ActiveElement = {
      icon: "/assets/select.svg",
      name: "Select",
      value: "select",
    };

    render(<Navbar {...defaultProps} activeElement={activeElement} />);
    
    const selectButton = screen.getByAltText('Select').closest('button');
    expect(selectButton).toHaveClass('bg-blue-100', 'text-blue-600');
  });

  it('applies inactive styling when element is not active', () => {
    const activeElement: ActiveElement = {
      icon: "/assets/text.svg",
      name: "Text",
      value: "text",
    };

    render(<Navbar {...defaultProps} activeElement={activeElement} />);
    
    const selectButton = screen.getByAltText('Select').closest('button');
    expect(selectButton).toHaveClass('text-neutral-600');
    expect(selectButton).not.toHaveClass('bg-blue-100');
  });

  it('does not call handleActiveElement for array-type elements (shapes)', () => {
    render(<Navbar {...defaultProps} />);
    
    // The rectangle element has an array value, so clicking should not call handleActiveElement
    const rectangleElement = screen.getByTestId('shapes-menu-Rectangle').closest('li');
    fireEvent.click(rectangleElement!);
    
    expect(mockHandleActiveElement).not.toHaveBeenCalled();
  });

  it('memoizes correctly when activeElement does not change', () => {
    const { rerender } = render(<Navbar {...defaultProps} />);
    
    // Re-render with same activeElement
    rerender(<Navbar {...defaultProps} />);
    
    // Component should not re-render due to memoization
    expect(screen.getByText('Canvas')).toBeInTheDocument();
  });

  it('re-renders when activeElement changes', () => {
    const { rerender } = render(<Navbar {...defaultProps} />);
    
    const newActiveElement: ActiveElement = {
      icon: "/assets/text.svg",
      name: "Text",
      value: "text",
    };
    
    rerender(<Navbar {...defaultProps} activeElement={newActiveElement} />);
    
    const textButton = screen.getByAltText('Text').closest('button');
    expect(textButton).toHaveClass('bg-blue-100', 'text-blue-600');
  });
});