# Temet Platform - Swimlane Flowchart

## Platform Overview
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                TEMET PLATFORM                                     │
│                    Real-time Project Management & Collaboration                    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## User Authentication & Workspace Management

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     ADMIN       │    │     MEMBER      │    │   AUTH SYSTEM   │    │   WORKSPACE     │
│                 │    │                 │    │                 │    │   MANAGEMENT    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ 1. Login        │───▶│ 1. Login        │───▶│ 2. Authenticate │───▶│ 3. Create       │
│ 2. Create       │    │ 2. Join via     │    │ 3. Validate     │    │    Workspace    │
│    Workspace    │    │    Invite Code  │    │ 4. Assign Role  │    │ 4. Generate     │
│ 3. Invite       │    │ 3. Accept       │    │ 5. Set          │    │    Invite Code  │
│    Members      │    │    Invitation   │    │    Permissions  │    │ 5. Store        │
│ 4. Manage       │    │ 4. Access       │    │                 │    │    Workspace    │
│    Permissions  │    │    Workspace    │    │                 │    │    Data         │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Project & Task Management Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     ADMIN       │    │     MEMBER      │    │   PROJECT       │    │   TASK          │
│                 │    │                 │    │   SYSTEM        │    │   SYSTEM        │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ 1. Create       │───▶│ 1. Create       │───▶│ 2. Validate     │───▶│ 3. Create       │
│    Project      │    │    Task         │    │    Project      │    │    Task         │
│ 2. Assign       │    │ 2. Assign       │    │ 3. Store        │    │ 4. Update       │
│    Members      │    │    Members      │    │ 4. Trigger      │    │ 5. Trigger      │
│ 3. Set          │    │ 3. Set          │    │ 5. Apply        │    │ 6. Update       │
│    Permissions  │    │    Status       │    │ 6. Export       │    │ 7. Export       │
│ 4. Manage       │    │ 4. Update       │    │ 7. Trigger      │    │ 8. Update       │
│    Project      │    │    Progress     │    │ 8. Display      │    │ 9. Display      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Real-time Collaboration & Storage

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PUSHER        │    │   STORAGE       │    │   FIG BOARD     │    │   ANALYTICS     │
│   REAL-TIME     │    │   SYSTEM        │    │   (FIGMA CLONE) │    │   SYSTEM        │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ 1. Subscribe    │───▶│ 2. Upload       │───▶│ 3. Create       │───▶│ 4. Track        │
│    to Channels  │    │    Files        │    │    Design       │    │    User         │
│ 2. Listen for   │    │ 3. Store        │    │    Elements     │    │    Activity     │
│    Updates      │    │    Images       │    │ 4. Collaborate  │    │ 5. Generate     │
│ 3. Broadcast    │    │ 4. Manage       │    │    in Real-time │    │    Reports      │
│    Changes      │    │    File Access  │    │ 5. Export       │    │ 6. Update       │
│ 4. Update UI    │    │ 5. Sync with    │    │    Designs      │    │    Dashboard    │
│    Instantly    │    │    Real-time    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Detailed Process Flow

