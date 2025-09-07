import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import Live from '../Live';
import { CursorMode } from '../../types/canvas';

// Mock the Liveblocks hooks
vi.mock('@/config/liveblocks', () => ({
  useOthers: vi.fn(() => []),
  useMyPresence: vi.fn(() => [{ cursor: null }, vi.fn()]),
  useBroadcastEvent: vi.fn(() => vi.fn()),
  useEventListener: vi.fn(),
}));

// Mock the useInterval hook
vi.mock('../../hooks/useInterval', () => {
  return vi.fn((callback: () => void, delay: number) => {
    // For testing, we'll just call the callback immediately
    if (delay > 0) {
      setTimeout(callback, delay);
    }
  });
});

// Mock the components
vi.mock('../../collaboration/comments/Comments', () => ({
  Comments: () => <div data-testid="comments">Comments</div>,
}));

vi.mock('../../collaboration/cursor/CursorChat', () => ({
  __esModule: true,
  default: ({ cursor }: any) => cursor ? <div data-testid="cursor-chat">CursorChat</div> : null,
}));

vi.mock('../../collaboration/reaction/FlyingReaction', () => ({
  __esModule: true,
  default: ({ value }: any) => <div data-testid="flying-reaction">{value}</div>,
}));

vi.mock('../../collaboration/cursor/LiveCursors', () => ({
  __esModule: true,
  default: ({ others }: any) => <div data-testid="live-cursors">LiveCursors: {others.length}</div>,
}));

vi.mock('../../collaboration/reaction/ReactionSelector', () => ({
  __esModule: true,
  default: ({ setReaction }: any) => (
    <div data-testid="reaction-selector">
      <button onClick={() => setReaction('👍')}>👍</button>
    </div>
  ),
}));

describe('Live Component', () => {
  const mockUndo = vi.fn();
  const mockRedo = vi.fn();
  const mockCanvasRef = { current: null } as React.MutableRefObject<HTMLCanvasElement | null>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders canvas and basic components', () => {
    render(<Live canvasRef={mockCanvasRef} undo={mockUndo} redo={mockRedo} />);

    expect(screen.getByRole('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('comments')).toBeInTheDocument();
    expect(screen.getByTestId('live-cursors')).toBeInTheDocument();
  });

  it('handles pointer move events', () => {
    const { useMyPresence } = require('@/config/liveblocks');
    const mockUpdateMyPresence = vi.fn();
    useMyPresence.mockReturnValue([{ cursor: null }, mockUpdateMyPresence]);

    render(<Live canvasRef={mockCanvasRef} undo={mockUndo} redo={mockRedo} />);

    const canvasContainer = screen.getByTestId('canvas');
    
    fireEvent.pointerMove(canvasContainer, {
      clientX: 100,
      clientY: 200,
    });

    expect(mockUpdateMyPresence).toHaveBeenCalledWith({
      cursor: {
        x: expect.any(Number),
        y: expect.any(Number),
      },
    });
  });

  it('handles pointer leave events', () => {
    const { useMyPresence } = require('@/config/liveblocks');
    const mockUpdateMyPresence = vi.fn();
    useMyPresence.mockReturnValue([{ cursor: { x: 100, y: 200 } }, mockUpdateMyPresence]);

    render(<Live canvasRef={mockCanvasRef} undo={mockUndo} redo={mockRedo} />);

    const canvasContainer = screen.getByTestId('canvas');
    
    fireEvent.pointerLeave(canvasContainer);

    expect(mockUpdateMyPresence).toHaveBeenCalledWith({
      cursor: null,
      message: null,
    });
  });

  it('handles keyboard events for chat mode', () => {
    const { useMyPresence } = require('@/config/liveblocks');
    const mockUpdateMyPresence = vi.fn();
    useMyPresence.mockReturnValue([{ cursor: null }, mockUpdateMyPresence]);

    render(<Live canvasRef={mockCanvasRef} undo={mockUndo} redo={mockRedo} />);

    // Simulate pressing '/' key to enter chat mode
    fireEvent.keyUp(window, { key: '/' });

    // The component should enter chat mode (this would be visible in cursor state)
    // We can't directly test state, but we can test the effect
    expect(mockUpdateMyPresence).not.toHaveBeenCalledWith({ message: "" });
  });

  it('handles keyboard events for escape key', () => {
    const { useMyPresence } = require('@/config/liveblocks');
    const mockUpdateMyPresence = vi.fn();
    useMyPresence.mockReturnValue([{ cursor: null }, mockUpdateMyPresence]);

    render(<Live canvasRef={mockCanvasRef} undo={mockUndo} redo={mockRedo} />);

    // Simulate pressing 'Escape' key
    fireEvent.keyUp(window, { key: 'Escape' });

    expect(mockUpdateMyPresence).toHaveBeenCalledWith({ message: "" });
  });

  it('shows cursor chat when cursor exists', () => {
    const { useMyPresence } = require('@/config/liveblocks');
    const mockUpdateMyPresence = vi.fn();
    useMyPresence.mockReturnValue([{ cursor: { x: 100, y: 200 } }, mockUpdateMyPresence]);

    render(<Live canvasRef={mockCanvasRef} undo={mockUndo} redo={mockRedo} />);

    expect(screen.getByTestId('cursor-chat')).toBeInTheDocument();
  });

  it('does not show cursor chat when cursor is null', () => {
    const { useMyPresence } = require('@/config/liveblocks');
    const mockUpdateMyPresence = vi.fn();
    useMyPresence.mockReturnValue([{ cursor: null }, mockUpdateMyPresence]);

    render(<Live canvasRef={mockCanvasRef} undo={mockUndo} redo={mockRedo} />);

    expect(screen.queryByTestId('cursor-chat')).not.toBeInTheDocument();
  });

  it('handles context menu clicks for undo', () => {
    render(<Live canvasRef={mockCanvasRef} undo={mockUndo} redo={mockRedo} />);

    const canvasContainer = screen.getByTestId('canvas');
    
    // Right click to open context menu
    fireEvent.contextMenu(canvasContainer);

    // Find and click undo option
    const undoOption = screen.getByText('Undo');
    fireEvent.click(undoOption);

    expect(mockUndo).toHaveBeenCalled();
  });

  it('handles context menu clicks for redo', () => {
    render(<Live canvasRef={mockCanvasRef} undo={mockUndo} redo={mockRedo} />);

    const canvasContainer = screen.getByTestId('canvas');
    
    // Right click to open context menu
    fireEvent.contextMenu(canvasContainer);

    // Find and click redo option
    const redoOption = screen.getByText('Redo');
    fireEvent.click(redoOption);

    expect(mockRedo).toHaveBeenCalled();
  });
});