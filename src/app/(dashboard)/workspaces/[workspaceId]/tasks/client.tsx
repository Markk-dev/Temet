"use client";

import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";

export const TasksClient = () => {
    return (
        <div className="h-full flex flex-col">
            <TaskViewSwitcher/>
        </div>
    );
};