### 1. Workspace Creation & Management
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     ADMIN       │    │   AUTH SYSTEM   │    │   DATABASE      │    │   PUSHER        │
│                 │    │                 │    │   (APPWRITE)    │    │   REAL-TIME     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ 1. Create       │───▶│ 2. Validate     │───▶│ 3. Store        │───▶│ 4. Broadcast    │
│    Workspace    │    │    User         │    │    Workspace    │    │    Workspace    │
│ 2. Upload       │    │ 3. Assign       │    │    Data         │    │    Created      │
│    Workspace    │    │    Admin Role   │    │ 4. Generate     │    │ 5. Update       │
│    Image        │    │ 4. Set          │    │    Invite Code  │    │    All Members  │
│ 3. Set          │    │    Permissions  │    │ 5. Create       │    │    Instantly    │
│    Permissions  │    │                 │    │    Member       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. Project & Task Creation
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USER (ANY)    │    │   VALIDATION    │    │   DATABASE      │    │   REAL-TIME     │
│                 │    │   SYSTEM        │    │   (APPWRITE)    │    │   UPDATE        │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ 1. Create       │───▶│ 2. Validate     │───▶│ 3. Store        │───▶│ 4. Broadcast    │
│    Project/Task │    │    Permissions  │    │    Project/Task │    │    to All       │
│ 2. Assign       │    │ 3. Check        │    │    Data         │    │    Members      │
│    Members      │    │    Workspace    │    │ 4. Update       │    │ 5. Update       │
│ 3. Set          │    │    Access       │    │    Analytics    │    │    UI in        │
│    Status       │    │ 4. Validate     │    │ 5. Trigger      │    │    Real-time    │
│ 4. Upload       │    │    Data         │    │    Notifications│    │                 │
│    Files        │    │                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3. Storage & File Management
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USER        │    │   STORAGE       │    │   FILE          │    │   REAL-TIME     │
│                 │    │   VALIDATION    │    │   PROCESSING    │    │   SYNC          │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ 1. Upload       │───▶│ 2. Validate     │───▶│ 3. Process      │───▶│ 4. Broadcast    │
│    File         │    │    File Type    │    │    File         │    │    File         │
│ 2. Select       │    │ 3. Check        │    │    (Resize,     │    │    Uploaded     │
│    Location     │    │    File Size    │    │    Compress)    │    │ 5. Update       │
│ 3. Set          │    │ 4. Validate     │    │ 4. Generate     │    │    File List    │
│    Permissions  │    │    Permissions  │    │    Thumbnail    │    │    Instantly    │
│ 4. Share        │    │ 5. Check        │    │ 5. Store        │    │                 │
│    with Team    │    │    Storage      │    │    Metadata     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 4. Fig Board (Figma Clone) Collaboration
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USER        │    │   FIG BOARD     │    │   CANVAS        │    │   REAL-TIME     │
│                 │    │   ENGINE        │    │   RENDERING     │    │   COLLABORATION │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ 1. Create       │───▶│ 2. Initialize   │───▶│ 3. Render       │───▶│ 4. Broadcast    │
│    Design       │    │    Canvas       │    │    Elements     │    │    Changes      │
│ 2. Add          │    │ 3. Handle       │    │ 4. Update       │    │ 5. Sync with    │
│    Elements     │    │    User Input   │    │    Viewport     │    │    All Users    │
│ 3. Edit         │    │ 4. Process      │    │ 5. Apply        │    │ 6. Update       │
│    Properties   │    │    Changes      │    │    Styles       │    │    Cursors      │
│ 4. Collaborate  │    │ 5. Validate     │    │ 6. Export       │    │    & Comments   │
│    in Real-time │    │    Permissions  │    │    Design       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 5. Analytics & Reporting
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USER          │    │   ANALYTICS     │    │   DATA          │    │   DASHBOARD     │
│   ACTIVITY      │    │   ENGINE        │    │   PROCESSING    │    │   RENDERING     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ 1. Perform      │───▶│ 2. Track        │───▶│ 3. Process      │───▶│ 4. Generate     │
│    Actions      │    │    User         │    │    Data         │    │    Charts       │
│ 2. Update       │    │    Activity     │    │    (Aggregate,  │    │ 5. Update       │
│    Tasks        │    │ 3. Calculate    │    │    Filter)      │    │    Dashboard    │
│ 3. Complete     │    │    Metrics      │    │ 4. Store        │    │ 6. Display      │
│    Projects     │    │ 4. Generate     │    │    Analytics    │    │    Reports      │
│ 4. Collaborate  │    │    Reports      │    │ 5. Trigger      │    │ 7. Export       │
│    on Designs   │    │ 5. Update       │    │    Real-time    │    │    Data         │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key System Interactions

