# Design Document

## Overview

The Figma Canvas Integration will merge the existing standalone Figma clone into the main Temet project, creating a unified design and collaboration platform. The integration involves migrating components, consolidating dependencies, implementing proper routing, and ensuring seamless user experience within the existing Temet architecture.

Key findings from research:
- Figma clone uses Liveblocks for real-time collaboration with specific dependencies (@liveblocks/client, @liveblocks/react, @liveblocks/react-comments)
- Canvas functionality uses Fabric.js for drawing operations
- Current Canvas button in TemBox component is non-functional (no onClick handler)
- Temet uses Next.js 15 with app router, while Figma clone uses Next.js 14
- Both projects share some common dependencies (Radix UI components, Tailwind CSS)

## Architecture

### Routing Structure
The canvas functionality will be integrated into Temet's existing app router structure:

```
src/app/(dashboard)/workspaces/[workspaceId]/canvas/
├── page.tsx                 # Main canvas page
├── [roomId]/
│   └── page.tsx            # Specific canvas room
└── layout.tsx              # Canvas-specific layout
```

### Component Organization
Figma clone components will be reorganized into Temet's component structure:

```
src/components/canvas/
├── core/                   # Core canvas functionality
│   ├── Live.tsx           # Liveblocks integration
│   ├── CanvasProvider.tsx # Canvas context provider
│   └── Loader.tsx         # Loading states
├── sidebar/               # Canvas sidebars
│   ├── LeftSidebar.tsx    # Tools and shapes
│   └── RightSidebar.tsx   # Properties panel
├── toolbar/               # Top toolbar
│   ├── Navbar.tsx         # Main navigation
│   └── ShapesMenu.tsx     # Shape selection
├── collaboration/         # Real-time features
│   ├── cursor/            # Cursor components
│   ├── comments/          # Comment system
│   ├── users/             # User presence
│   └── reaction/          # Reaction system
├── settings/              # Canvas settings
│   ├── Color.tsx          # Color picker
│   ├── Dimensions.tsx     # Size controls
│   ├── Export.tsx         # Export functionality
│   └── Text.tsx           # Text formatting
└── ui/                    # Canvas-specific UI components
```

### Configuration Integration
Liveblocks configuration will be moved to Temet's config structure:

```
src/config/
├── liveblocks.ts          # Liveblocks client configuration
└── canvas.ts              # Canvas-specific settings
```

## Components and Interfaces

### Canvas Provider Component
A new provider component will wrap canvas functionality and integrate with Temet's existing providers:

```typescript
interface CanvasProviderProps {
  workspaceId: string;
  roomId?: string;
  children: React.ReactNode;
}

interface CanvasContextType {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  isReady: boolean;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
}
```

### Navigation Integration
The TemBox component will be updated to handle Canvas navigation:

```typescript
interface CanvasNavigationProps {
  workspaceId: string;
  onNavigateToCanvas: () => void;
}
```

### Room Management
Canvas rooms will integrate with Temet's workspace structure:

```typescript
interface CanvasRoom {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  collaborators: string[];
}
```

## Data Models

### Canvas Storage Schema
Liveblocks storage will be structured to work with Temet's data patterns:

```typescript
type CanvasStorage = {
  canvasObjects: LiveMap<string, CanvasObject>;
  canvasSettings: LiveObject<CanvasSettings>;
};

interface CanvasObject {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'text' | 'freeform';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  // Additional properties based on object type
}

interface CanvasSettings {
  backgroundColor: string;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoom: number;
}
```

### User Presence
Real-time collaboration will integrate with Temet's user system:

```typescript
type CanvasPresence = {
  cursor: { x: number; y: number } | null;
  selection: string[] | null;
  pencilDraft: [x: number, y: number, pressure: number][] | null;
  penColor: string | null;
};

type CanvasUserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
    color: string;
  };
};
```

## Error Handling

### Canvas Loading States
- **Loading**: Display skeleton loader while canvas initializes
- **Error**: Show error boundary with retry functionality
- **Network Issues**: Handle Liveblocks connection failures gracefully
- **Permission Errors**: Integrate with Temet's workspace permissions

### Fabric.js Error Handling
- Canvas initialization failures
- Object manipulation errors
- Export/import errors
- Memory management for large canvases

### Liveblocks Integration Errors
- Connection timeout handling
- Authentication failures
- Room access denied
- Sync conflict resolution

## Testing Strategy

### Unit Tests
- Canvas component rendering
- Fabric.js object manipulation
- Liveblocks integration functions
- Navigation and routing logic
- Data transformation utilities

### Integration Tests
- Canvas within Temet workspace flow
- Real-time collaboration features
- Export/import functionality
- Permission system integration
- Theme and styling consistency

### E2E Tests
- Complete canvas workflow from sidebar navigation
- Multi-user collaboration scenarios
- Canvas persistence across sessions
- Integration with other Temet features

### Performance Tests
- Canvas rendering with many objects
- Real-time sync performance
- Memory usage optimization
- Bundle size impact analysis

## Migration Strategy

### Phase 1: Dependency Integration
1. Merge package.json dependencies
2. Resolve version conflicts (Next.js 14 → 15)
3. Update Liveblocks configuration
4. Set up canvas-specific environment variables

### Phase 2: Component Migration
1. Move components to new structure
2. Update import paths
3. Integrate with Temet's design system
4. Resolve styling conflicts

### Phase 3: Routing Implementation
1. Create canvas routes in app directory
2. Update TemBox navigation
3. Implement workspace-aware routing
4. Add proper error boundaries

### Phase 4: Feature Integration
1. Connect with Temet's authentication
2. Integrate workspace permissions
3. Add canvas rooms to workspace management
4. Implement data persistence strategy

### Phase 5: Testing and Optimization
1. Comprehensive testing suite
2. Performance optimization
3. Bundle size optimization
4. Documentation updates