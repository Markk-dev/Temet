import { render, screen, fireEvent } from '@testing-library/react';
import CursorChat from '../CursorChat';
import { CursorMode } from '../../types/canvas';

describe('CursorChat', () => {
  const mockSetCursorState = jest.fn();
  const mockUpdateMyPresence = jest.fn();

  const defaultProps = {
    cursor: { x: 100, y: 200 },
    cursorState: {
      mode: CursorMode.Chat,
      message: '',
      previousMessage: null,
    },
    setCursorState: mockSetCursorState,
    updateMyPresence: mockUpdateMyPresence,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat input when in chat mode', () => {
    render(<CursorChat {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Say something…')).toBeInTheDocument();
  });

  it('does not render when not in chat mode', () => {
    const props = {
      ...defaultProps,
      cursorState: {
        mode: CursorMode.Hidden,
      },
    };
    
    render(<CursorChat {...props} />);
    
    expect(screen.queryByPlaceholderText('Say something…')).not.toBeInTheDocument();
  });

  it('positions cursor correctly', () => {
    const { container } = render(<CursorChat {...defaultProps} />);
    const cursorElement = container.firstChild as HTMLElement;
    
    expect(cursorElement).toHaveStyle({
      transform: 'translateX(100px) translateY(200px)',
    });
  });

  it('updates message on input change', () => {
    render(<CursorChat {...defaultProps} />);
    const input = screen.getByPlaceholderText('Say something…');
    
    fireEvent.change(input, { target: { value: 'Hello world' } });
    
    expect(mockUpdateMyPresence).toHaveBeenCalledWith({ message: 'Hello world' });
    expect(mockSetCursorState).toHaveBeenCalledWith({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: 'Hello world',
    });
  });

  it('handles Enter key to send message', () => {
    const props = {
      ...defaultProps,
      cursorState: {
        mode: CursorMode.Chat,
        message: 'Test message',
        previousMessage: null,
      },
    };
    
    render(<CursorChat {...props} />);
    const input = screen.getByDisplayValue('Test message');
    
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockSetCursorState).toHaveBeenCalledWith({
      mode: CursorMode.Chat,
      previousMessage: 'Test message',
      message: '',
    });
  });

  it('handles Escape key to hide cursor', () => {
    render(<CursorChat {...defaultProps} />);
    const input = screen.getByPlaceholderText('Say something…');
    
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(mockSetCursorState).toHaveBeenCalledWith({
      mode: CursorMode.Hidden,
    });
  });

  it('displays previous message when available', () => {
    const props = {
      ...defaultProps,
      cursorState: {
        mode: CursorMode.Chat,
        message: 'Current message',
        previousMessage: 'Previous message',
      },
    };
    
    render(<CursorChat {...props} />);
    
    expect(screen.getByText('Previous message')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Current message')).toBeInTheDocument();
  });

  it('stops event propagation on keyUp', () => {
    render(<CursorChat {...defaultProps} />);
    const chatContainer = screen.getByPlaceholderText('Say something…').parentElement;
    
    const mockStopPropagation = jest.fn();
    const keyUpEvent = new KeyboardEvent('keyup', { bubbles: true });
    keyUpEvent.stopPropagation = mockStopPropagation;
    
    fireEvent(chatContainer!, keyUpEvent);
    
    expect(mockStopPropagation).toHaveBeenCalled();
  });

  it('limits input to 50 characters', () => {
    render(<CursorChat {...defaultProps} />);
    const input = screen.getByPlaceholderText('Say something…');
    
    expect(input).toHaveAttribute('maxLength', '50');
  });

  it('applies correct z-index for layering', () => {
    const { container } = render(<CursorChat {...defaultProps} />);
    const cursorElement = container.firstChild as HTMLElement;
    
    expect(cursorElement).toHaveClass('z-50');
  });
});