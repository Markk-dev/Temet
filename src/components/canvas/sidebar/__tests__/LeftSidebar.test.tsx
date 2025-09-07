import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LeftSidebar from '../LeftSidebar';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('LeftSidebar', () => {
  const mockShapes = [
    [
      'shape1',
      {
        objectId: 'shape1',
        type: 'rect',
      },
    ],
    [
      'shape2',
      {
        objectId: 'shape2',
        type: 'circle',
      },
    ],
    [
      'shape3',
      {
        objectId: 'shape3',
        type: 'i-text',
      },
    ],
  ];

  it('renders the sidebar with layers header', () => {
    render(<LeftSidebar allShapes={[]} />);
    
    expect(screen.getByText('Layers')).toBeInTheDocument();
  });

  it('displays empty state when no shapes are provided', () => {
    render(<LeftSidebar allShapes={[]} />);
    
    expect(screen.getByText('No layers yet')).toBeInTheDocument();
    expect(screen.getByText('Add shapes to see them here')).toBeInTheDocument();
  });

  it('renders all shapes with correct information', () => {
    render(<LeftSidebar allShapes={mockShapes} />);
    
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
    expect(screen.getByText('Circle')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('displays correct icons for each shape type', () => {
    render(<LeftSidebar allShapes={mockShapes} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    
    expect(images[0]).toHaveAttribute('src', '/assets/rectangle.svg');
    expect(images[1]).toHaveAttribute('src', '/assets/circle.svg');
    expect(images[2]).toHaveAttribute('src', '/assets/text.svg');
  });

  it('calls onShapeSelect when a shape is clicked', () => {
    const mockOnShapeSelect = vi.fn();
    render(
      <LeftSidebar 
        allShapes={mockShapes} 
        onShapeSelect={mockOnShapeSelect}
      />
    );
    
    const rectangleButton = screen.getByText('Rectangle').closest('button');
    fireEvent.click(rectangleButton!);
    
    expect(mockOnShapeSelect).toHaveBeenCalledWith('shape1');
  });

  it('highlights selected shape', () => {
    render(
      <LeftSidebar 
        allShapes={mockShapes} 
        selectedShapeId="shape2"
      />
    );
    
    const circleButton = screen.getByText('Circle').closest('button');
    expect(circleButton).toHaveClass('bg-blue-100', 'text-blue-900');
  });

  it('does not highlight non-selected shapes', () => {
    render(
      <LeftSidebar 
        allShapes={mockShapes} 
        selectedShapeId="shape2"
      />
    );
    
    const rectangleButton = screen.getByText('Rectangle').closest('button');
    expect(rectangleButton).not.toHaveClass('bg-blue-100');
    expect(rectangleButton).toHaveClass('text-neutral-700');
  });

  it('handles unknown shape types gracefully', () => {
    const unknownShapes = [
      [
        'unknown',
        {
          objectId: 'unknown',
          type: 'unknown-type',
        },
      ],
    ];

    render(<LeftSidebar allShapes={unknownShapes} />);
    
    expect(screen.getByText('unknown-type')).toBeInTheDocument();
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/assets/rectangle.svg'); // fallback icon
  });

  it('memoizes shapes correctly', () => {
    const { rerender } = render(<LeftSidebar allShapes={mockShapes} />);
    
    const initialRectangle = screen.getByText('Rectangle');
    
    // Rerender with same shapes
    rerender(<LeftSidebar allShapes={mockShapes} />);
    
    const afterRerenderRectangle = screen.getByText('Rectangle');
    expect(initialRectangle).toBe(afterRerenderRectangle);
  });
});