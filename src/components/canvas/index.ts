/**
 * Canvas Component Library
 * 
 * This index file provides organized exports for all canvas-related components,
 * utilities, types, and constants. Components are grouped by category for
 * better organization and easier imports.
 */

// Core Components
// Essential canvas functionality including providers, live collaboration, and loading states
export * from './core';

// Toolbar Components  
// Navigation bar and shape selection menus
export * from './toolbar';

// Sidebar Components
// Left sidebar (tools) and right sidebar (properties)
export * from './sidebar';

// Collaboration Components
// Real-time collaboration features including cursors, comments, users, and reactions
export * from './collaboration';
// Explicit re-exports to ensure availability in test environment
export { default as CommentsOverlay } from './collaboration/comments/CommentsOverlay';
export { default as NewThread } from './collaboration/comments/NewThread';
export { default as NewThreadCursor } from './collaboration/comments/NewThreadCursor';
export { default as PinnedComposer } from './collaboration/comments/PinnedComposer';
export { default as PinnedThread } from './collaboration/comments/PinnedThread';

// Settings Components
// Canvas object property controls (color, dimensions, text, export)
export * from './settings';

// UI Components
// Canvas-specific UI components (tooltips, collapsibles)
export * from './ui';

// Hooks
// Custom React hooks for canvas functionality
export * from './hooks';
export { default as useInterval } from './hooks/useInterval';
export { useMaxZIndex } from './hooks/useMaxZIndex';

// Utilities
// Helper functions and shape manipulation utilities
export * from './utils';

// Constants
// Canvas configuration constants and default values
export * from './constants';

// Types
// TypeScript type definitions for canvas components and data structures
export * from './types';