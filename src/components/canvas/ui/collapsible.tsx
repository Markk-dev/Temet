"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

// Wrap Radix primitives in function components so typeof === 'function' in tests
export const Collapsible = (
  props: React.ComponentProps<typeof CollapsiblePrimitive.Root>
) => {
  const { defaultOpen, open, ...rest } = props as any;
  const effectiveDefaultOpen = open !== undefined || defaultOpen !== undefined ? defaultOpen : true;
  return <CollapsiblePrimitive.Root defaultOpen={effectiveDefaultOpen} open={open} {...rest} />
}

export const CollapsibleTrigger = (
  props: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>
) => <CollapsiblePrimitive.CollapsibleTrigger {...props} />

export const CollapsibleContent = (
  props: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>
) => <CollapsiblePrimitive.CollapsibleContent {...props} />

export { }