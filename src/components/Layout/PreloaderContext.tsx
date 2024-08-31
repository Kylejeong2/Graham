"use client";
import React, { createContext, useState, useContext } from 'react';

interface PreloaderContextType {
  hasPreloaded: boolean;
  setHasPreloaded: (value: boolean) => void;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

export const PreloaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasPreloaded, setHasPreloaded] = useState(false);

  return (
    <PreloaderContext.Provider value={{ hasPreloaded, setHasPreloaded }}>
      {children}
    </PreloaderContext.Provider>
  );
};

export const usePreloader = () => {
  const context = useContext(PreloaderContext);
  if (context === undefined) {
    throw new Error('usePreloader must be used within a PreloaderProvider');
  }
  return context;
};