import { render, fireEvent } from '@testing-library/react';
import { NewThreadCursor } from '../NewThreadCursor';

// Mock Portal
jest.mock('@radix-ui/react-portal', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div data-testid="portal">{children}</div>,
}));

describe('NewThreadCursor', () => {
  beforeEach(() => {
    // Reset document classes
    document.documentElement.classList.remove('hide-cursor');
  });

  afterEach(() => {
    // Clean up
    document.documentElement.classList.remove('hide-cursor');
  });

  it('does not render when display is false', () => {
    const { queryByTestId } = render(<NewThreadCursor display={false} />);
    
    expect(queryByTestId('portal')).not.toBeInTheDocument();
  });

  it('renders when display is true', () => {
    const { getByTestId } = render(<NewThreadCursor display={true} />);
    
    expect(getByTestId('portal')).toBeInTheDocument();
  });

  it('adds hide-cursor class when display is true', () => {
    render(<NewThreadCursor display={true} />);
    
    expect(document.documentElement.classList.contains('hide-cursor')).toBe(true);
  });

  it('removes hide-cursor class when display is false', () => {
    const { rerender } = render(<NewThreadCursor display={true} />);
    expect(document.documentElement.classList.contains('hide-cursor')).toBe(true);
    
    rerender(<NewThreadCursor display={false} />);
    expect(document.documentElement.classList.contains('hide-cursor')).toBe(false);
  });

  it('updates cursor position on mouse move', () => {
    // Create a mock canvas element
    const mockCanvas = document.createElement('div');
    mockCanvas.id = 'canvas';
    mockCanvas.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      right: 500,
      top: 100,
      bottom: 400,
      width: 400,
      height: 300,
    })) as any;
    document.body.appendChild(mockCanvas);

    const { container } = render(<NewThreadCursor display={true} />);
    
    // Simulate mouse move within canvas bounds
    fireEvent.mouseMove(document, {
      clientX: 200,
      clientY: 200,
    });

    const cursorElement = container.querySelector('[style*="translate"]');
    expect(cursorElement).toHaveStyle({
      transform: 'translate(200px, 200px)',
    });

    // Clean up
    document.body.removeChild(mockCanvas);
  });

  it('hides cursor when mouse is outside canvas bounds', () => {
    // Create a mock canvas element
    const mockCanvas = document.createElement('div');
    mockCanvas.id = 'canvas';
    mockCanvas.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      right: 500,
      top: 100,
      bottom: 400,
      width: 400,
      height: 300,
    })) as any;
    document.body.appendChild(mockCanvas);

    const { container } = render(<NewThreadCursor display={true} />);
    
    // Simulate mouse move outside canvas bounds
    fireEvent.mouseMove(document, {
      clientX: 50, // Outside left bound
      clientY: 200,
    });

    const cursorElement = container.querySelector('[style*="translate"]');
    expect(cursorElement).toHaveStyle({
      transform: 'translate(-10000px, -10000px)',
    });

    // Clean up
    document.body.removeChild(mockCanvas);
  });

  it('handles mouse enter events', () => {
    const { container } = render(<NewThreadCursor display={true} />);
    
    fireEvent.mouseEnter(document, {
      clientX: 150,
      clientY: 150,
    });

    // Should update position (exact behavior depends on canvas presence)
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<NewThreadCursor display={true} />);
    const cursorElement = container.querySelector('div[class*="pointer-events-none"]');
    
    expect(cursorElement).toHaveClass(
      'pointer-events-none',
      'fixed',
      'left-0',
      'top-0',
      'z-50',
      'select-none'
    );
  });

  it('cleans up event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(<NewThreadCursor display={true} />);
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), false);
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function), false);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});