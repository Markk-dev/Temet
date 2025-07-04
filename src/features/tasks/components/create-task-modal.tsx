"use client"

import { Modal } from "@/components/modal";

import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { CreateTaskFormWrapper } from "./create-task-form-wrapper";

export const CreateTaskModal = () => {
    const { isOpen, setIsOpen, close } = useCreateTaskModal();

    return (
        <Modal open={isOpen} onOpenChange={setIsOpen}> 
            <CreateTaskFormWrapper onCancel={close}/>
        </Modal>
    )
}