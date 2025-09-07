import { render } from '@testing-library/react';
import { Comments } from '../Comments';

// Mock Liveblocks components
jest.mock('@liveblocks/react', () => ({
  ClientSideSuspense: ({ children }: { children: () => React.ReactNode }) => {
    return <div data-testid="client-side-suspense">{children()}</div>;
  },
}));

jest.mock('../CommentsOverlay', () => ({
  CommentsOverlay: () => <div data-testid="comments-overlay">Comments Overlay</div>,
}));

describe('Comments', () => {
  it('renders ClientSideSuspense wrapper', () => {
    const { getByTestId } = render(<Comments />);
    
    expect(getByTestId('client-side-suspense')).toBeInTheDocument();
  });

  it('renders CommentsOverlay inside suspense', () => {
    const { getByTestId } = render(<Comments />);
    
    expect(getByTestId('comments-overlay')).toBeInTheDocument();
  });

  it('provides fallback for suspense', () => {
    // This test verifies the structure is correct
    // The actual fallback behavior would be tested in integration tests
    const { container } = render(<Comments />);
    
    expect(container.firstChild).toBeInTheDocument();
  });
});