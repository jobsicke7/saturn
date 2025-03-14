// src/components/SolarSystem/SolarSystemContext.tsx
import React, { createContext, useState, ReactNode, useCallback } from 'react';

interface SolarSystemContextType {
  trackedPlanet: string | null;
  setTrackedPlanet: (planetName: string | null) => void;
}

export const SolarSystemContext = createContext<SolarSystemContextType>({
  trackedPlanet: null,
  setTrackedPlanet: () => {},
});

export function SolarSystemProvider({ children }: { children: ReactNode }) {
  const [trackedPlanet, setTrackedPlanet] = useState<string | null>(null);
  
  // 메모이제이션으로 불필요한 렌더링 방지
  const handleSetTrackedPlanet = useCallback((planetName: string | null) => {
    setTrackedPlanet(planetName);
  }, []);
  
  return (
    <SolarSystemContext.Provider 
      value={{ 
        trackedPlanet, 
        setTrackedPlanet: handleSetTrackedPlanet 
      }}
    >
      {children}
    </SolarSystemContext.Provider>
  );
}
