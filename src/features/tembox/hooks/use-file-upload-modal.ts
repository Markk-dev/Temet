import { useState } from "react";

export interface FileUploadData {
  file: File;
  folderId?: string;
}


let globalState = {
  isOpen: false,
  selectedFile: null as File | null,
  folderId: "",
  listeners: new Set<() => void>()
};

const notifyListeners = () => {
  globalState.listeners.forEach(listener => listener());
};

export const useFileUploadModal = () => {
  const [, forceUpdate] = useState({});

  // Subscribe to global state changes
  useState(() => {
    const listener = () => forceUpdate({});
    globalState.listeners.add(listener);
    return () => globalState.listeners.delete(listener);
  });

  const open = (file: File, folderId?: string) => {
    globalState.selectedFile = file;
    globalState.folderId = folderId || "";
    globalState.isOpen = true;
    notifyListeners();
  };

  const close = () => {
    globalState.isOpen = false;
    globalState.folderId = "";
    globalState.selectedFile = null;
    notifyListeners();
  };

  const fileUploadData: FileUploadData | null = globalState.selectedFile ? {
    file: globalState.selectedFile,
    folderId: globalState.folderId || undefined
  } : null;

  return {
    isOpen: globalState.isOpen,
    open,
    close,
    selectedFile: fileUploadData,
  };
}; 