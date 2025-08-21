# Temet Platform - Project & Database Index

## Project Overview
**Temet** is a real-time project management and collaboration platform built with Next.js, featuring:
- Workspace-based project management
- Real-time collaboration using Pusher
- File storage and management
- Task tracking with time logging
- Comment system with mentions and pinned fields
- Role-based access control (ADMIN/MEMBER)

## Database Structure

### Database: `temet` (ID: 68484be90037edf3dcf5)
- **Created**: June 10, 2025
- **Status**: Active
- **Collections**: 7

---

## Collections Index

### 1. Workspaces Collection
**ID**: `68484c32000ec9795a72`
**Purpose**: Store workspace information and settings

**Attributes**:
- `name` (string, 256 chars, required) - Workspace name
- `userId` (string, 50 chars, required) - Creator's user ID
- `imageUrl` (string, 1.4MB, optional) - Workspace banner image
- `inviteCode` (string, 10 chars, required) - Unique invite code

**Current Data**: 1 workspace
- **Saas Application** - Created by MarkDev (6849af050019c91bca11)

---

### 2. Members Collection
**ID**: `684c65730004d40594a4`
**Purpose**: Manage workspace membership and roles

**Attributes**:
- `userId` (string, 50 chars, required) - Member's user ID
- `workspaceId` (string, 50 chars, required) - Workspace they belong to
- `role` (enum, required) - ADMIN or MEMBER

**Current Data**: 5 memberships across 2 workspaces
- **Workspace 1** (689047d600346783d33a): 3 ADMIN members
- **Workspace 2** (6892a4820025da4684d0): 1 ADMIN, 1 MEMBER

---

### 3. Projects Collection
**ID**: `685fac6a0034859e17d2`
**Purpose**: Store project information within workspaces

**Attributes**:
- `workspaceId` (string, 50 chars, required) - Parent workspace
- `imageUrl` (string, 1.4MB, optional) - Project image
- `name` (string, 256 chars, required) - Project name

**Current Data**: 1 project
- **Saas Application** - In "Saas Application" workspace

---

### 4. Tasks Collection
**ID**: `68667b13001e69e4bf4f`
**Purpose**: Manage individual tasks with full lifecycle tracking

**Attributes**:
- `workspaceId` (string, 50 chars, required) - Parent workspace
- `name` (string, 256 chars, required) - Task name
- `projectId` (string, 50 chars, required) - Parent project
- `description` (string, 2048 chars, optional) - Task description
- `dueDate` (datetime, required) - Task deadline
- `status` (enum, required) - BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE
- `position` (integer, 1000-1000000, required) - Kanban board position
- `assigneeId` (string array, 50 chars, optional) - Assigned team members
- `timeLogs` (string, 10000 chars, optional) - JSON array of time tracking
- `totalTimeSpent` (integer, required) - Total time spent on task
- `lastActiveAt` (string, 255 chars, optional) - Last activity timestamp

**Current Data**: 4 tasks
- All tasks are in "DONE" status
- Tasks include: Test Analytics, Test Analytics 2, Test Analytics 3, Thursday Analytics Test
- Time logging is implemented with start/end timestamps

---

### 5. Folders Collection
**ID**: `folders`
**Purpose**: Organize files into hierarchical structures

**Attributes**:
- `name` (string, 128 chars, required) - Folder name
- `workspaceId` (string, 36 chars, required) - Parent workspace
- `createdBy` (string, 36 chars, required) - Creator's user ID
- `color` (string, 20 chars, optional) - Folder color theme

**Indexes**:
- `workspace_folders` (key) - Indexed on workspaceId

**Current Data**: 2 folders
- **Test Storage** (green) - In Saas Application workspace
- **Capstone Folder** (blue) - In another workspace

---

### 6. Files Collection
**ID**: `files`
**Purpose**: Store file metadata and references

