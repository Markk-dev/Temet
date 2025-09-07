import { render } from '@testing-library/react';
import FlyingReaction from '../FlyingReaction';

// Mock CSS modules
jest.mock('../index.module.css', () => ({
  disappear: 'disappear',
  goUp0: 'goUp0',
  goUp1: 'goUp1',
  goUp2: 'goUp2',
  leftRight0: 'leftRight0',
  leftRight1: 'leftRight1',
  leftRight2: 'leftRight2',
}));

describe('FlyingReaction', () => {
  const defaultProps = {
    x: 100,
    y: 200,
    timestamp: 1234567890,
    value: '👍',
  };

  it('renders reaction at correct position', () => {
    const { container } = render(<FlyingReaction {...defaultProps} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    expect(reactionElement).toHaveStyle({
      left: '100px',
      top: '200px',
    });
  });

  it('displays the reaction value', () => {
    const { container } = render(<FlyingReaction {...defaultProps} />);
    
    expect(container.textContent).toBe('👍');
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<FlyingReaction {...defaultProps} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    expect(reactionElement).toHaveClass(
      'pointer-events-none',
      'absolute',
      'select-none',
      'z-50',
      'disappear'
    );
  });

  it('applies animation classes based on timestamp', () => {
    // Test with timestamp that gives remainder 0 when mod 3
    const props = { ...defaultProps, timestamp: 3 };
    const { container } = render(<FlyingReaction {...props} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    expect(reactionElement).toHaveClass('goUp0');
    
    const innerElement = reactionElement.firstChild as HTMLElement;
    expect(innerElement).toHaveClass('leftRight0');
  });

  it('applies different animation classes for different timestamps', () => {
    // Test with timestamp that gives remainder 1 when mod 3
    const props = { ...defaultProps, timestamp: 4 };
    const { container } = render(<FlyingReaction {...props} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    expect(reactionElement).toHaveClass('goUp1');
    
    const innerElement = reactionElement.firstChild as HTMLElement;
    expect(innerElement).toHaveClass('leftRight1');
  });

  it('applies text size based on timestamp', () => {
    // Test with timestamp that gives text-3xl (timestamp % 5 + 2 = 1 + 2 = 3)
    const props = { ...defaultProps, timestamp: 1 };
    const { container } = render(<FlyingReaction {...props} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    expect(reactionElement).toHaveClass('text-3xl');
  });

  it('applies different text sizes for different timestamps', () => {
    // Test with timestamp that gives text-6xl (timestamp % 5 + 2 = 4 + 2 = 6)
    const props = { ...defaultProps, timestamp: 4 };
    const { container } = render(<FlyingReaction {...props} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    expect(reactionElement).toHaveClass('text-6xl');
  });

  it('applies transform classes to inner element', () => {
    const { container } = render(<FlyingReaction {...defaultProps} />);
    
    const innerMostElement = container.querySelector('div > div > div') as HTMLElement;
    expect(innerMostElement).toHaveClass(
      'transform',
      '-translate-x-1/2',
      '-translate-y-1/2',
      'drop-shadow-lg',
      'filter'
    );
  });

  it('handles different reaction values', () => {
    const reactions = ['🔥', '😍', '👀', '😱', '🙁'];
    
    reactions.forEach(reaction => {
      const { container } = render(
        <FlyingReaction {...defaultProps} value={reaction} />
      );
      expect(container.textContent).toBe(reaction);
    });
  });

  it('handles edge case timestamps', () => {
    // Test with timestamp 0
    const props = { ...defaultProps, timestamp: 0 };
    const { container } = render(<FlyingReaction {...props} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    expect(reactionElement).toHaveClass('goUp0', 'text-2xl');
  });

  it('handles large timestamps', () => {
    // Test with large timestamp
    const props = { ...defaultProps, timestamp: 999999999 };
    const { container } = render(<FlyingReaction {...props} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    // Should still work with modulo operations
    expect(reactionElement).toHaveClass('disappear');
  });

  it('positions correctly with negative coordinates', () => {
    const props = { ...defaultProps, x: -50, y: -100 };
    const { container } = render(<FlyingReaction {...props} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    expect(reactionElement).toHaveStyle({
      left: '-50px',
      top: '-100px',
    });
  });

  it('positions correctly with zero coordinates', () => {
    const props = { ...defaultProps, x: 0, y: 0 };
    const { container } = render(<FlyingReaction {...props} />);
    
    const reactionElement = container.firstChild as HTMLElement;
    expect(reactionElement).toHaveStyle({
      left: '0px',
      top: '0px',
    });
  });
});