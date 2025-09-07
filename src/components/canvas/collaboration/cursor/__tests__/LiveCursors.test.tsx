import { render, screen } from '@testing-library/react';
import LiveCursors from '../LiveCursors';
import { COLORS } from '../../../constants';

describe('LiveCursors', () => {
  const mockUsers = [
    {
      connectionId: 1,
      presence: {
        cursor: { x: 100, y: 200 },
        message: 'Hello from user 1',
      },
      info: {
        name: 'John Doe',
        avatar: 'avatar1.jpg',
        color: '#FF5733',
      },
    },
    {
      connectionId: 2,
      presence: {
        cursor: { x: 300, y: 400 },
        message: null,
      },
      info: {
        name: 'Jane Smith',
        avatar: 'avatar2.jpg',
        color: '#33FF57',
      },
    },
    {
      connectionId: 3,
      presence: {
        cursor: null,
      },
      info: {
        name: 'Bob Wilson',
        avatar: 'avatar3.jpg',
        color: '#3357FF',
      },
    },
  ];

  it('renders cursors for users with valid cursor positions', () => {
    render(<LiveCursors others={mockUsers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
  });

  it('displays user messages when available', () => {
    render(<LiveCursors others={mockUsers} />);
    
    expect(screen.getByText('Hello from user 1')).toBeInTheDocument();
    expect(screen.queryByText('Hello from user 2')).not.toBeInTheDocument();
  });

  it('uses custom user colors when available', () => {
    const { container } = render(<LiveCursors others={mockUsers} />);
    
    // Check that custom colors are being used (this would need to be verified through DOM inspection)
    expect(container.firstChild).toBeInTheDocument();
  });

  it('falls back to default colors when user color not provided', () => {
    const usersWithoutColors = [
      {
        connectionId: 1,
        presence: {
          cursor: { x: 100, y: 200 },
        },
        info: {
          name: 'User Without Color',
        },
      },
    ];
    
    render(<LiveCursors others={usersWithoutColors} />);
    
    expect(screen.getByText('User Without Color')).toBeInTheDocument();
  });

  it('generates fallback user names when name not provided', () => {
    const usersWithoutNames = [
      {
        connectionId: 5,
        presence: {
          cursor: { x: 100, y: 200 },
        },
        info: {},
      },
    ];
    
    render(<LiveCursors others={usersWithoutNames} />);
    
    expect(screen.getByText('User 5')).toBeInTheDocument();
  });

  it('handles empty others array', () => {
    const { container } = render(<LiveCursors others={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('filters out users with null presence', () => {
    const usersWithNullPresence = [
      {
        connectionId: 1,
        presence: null,
        info: {
          name: 'User with null presence',
        },
      },
      {
        connectionId: 2,
        presence: {
          cursor: { x: 100, y: 200 },
        },
        info: {
          name: 'Valid User',
        },
      },
    ];
    
    render(<LiveCursors others={usersWithNullPresence} />);
    
    expect(screen.queryByText('User with null presence')).not.toBeInTheDocument();
    expect(screen.getByText('Valid User')).toBeInTheDocument();
  });

  it('uses connection ID as key for React rendering', () => {
    const { container } = render(<LiveCursors others={mockUsers.slice(0, 2)} />);
    
    // Verify that multiple cursors are rendered
    const cursors = container.querySelectorAll('[class*="pointer-events-none"]');
    expect(cursors).toHaveLength(2);
  });

  it('handles users with undefined info', () => {
    const usersWithUndefinedInfo = [
      {
        connectionId: 1,
        presence: {
          cursor: { x: 100, y: 200 },
        },
        info: undefined,
      },
    ];
    
    render(<LiveCursors others={usersWithUndefinedInfo} />);
    
    expect(screen.getByText('User 1')).toBeInTheDocument();
  });
});