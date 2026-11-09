import { useEffect, useState } from "react";

// The current time, refreshed every minute. Components use this instead of
// calling Date.now() while rendering, which React requires to stay pure.
export function useNow(intervalMs = 60 * 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
