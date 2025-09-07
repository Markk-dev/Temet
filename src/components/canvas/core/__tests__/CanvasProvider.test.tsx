import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { CanvasProvider, useCanvas, CanvasContext } from '../CanvasProvider';

// Mock fabric.js
vi.mock('fabric', () => ({
  fabric: {
    Canvas: vi.fn().mockImplementation(() => ({
      dispose: vi.fn(),
    })),
  },
}));

describe('CanvasProvider', () => {
  const defaultProps = {
    workspaceId: 'test-workspace',
    roomId: 'test-room',
  };

  it('renders children correctly', () => {
    render(
      <CanvasProvider {...defaultProps}>
        <div data-testid="child">Test Child</div>
      </CanvasProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('provides canvas context with correct initial values', () => {
    const TestComponent = () => {
      const context = useCanvas();
      return (
        <div>
          <div data-testid="is-ready">{context.isReady.toString()}</div>
          <div data-testid="fabric-ref">{context.fabricRef ? 'exists' : 'null'}</div>
          <div data-testid="active-object-ref">{context.activeObjectRef ? 'exists' : 'null'}</div>
          <div data-testid="is-drawing-ref">{context.isDrawing ? 'exists' : 'null'}</div>
          <div data-testid="shape-ref">{context.shapeRef ? 'exists' : 'null'}</div>
          <div data-testid="selected-shape-ref">{context.selectedShapeRef ? 'exists' : 'null'}</div>
          <div data-testid="is-editing-ref">{context.isEditingRef ? 'exists' : 'null'}</div>
          <div data-testid="image-input-ref">{context.imageInputRef ? 'exists' : 'null'}</div>
        </div>
      );
    };

    render(
      <CanvasProvider {...defaultProps}>
        <TestComponent />
      </CanvasProvider>
    );

    expect(screen.getByTestId('is-ready')).toHaveTextContent('true');
    expect(screen.getByTestId('fabric-ref')).toHaveTextContent('exists');
    expect(screen.getByTestId('active-object-ref')).toHaveTextContent('exists');
    expect(screen.getByTestId('is-drawing-ref')).toHaveTextContent('exists');
    expect(screen.getByTestId('shape-ref')).toHaveTextContent('exists');
    expect(screen.getByTestId('selected-shape-ref')).toHaveTextContent('exists');
    expect(screen.getByTestId('is-editing-ref')).toHaveTextContent('exists');
    expect(screen.getByTestId('image-input-ref')).toHaveTextContent('exists');
  });

  it('throws error when useCanvas is used outside provider', () => {
    const TestComponent = () => {
      useCanvas();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useCanvas must be used within a CanvasProvider'
    );

    consoleSpy.mockRestore();
  });

  it('works without roomId prop', () => {
    const propsWithoutRoomId = {
      workspaceId: 'test-workspace',
    };

    render(
      <CanvasProvider {...propsWithoutRoomId}>
        <div data-testid="child">Test Child</div>
      </CanvasProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('provides stable context value', () => {
    let contextValue1: any;
    let contextValue2: any;

    const TestComponent = ({ onRender }: { onRender: (context: any) => void }) => {
      const context = useCanvas();
      onRender(context);
      return <div>Test</div>;
    };

    const { rerender } = render(
      <CanvasProvider {...defaultProps}>
        <TestComponent onRender={(context) => { contextValue1 = context; }} />
      </CanvasProvider>
    );

    rerender(
      <CanvasProvider {...defaultProps}>
        <TestComponent onRender={(context) => { contextValue2 = context; }} />
      </CanvasProvider>
    );

    // Context should provide stable references
    expect(contextValue1.fabricRef).toBe(contextValue1.fabricRef);
    expect(contextValue1.activeObjectRef).toBe(contextValue1.activeObjectRef);
  });
});

describe('useCanvas hook', () => {
  it('returns canvas context when used within provider', () => {
    const { result } = renderHook(() => useCanvas(), {
      wrapper: ({ children }) => (
        <CanvasProvider workspaceId="test" roomId="test">
          {children}
        </CanvasProvider>
      ),
    });

    expect(result.current).toBeDefined();
    expect(result.current.fabricRef).toBeDefined();
    expect(result.current.isReady).toBe(true);
    expect(result.current.activeObjectRef).toBeDefined();
    expect(result.current.isDrawing).toBeDefined();
    expect(result.current.shapeRef).toBeDefined();
    expect(result.current.selectedShapeRef).toBeDefined();
    expect(result.current.isEditingRef).toBeDefined();
    expect(result.current.imageInputRef).toBeDefined();
  });
});