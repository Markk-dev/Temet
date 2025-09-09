import { Room } from "../Room";

interface FullscreenLayoutProps {
    children: React.ReactNode;
}

const FullscreenLayout = ({ children }: FullscreenLayoutProps) => {
    return (
        <main className="min-h-screen w-screen bg-white">
          <Room>
            {children}
          </Room>
        </main>
    );
};

export default FullscreenLayout;


