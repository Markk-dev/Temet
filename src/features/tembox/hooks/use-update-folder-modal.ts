import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

export const useUpdateFolderModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "update-folder",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const [folderId, setFolderId] = useQueryState(
    "folder-id",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );

  const [folderName, setFolderName] = useQueryState(
    "folder-name",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );

  const [folderColor, setFolderColor] = useQueryState(
    "folder-color",
    parseAsString.withDefault("blue").withOptions({ clearOnDefault: true })
  );

  const [onSuccessCallback, setOnSuccessCallback] = useQueryState(
    "on-success-callback",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );

  const open = (data: { 
    folderId: string; 
    folderName: string; 
    folderColor: string;
    onSuccess?: () => void;
  }) => {
    setFolderId(data.folderId);
    setFolderName(data.folderName);
    setFolderColor(data.folderColor);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setFolderId("");
    setFolderName("");
    setFolderColor("blue");
  };

  return {
    isOpen,
    folderId,
    folderName,
    folderColor,
    onSuccessCallback,
    open,
    close,
    setIsOpen,
  };
}; 