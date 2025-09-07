"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  onConnectionError?: () => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isConnectionError: boolean;
  retryCount: number;
}

export class LiveblocksErrorBoundary extends Component<Props, State> {
  private maxRetries = 5;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isConnectionError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a connection-related error
    const isConnectionError = 
      error.message.includes('network') ||
      error.message.includes('connection') ||
      error.message.includes('timeout') ||
      error.message.includes('fetch') ||
      error.name === 'NetworkError';

    return {
      hasError: true,
      error,
      isConnectionError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Liveblocks Error Boundary caught an error:', error, errorInfo);
    
    // Call the onConnectionError callback if it's a connection error
    if (this.state.isConnectionError && this.props.onConnectionError) {
      this.props.onConnectionError();
    }

    // Auto-retry for connection errors
    if (this.state.isConnectionError && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }

    // Log error details
    this.logLiveblocksError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private logLiveblocksError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Liveblocks Error Details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isConnectionError: this.state.isConnectionError,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
    });
  };

  private scheduleRetry = () => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 16000);
    
    this.retryTimeout = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1,
      }));

      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  };

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  private getErrorMessage = () => {
    if (this.state.isConnectionError) {
      return "Unable to connect to the collaboration server. Please check your internet connection.";
    }
    
    return "There was an issue with the real-time collaboration features.";
  };

  private getErrorIcon = () => {
    if (this.state.isConnectionError) {
      return <WifiOff className="h-8 w-8 text-destructive" />;
    }
    
    return <AlertTriangle className="h-8 w-8 text-destructive" />;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-background border border-border rounded-lg">
          <div className="flex flex-col items-center space-y-3 text-center">
            {this.getErrorIcon()}
            
            <h3 className="text-lg font-medium text-foreground">
              Collaboration Unavailable
            </h3>
            
            <p className="text-sm text-muted-foreground max-w-sm">
              {this.getErrorMessage()}
            </p>

            {this.state.isConnectionError && this.state.retryCount < this.maxRetries && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                <span>Retrying... (Attempt {this.state.retryCount + 1}/{this.maxRetries})</span>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={this.handleManualRetry}
                variant="primary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Wifi className="h-4 w-4" />
                <span>Retry Connection</span>
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-muted rounded text-left w-full max-w-md">
                <summary className="cursor-pointer text-xs font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LiveblocksErrorBoundary;