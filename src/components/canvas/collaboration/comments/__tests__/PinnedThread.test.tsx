import { render, screen, fireEvent } from '@testing-library/react';
import { PinnedThread } from '../PinnedThread';

// Mock Liveblocks hooks and components
jest.mock('@/config/liveblocks', () => ({
  useUser: jest.fn(),
}));

jest.mock('@liveblocks/react-comments', () => ({
  Thread: ({ thread, indentCommentContent, onKeyUp }: any) => (
    <div data-testid="thread-component" onKeyUp={onKeyUp}>
      Thread for {thread.id}
    </div>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => <div className={className} data-testid="avatar">{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="avatar-image" />,
  AvatarFallback: ({ children, className, style }: any) => (
    <div className={className} style={style} data-testid="avatar-fallback">{children}</div>
  ),
}));

import { useUser } from '@/config/liveblocks';

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

describe('PinnedThread', () => {
  const mockOnFocus = jest.fn();
  
  const mockThread = {
    id: 'thread-1',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    comments: [
      {
        userId: 'user-1',
        body: 'Test comment',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current time to be much later than thread creation
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-01-01T01:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders thread with user avatar', () => {
    mockUseUser.mockReturnValue({
      user: {
        info: {
          name: 'John Doe',
          avatar: 'avatar.jpg',
          color: '#FF5733',
        },
      },
    } as any);

    render(<PinnedThread thread={mockThread as any} onFocus={mockOnFocus} />);
    
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('starts minimized for old threads', () => {
    mockUseUser.mockReturnValue({
      user: {
        info: {
          name: 'John Doe',
        },
      },
    } as any);

    render(<PinnedThread thread={mockThread as any} onFocus={mockOnFocus} />);
    
    // Thread should be minimized, so thread component should not be visible
    expect(screen.queryByTestId('thread-component')).not.toBeInTheDocument();
  });

  it('starts expanded for new threads', () => {
    const newThread = {
      ...mockThread,
      createdAt: new Date(), // Very recent
    };

    mockUseUser.mockReturnValue({
      user: {
        info: {
          name: 'John Doe',
        },
      },
    } as any);

    render(<PinnedThread thread={newThread as any} onFocus={mockOnFocus} />);
    
    // Thread should be expanded, so thread component should be visible
    expect(screen.getByTestId('thread-component')).toBeInTheDocument();
  });

  it('toggles minimized state on click', () => {
    mockUseUser.mockReturnValue({
      user: {
        info: {
          name: 'John Doe',
        },
      },
    } as any);

    const { container } = render(<PinnedThread thread={mockThread as any} onFocus={mockOnFocus} />);
    
    // Initially minimized
    expect(screen.queryByTestId('thread-component')).not.toBeInTheDocument();
    
    // Click to expand
    const threadContainer = container.querySelector('[class*="absolute"]');
    fireEvent.click(threadContainer!);
    
    expect(screen.getByTestId('thread-component')).toBeInTheDocument();
  });

  it('calls onFocus when clicked', () => {
    mockUseUser.mockReturnValue({
      user: {
        info: {
          name: 'John Doe',
        },
      },
    } as any);

    const { container } = render(<PinnedThread thread={mockThread as any} onFocus={mockOnFocus} />);
    
    const threadContainer = container.querySelector('[class*="absolute"]');
    fireEvent.click(threadContainer!);
    
    expect(mockOnFocus).toHaveBeenCalledWith('thread-1');
  });

  it('displays user avatar with fallback', () => {
    mockUseUser.mockReturnValue({
      user: {
        info: {
          name: 'John Doe',
          avatar: null,
          color: '#FF5733',
        },
      },
    } as any);

    render(<PinnedThread thread={mockThread as any} onFocus={mockOnFocus} />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('J');
    expect(fallback).toHaveStyle({ backgroundColor: '#FF5733' });
  });

  it('handles anonymous user', () => {
    mockUseUser.mockReturnValue({
      user: {
        info: null,
      },
    } as any);

    render(<PinnedThread thread={mockThread as any} onFocus={mockOnFocus} />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('A'); // Anonymous
    expect(fallback).toHaveStyle({ backgroundColor: '#3B82F6' }); // Default color
  });

  it('handles missing user info', () => {
    mockUseUser.mockReturnValue({
      user: null,
    } as any);

    render(<PinnedThread thread={mockThread as any} onFocus={mockOnFocus} />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('A'); // Anonymous
  });

  it('does not toggle when clicking on liveblocks icons', () => {
    mockUseUser.mockReturnValue({
      user: {
        info: {
          name: 'John Doe',
        },
      },
    } as any);

    const { container } = render(<PinnedThread thread={mockThread as any} onFocus={mockOnFocus} />);
    
    // Create a mock event with liveblocks icon classes
    const mockEvent = {
      target: {
        classList: {
          contains: jest.fn((className: string) => 
            className === 'lb-icon' || className === 'lb-button-icon'
          ),
        },
      },
    };

    const threadContainer = container.querySelector('[class*="absolute"]');
    
    // Simulate click on liveblocks icon
    fireEvent.click(threadContainer!, mockEvent);
    
    // Should still call onFocus but not toggle minimized state
    expect(mockOnFocus).toHaveBeenCalledWith('thread-1');
    expect(screen.queryByTestId('thread-component')).not.toBeInTheDocument();
  });

  it('stops event propagation on keyUp', () => {
    const newThread = {
      ...mockThread,
      createdAt: new Date(), // Make it expanded
    };

    mockUseUser.mockReturnValue({
      user: {
        info: {
          name: 'John Doe',
        },
      },
    } as any);

    render(<PinnedThread thread={newThread as any} onFocus={mockOnFocus} />);
    
    const threadComponent = screen.getByTestId('thread-component');
    
    const mockStopPropagation = jest.fn();
    const keyUpEvent = new KeyboardEvent('keyup', { bubbles: true });
    keyUpEvent.stopPropagation = mockStopPropagation;
    
    fireEvent(threadComponent, keyUpEvent);
    
    expect(mockStopPropagation).toHaveBeenCalled();
  });
});