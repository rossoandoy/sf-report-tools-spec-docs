import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  path: '/',
  navigate: () => {},
});

export function useRouter(): RouterContextValue {
  return useContext(RouterContext);
}

function getHashPath(): string {
  const hash = window.location.hash.slice(1);
  return hash || '/';
}

export function HashRouter({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(getHashPath);

  useEffect(() => {
    const onHashChange = () => setPath(getHashPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function matchRoute(
  pattern: string,
  path: string
): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    if (pp.startsWith(':')) {
      params[pp.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (pp !== pathParts[i]) {
      return null;
    }
  }
  return params;
}
