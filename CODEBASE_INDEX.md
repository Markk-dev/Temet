# Temet Platform - Codebase Index & Architecture Guide

## 🚀 Project Overview

**Temet** is a modern, real-time project management and collaboration platform built with Next.js 15 and Appwrite. It's designed as a comprehensive workspace management solution with real-time collaboration features.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Backend**: Appwrite (Database, Auth, Storage), Hono (API routes)
- **Real-time**: Pusher (WebSocket integration)
- **State Management**: TanStack Query (React Query), React Hook Form
- **UI Components**: Radix UI, Tailwind CSS, Framer Motion
- **Validation**: Zod schemas
- **Drag & Drop**: @hello-pangea/dnd (Kanban board)

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (standalone)/      # Public workspace routes
│   └── api/               # API endpoints (Hono)
├── components/             # Shared UI components
├── features/               # Feature-based modules
├── lib/                    # Utilities and configurations
├── hooks/                  # Custom React hooks
└── styles/                 # Global styles
```

## 🔐 Authentication & Authorization

### Auth Flow
- **Session-based**: Uses Appwrite sessions with HTTP-only cookies
- **Middleware**: `SessionMiddleware` protects API routes
- **User Context**: `useCurrent` hook provides authenticated user data

### Key Files
- `src/features/auth/` - Authentication logic
- `src/lib/session-middleware.ts` - Session validation
- `src/lib/appwrite.ts` - Appwrite client configuration

## 🏢 Workspace Management

### Core Entities
1. **Workspaces** - Top-level containers for projects
2. **Members** - Role-based access (ADMIN/MEMBER)
3. **Projects** - Organized within workspaces
4. **Tasks** - Individual work items with status tracking

### Workspace Features
- Invite codes for team collaboration
- Role-based permissions
- Real-time member updates
- Workspace switching

## 📋 Task Management System

### Kanban Board Implementation
- **Status Columns**: BACKLOG → TODO → IN_PROGRESS → IN_REVIEW → DONE
- **Drag & Drop**: Real-time updates across browsers
- **Position Tracking**: Maintains task order within columns
- **Time Logging**: Start/stop time tracking for tasks

### Task Properties
```typescript
interface Task {
  name: string;
  status: TaskStatus;
  workspaceId: string;
  assigneeId: string[];
  projectId: string;
  position: number;
  dueDate: string;
  description?: string;
  timeLogs: string; // JSON array of TimeLog[]
  totalTimeSpent: number;
  lastActiveAt?: string;
}
```

### Key Components
- `data-kanban.tsx` - Main Kanban board with real-time sync
- `kanban-card.tsx` - Individual task cards
- `columns.tsx` - Status column definitions
- `create-task-form.tsx` - Task creation interface

## 💬 Real-time Collaboration

### Pusher Integration
- **Channels**: `tasks`, `comments-{taskId}`
- **Events**: task-created, updated, deleted, bulk-updated
- **Real-time Updates**: Instant sync across all connected clients

### Comment System
- **Nested Comments**: Support for replies and threading
- **Mentions**: @user tagging system
- **Pinned Fields**: Highlight important task properties
- **Priority Levels**: LOWEST to HIGHEST priority flags

## 📁 File Management (TemBox)

### Storage Features
- **Folder Organization**: Color-coded folder system
- **File Upload**: Drag & drop file management
- **Storage Quotas**: Usage tracking and limits
- **Search**: Global file and folder search

### File Structure
- **Folders**: Hierarchical organization with color themes
- **Files**: Metadata storage with Appwrite storage integration
- **Permissions**: Workspace-based access control

## 📊 Analytics & Reporting

### Metrics Tracked
- Total tasks count and trends
- Assigned vs. unassigned tasks
- Completion rates and overdue tasks
- Time tracking analytics per member

### Analytics Components
- `analytics.tsx` - Main analytics dashboard
- `analytics-card.tsx` - Individual metric cards
- `member-time-analytics.tsx` - Time tracking reports

## 🔌 API Architecture

### Hono-based API Routes
- **RESTful Design**: CRUD operations for all entities
- **Validation**: Zod schemas for request validation
- **Middleware**: Session validation and error handling
- **Type Safety**: Full TypeScript integration

### API Structure
```
/api/
├── auth/           # Authentication endpoints
├── workspaces/     # Workspace management
├── members/        # Member management
├── projects/       # Project CRUD
├── tasks/          # Task operations
├── comments/       # Comment system
└── analytics/      # Data reporting
```

## 🎨 UI Component System

### Design System
- **Radix UI**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Custom Components**: Specialized components for platform features

### Key UI Components
- `modal.tsx` - Reusable modal system
- `sidebar.tsx` - Navigation sidebar
- `navbar.tsx` - Top navigation bar
- `workspace-switcher.tsx` - Workspace selection

## 🚀 Performance Optimizations

### Query Optimization
- **N+1 Prevention**: Batch user fetching in task endpoints
- **React Query**: Efficient caching and state management
- **Lazy Loading**: Component-level code splitting
- **Bundle Analysis**: Webpack bundle analyzer integration

### Real-time Performance
- **Pusher Optimization**: Efficient WebSocket management
- **State Updates**: Optimistic updates with rollback
- **Memory Management**: Proper cleanup of subscriptions

## 🔧 Development Tools

### Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "analyze": "ANALYZE=true next build",
  "clean": "rm -rf .next && rm -rf node_modules/.cache"
}
```

