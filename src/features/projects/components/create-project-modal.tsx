"use client"

import { Modal } from "@/components/modal";

import { CreateProjectForm } from "./create-project-form";
import { useCreateProjectModal } from "../hooks/use-create-project-modal";

export const CreateProjectModal = () => {
    const {isOpen, setIsOpen, close} = useCreateProjectModal();

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
        <CreateProjectForm onCancel={close}/>
    </Modal>
  );
};
