import { fabric } from 'fabric';

export interface CanvasError extends Error {
  type: 'canvas' | 'fabric' | 'liveblocks' | 'network' | 'unknown';
  operation?: string;
  retryable?: boolean;
}

export class CanvasErrorHandler {
  private static instance: CanvasErrorHandler;
  private errorCallbacks: Map<string, (error: CanvasError) => void> = new Map();

  static getInstance(): CanvasErrorHandler {
    if (!CanvasErrorHandler.instance) {
      CanvasErrorHandler.instance = new CanvasErrorHandler();
    }
    return CanvasErrorHandler.instance;
  }

  // Register error callback for specific error types
  onError(type: string, callback: (error: CanvasError) => void): void {
    this.errorCallbacks.set(type, callback);
  }

  // Remove error callback
  offError(type: string): void {
    this.errorCallbacks.delete(type);
  }

  // Handle and categorize errors
  handleError(error: Error, operation?: string): CanvasError {
    const canvasError = this.categorizeError(error, operation);
    
    // Log error
    console.error(`Canvas Error [${canvasError.type}]:`, {
      message: canvasError.message,
      operation: canvasError.operation,
      retryable: canvasError.retryable,
      stack: canvasError.stack,
      timestamp: new Date().toISOString(),
    });

    // Call registered callback if exists
    const callback = this.errorCallbacks.get(canvasError.type);
    if (callback) {
      callback(canvasError);
    }

    return canvasError;
  }

  private categorizeError(error: Error, operation?: string): CanvasError {
    const message = error.message.toLowerCase();
    
    let type: CanvasError['type'] = 'unknown';
    let retryable = false;

    // Network errors
    if (message.includes('network') || message.includes('fetch') || 
        message.includes('timeout') || error.name === 'NetworkError') {
      type = 'network';
      retryable = true;
    }
    // Liveblocks errors
    else if (message.includes('liveblocks') || message.includes('room') || 
             message.includes('presence') || message.includes('broadcast')) {
      type = 'liveblocks';
      retryable = true;
    }
    // Fabric.js errors
    else if (message.includes('fabric') || message.includes('canvas') || 
             message.includes('object') || message.includes('render')) {
      type = 'fabric';
      retryable = false;
    }
    // Canvas API errors
    else if (message.includes('canvas') || message.includes('context') || 
             message.includes('webgl')) {
      type = 'canvas';
      retryable = false;
    }

    const canvasError = new Error(error.message) as CanvasError;
    canvasError.name = error.name;
    canvasError.stack = error.stack;
    canvasError.type = type;
    canvasError.operation = operation;
    canvasError.retryable = retryable;

    return canvasError;
  }
}

// Utility functions for safe canvas operations
export const safeCanvasOperation = async <T>(
  operation: () => Promise<T> | T,
  operationName: string,
  maxRetries: number = 3
): Promise<T | null> => {
  const errorHandler = CanvasErrorHandler.getInstance();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.resolve(operation());
      return result;
    } catch (error) {
      const canvasError = errorHandler.handleError(error as Error, operationName);
      
      // If not retryable or last attempt, throw the error
      if (!canvasError.retryable || attempt === maxRetries) {
        throw canvasError;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
};

// Safe Fabric.js operations
export const safeFabricOperation = <T>(
  canvas: fabric.Canvas | null,
  operation: (canvas: fabric.Canvas) => T,
  operationName: string
): T | null => {
  if (!canvas) {
    console.warn(`Cannot perform ${operationName}: Canvas is not initialized`);
    return null;
  }

  try {
    return operation(canvas);
  } catch (error) {
    const errorHandler = CanvasErrorHandler.getInstance();
    errorHandler.handleError(error as Error, operationName);
    return null;
  }
};

// Safe object manipulation
export const safeObjectOperation = <T>(
  object: fabric.Object | null,
  operation: (object: fabric.Object) => T,
  operationName: string
): T | null => {
  if (!object) {
    console.warn(`Cannot perform ${operationName}: Object is null`);
    return null;
  }

  try {
    return operation(object);
  } catch (error) {
    const errorHandler = CanvasErrorHandler.getInstance();
    errorHandler.handleError(error as Error, operationName);
    return null;
  }
};

// Retry mechanism for async operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};

// Error recovery strategies
export const recoverFromCanvasError = (
  canvas: fabric.Canvas | null,
  errorType: CanvasError['type']
): boolean => {
  if (!canvas) return false;

  try {
    switch (errorType) {
      case 'fabric':
        // Clear selection and try to render
        canvas.discardActiveObject();
        canvas.renderAll();
        return true;
        
      case 'canvas':
        // Try to clear and reinitialize
        canvas.clear();
        canvas.renderAll();
        return true;
        
      default:
        return false;
    }
  } catch (error) {
    console.error('Error recovery failed:', error);
    return false;
  }
};

export default CanvasErrorHandler;