**Attributes**:
- `name` (string, 256 chars, required) - File name
- `workspaceId` (string, 36 chars, required) - Parent workspace
- `folderId` (string, 36 chars, optional) - Parent folder
- `fileId` (string, 36 chars, required) - Appwrite storage file ID
- `mimeType` (string, 100 chars, required) - File MIME type
- `size` (integer, required) - File size in bytes
- `uploadedBy` (string, 36 chars, required) - Uploader's user ID

**Indexes**:
- `workspace_files` (key) - Indexed on workspaceId
- `folder_files` (key) - Indexed on folderId

**Current Data**: 2 files
- **Justine.jpg** (482KB, JPEG) - In Test Storage folder
- **test.txt** (0 bytes, text) - In Test Storage folder

---

### 7. Comments Collection
**ID**: `comments`
**Purpose**: Enable task discussion and collaboration

**Attributes**:
- `taskId` (string, 50 chars, required) - Associated task
- `workspaceId` (string, 50 chars, required) - Parent workspace
- `content` (string, 2048 chars, required) - Comment text
- `authorId` (string, 50 chars, required) - Comment author
- `parentId` (string, 50 chars, optional) - Parent comment for replies
- `priority` (enum, optional) - LOWEST, LOW, MEDIUM, HIGH, HIGHEST
- `pinnedFields` (string array, 255 chars, optional) - Fields to highlight
- `mentions` (string array, 255 chars, optional) - Mentioned users
- `pinnedFieldValues` (string, 1000 chars, optional) - Custom field values

**Current Data**: 1 comment
- Comment on "Thursday Analytics Test" task
- Mentions user 68a221be0021b445a3d6
- Pinned fields: assignee, dueDate, status

---

## User Base

**Total Users**: 5
- **MarkDev** (6849af050019c91bca11) - Primary developer account
- **MarkGuest** (6845b6230006d3b80775) - Guest user account
- **MarkTest** (6862935c0023a673557b) - Testing account
- **Mark Vincent Madrid** (6886e21f5c70a0d6e58f) - Personal account
- **Mark Vincent Madrid** (6886e32c6bd359181adb) - Additional account

---

## Current System State

### Active Workspaces
1. **Saas Application** (6892a4820025da4684d0)
   - 1 project: Saas Application
   - 4 completed tasks
   - 1 folder with 2 files
   - 1 comment

2. **Capstone Workspace** (689047d600346783d33a)
   - 1 folder: Capstone Folder
   - 3 admin members

### Data Volume
- **Workspaces**: 1
- **Projects**: 1
- **Tasks**: 4 (all completed)
- **Files**: 2 (482KB total)
- **Comments**: 1
- **Memberships**: 5

### Key Features Implemented
✅ User authentication and workspace management
✅ Project and task creation
✅ File storage and organization
✅ Time tracking and logging
✅ Comment system with mentions
✅ Role-based permissions
✅ Real-time updates (Pusher integration)

### Technical Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Appwrite (Database, Auth, Storage)
- **Real-time**: Pusher
- **UI**: Radix UI, Tailwind CSS, Framer Motion
- **State Management**: TanStack Query, React Hook Form
- **Validation**: Zod

---

## Recommendations

### Database Optimization
1. **Add Indexes**: Consider adding indexes on frequently queried fields like `status`, `dueDate`, `assigneeId`
2. **Data Archiving**: Implement soft delete for completed tasks older than X months
3. **Performance**: Monitor query performance as data grows

### Feature Enhancements
1. **Search**: Implement full-text search across tasks, projects, and files
2. **Analytics**: Add reporting on task completion rates and time tracking
3. **Notifications**: Expand the notification system for mentions and due dates
4. **API Rate Limiting**: Consider implementing rate limiting for file uploads

### Security Considerations
1. **File Validation**: Implement stricter file type and size validation
2. **Permission Auditing**: Add audit logs for permission changes
3. **Data Encryption**: Consider encrypting sensitive task descriptions

---

*Index generated on: January 21, 2025*
*Using: Appwrite MCP Server*
*Total Collections Indexed: 7*
*Total Documents Indexed: 16* 