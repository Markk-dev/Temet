import { render, screen } from '@testing-library/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip'

describe('Tooltip', () => {
  it('renders tooltip trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('applies custom className to tooltip content', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="custom-class">Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    const content = screen.getByText('Tooltip content')
    expect(content).toHaveClass('custom-class')
  })

  it('sets correct sideOffset', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent sideOffset={8}>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    expect(screen.getByText('Tooltip content')).toBeInTheDocument()
  })
})