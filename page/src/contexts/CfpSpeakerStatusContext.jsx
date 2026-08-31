import React, { createContext, useContext, useState, useCallback } from 'react';
import { getCfpSpeakerStatus, setCfpSpeakerStatus } from '../utils/cfpSpeakerStatuses';

const CfpSpeakerStatusContext = createContext(null);

export const useCfpSpeakerStatusContext = () => {
  const context = useContext(CfpSpeakerStatusContext);
  if (!context) {
    return {
      getStatus: (eventId) => getCfpSpeakerStatus(eventId),
      updateStatus: (eventId, status) => setCfpSpeakerStatus(eventId, status),
      updateTrigger: 0
    };
  }
  return context;
};

export const CfpSpeakerStatusProvider = ({ children }) => {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const updateStatus = useCallback((eventId, nextStatus) => {
    setCfpSpeakerStatus(eventId, nextStatus);
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const getStatus = useCallback((eventId) => {
    return getCfpSpeakerStatus(eventId);
  }, [updateTrigger]);

  const value = {
    getStatus,
    updateStatus,
    updateTrigger
  };

  return (
    <CfpSpeakerStatusContext.Provider value={value}>
      {children}
    </CfpSpeakerStatusContext.Provider>
  );
};
