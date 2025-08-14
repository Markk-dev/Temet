import { useQueryState, parseAsBoolean } from "nuqs";

export const useTemboxModal = () => {
  const [ isOpen, setIsOpen ] = useQueryState(
    "tembox",
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