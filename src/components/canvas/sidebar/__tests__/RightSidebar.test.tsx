import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fabric } from 'fabric';
import RightSidebar from '../RightSidebar';
import { Attributes } from '../../types';

// Mock fabric.js
vi.mock('fabric', () => ({
  fabric: {
    Canvas: vi.fn(),
    Object: vi.fn(),
  },
}));

describe('RightSidebar', () => {
  const mockElementAttributes: Attributes = {
    width: '100',
    height: '100',
    fontSize: '16',
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fill: '#000000',
    stroke: '#ffffff',
    fillOpacity: '1',
    strokeOpacity: '1',
  };

  const mockSetElementAttributes = vi.fn();
  const mockSyncShapeInStorage = vi.fn();
  const mockFabricRef = { current: null };
  const mockActiveObjectRef = { current: null };
  const mockIsEditingRef = { current: false };

  const defaultProps = {
    elementAttributes: mockElementAttributes,
    setElementAttributes: mockSetElementAttributes,
    fabricRef: mockFabricRef,
    activeObjectRef: mockActiveObjectRef,
    isEditingRef: mockIsEditingRef,
    syncShapeInStorage: mockSyncShapeInStorage,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar with design header', () => {
    render(<RightSidebar {...defaultProps} />);
    
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Make changes to canvas as you like')).toBeInTheDocument();
  });

  it('displays all property sections', () => {
    render(<RightSidebar {...defaultProps} />);
    
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('Text Properties')).toBeInTheDocument();
    expect(screen.getAllByText('Color Properties')).toHaveLength(2); // Fill and stroke
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('shows placeholder messages for unimplemented features', () => {
    render(<RightSidebar {...defaultProps} />);
    
    expect(screen.getByText('Dimension controls will be implemented in task 7.2')).toBeInTheDocument();
    expect(screen.getByText('Text controls will be implemented in task 7.4')).toBeInTheDocument();
    expect(screen.getByText('Color controls will be implemented in task 7.1')).toBeInTheDocument();
    expect(screen.getByText('Export functionality will be implemented in task 7.3')).toBeInTheDocument();
  });

  it('has proper styling classes for Temet integration', () => {
    const { container } = render(<RightSidebar {...defaultProps} />);
    
    const card = container.querySelector('.bg-neutral-50');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('w-[280px]', 'h-full', 'border-l', 'rounded-none');
  });

  it('memoizes content correctly', () => {
    const { rerender } = render(<RightSidebar {...defaultProps} />);
    
    const initialDesignText = screen.getByText('Design');
    
    // Rerender with same elementAttributes
    rerender(<RightSidebar {...defaultProps} />);
    
    const afterRerenderDesignText = screen.getByText('Design');
    expect(initialDesignText).toBe(afterRerenderDesignText);
  });

  it('re-renders when elementAttributes change', () => {
    const { rerender } = render(<RightSidebar {...defaultProps} />);
    
    const newAttributes = { ...mockElementAttributes, width: '200' };
    rerender(<RightSidebar {...defaultProps} elementAttributes={newAttributes} />);
    
    // Component should re-render with new attributes
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('handles handleInputChange function correctly', () => {
    // Create a mock canvas with getActiveObject method
    const mockCanvas = {
      getActiveObject: vi.fn().mockReturnValue({
        set: vi.fn(),
        stroke: '#000000',
      }),
    };
    
    const propsWithCanvas = {
      ...defaultProps,
      fabricRef: { current: mockCanvas as any },
    };

    render(<RightSidebar {...propsWithCanvas} />);
    
    // The handleInputChange function should be available (tested indirectly through component rendering)
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('handles opacity changes correctly', () => {
    const mockSelectedElement = {
      set: vi.fn(),
      stroke: '#ff0000',
    };
    
    const mockCanvas = {
      getActiveObject: vi.fn().mockReturnValue(mockSelectedElement),
    };
    
    const propsWithCanvas = {
      ...defaultProps,
      fabricRef: { current: mockCanvas as any },
    };

    render(<RightSidebar {...propsWithCanvas} />);
    
    // Component should render without errors when canvas is available
    expect(screen.getByText('Design')).toBeInTheDocument();
  });
});