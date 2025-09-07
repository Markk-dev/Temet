interface CanvasLayoutProps {
  children: React.ReactNode;
  params: {
    workspaceId: string;
  };
}

const CanvasLayout = ({ children }: CanvasLayoutProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Canvas-specific layout wrapper */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default CanvasLayout;