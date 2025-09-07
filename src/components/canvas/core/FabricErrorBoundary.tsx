"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush, AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onCanvasReset?: () => void;
  onObjectError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'canvas' | 'object' | 'render' | 'unknown';
  retryCount: number;
}

export class FabricErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: 'unknown',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Categorize Fabric.js errors
    let errorType: 'canvas' | 'object' | 'render' | 'unknown' = 'unknown';
    
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('canvas') || errorMessage.includes('fabric')) {
      errorType = 'canvas';
    } else if (errorMessage.includes('object') || errorMessage.includes('shape')) {
      errorType = 'object';
    } else if (errorMessage.includes('render') || errorMessage.includes('draw')) {
      errorType = 'render';
    }

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Fabric.js Error Boundary caught an error:', error, errorInfo);
    
    // Call specific error handlers
    if (this.state.errorType === 'object' && this.props.onObjectError) {
      this.props.onObjectError(error);
    }

    // Log Fabric.js specific error details
    this.logFabricError(error, errorInfo);
  }

  private logFabricError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Fabric.js Error Details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorType: this.state.errorType,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      fabricVersion: typeof window !== 'undefined' && (window as any).fabric?.version,
    });
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleCanvasReset = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
    });

    if (this.props.onCanvasReset) {
      this.props.onCanvasReset();
    }
  };

  private getErrorMessage = () => {
    switch (this.state.errorType) {
      case 'canvas':
        return "There was an issue initializing the drawing canvas. This might be due to browser compatibility or memory constraints.";
      case 'object':
        return "An error occurred while manipulating a canvas object. The object might be corrupted or invalid.";
      case 'render':
        return "There was a problem rendering the canvas content. This might be due to complex shapes or performance issues.";
      default:
        return "An unexpected error occurred in the drawing engine.";
    }
  };

  private getErrorTitle = () => {
    switch (this.state.errorType) {
      case 'canvas':
        return "Canvas Initialization Error";
      case 'object':
        return "Object Manipulation Error";
      case 'render':
        return "Rendering Error";
      default:
        return "Drawing Engine Error";
    }
  };

  private getSuggestions = () => {
    switch (this.state.errorType) {
      case 'canvas':
        return [
          "Try refreshing the page",
          "Check if your browser supports HTML5 Canvas",
          "Close other browser tabs to free up memory"
        ];
      case 'object':
        return [
          "Try undoing the last action",
          "Remove the problematic object",
          "Reset the canvas if the issue persists"
        ];
      case 'render':
        return [
          "Simplify complex shapes",
          "Reduce the number of objects on canvas",
          "Try zooming out to reduce rendering load"
        ];
      default:
        return [
          "Try refreshing the page",
          "Reset the canvas",
          "Contact support if the issue persists"
        ];
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-background">
          <div className="flex flex-col items-center space-y-4 max-w-lg text-center">
            <div className="flex items-center space-x-2">
              <Paintbrush className="h-8 w-8 text-destructive" />
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            
            <h2 className="text-xl font-semibold text-foreground">
              {this.getErrorTitle()}
            </h2>
            
            <p className="text-sm text-muted-foreground">
              {this.getErrorMessage()}
            </p>

            <div className="bg-muted p-4 rounded-lg text-left w-full">
              <h4 className="text-sm font-medium mb-2">Suggested Solutions:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {this.getSuggestions().map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {this.state.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry ({this.maxRetries - this.state.retryCount} left)</span>
                </Button>
              )}
              
              <Button
                onClick={this.handleCanvasReset}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Paintbrush className="h-4 w-4" />
                <span>Reset Canvas</span>
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                size="sm"
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-muted rounded-md text-left w-full">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-32">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
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

export default FabricErrorBoundary;