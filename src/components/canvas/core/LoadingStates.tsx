"use client";

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type LoadingState = 
  | 'initializing'
  | 'connecting'
  | 'loading-canvas'
  | 'loading-objects'
  | 'syncing'
  | 'reconnecting'
  | 'offline'
  | 'error';

interface LoadingStatesProps {
  state: LoadingState;
  message?: string;
  progress?: number;
  onRetry?: () => void;
  onOfflineMode?: () => void;
}

const LoadingStates: React.FC<LoadingStatesProps> = ({
  state,
  message,
  progress,
  onRetry,
  onOfflineMode,
}) => {
  const getLoadingContent = () => {
    switch (state) {
      case 'initializing':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: 'Initializing Canvas',
          description: message || 'Setting up the drawing environment...',
          showProgress: false,
        };

      case 'connecting':
        return {
          icon: <Wifi className="h-8 w-8 animate-pulse text-primary" />,
          title: 'Connecting',
          description: message || 'Connecting to collaboration server...',
          showProgress: false,
        };

      case 'loading-canvas':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: 'Loading Canvas',
          description: message || 'Loading canvas data and settings...',
          showProgress: true,
        };

      case 'loading-objects':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: 'Loading Objects',
          description: message || 'Loading canvas objects and shapes...',
          showProgress: true,
        };

      case 'syncing':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-500" />,
          title: 'Syncing Changes',
          description: message || 'Synchronizing with other users...',
          showProgress: false,
        };

      case 'reconnecting':
        return {
          icon: <WifiOff className="h-8 w-8 animate-pulse text-orange-500" />,
          title: 'Reconnecting',
          description: message || 'Lost connection. Attempting to reconnect...',
          showProgress: false,
        };

      case 'offline':
        return {
          icon: <WifiOff className="h-8 w-8 text-gray-500" />,
          title: 'Offline Mode',
          description: message || 'Working offline. Changes will sync when connection is restored.',
          showProgress: false,
        };

      case 'error':
        return {
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: 'Loading Error',
          description: message || 'Failed to load canvas. Please try again.',
          showProgress: false,
        };

      default:
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: 'Loading',
          description: message || 'Please wait...',
          showProgress: false,
        };
    }
  };

  const content = getLoadingContent();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8">
      {/* Canvas skeleton for visual context */}
      <div className="flex flex-col items-center gap-4 opacity-50">
        <div className="relative">
          <Skeleton className="h-64 w-80 rounded-lg" />
          {/* Overlay loading indicator on skeleton */}
          <div className="absolute inset-0 flex items-center justify-center">
            {content.icon}
          </div>
        </div>
        
        {/* Toolbar skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Loading information */}
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <div className="flex items-center gap-3">
          {content.icon}
          <h3 className="text-lg font-semibold text-foreground">
            {content.title}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {content.description}
        </p>

        {/* Progress bar */}
        {content.showProgress && typeof progress === 'number' && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}

        {/* Action buttons for error and offline states */}
        {(state === 'error' || state === 'reconnecting') && onRetry && (
          <Button
            onClick={onRetry}
            variant="default"
            size="sm"
            className="mt-2"
          >
            Try Again
          </Button>
        )}

        {state === 'reconnecting' && onOfflineMode && (
          <Button
            onClick={onOfflineMode}
            variant="outline"
            size="sm"
            className="mt-1"
          >
            Work Offline
          </Button>
        )}
      </div>

      {/* Connection status indicator */}
      {(state === 'connecting' || state === 'reconnecting' || state === 'offline') && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${
            state === 'offline' ? 'bg-gray-400' : 
            state === 'reconnecting' ? 'bg-orange-400 animate-pulse' : 
            'bg-green-400 animate-pulse'
          }`} />
          <span>
            {state === 'offline' ? 'Offline' : 
             state === 'reconnecting' ? 'Reconnecting...' : 
             'Connecting...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default LoadingStates;