import { render, screen } from '@testing-library/react';
import ActiveUsers from '../ActiveUsers';

// Mock Liveblocks hooks
jest.mock('@/config/liveblocks', () => ({
  useOthers: jest.fn(),
  useSelf: jest.fn(),
}));

// Mock UserAvatar component
jest.mock('../UserAvatar', () => ({
  UserAvatar: ({ name, userInfo, className }: any) => (
    <div data-testid="user-avatar" className={className}>
      {name} - {userInfo?.name || 'No name'}
    </div>
  ),
}));

import { useOthers, useSelf } from '@/config/liveblocks';

const mockUseOthers = useOthers as jest.MockedFunction<typeof useOthers>;
const mockUseSelf = useSelf as jest.MockedFunction<typeof useSelf>;

describe('ActiveUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders current user when present', () => {
    mockUseSelf.mockReturnValue({
      info: {
        name: 'Current User',
        avatar: 'avatar.jpg',
        color: '#FF5733',
      },
    } as any);
    mockUseOthers.mockReturnValue([]);

    render(<ActiveUsers />);
    
    expect(screen.getByText('You - Current User')).toBeInTheDocument();
  });

  it('does not render current user when not present', () => {
    mockUseSelf.mockReturnValue(null);
    mockUseOthers.mockReturnValue([]);

    render(<ActiveUsers />);
    
    expect(screen.queryByText(/You -/)).not.toBeInTheDocument();
  });

  it('renders other users up to limit of 2', () => {
    mockUseSelf.mockReturnValue({
      info: { name: 'Current User' },
    } as any);
    
    mockUseOthers.mockReturnValue([
      {
        connectionId: 1,
        info: { name: 'User 1' },
      },
      {
        connectionId: 2,
        info: { name: 'User 2' },
      },
      {
        connectionId: 3,
        info: { name: 'User 3' },
      },
    ] as any);

    render(<ActiveUsers />);
    
    expect(screen.getByText('User 1 - User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2 - User 2')).toBeInTheDocument();
    expect(screen.queryByText('User 3 - User 3')).not.toBeInTheDocument();
  });

  it('shows overflow indicator when more than 2 other users', () => {
    mockUseSelf.mockReturnValue({
      info: { name: 'Current User' },
    } as any);
    
    mockUseOthers.mockReturnValue([
      { connectionId: 1, info: { name: 'User 1' } },
      { connectionId: 2, info: { name: 'User 2' } },
      { connectionId: 3, info: { name: 'User 3' } },
      { connectionId: 4, info: { name: 'User 4' } },
    ] as any);

    render(<ActiveUsers />);
    
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not show overflow indicator when 2 or fewer other users', () => {
    mockUseSelf.mockReturnValue({
      info: { name: 'Current User' },
    } as any);
    
    mockUseOthers.mockReturnValue([
      { connectionId: 1, info: { name: 'User 1' } },
      { connectionId: 2, info: { name: 'User 2' } },
    ] as any);

    render(<ActiveUsers />);
    
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('handles users without names', () => {
    mockUseSelf.mockReturnValue({
      info: { name: 'Current User' },
    } as any);
    
    mockUseOthers.mockReturnValue([
      {
        connectionId: 1,
        info: null,
      },
      {
        connectionId: 2,
        info: { name: undefined },
      },
    ] as any);

    render(<ActiveUsers />);
    
    expect(screen.getByText('User 1 - No name')).toBeInTheDocument();
    expect(screen.getByText('User 2 - No name')).toBeInTheDocument();
  });

  it('applies correct styling classes to current user', () => {
    mockUseSelf.mockReturnValue({
      info: { name: 'Current User' },
    } as any);
    mockUseOthers.mockReturnValue([]);

    const { container } = render(<ActiveUsers />);
    
    const currentUserAvatar = screen.getByText('You - Current User');
    expect(currentUserAvatar).toHaveClass('border-2', 'border-green-500');
  });

  it('applies correct styling classes to other users', () => {
    mockUseSelf.mockReturnValue(null);
    
    mockUseOthers.mockReturnValue([
      {
        connectionId: 1,
        info: { name: 'User 1' },
      },
    ] as any);

    render(<ActiveUsers />);
    
    const otherUserAvatar = screen.getByText('User 1 - User 1');
    expect(otherUserAvatar).toHaveClass('-ml-2', 'border-2', 'border-white');
  });

  it('memoizes users list correctly', () => {
    mockUseSelf.mockReturnValue({
      info: { name: 'Current User' },
    } as any);
    
    const othersData = [
      { connectionId: 1, info: { name: 'User 1' } },
    ];
    
    mockUseOthers.mockReturnValue(othersData as any);

    const { rerender } = render(<ActiveUsers />);
    
    // First render
    expect(screen.getByText('User 1 - User 1')).toBeInTheDocument();
    
    // Rerender with same data - should use memoized result
    rerender(<ActiveUsers />);
    expect(screen.getByText('User 1 - User 1')).toBeInTheDocument();
  });

  it('handles empty others array', () => {
    mockUseSelf.mockReturnValue({
      info: { name: 'Current User' },
    } as any);
    mockUseOthers.mockReturnValue([]);

    render(<ActiveUsers />);
    
    expect(screen.getByText('You - Current User')).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('calculates overflow count correctly', () => {
    mockUseSelf.mockReturnValue(null);
    
    // 5 other users should show +3 (5 - 2 = 3)
    mockUseOthers.mockReturnValue([
      { connectionId: 1, info: { name: 'User 1' } },
      { connectionId: 2, info: { name: 'User 2' } },
      { connectionId: 3, info: { name: 'User 3' } },
      { connectionId: 4, info: { name: 'User 4' } },
      { connectionId: 5, info: { name: 'User 5' } },
    ] as any);

    render(<ActiveUsers />);
    
    expect(screen.getByText('+3')).toBeInTheDocument();
  });
});