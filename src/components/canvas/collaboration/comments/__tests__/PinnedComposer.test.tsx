import { render, screen } from '@testing-library/react';
import { PinnedComposer } from '../PinnedComposer';

// Mock Liveblocks hooks and components
jest.mock('@/config/liveblocks', () => ({
  useSelf: jest.fn(),
}));

jest.mock('@liveblocks/react-comments', () => ({
  Composer: ({ onComposerSubmit, autoFocus, onKeyUp }: any) => (
    <div data-testid="composer">
      <input 
        data-testid="composer-input"
        autoFocus={autoFocus}
        onKeyUp={onKeyUp}
      />
      <button onClick={() => onComposerSubmit({ body: 'test' }, new Event('submit'))}>
        Submit
      </button>
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

import { useSelf } from '@/config/liveblocks';

const mockUseSelf = useSelf as jest.MockedFunction<typeof useSelf>;

describe('PinnedComposer', () => {
  const mockOnComposerSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders composer with user avatar', () => {
    mockUseSelf.mockReturnValue({
      info: {
        name: 'John Doe',
        avatar: 'avatar.jpg',
        color: '#FF5733',
      },
    } as any);

    render(<PinnedComposer onComposerSubmit={mockOnComposerSubmit} />);
    
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('composer')).toBeInTheDocument();
  });

  it('displays user avatar image when available', () => {
    mockUseSelf.mockReturnValue({
      info: {
        name: 'John Doe',
        avatar: 'avatar.jpg',
        color: '#FF5733',
      },
    } as any);

    render(<PinnedComposer onComposerSubmit={mockOnComposerSubmit} />);
    
    expect(screen.getByTestId('avatar-image')).toHaveAttribute('src', 'avatar.jpg');
    expect(screen.getByTestId('avatar-image')).toHaveAttribute('alt', 'John Doe');
  });

  it('displays fallback avatar with user initial and color', () => {
    mockUseSelf.mockReturnValue({
      info: {
        name: 'John Doe',
        avatar: null,
        color: '#FF5733',
      },
    } as any);

    render(<PinnedComposer onComposerSubmit={mockOnComposerSubmit} />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('J');
    expect(fallback).toHaveStyle({ backgroundColor: '#FF5733' });
  });

  it('handles anonymous user with default values', () => {
    mockUseSelf.mockReturnValue({
      info: null,
    } as any);

    render(<PinnedComposer onComposerSubmit={mockOnComposerSubmit} />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('A'); // First letter of "Anonymous"
    expect(fallback).toHaveStyle({ backgroundColor: '#3B82F6' }); // Default color
  });

  it('handles user without info', () => {
    mockUseSelf.mockReturnValue(null as any);

    render(<PinnedComposer onComposerSubmit={mockOnComposerSubmit} />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('A'); // First letter of "Anonymous"
  });

  it('passes onComposerSubmit to Composer component', () => {
    mockUseSelf.mockReturnValue({
      info: {
        name: 'John Doe',
        avatar: 'avatar.jpg',
        color: '#FF5733',
      },
    } as any);

    render(<PinnedComposer onComposerSubmit={mockOnComposerSubmit} />);
    
    const submitButton = screen.getByText('Submit');
    submitButton.click();
    
    expect(mockOnComposerSubmit).toHaveBeenCalledWith(
      { body: 'test' },
      expect.any(Event)
    );
  });

  it('sets autoFocus on composer', () => {
    mockUseSelf.mockReturnValue({
      info: {
        name: 'John Doe',
      },
    } as any);

    render(<PinnedComposer onComposerSubmit={mockOnComposerSubmit} />);
    
    const input = screen.getByTestId('composer-input');
    expect(input).toHaveAttribute('autoFocus');
  });

  it('applies correct styling classes', () => {
    mockUseSelf.mockReturnValue({
      info: {
        name: 'John Doe',
      },
    } as any);

    const { container } = render(<PinnedComposer onComposerSubmit={mockOnComposerSubmit} />);
    
    // Check main container has pointer-events-auto
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('pointer-events-auto');
  });

  it('handles missing user color gracefully', () => {
    mockUseSelf.mockReturnValue({
      info: {
        name: 'John Doe',
        avatar: null,
        color: undefined,
      },
    } as any);

    render(<PinnedComposer onComposerSubmit={mockOnComposerSubmit} />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveStyle({ backgroundColor: '#3B82F6' }); // Default blue color
  });
});