"use client";

export default function FullscreenError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <p>Something went wrong.</p>
            <button onClick={() => reset()} style={{ marginTop: 12, padding: "6px 12px", border: "1px solid #ddd", borderRadius: 6 }}>Retry</button>
        </div>
    );
}


