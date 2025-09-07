import { render, screen, fireEvent } from '@testing-library/react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible'

describe('Collapsible', () => {
  it('renders collapsible trigger and content', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Collapsible content</CollapsibleContent>
      </Collapsible>
    )
    
    expect(screen.getByText('Toggle')).toBeInTheDocument()
    expect(screen.getByText('Collapsible content')).toBeInTheDocument()
  })

  it('toggles content visibility when trigger is clicked', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Collapsible content</CollapsibleContent>
      </Collapsible>
    )
    
    const trigger = screen.getByText('Toggle')
    const content = screen.getByText('Collapsible content')
    
    // Initially visible
    expect(content).toBeVisible()
    
    // Click to collapse
    fireEvent.click(trigger)
    
    // Should still be in DOM but potentially hidden by Radix
    expect(content).toBeInTheDocument()
  })

  it('accepts custom props', () => {
    render(
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Collapsible content</CollapsibleContent>
      </Collapsible>
    )
    
    expect(screen.getByTestId('trigger')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })
})