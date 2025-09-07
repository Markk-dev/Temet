import { render } from '@testing-library/react';
import CursorSVG from '../CursorSVG';

describe('CursorSVG', () => {
  it('renders SVG with correct color', () => {
    const color = '#FF5733';
    const { container } = render(<CursorSVG color={color} />);
    
    const svg = container.querySelector('svg');
    const path = container.querySelector('path');
    
    expect(svg).toBeInTheDocument();
    expect(path).toHaveAttribute('fill', color);
  });

  it('applies default classes', () => {
    const { container } = render(<CursorSVG color="#000" />);
    const svg = container.querySelector('svg');
    
    expect(svg).toHaveClass('relative', 'drop-shadow-sm');
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-cursor-class';
    const { container } = render(<CursorSVG color="#000" className={customClass} />);
    const svg = container.querySelector('svg');
    
    expect(svg).toHaveClass(customClass);
  });

  it('has correct SVG attributes', () => {
    const { container } = render(<CursorSVG color="#000" />);
    const svg = container.querySelector('svg');
    
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '36');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 36');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke', 'white');
    expect(svg).toHaveAttribute('strokeWidth', '1');
  });

  it('has transition class on path element', () => {
    const { container } = render(<CursorSVG color="#000" />);
    const path = container.querySelector('path');
    
    expect(path).toHaveClass('transition-colors', 'duration-200');
  });

  it('renders with correct path data', () => {
    const { container } = render(<CursorSVG color="#000" />);
    const path = container.querySelector('path');
    
    expect(path).toHaveAttribute('d', 'M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z');
  });

  it('handles different color formats', () => {
    const colors = ['#FF5733', 'rgb(255, 87, 51)', 'red', 'hsl(9, 100%, 60%)'];
    
    colors.forEach(color => {
      const { container } = render(<CursorSVG color={color} />);
      const path = container.querySelector('path');
      
      expect(path).toHaveAttribute('fill', color);
    });
  });
});