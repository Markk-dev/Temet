import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateFolderModal = () => {
  const [ isOpen, setIsOpen ] = useQueryState(
    "create-folder",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true})
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    setIsOpen,
  };
}; 