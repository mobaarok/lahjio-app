// Published lessons and words, loaded once and shared with every screen.
// error is a message key, shown with t(error).
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { MessageKey } from "@/i18n/messages";
import { loadContent } from "@/lib/content";
import type { Content } from "@/lib/types";

interface ContentValue {
  content: Content | null;
  loading: boolean;
  error: MessageKey | null;
  reload: () => void;
}

const ContentContext = createContext<ContentValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MessageKey | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;

    loadContent()
      .then((loaded) => {
        if (!ignore) setContent(loaded);
      })
      .catch(() => {
        if (!ignore) setError("error.contentLoad");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [attempt]);

  // Try again after an error: show the spinner and load once more
  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, error, reload }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(): ContentValue {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used inside <ContentProvider>");
  return context;
}
