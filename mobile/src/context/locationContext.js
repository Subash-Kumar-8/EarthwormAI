import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [locationCoords, setLocationCoords] = useState(null);

  return (
    <LocationContext.Provider
      value={{
        locationCoords,
        setLocationCoords,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }

  return context;
};