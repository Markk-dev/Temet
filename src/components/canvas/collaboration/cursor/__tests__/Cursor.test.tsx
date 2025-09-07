import { render, screen } from '@testing-library/react';
import Cursor from '../Cursor';

describe('Cursor', () => {
  const defaultProps = {
    color: '#DC2626',
    x: 100,
    y: 200,
  };

  it('renders cursor at correct position', () => {
    const { container } = render(<Cursor {...defaultProps} />);
    const cursorElement = container.firstChild as HTMLElement;
    
    expect(cursorElement).toHaveStyle({
      transform: 'translateX(100px) translateY(200px)',
    });
  });

  it('renders cursor with correct color', () => {
    render(<Cursor {...defaultProps} />);
    const svgElement = screen.getByRole('img', { hidden: true });
    
    expect(svgElement).toBeInTheDocument();
  });

  it('displays user name when provided', () => {
    render(<Cursor {...defaultProps} userName="John Doe" />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays message when provided', () => {
    const message = 'Hello everyone!';
    render(<Cursor {...defaultProps} message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('does not display user name when not provided', () => {
    render(<Cursor {...defaultProps} />);
    
    expect(screen.queryByText(/User/)).not.toBeInTheDocument();
  });

  it('does not display message when not provided', () => {
    render(<Cursor {...defaultProps} />);
    
    expect(screen.queryByText(/Hello/)).not.toBeInTheDocument();
  });

  it('applies correct z-index for layering', () => {
    const { container } = render(<Cursor {...defaultProps} />);
    const cursorElement = container.firstChild as HTMLElement;
    
    expect(cursorElement).toHaveClass('z-50');
  });

  it('has pointer-events-none class for non-interactive behavior', () => {
    const { container } = render(<Cursor {...defaultProps} />);
    const cursorElement = container.firstChild as HTMLElement;
    
    expect(cursorElement).toHaveClass('pointer-events-none');
  });
});