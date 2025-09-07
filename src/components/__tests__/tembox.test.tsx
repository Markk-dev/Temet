import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { TemBox } from '../tembox'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspaceID'
import { useTemboxModal } from '@/features/tembox/hooks/use-tembox-modal'
import { useTemboxLLMModal } from '@/features/tembox/hooks/use-tembox-llm-modal'

// Mock the hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/features/workspaces/hooks/use-workspaceID', () => ({
  useWorkspaceId: vi.fn(),
}))

vi.mock('@/features/tembox/hooks/use-tembox-modal', () => ({
  useTemboxModal: vi.fn(),
}))

vi.mock('@/features/tembox/hooks/use-tembox-llm-modal', () => ({
  useTemboxLLMModal: vi.fn(),
}))

describe('TemBox', () => {
  const mockPush = vi.fn()
  const mockOpen = vi.fn()
  const mockOpenLLM = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ push: mockPush })
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace')
    ;(useWorkspaceId as any).mockReturnValue('test-workspace-id')
    ;(useTemboxModal as any).mockReturnValue({ open: mockOpen })
    ;(useTemboxLLMModal as any).mockReturnValue({ open: mockOpenLLM })
  })

  it('renders all buttons correctly', () => {
    render(<TemBox />)
    
    expect(screen.getByText('Storage')).toBeInTheDocument()
    expect(screen.getByText('Canvas')).toBeInTheDocument()
    expect(screen.getByText('Chat with Temet')).toBeInTheDocument()
  })

  it('navigates to canvas when Canvas button is clicked', () => {
    render(<TemBox />)
    
    const canvasButton = screen.getByText('Canvas')
    fireEvent.click(canvasButton)
    
    expect(mockPush).toHaveBeenCalledWith('/workspaces/test-workspace-id/canvas')
  })

  it('does not navigate when workspaceId is not available', () => {
    ;(useWorkspaceId as any).mockReturnValue(null)
    
    render(<TemBox />)
    
    const canvasButton = screen.getByText('Canvas')
    fireEvent.click(canvasButton)
    
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('opens storage modal when Storage button is clicked', () => {
    render(<TemBox />)
    
    const storageButton = screen.getByText('Storage')
    fireEvent.click(storageButton)
    
    expect(mockOpen).toHaveBeenCalled()
  })

  it('opens LLM modal when Chat with Temet button is clicked', () => {
    render(<TemBox />)
    
    const chatButton = screen.getByText('Chat with Temet')
    fireEvent.click(chatButton)
    
    expect(mockOpenLLM).toHaveBeenCalled()
  })

  it('applies active state styling when on canvas route', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace/canvas')
    
    render(<TemBox />)
    
    const canvasButton = screen.getByText('Canvas')
    expect(canvasButton).toHaveClass('from-blue-700', 'to-blue-800')
  })

  it('applies active state styling when on storage route', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace/tembox')
    
    render(<TemBox />)
    
    const storageButton = screen.getByText('Storage')
    expect(storageButton).toHaveClass('from-blue-700', 'to-blue-800')
  })
})