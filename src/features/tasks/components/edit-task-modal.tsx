"use client"

import { Modal } from "@/components/modal";

import { EditTaskFormWrapper } from "./edit-task-form-wrapper";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";

export const EditTaskModal = () => {
    const { taskId, close } = useEditTaskModal();

    return (
        <Modal open={!!taskId} onOpenChange={close}> 
        {taskId && (
            <EditTaskFormWrapper id={taskId} onCancel={close}/>
        )}
        </Modal>
    )
}