"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es" className="dark">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            background: "#0a0a0a",
            color: "#fafafa",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Algo salió mal
          </h2>
          <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>
            Ocurrió un error inesperado en la aplicación.
          </p>
          <button
            onClick={() => reset()}
            style={{
              borderRadius: "0.5rem",
              background: "#f97316",
              color: "#0a0a0a",
              padding: "0.5rem 1rem",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
