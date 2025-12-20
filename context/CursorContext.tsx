import React, { createContext, useContext, useState } from 'react';

export type CursorMode = 'default' | 'blob' | 'ring';

interface CursorContextType {
  mode: CursorMode;
  setMode: (m: CursorMode) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<CursorMode>('default');
  return (
    <CursorContext.Provider value={{ mode, setMode }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error('useCursor must be used within CursorProvider');
  return ctx;
};

export default CursorProvider;
