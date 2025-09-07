import { render, screen, fireEvent } from '@testing-library/react';
import ReactionSelector, { ReactionButton } from '../ReactionSelector';

describe('ReactionSelector', () => {
  const mockSetReaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all reaction buttons', () => {
    render(<ReactionSelector setReaction={mockSetReaction} />);
    
    expect(screen.getByLabelText('React with 👍')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 🔥')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 😍')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 👀')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 😱')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 🙁')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<ReactionSelector setReaction={mockSetReaction} />);
    
    const selectorElement = container.firstChild as HTMLElement;
    expect(selectorElement).toHaveClass(
      'absolute',
      'bottom-20',
      'left-0',
      'right-0',
      'mx-auto',
      'w-fit',
      'z-50',
      'transform',
      'rounded-full',
      'bg-white',
      'px-2',
      'py-1',
      'shadow-lg',
      'border',
      'border-gray-200'
    );
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-selector-class';
    const { container } = render(
      <ReactionSelector setReaction={mockSetReaction} className={customClass} />
    );
    
    const selectorElement = container.firstChild as HTMLElement;
    expect(selectorElement).toHaveClass(customClass);
  });

  it('stops pointer move propagation', () => {
    const { container } = render(<ReactionSelector setReaction={mockSetReaction} />);
    
    const selectorElement = container.firstChild as HTMLElement;
    const mockStopPropagation = jest.fn();
    
    const pointerMoveEvent = new PointerEvent('pointermove', { bubbles: true });
    pointerMoveEvent.stopPropagation = mockStopPropagation;
    
    fireEvent(selectorElement, pointerMoveEvent);
    
    expect(mockStopPropagation).toHaveBeenCalled();
  });

  it('calls setReaction when reaction button is clicked', () => {
    render(<ReactionSelector setReaction={mockSetReaction} />);
    
    const thumbsUpButton = screen.getByLabelText('React with 👍');
    fireEvent.pointerDown(thumbsUpButton);
    
    expect(mockSetReaction).toHaveBeenCalledWith('👍');
  });

  it('calls setReaction for different reactions', () => {
    render(<ReactionSelector setReaction={mockSetReaction} />);
    
    const reactions = ['👍', '🔥', '😍', '👀', '😱', '🙁'];
    
    reactions.forEach(reaction => {
      const button = screen.getByLabelText(`React with ${reaction}`);
      fireEvent.pointerDown(button);
      expect(mockSetReaction).toHaveBeenCalledWith(reaction);
    });
    
    expect(mockSetReaction).toHaveBeenCalledTimes(6);
  });
});

describe('ReactionButton', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reaction emoji', () => {
    render(<ReactionButton reaction="👍" onSelect={mockOnSelect} />);
    
    expect(screen.getByText('👍')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<ReactionButton reaction="👍" onSelect={mockOnSelect} />);
    
    const button = screen.getByLabelText('React with 👍');
    expect(button).toHaveClass(
      'transform',
      'select-none',
      'p-2',
      'text-xl',
      'transition-all',
      'duration-200',
      'ease-out',
      'hover:scale-150',
      'focus:scale-150',
      'focus:outline-none',
      'rounded-full',
      'hover:bg-gray-100',
      'active:bg-gray-200'
    );
  });

  it('has correct accessibility attributes', () => {
    render(<ReactionButton reaction="👍" onSelect={mockOnSelect} />);
    
    const button = screen.getByLabelText('React with 👍');
    expect(button).toHaveAttribute('aria-label', 'React with 👍');
  });

  it('calls onSelect when pointer down event occurs', () => {
    render(<ReactionButton reaction="👍" onSelect={mockOnSelect} />);
    
    const button = screen.getByLabelText('React with 👍');
    fireEvent.pointerDown(button);
    
    expect(mockOnSelect).toHaveBeenCalledWith('👍');
  });

  it('calls onSelect with correct reaction for different emojis', () => {
    const reactions = ['🔥', '😍', '👀'];
    
    reactions.forEach(reaction => {
      const { unmount } = render(
        <ReactionButton reaction={reaction} onSelect={mockOnSelect} />
      );
      
      const button = screen.getByLabelText(`React with ${reaction}`);
      fireEvent.pointerDown(button);
      
      expect(mockOnSelect).toHaveBeenCalledWith(reaction);
      
      unmount();
      mockOnSelect.mockClear();
    });
  });

  it('handles keyboard interactions', () => {
    render(<ReactionButton reaction="👍" onSelect={mockOnSelect} />);
    
    const button = screen.getByLabelText('React with 👍');
    
    // Test focus
    button.focus();
    expect(button).toHaveFocus();
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    // Note: pointerDown is the trigger, not keyDown, so this shouldn't call onSelect
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('is accessible via keyboard navigation', () => {
    render(<ReactionButton reaction="👍" onSelect={mockOnSelect} />);
    
    const button = screen.getByLabelText('React with 👍');
    
    // Should be focusable
    expect(button).toHaveAttribute('tabIndex', '0');
  });
});