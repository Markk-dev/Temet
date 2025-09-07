import { vi } from 'vitest';

// Mock Liveblocks before importing canvas components
vi.mock('@liveblocks/client', () => ({
  createClient: vi.fn(() => ({})),
  LiveMap: vi.fn(),
  LiveObject: vi.fn(),
}));

vi.mock('@liveblocks/react', () => ({
  createRoomContext: vi.fn(() => ({
    suspense: {
      RoomProvider: vi.fn(),
      useRoom: vi.fn(),
      useMyPresence: vi.fn(),
      useUpdateMyPresence: vi.fn(),
      useSelf: vi.fn(),
      useOthers: vi.fn(),
      useOthersMapped: vi.fn(),
      useOthersConnectionIds: vi.fn(),
      useOther: vi.fn(),
      useBroadcastEvent: vi.fn(),
      useEventListener: vi.fn(),
      useErrorListener: vi.fn(),
      useStorage: vi.fn(),
      useBatch: vi.fn(),
      useHistory: vi.fn(),
      useUndo: vi.fn(),
      useRedo: vi.fn(),
      useCanUndo: vi.fn(),
      useCanRedo: vi.fn(),
      useMutation: vi.fn(),
      useStatus: vi.fn(),
      useLostConnectionListener: vi.fn(),
      useThreads: vi.fn(),
      useUser: vi.fn(),
      useCreateThread: vi.fn(),
      useEditThreadMetadata: vi.fn(),
      useCreateComment: vi.fn(),
      useEditComment: vi.fn(),
      useDeleteComment: vi.fn(),
      useAddReaction: vi.fn(),
      useRemoveReaction: vi.fn(),
    },
  })),
}));

// Mock @liveblocks/react-comments
vi.mock('@liveblocks/react-comments', () => ({
  Thread: vi.fn(() => null),
  Comment: vi.fn(() => null),
  Composer: vi.fn(() => null),
}));

// Mock fabric.js
vi.mock('fabric', () => ({
  fabric: {
    Canvas: vi.fn(),
    Object: vi.fn(),
    Path: vi.fn(),
    Rect: vi.fn(),
    Circle: vi.fn(),
    Triangle: vi.fn(),
    Line: vi.fn(),
    IText: vi.fn(),
  },
}));

