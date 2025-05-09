'use client';

import { useState, useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [countdown, setCountdown] = useState(1);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.reload();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 100);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <html>
      <body>
        <main style={{ textAlign: 'center', padding: '50px' }}>
          <h1>Something went wrong!</h1>
          <p>An unexpected error has occurred. (5)</p>
          {error.digest && (
            <p>
              Error ID: <code>{error.digest}</code>
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className='border border-black'
            style={{
              padding: '10px 20px',
              marginTop: '20px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: '10px' }}>Auto-refreshing in {countdown} seconds...</p>
          <p> {error.digest} </p>
        </main>
      </body>
    </html>
  );
}
