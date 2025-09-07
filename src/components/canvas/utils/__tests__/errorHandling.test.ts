import { fabric } from 'fabric';
import CanvasErrorHandler, {
  safeCanvasOperation,
  safeFabricOperation,
  safeObjectOperation,
  withRetry,
  recoverFromCanvasError,
} from '../errorHandling';

// Mock fabric.js
jest.mock('fabric', () => ({
  fabric: {
    Canvas: jest.fn(),
    Object: jest.fn(),
  },
}));

describe('CanvasErrorHandler', () => {
  let errorHandler: CanvasErrorHandler;

  beforeEach(() => {
    errorHandler = CanvasErrorHandler.getInstance();
    // Clear any existing callbacks
    (errorHandler as any).errorCallbacks.clear();
  });

  describe('getInstance', () => {
    it('returns singleton instance', () => {
      const instance1 = CanvasErrorHandler.getInstance();
      const instance2 = CanvasErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('error categorization', () => {
    it('categorizes network errors correctly', () => {
      const networkError = new Error('Network request failed');
      const result = errorHandler.handleError(networkError, 'test-operation');
      
      expect(result.type).toBe('network');
      expect(result.retryable).toBe(true);
      expect(result.operation).toBe('test-operation');
    });

    it('categorizes liveblocks errors correctly', () => {
      const liveblocksError = new Error('Liveblocks room connection failed');
      const result = errorHandler.handleError(liveblocksError, 'liveblocks-operation');
      
      expect(result.type).toBe('liveblocks');
      expect(result.retryable).toBe(true);
    });

    it('categorizes fabric errors correctly', () => {
      const fabricError = new Error('Fabric canvas rendering failed');
      const result = errorHandler.handleError(fabricError, 'fabric-operation');
      
      expect(result.type).toBe('fabric');
      expect(result.retryable).toBe(false);
    });

    it('categorizes canvas errors correctly', () => {
      const canvasError = new Error('Canvas context not available');
      const result = errorHandler.handleError(canvasError, 'canvas-operation');
      
      expect(result.type).toBe('canvas');
      expect(result.retryable).toBe(false);
    });

    it('categorizes unknown errors correctly', () => {
      const unknownError = new Error('Some random error');
      const result = errorHandler.handleError(unknownError, 'unknown-operation');
      
      expect(result.type).toBe('unknown');
      expect(result.retryable).toBe(false);
    });
  });

  describe('error callbacks', () => {
    it('registers and calls error callbacks', () => {
      const callback = jest.fn();
      errorHandler.onError('network', callback);
      
      const networkError = new Error('Network error');
      errorHandler.handleError(networkError);
      
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        type: 'network',
        message: 'Network error',
      }));
    });

    it('removes error callbacks', () => {
      const callback = jest.fn();
      errorHandler.onError('network', callback);
      errorHandler.offError('network');
      
      const networkError = new Error('Network error');
      errorHandler.handleError(networkError);
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
});

describe('safeCanvasOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('executes operation successfully', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    const result = await safeCanvasOperation(operation, 'test-operation');
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue('success');
    
    const result = await safeCanvasOperation(operation, 'test-operation', 2);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('throws error after max retries', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Network error'));
    
    await expect(safeCanvasOperation(operation, 'test-operation', 2))
      .rejects.toThrow('Network error');
    
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-retryable errors', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Fabric error'));
    
    await expect(safeCanvasOperation(operation, 'test-operation', 3))
      .rejects.toThrow('Fabric error');
    
    expect(operation).toHaveBeenCalledTimes(1);
  });
});

describe('safeFabricOperation', () => {
  it('executes operation with valid canvas', () => {
    const mockCanvas = { renderAll: jest.fn() } as any;
    const operation = jest.fn().mockReturnValue('result');
    
    const result = safeFabricOperation(mockCanvas, operation, 'test-operation');
    
    expect(result).toBe('result');
    expect(operation).toHaveBeenCalledWith(mockCanvas);
  });

  it('returns null for null canvas', () => {
    const operation = jest.fn();
    
    const result = safeFabricOperation(null, operation, 'test-operation');
    
    expect(result).toBeNull();
    expect(operation).not.toHaveBeenCalled();
  });

  it('handles operation errors', () => {
    const mockCanvas = { renderAll: jest.fn() } as any;
    const operation = jest.fn().mockImplementation(() => {
      throw new Error('Operation failed');
    });
    
    const result = safeFabricOperation(mockCanvas, operation, 'test-operation');
    
    expect(result).toBeNull();
  });
});

describe('safeObjectOperation', () => {
  it('executes operation with valid object', () => {
    const mockObject = { set: jest.fn() } as any;
    const operation = jest.fn().mockReturnValue('result');
    
    const result = safeObjectOperation(mockObject, operation, 'test-operation');
    
    expect(result).toBe('result');
    expect(operation).toHaveBeenCalledWith(mockObject);
  });

  it('returns null for null object', () => {
    const operation = jest.fn();
    
    const result = safeObjectOperation(null, operation, 'test-operation');
    
    expect(result).toBeNull();
    expect(operation).not.toHaveBeenCalled();
  });

  it('handles operation errors', () => {
    const mockObject = { set: jest.fn() } as any;
    const operation = jest.fn().mockImplementation(() => {
      throw new Error('Operation failed');
    });
    
    const result = safeObjectOperation(mockObject, operation, 'test-operation');
    
    expect(result).toBeNull();
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('succeeds on first attempt', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    
    const promise = withRetry(operation, 3, 1000);
    const result = await promise;
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries with exponential backoff', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');
    
    const promise = withRetry(operation, 3, 1000);
    
    // Fast-forward through delays
    setTimeout(() => jest.advanceTimersByTime(1000), 0);
    setTimeout(() => jest.advanceTimersByTime(2000), 0);
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('throws error after max retries', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Always fails'));
    
    const promise = withRetry(operation, 2, 1000);
    
    // Fast-forward through delays
    setTimeout(() => jest.advanceTimersByTime(1000), 0);
    
    await expect(promise).rejects.toThrow('Always fails');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe('recoverFromCanvasError', () => {
  it('recovers from fabric errors', () => {
    const mockCanvas = {
      discardActiveObject: jest.fn(),
      renderAll: jest.fn(),
    } as any;
    
    const result = recoverFromCanvasError(mockCanvas, 'fabric');
    
    expect(result).toBe(true);
    expect(mockCanvas.discardActiveObject).toHaveBeenCalled();
    expect(mockCanvas.renderAll).toHaveBeenCalled();
  });

  it('recovers from canvas errors', () => {
    const mockCanvas = {
      clear: jest.fn(),
      renderAll: jest.fn(),
    } as any;
    
    const result = recoverFromCanvasError(mockCanvas, 'canvas');
    
    expect(result).toBe(true);
    expect(mockCanvas.clear).toHaveBeenCalled();
    expect(mockCanvas.renderAll).toHaveBeenCalled();
  });

  it('returns false for null canvas', () => {
    const result = recoverFromCanvasError(null, 'fabric');
    expect(result).toBe(false);
  });

  it('returns false for unsupported error types', () => {
    const mockCanvas = { renderAll: jest.fn() } as any;
    const result = recoverFromCanvasError(mockCanvas, 'network');
    expect(result).toBe(false);
  });

  it('handles recovery errors gracefully', () => {
    const mockCanvas = {
      discardActiveObject: jest.fn().mockImplementation(() => {
        throw new Error('Recovery failed');
      }),
      renderAll: jest.fn(),
    } as any;
    
    const result = recoverFromCanvasError(mockCanvas, 'fabric');
    expect(result).toBe(false);
  });
});