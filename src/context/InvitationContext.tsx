import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface InvitationContextValue {
  /** True once the envelope open sequence has fully finished. */
  isOpened: boolean;
  open: () => void;
}

const InvitationContext = createContext<InvitationContextValue | null>(null);

export function InvitationProvider({ children }: { children: ReactNode }) {
  const [isOpened, setIsOpened] = useState(false);
  const open = useCallback(() => setIsOpened(true), []);

  return (
    <InvitationContext.Provider value={{ isOpened, open }}>
      {children}
    </InvitationContext.Provider>
  );
}

export function useInvitation(): InvitationContextValue {
  const ctx = useContext(InvitationContext);
  if (!ctx) throw new Error('useInvitation must be used within InvitationProvider');
  return ctx;
}
