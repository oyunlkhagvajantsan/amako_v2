// app/global-error.tsx
'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen items-center justify-center">
                    <h1 className="text-xl font-bold">Something went wrong</h1>
                    <button onClick={() => reset()}>Retry</button>
                </div>
            </body>
        </html>
    );
}