### Real-time Updates Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USER      │    │   PUSHER    │    │   DATABASE  │    │   ALL       │
│   ACTION    │    │   CHANNEL   │    │   UPDATE    │    │   MEMBERS   │
├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤
│ 1. Create   │───▶│ 2. Broadcast│───▶│ 3. Store    │───▶│ 4. Update   │
│    Task     │    │    Event    │    │    Data     │    │    UI       │
│ 2. Update   │    │ 3. Send to  │    │ 4. Trigger  │    │ 5. Show     │
│    Status   │    │    Channel  │    │    Analytics│    │    Changes  │
│ 3. Move     │    │ 4. Include  │    │ 5. Update   │    │ 6. Sync     │
│    Task     │    │    Metadata │    │    Indexes  │    │    State    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Storage & File Management Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USER      │    │   STORAGE   │    │   FILE      │    │   REAL-TIME │
│   UPLOAD    │    │   VALIDATION│    │   PROCESSING│    │   SYNC      │
├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤
│ 1. Select   │───▶│ 2. Validate │───▶│ 3. Process  │───▶│ 4. Broadcast│
│    File     │    │    Type     │    │    File     │    │    Upload   │
│ 2. Choose   │    │ 3. Check    │    │    (Resize, │    │ 5. Update   │
│    Location │    │    Size      │    │    Compress)│    │    File List│
│ 3. Set      │    │ 4. Validate │    │ 4. Generate │    │ 6. Notify   │
│    Access   │    │    Perms    │    │    Thumbnail│    │    Team     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Fig Board Collaboration Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USER      │    │   FIG BOARD │    │   CANVAS    │    │   REAL-TIME │
│   DESIGN    │    │   ENGINE    │    │   RENDERING │    │   SYNC      │
├─────────────┤    ├─────────────┤    ├─────────────┤    ├─────────────┤
│ 1. Create   │───▶│ 2. Initialize│───▶│ 3. Render   │───▶│ 4. Broadcast│
│    Element  │    │    Canvas   │    │    Element  │    │    Changes  │
│ 2. Edit     │    │ 3. Handle   │    │ 4. Update   │    │ 5. Sync     │
│    Properties│    │    Input    │    │    View     │    │    Cursors  │
│ 3. Move     │    │ 4. Process  │    │ 5. Apply    │    │ 6. Update   │
│    Element  │    │    Changes  │    │    Styles   │    │    All Users│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND (Next.js)                                 │
├─────────────────┬─────────────────┬─────────────────┬─────────────────┬───────────┤
│   AUTH UI       │   DASHBOARD     │   KANBAN        │   FIG BOARD     │   STORAGE │
│   COMPONENTS    │   COMPONENTS    │   COMPONENTS    │   COMPONENTS    │   UI      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴───────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Appwrite)                                   │
├─────────────────┬─────────────────┬─────────────────┬─────────────────┬───────────┤
│   AUTHENTICATION│   DATABASE      │   STORAGE       │   REAL-TIME     │   ANALYTICS│
│   SYSTEM        │   (Collections) │   (Buckets)     │   (Pusher)      │   ENGINE  │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴───────────┘
```

## Key Features Summary

### Admin Capabilities
- ✅ Create and manage workspaces
- ✅ Invite and manage members
- ✅ Set role-based permissions
- ✅ Access analytics and reports
- ✅ Manage storage and files
- ✅ Oversee Fig board projects

### Member Capabilities
- ✅ Join workspaces via invite codes
- ✅ Create and manage tasks
- ✅ Collaborate on projects
- ✅ Upload and share files
- ✅ Participate in Fig board designs
- ✅ View analytics and progress

### System Features
- ✅ Real-time collaboration via Pusher
- ✅ File storage and management
- ✅ Fig board (Figma clone) functionality
- ✅ Analytics and reporting
- ✅ Role-based access control
- ✅ Mobile responsive design
- ✅ Modern UI/UX with Radix UI 