### Code Quality
- **ESLint**: Next.js configuration
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting
- **Bundle Analysis**: Performance monitoring

## 📱 Responsive Design

### Mobile Support
- **Mobile Sidebar**: Collapsible navigation
- **Touch Gestures**: Mobile-friendly interactions
- **Responsive Layout**: Adaptive design for all screen sizes
- **Progressive Web App**: PWA capabilities

## 🔒 Security Features

### Data Protection
- **Session Validation**: Secure authentication checks
- **Permission Checks**: Role-based access control
- **Input Validation**: Zod schema validation
- **CORS Protection**: Secure cross-origin requests

## 🚀 Deployment & Infrastructure

### Environment Configuration
- **Appwrite**: Database and storage configuration
- **Pusher**: Real-time service configuration
- **Next.js**: Production build optimization
- **Vercel**: Deployment platform ready

### Environment Variables
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

## 📈 Current Status & Features

### ✅ Implemented Features
- Complete authentication system
- Real-time Kanban board with drag & drop
- File management and storage
- Comment system with mentions
- Time tracking and analytics
- Role-based permissions
- Real-time collaboration
- Performance optimizations

### 🎯 Key Strengths
1. **Real-time Sync**: Working Pusher integration
2. **Performance**: N+1 query prevention implemented
3. **User Experience**: Smooth drag & drop interactions
4. **Code Quality**: Clean, maintainable TypeScript
5. **Scalability**: Feature-based architecture

## 🔮 Future Enhancements

### Potential Improvements
- **Search**: Full-text search across all entities
- **Notifications**: Push notifications for mentions and updates
- **Integrations**: Third-party service connections
- **Mobile App**: Native mobile applications
- **Advanced Analytics**: Custom reporting and dashboards

## 📚 Development Guidelines

### Code Organization
- **Feature-based**: Group related functionality together
- **Type Safety**: Use TypeScript interfaces and types
- **Component Reusability**: Create reusable UI components
- **Performance**: Implement optimizations from the start

### Best Practices
- **Real-time**: Use Pusher for live updates
- **State Management**: Leverage React Query for server state
- **Validation**: Validate all inputs with Zod
- **Error Handling**: Graceful error handling throughout

---

*This index provides a comprehensive overview of the Temet platform codebase. The project demonstrates modern web development practices with a focus on real-time collaboration, performance, and user experience.*
