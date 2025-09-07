import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { Navigation } from '../navigation'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspaceID'

// Mock the hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('@/features/workspaces/hooks/use-workspaceID', () => ({
  useWorkspaceId: vi.fn(),
}))

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useWorkspaceId as any).mockReturnValue('test-workspace-id')
  })

  it('renders all navigation items', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace-id')
    
    render(<Navigation />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('My Tasks')).toBeInTheDocument()
    expect(screen.getByText('Canvas')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
  })

  it('applies active state to Home when on workspace root', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace-id')
    
    render(<Navigation />)
    
    const homeLink = screen.getByText('Home').closest('div')
    expect(homeLink).toHaveClass('bg-white', 'shadow-sm', 'text-primary')
  })

  it('applies active state to Canvas when on canvas route', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace-id/canvas')
    
    render(<Navigation />)
    
    const canvasLink = screen.getByText('Canvas').closest('div')
    expect(canvasLink).toHaveClass('bg-white', 'shadow-sm', 'text-primary')
  })

  it('applies active state to Canvas when on canvas sub-route', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace-id/canvas/room-123')
    
    render(<Navigation />)
    
    const canvasLink = screen.getByText('Canvas').closest('div')
    expect(canvasLink).toHaveClass('bg-white', 'shadow-sm', 'text-primary')
  })

  it('applies active state to My Tasks when on tasks route', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace-id/tasks')
    
    render(<Navigation />)
    
    const tasksLink = screen.getByText('My Tasks').closest('div')
    expect(tasksLink).toHaveClass('bg-white', 'shadow-sm', 'text-primary')
  })

  it('applies active state to Settings when on settings route', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace-id/settings')
    
    render(<Navigation />)
    
    const settingsLink = screen.getByText('Settings').closest('div')
    expect(settingsLink).toHaveClass('bg-white', 'shadow-sm', 'text-primary')
  })

  it('applies active state to Members when on members route', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace-id/members')
    
    render(<Navigation />)
    
    const membersLink = screen.getByText('Members').closest('div')
    expect(membersLink).toHaveClass('bg-white', 'shadow-sm', 'text-primary')
  })

  it('generates correct href for canvas link', () => {
    ;(usePathname as any).mockReturnValue('/workspaces/test-workspace-id')
    
    render(<Navigation />)
    
    const canvasLink = screen.getByText('Canvas').closest('a')
    expect(canvasLink).toHaveAttribute('href', '/workspaces/test-workspace-id/canvas')
  })
})