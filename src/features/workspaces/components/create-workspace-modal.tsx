"use client"

import { Modal } from "@/components/modal";

import { CreateWorkspaceForm } from "./create-workspace-form";
import { useCreateWorkspaceModal } from "../hooks/use-create-workspace-modal";

export const CreateWorkspaceModal = () => {
    const {isOpen, setIsOpen, close} = useCreateWorkspaceModal();

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
        <CreateWorkspaceForm onCancel={close}/>
    </Modal>
  );
};
