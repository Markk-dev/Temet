import { render, screen } from '@testing-library/react';
import { UserAvatar } from '../UserAvatar';

// Mock UI components
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => <div className={className} data-testid="avatar">{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="avatar-image" />,
  AvatarFallback: ({ children, className, style }: any) => (
    <div className={className} style={style} data-testid="avatar-fallback">{children}</div>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children, className, sideOffset }: any) => (
    <div className={className} data-testid="tooltip-content">{children}</div>
  ),
}));

describe('UserAvatar', () => {
  const defaultProps = {
    name: 'John Doe',
  };

  it('renders avatar with user name', () => {
    render(<UserAvatar {...defaultProps} />);
    
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays user avatar image when provided', () => {
    const userInfo = {
      name: 'Jane Smith',
      avatar: 'avatar.jpg',
      color: '#FF5733',
    };

    render(<UserAvatar {...defaultProps} userInfo={userInfo} />);
    
    expect(screen.getByTestId('avatar-image')).toHaveAttribute('src', 'avatar.jpg');
    expect(screen.getByTestId('avatar-image')).toHaveAttribute('alt', 'Jane Smith');
  });

  it('displays fallback with user initial and color', () => {
    const userInfo = {
      name: 'Jane Smith',
      avatar: null,
      color: '#FF5733',
    };

    render(<UserAvatar {...defaultProps} userInfo={userInfo} />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('J');
    expect(fallback).toHaveStyle({ backgroundColor: '#FF5733' });
  });

  it('uses default color when user color not provided', () => {
    const userInfo = {
      name: 'Jane Smith',
      avatar: null,
    };

    render(<UserAvatar {...defaultProps} userInfo={userInfo} />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveStyle({ backgroundColor: '#3B82F6' });
  });

  it('uses provided name when userInfo name not available', () => {
    const userInfo = {
      avatar: 'avatar.jpg',
    };

    render(<UserAvatar {...defaultProps} userInfo={userInfo} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-image')).toHaveAttribute('alt', 'John Doe');
  });

  it('prefers userInfo name over provided name', () => {
    const userInfo = {
      name: 'Jane Smith',
      avatar: 'avatar.jpg',
    };

    render(<UserAvatar {...defaultProps} userInfo={userInfo} />);
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-image')).toHaveAttribute('alt', 'Jane Smith');
  });

  it('handles null userInfo', () => {
    render(<UserAvatar {...defaultProps} userInfo={null} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('J');
    expect(fallback).toHaveStyle({ backgroundColor: '#3B82F6' });
  });

  it('handles undefined userInfo', () => {
    render(<UserAvatar {...defaultProps} userInfo={undefined} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('J');
  });

  it('applies custom className', () => {
    const customClass = 'custom-avatar-class';
    
    const { container } = render(
      <UserAvatar {...defaultProps} className={customClass} />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('displays online indicator', () => {
    const { container } = render(<UserAvatar {...defaultProps} />);
    
    const onlineIndicator = container.querySelector('[class*="bg-green-500"]');
    expect(onlineIndicator).toBeInTheDocument();
  });

  it('renders tooltip with correct content', () => {
    const userInfo = {
      name: 'Jane Smith',
    };

    render(<UserAvatar {...defaultProps} userInfo={userInfo} />);
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Jane Smith');
  });

  it('handles empty name gracefully', () => {
    render(<UserAvatar name="" />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent(''); // Empty string first character is empty
  });

  it('handles special characters in name', () => {
    render(<UserAvatar name="@john-doe_123" />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('@'); // First character
  });

  it('converts first character to uppercase', () => {
    render(<UserAvatar name="jane" />);
    
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('J');
  });

  it('applies correct styling classes', () => {
    const { container } = render(<UserAvatar {...defaultProps} />);
    
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('h-9', 'w-9', 'cursor-pointer');
    
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveClass('border-none', 'px-2.5', 'py-1.5');
  });
});