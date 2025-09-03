import { useQueryState, parseAsBoolean } from "nuqs";

export const useTemboxLLMModal = () => {
  const [ isOpen, setIsOpen ] = useQueryState(
    "tembox-llm",
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
