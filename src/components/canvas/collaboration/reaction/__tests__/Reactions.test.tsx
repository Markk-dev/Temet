import { render, screen, fireEvent, act } from '@testing-library/react';
import { Reactions } from '../Reactions';

// Mock Liveblocks hooks
jest.mock('@/config/liveblocks', () => ({
  useBroadcastEvent: jest.fn(),
  useEventListener: jest.fn(),
}));

// Mock components
jest.mock('../FlyingReaction', () => {
  return function MockFlyingReaction({ x, y, timestamp, value }: any) {
    return (
      <div data-testid="flying-reaction" data-x={x} data-y={y} data-timestamp={timestamp}>
        {value}
      </div>
    );
  };
});

jest.mock('../ReactionSelector', () => {
  return function MockReactionSelector({ setReaction, className }: any) {
    return (
      <div data-testid="reaction-selector" className={className}>
        <button onClick={() => setReaction('👍')}>Select Reaction</button>
      </div>
    );
  };
});

import { useBroadcastEvent, useEventListener } from '@/config/liveblocks';

const mockBroadcast = jest.fn();
const mockUseEventListener = useEventListener as jest.MockedFunction<typeof useEventListener>;

(useBroadcastEvent as jest.MockedFunction<typeof useBroadcastEvent>).mockReturnValue(mockBroadcast);

describe('Reactions', () => {
  const defaultProps = {
    isReactionSelectorVisible: false,
    onReactionSelectorToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock canvas element
    const mockCanvas = document.createElement('div');
    mockCanvas.id = 'canvas';
    mockCanvas.getBoundingClientRect = jest.fn(() => ({
      width: 800,
      height: 600,
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
    })) as any;
    document.body.appendChild(mockCanvas);
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('renders without crashing', () => {
    render(<Reactions {...defaultProps} />);
    
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('shows reaction selector when visible', () => {
    render(<Reactions {...defaultProps} isReactionSelectorVisible={true} />);
    
    expect(screen.getByTestId('reaction-selector')).toBeInTheDocument();
  });

  it('hides reaction selector when not visible', () => {
    render(<Reactions {...defaultProps} isReactionSelectorVisible={false} />);
    
    expect(screen.queryByTestId('reaction-selector')).not.toBeInTheDocument();
  });

  it('handles reaction selection', () => {
    const mockToggle = jest.fn();
    render(
      <Reactions 
        {...defaultProps} 
        isReactionSelectorVisible={true}
        onReactionSelectorToggle={mockToggle}
      />
    );
    
    const selectButton = screen.getByText('Select Reaction');
    fireEvent.click(selectButton);
    
    // Should broadcast the reaction
    expect(mockBroadcast).toHaveBeenCalledWith({
      type: 'REACTION',
      emoji: '👍',
      x: 400, // Center of 800px width
      y: 300, // Center of 600px height
    });
    
    // Should toggle selector
    expect(mockToggle).toHaveBeenCalled();
    
    // Should show flying reaction
    expect(screen.getByTestId('flying-reaction')).toBeInTheDocument();
  });

  it('handles incoming reactions from other users', () => {
    let eventHandler: (event: any) => void;
    
    mockUseEventListener.mockImplementation((handler) => {
      eventHandler = handler;
    });
    
    render(<Reactions {...defaultProps} />);
    
    // Simulate incoming reaction event
    act(() => {
      eventHandler!({
        event: {
          type: 'REACTION',
          emoji: '🔥',
          x: 100,
          y: 200,
        },
      });
    });
    
    // Should display flying reaction
    const flyingReaction = screen.getByTestId('flying-reaction');
    expect(flyingReaction).toBeInTheDocument();
    expect(flyingReaction).toHaveTextContent('🔥');
    expect(flyingReaction).toHaveAttribute('data-x', '100');
    expect(flyingReaction).toHaveAttribute('data-y', '200');
  });

  it('ignores non-reaction events', () => {
    let eventHandler: (event: any) => void;
    
    mockUseEventListener.mockImplementation((handler) => {
      eventHandler = handler;
    });
    
    render(<Reactions {...defaultProps} />);
    
    // Simulate non-reaction event
    act(() => {
      eventHandler!({
        event: {
          type: 'OTHER_EVENT',
          data: 'some data',
        },
      });
    });
    
    // Should not display any flying reactions
    expect(screen.queryByTestId('flying-reaction')).not.toBeInTheDocument();
  });

  it('cleans up old reactions after timeout', () => {
    render(<Reactions {...defaultProps} isReactionSelectorVisible={true} />);
    
    // Add a reaction
    const selectButton = screen.getByText('Select Reaction');
    fireEvent.click(selectButton);
    
    // Should show flying reaction
    expect(screen.getByTestId('flying-reaction')).toBeInTheDocument();
    
    // Fast forward time by 4 seconds (more than 3 second cleanup threshold)
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    
    // Should clean up old reactions
    expect(screen.queryByTestId('flying-reaction')).not.toBeInTheDocument();
  });

  it('handles missing canvas element gracefully', () => {
    // Remove canvas element
    document.body.innerHTML = '';
    
    render(<Reactions {...defaultProps} isReactionSelectorVisible={true} />);
    
    const selectButton = screen.getByText('Select Reaction');
    fireEvent.click(selectButton);
    
    // Should not crash and should not broadcast
    expect(mockBroadcast).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const customClass = 'custom-reactions-class';
    const { container } = render(
      <Reactions {...defaultProps} className={customClass} />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('applies correct default classes', () => {
    const { container } = render(<Reactions {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass(
      'absolute',
      'inset-0',
      'pointer-events-none'
    );
  });

  it('makes reaction selector interactive', () => {
    render(<Reactions {...defaultProps} isReactionSelectorVisible={true} />);
    
    const selector = screen.getByTestId('reaction-selector');
    expect(selector).toHaveClass('pointer-events-auto');
  });

  it('handles multiple reactions', () => {
    render(<Reactions {...defaultProps} isReactionSelectorVisible={true} />);
    
    const selectButton = screen.getByText('Select Reaction');
    
    // Add multiple reactions
    fireEvent.click(selectButton);
    fireEvent.click(selectButton);
    fireEvent.click(selectButton);
    
    // Should show multiple flying reactions
    const flyingReactions = screen.getAllByTestId('flying-reaction');
    expect(flyingReactions).toHaveLength(3);
  });

  it('generates unique keys for reactions', () => {
    render(<Reactions {...defaultProps} isReactionSelectorVisible={true} />);
    
    const selectButton = screen.getByText('Select Reaction');
    
    // Add reactions with slight delay to ensure different timestamps
    fireEvent.click(selectButton);
    
    act(() => {
      jest.advanceTimersByTime(1);
    });
    
    fireEvent.click(selectButton);
    
    const flyingReactions = screen.getAllByTestId('flying-reaction');
    expect(flyingReactions).toHaveLength(2);
    
    // Each should have different timestamps
    const timestamps = flyingReactions.map(el => el.getAttribute('data-timestamp'));
    expect(new Set(timestamps).size).toBe(2); // All unique
  });
});