"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import { fabric } from 'fabric';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import FabricErrorBoundary from './FabricErrorBoundary';
import LoadingStates, { LoadingState } from './LoadingStates';
import { CanvasErrorHandler, safeFabricOperation } from '../utils/errorHandling';
import { useLoadingState } from '../hooks/useLoadingState';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

// Canvas context types
export interface CanvasContextType {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  isReady: boolean;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
  isDrawing: React.MutableRefObject<boolean>;
  shapeRef: React.MutableRefObject<fabric.Object | null>;
  selectedShapeRef: React.MutableRefObject<string | null>;
  isEditingRef: React.MutableRefObject<boolean>;
  imageInputRef: React.MutableRefObject<HTMLInputElement | null>;
  error: Error | null;
  resetCanvas: () => void;
  // Loading state management
  loadingState: LoadingState;
  loadingMessage: string;
  loadingProgress: number;
  isLoading: boolean;
  setLoadingState: (state: LoadingState, message?: string) => void;
  setLoadingProgress: (progress: number) => void;
  // Network status
  isOnline: boolean;
  connectionQuality: 'good' | 'poor' | 'offline';
}

export interface CanvasProviderProps {
  workspaceId: string;
  roomId?: string;
  children: ReactNode;
}

// Create the canvas context
const CanvasContext = createContext<CanvasContextType | null>(null);

// Canvas provider component
export const CanvasProvider: React.FC<CanvasProviderProps> = ({
  workspaceId,
  roomId,
  children,
}) => {
  // Fabric.js canvas reference
  const fabricRef = useRef<fabric.Canvas | null>(null);
  
  // Canvas state references
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const isDrawing = useRef<boolean>(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const isEditingRef = useRef<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  
  // Canvas ready state
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Loading state management
  const loadingManager = useLoadingState({
    initialState: 'initializing',
    initialMessage: 'Setting up canvas...',
    autoTimeout: 30000, // 30 second timeout
    onStateChange: (state) => {
      console.log('Canvas loading state changed:', state);
    },
    onError: (error) => {
      console.error('Loading state error:', error);
      setError(error);
    },
  });

  // Network status monitoring
  const networkStatus = useNetworkStatus({
    onOffline: () => {
      loadingManager.handleOffline();
    },
    onReconnect: () => {
      if (loadingManager.state === 'offline' || loadingManager.state === 'reconnecting') {
        loadingManager.setLoadingState('connecting', 'Reconnecting to collaboration server...');
      }
    },
    maxRetries: 5,
    retryInterval: 3000,
  });

  // Initialize error handler
  useEffect(() => {
    const errorHandler = CanvasErrorHandler.getInstance();
    
    // Register error callbacks
    errorHandler.onError('fabric', (error) => {
      console.error('Fabric.js error in CanvasProvider:', error);
      setError(error);
    });

    errorHandler.onError('canvas', (error) => {
      console.error('Canvas error in CanvasProvider:', error);
      setError(error);
    });

    return () => {
      errorHandler.offError('fabric');
      errorHandler.offError('canvas');
    };
  }, []);

  // Reset canvas function
  const resetCanvas = () => {
    try {
      if (fabricRef.current) {
        safeFabricOperation(fabricRef.current, (canvas) => {
          canvas.clear();
          canvas.renderAll();
        }, 'resetCanvas');
      }
      setError(null);
      setIsReady(true);
    } catch (error) {
      console.error('Failed to reset canvas:', error);
      setError(error as Error);
    }
  };

  // Initialize canvas when component mounts
  useEffect(() => {
    const initializeCanvas = async () => {
      try {
        loadingManager.startLoading('initializing', 'Setting up canvas environment...');
        
        // Simulate initialization steps with progress
        loadingManager.setProgress(20);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        loadingManager.setLoadingState('loading-canvas', 'Loading canvas configuration...');
        loadingManager.setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check network connectivity
        if (!networkStatus.isOnline) {
          loadingManager.handleOffline();
          setIsReady(true); // Allow offline mode
          return;
        }
        
        loadingManager.setLoadingState('connecting', 'Connecting to collaboration server...');
        loadingManager.setProgress(80);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Canvas will be initialized when the canvas element is available
        // This is handled by the component that uses this provider
        loadingManager.setProgress(100);
        loadingManager.finishLoading();
        
        setIsReady(true);
        setError(null);
      } catch (error) {
        console.error('Canvas initialization error:', error);
        loadingManager.handleError(error as Error, 'Failed to initialize canvas');
        setError(error as Error);
        setIsReady(false);
      }
    };

    initializeCanvas();
    
    return () => {
      // Cleanup canvas when component unmounts
      try {
        if (fabricRef.current) {
          fabricRef.current.dispose();
          fabricRef.current = null;
        }
      } catch (error) {
        console.error('Canvas cleanup error:', error);
      }
    };
  }, [loadingManager, networkStatus.isOnline]);

  const contextValue: CanvasContextType = {
    fabricRef,
    isReady,
    activeObjectRef,
    isDrawing,
    shapeRef,
    selectedShapeRef,
    isEditingRef,
    imageInputRef,
    error,
    resetCanvas,
    // Loading state
    loadingState: loadingManager.state,
    loadingMessage: loadingManager.message,
    loadingProgress: loadingManager.progress,
    isLoading: loadingManager.isLoading,
    setLoadingState: loadingManager.setLoadingState,
    setLoadingProgress: loadingManager.setProgress,
    // Network status
    isOnline: networkStatus.isOnline,
    connectionQuality: networkStatus.connectionQuality,
  };

  // Show loading states when canvas is not ready
  if (loadingManager.isLoading || !isReady) {
    return (
      <CanvasErrorBoundary
        onError={(error) => {
          console.error('Canvas Error Boundary triggered:', error);
          loadingManager.handleError(error);
          setError(error);
        }}
      >
        <LoadingStates
          state={loadingManager.state}
          message={loadingManager.message}
          progress={loadingManager.progress}
          onRetry={() => {
            setError(null);
            loadingManager.reset();
            // Trigger re-initialization
            setIsReady(false);
          }}
          onOfflineMode={() => {
            loadingManager.handleOffline();
            setIsReady(true);
          }}
        />
      </CanvasErrorBoundary>
    );
  }

  return (
    <CanvasErrorBoundary
      onError={(error) => {
        console.error('Canvas Error Boundary triggered:', error);
        loadingManager.handleError(error);
        setError(error);
      }}
    >
      <FabricErrorBoundary
        onCanvasReset={resetCanvas}
        onObjectError={(error) => {
          console.error('Fabric object error:', error);
          loadingManager.handleError(error);
          setError(error);
        }}
      >
        <CanvasContext.Provider value={contextValue}>
          {children}
        </CanvasContext.Provider>
      </FabricErrorBoundary>
    </CanvasErrorBoundary>
  );
};

// Hook to use canvas context
export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  
  return context;
};

// Export context for testing purposes
export { CanvasContext };

export default CanvasProvider;