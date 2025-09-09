export default function FullscreenNotFound() {
    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <p>Page not found.</p>
            <a href="/" style={{ marginTop: 12, textDecoration: "underline" }}>Back to home</a>
        </div>
    );
}


