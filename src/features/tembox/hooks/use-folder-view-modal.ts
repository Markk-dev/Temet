import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

export interface FolderViewData {
  folderId: string;
  folderName: string;
  folderColor?: string;
}

export const useFolderViewModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "folder-view",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const [folderData, setFolderData] = useQueryState(
    "folder-data",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );

  const open = (folder: FolderViewData) => {
    setFolderData(JSON.stringify(folder));
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setFolderData("");
  };

  const selectedFolder: FolderViewData | null = folderData ? JSON.parse(folderData) : null;

  return {
    isOpen,
    open,
    close,
    selectedFolder,
  };
}; 