// Mock Next.js components
vi.mock('next/image', () => ({
  default: vi.fn(() => null),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

import { describe, it, expect } from 'vitest';
import * as CanvasComponents from '../index';

describe('Canvas Component Exports', () => {
  describe('Core Components', () => {
    it('exports all core components', () => {
      expect(CanvasComponents.CanvasProvider).toBeDefined();
      expect(CanvasComponents.Live).toBeDefined();
      expect(CanvasComponents.Loader).toBeDefined();
    });

    it('core components are functions/classes', () => {
      expect(typeof CanvasComponents.CanvasProvider).toBe('function');
      expect(typeof CanvasComponents.Live).toBe('function');
      expect(typeof CanvasComponents.Loader).toBe('function');
    });
  });

  describe('Toolbar Components', () => {  
    it('exports all toolbar components', () => {
      expect(CanvasComponents.Navbar).toBeDefined();
      expect(CanvasComponents.ShapesMenu).toBeDefined();
    });

    it('toolbar components are functions', () => {
      expect(typeof CanvasComponents.Navbar).toBe('function');
      expect(typeof CanvasComponents.ShapesMenu).toBe('function');
    });
  });

  describe('Sidebar Components', () => {
    it('exports all sidebar components', () => {
      expect(CanvasComponents.LeftSidebar).toBeDefined();
      expect(CanvasComponents.RightSidebar).toBeDefined();
    });

    it('sidebar components are functions', () => {
      expect(typeof CanvasComponents.LeftSidebar).toBe('function');
      expect(typeof CanvasComponents.RightSidebar).toBe('function');
    });
  });

  describe('Collaboration Components', () => {
    it('exports all cursor components', () => {
      expect(CanvasComponents.Cursor).toBeDefined();
      expect(CanvasComponents.CursorChat).toBeDefined();
      expect(CanvasComponents.CursorSVG).toBeDefined();
      expect(CanvasComponents.LiveCursors).toBeDefined();
    });

    it('exports all comment components', () => {
      expect(CanvasComponents.Comments).toBeDefined();
      expect(CanvasComponents.CommentsOverlay).toBeDefined();
      expect(CanvasComponents.NewThread).toBeDefined();
      expect(CanvasComponents.NewThreadCursor).toBeDefined();
      expect(CanvasComponents.PinnedComposer).toBeDefined();
      expect(CanvasComponents.PinnedThread).toBeDefined();
    });

    it('exports all user components', () => {
      expect(CanvasComponents.ActiveUsers).toBeDefined();
      expect(CanvasComponents.UserAvatar).toBeDefined();
    });

    it('exports all reaction components', () => {
      expect(CanvasComponents.FlyingReaction).toBeDefined();
      expect(CanvasComponents.Reactions).toBeDefined();
      expect(CanvasComponents.ReactionSelector).toBeDefined();
    });

    it('collaboration components are functions', () => {
      expect(typeof CanvasComponents.Cursor).toBe('function');
      expect(typeof CanvasComponents.CursorChat).toBe('function');
      expect(typeof CanvasComponents.LiveCursors).toBe('function');
      expect(typeof CanvasComponents.ActiveUsers).toBe('function');
      expect(typeof CanvasComponents.UserAvatar).toBe('function');
    });
  });

  describe('Settings Components', () => {
    it('exports all settings components', () => {
      expect(CanvasComponents.Color).toBeDefined();
      expect(CanvasComponents.Dimensions).toBeDefined();
      expect(CanvasComponents.Export).toBeDefined();
      expect(CanvasComponents.Text).toBeDefined();
    });

    it('settings components are functions', () => {
      expect(typeof CanvasComponents.Color).toBe('function');
      expect(typeof CanvasComponents.Dimensions).toBe('function');
      expect(typeof CanvasComponents.Export).toBe('function');
      expect(typeof CanvasComponents.Text).toBe('function');
    });
  });

  describe('UI Components', () => {
    it('exports all UI components', () => {
      expect(CanvasComponents.Tooltip).toBeDefined();
      expect(CanvasComponents.TooltipContent).toBeDefined();
      expect(CanvasComponents.TooltipProvider).toBeDefined();
      expect(CanvasComponents.TooltipTrigger).toBeDefined();
      expect(CanvasComponents.Collapsible).toBeDefined();
      expect(CanvasComponents.CollapsibleContent).toBeDefined();
      expect(CanvasComponents.CollapsibleTrigger).toBeDefined();
    });

    it('UI components are functions', () => {
      expect(typeof CanvasComponents.Tooltip).toBe('function');
      expect(typeof CanvasComponents.TooltipContent).toBe('function');
      expect(typeof CanvasComponents.TooltipProvider).toBe('function');
      expect(typeof CanvasComponents.TooltipTrigger).toBe('function');
      expect(typeof CanvasComponents.Collapsible).toBe('function');
      expect(typeof CanvasComponents.CollapsibleContent).toBe('function');
      expect(typeof CanvasComponents.CollapsibleTrigger).toBe('function');
    });
  });

  describe('Hooks', () => {
    it('exports all hooks', () => {
      expect(CanvasComponents.useInterval).toBeDefined();
      expect(CanvasComponents.useMaxZIndex).toBeDefined();
    });

    it('hooks are functions', () => {
      expect(typeof CanvasComponents.useInterval).toBe('function');
      expect(typeof CanvasComponents.useMaxZIndex).toBe('function');
    });
  });

  describe('Utilities', () => {
    it('exports available utility functions', () => {
      // Only test for utilities that actually exist
      expect(CanvasComponents.modifyShape).toBeDefined();
      expect(CanvasComponents.bringElement).toBeDefined();
    });

    it('utility functions are functions', () => {
      expect(typeof CanvasComponents.modifyShape).toBe('function');
      expect(typeof CanvasComponents.bringElement).toBe('function');
    });
  });

  describe('Constants', () => {
    it('exports all canvas constants', () => {
      expect(CanvasComponents.COLORS).toBeDefined();
      expect(CanvasComponents.shapeElements).toBeDefined();
      expect(CanvasComponents.navElements).toBeDefined();
      expect(CanvasComponents.defaultNavElement).toBeDefined();
      expect(CanvasComponents.directionOptions).toBeDefined();
      expect(CanvasComponents.fontFamilyOptions).toBeDefined();
      expect(CanvasComponents.fontSizeOptions).toBeDefined();
      expect(CanvasComponents.fontWeightOptions).toBeDefined();
      expect(CanvasComponents.alignmentOptions).toBeDefined();
      expect(CanvasComponents.shortcuts).toBeDefined();
    });

    it('constants have correct types', () => {
      expect(Array.isArray(CanvasComponents.COLORS)).toBe(true);
      expect(Array.isArray(CanvasComponents.shapeElements)).toBe(true);
      expect(Array.isArray(CanvasComponents.navElements)).toBe(true);
      expect(typeof CanvasComponents.defaultNavElement).toBe('object');
      expect(Array.isArray(CanvasComponents.directionOptions)).toBe(true);
      expect(Array.isArray(CanvasComponents.fontFamilyOptions)).toBe(true);
      expect(Array.isArray(CanvasComponents.fontSizeOptions)).toBe(true);
      expect(Array.isArray(CanvasComponents.fontWeightOptions)).toBe(true);
      expect(Array.isArray(CanvasComponents.alignmentOptions)).toBe(true);
      expect(Array.isArray(CanvasComponents.shortcuts)).toBe(true);
    });
  });

  describe('Types', () => {
    it('exports type enums', () => {
      expect(CanvasComponents.CursorMode).toBeDefined();
      expect(typeof CanvasComponents.CursorMode).toBe('object');
    });

    it('CursorMode enum has correct values', () => {
      expect(CanvasComponents.CursorMode.Hidden).toBe(0);
      expect(CanvasComponents.CursorMode.Chat).toBe(1);
      expect(CanvasComponents.CursorMode.ReactionSelector).toBe(2);
      expect(CanvasComponents.CursorMode.Reaction).toBe(3);
    });
  });

  describe('Import Organization', () => {
    it('provides organized access to all canvas functionality', () => {
      // Verify that the main index provides comprehensive access
      const exportedKeys = Object.keys(CanvasComponents);

      // Should have components from all categories
      expect(exportedKeys.length).toBeGreaterThan(30);

      // Should include components from each category
      const hasCore = exportedKeys.some(key => ['CanvasProvider', 'Live', 'Loader'].includes(key));
      const hasToolbar = exportedKeys.some(key => ['Navbar', 'ShapesMenu'].includes(key));
      const hasSidebar = exportedKeys.some(key => ['LeftSidebar', 'RightSidebar'].includes(key));
      const hasCollaboration = exportedKeys.some(key => ['Cursor', 'Comments', 'ActiveUsers'].includes(key));
      const hasSettings = exportedKeys.some(key => ['Color', 'Dimensions', 'Export', 'Text'].includes(key));
      const hasUI = exportedKeys.some(key => ['Tooltip', 'Collapsible'].includes(key));
      const hasHooks = exportedKeys.some(key => ['useInterval', 'useMaxZIndex'].includes(key));
      const hasConstants = exportedKeys.some(key => ['COLORS', 'shapeElements'].includes(key));
      const hasTypes = exportedKeys.some(key => ['CursorMode'].includes(key));

      expect(hasCore).toBe(true);
      expect(hasToolbar).toBe(true);
      expect(hasSidebar).toBe(true);
      expect(hasCollaboration).toBe(true);
      expect(hasSettings).toBe(true);
      expect(hasUI).toBe(true);
      expect(hasHooks).toBe(true);
      expect(hasConstants).toBe(true);
      expect(hasTypes).toBe(true);
    });
  });

  describe('Import Path Consistency', () => {
    it('allows importing components using the main index', () => {
      // Test that components can be imported from the main index
      expect(() => {
        const { CanvasProvider, Navbar, LeftSidebar, Cursor, Color, Tooltip, useInterval, COLORS, CursorMode } = CanvasComponents;
        return { CanvasProvider, Navbar, LeftSidebar, Cursor, Color, Tooltip, useInterval, COLORS, CursorMode };
      }).not.toThrow();
    });
  });
});