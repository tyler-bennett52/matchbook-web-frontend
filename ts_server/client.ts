/**
 * WebSocket Client API for TypeScript
 * Provides a cleaner interface to the WebSocket server from client code
 */

// Define NodeJS.Timeout interface if needed
declare namespace NodeJS {
  interface Timeout {}
}
import { WebSocketMessage } from "../src/types/websocket";

/**
 * WebSocket client connection options
 */
export interface WebSocketClientOptions {
  /** Handler for received messages */
  onMessage?: (message: any) => void;
  /** Handler for connection open events */
  onOpen?: (event: Event) => void;
  /** Handler for connection close events */
  onClose?: (event: CloseEvent) => void;
  /** Handler for errors */
  onError?: (event: Event) => void;
  /** Auto-reconnect configuration */
  reconnect?: {
    /** Enable auto-reconnect (default: true) */
    enabled: boolean;
    /** Max reconnection attempts (default: 10) */
    maxAttempts: number;
    /** Base delay in ms between attempts (default: 2000) */
    baseDelay: number;
    /** Exponential backoff factor (default: 1.5) */
    backoffFactor: number;
  };
  /** Ping interval in ms (default: 20000) */
  pingInterval?: number;
}

/**
 * WebSocket client connection status
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed';

/**
 * WebSocket Client API
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: WebSocketClientOptions;
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private userId: string;
  private clientId?: string;

  /**
   * Create a new WebSocket client
   * @param url WebSocket server URL
   * @param userId User ID to connect with
   * @param options Configuration options
   */
  constructor(url: string, userId: string, options: Partial<WebSocketClientOptions> = {}) {
    // For Socket.IO, we should pass userId as a query parameter
    this.url = url.includes('?') ? `${url}&userId=${userId}` : `${url}?userId=${userId}`;
    this.userId = userId;
    
    console.log(`Creating WebSocket client for URL: ${this.url} with userId: ${userId}`);
    
    // Default options
    this.options = {
      onMessage: () => {},
      onOpen: () => {},
      onClose: () => {},
      onError: () => {},
      reconnect: {
        enabled: true,
        maxAttempts: 10,
        baseDelay: 2000,
        backoffFactor: 1.5
      },
      pingInterval: 20000,
      ...options
    };
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.status = 'connecting';
    try {
      console.log(`Connecting to WebSocket URL: ${this.url}`);
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = (event: Event) => {
        this.status = 'connected';
        this.reconnectAttempts = 0;
        this.startPingInterval();
        console.log(`WebSocket connection established to ${this.url}`);
        
        // Send an initial identification message on successful connection
        this.send({
          type: 'connection',
          senderId: this.userId,
          content: 'Connection established'
        });
        
        if (this.options.onOpen) this.options.onOpen(event);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle connection message to capture clientId
          if (data.type === 'connection' && data.status === 'connected' && data.clientId) {
            console.log('Received clientId:', data.clientId);
            this.clientId = data.clientId;
          }
          
          // Debug log for message receipt (except ping messages)
          if (data.type !== 'ping') {
            console.log('WebSocket received message:', data);
          }
          
          // Always pass messages to handler, even without specific type
          if (this.options.onMessage) {
            this.options.onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, event.data);
        }
      };

      this.ws.onclose = (event: CloseEvent) => {
        this.stopPingInterval();
        this.status = 'disconnected';
        
        // Log more details about the close event
        console.log(`WebSocket closed with code ${event.code}${event.reason ? ': ' + event.reason : ''}`);
        
        if (this.options.onClose) this.options.onClose(event);
        
        // With auto-reconnect disabled, we don't need to handle reconnection logic here
        if (this.options.reconnect?.enabled === false) {
          console.log('Auto-reconnect disabled, not attempting to reconnect');
          return;
        }
        
        // Only attempt to reconnect on abnormal closures
        // 1000 (Normal Closure) or 1001 (Going Away) should not trigger reconnect
        const abnormalClosure = event.code !== 1000 && event.code !== 1001;
        
        if (abnormalClosure && this.options.reconnect?.enabled && 
            this.reconnectAttempts < (this.options.reconnect?.maxAttempts || 10)) {
          console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1} of ${this.options.reconnect?.maxAttempts || 10}`);
          this.scheduleReconnect();
        } else if (this.reconnectAttempts >= (this.options.reconnect?.maxAttempts || 10)) {
          this.status = 'failed';
          console.log('Max reconnection attempts reached, giving up');
        } else {
          console.log('Normal closure, not attempting to reconnect');
        }
      };

      this.ws.onerror = (event: Event) => {
        // Try to extract more useful error information
        const errorDetails = {
          url: this.url,
          readyState: this.ws?.readyState,
          userId: this.userId,
          clientId: this.clientId,
          reconnectAttempts: this.reconnectAttempts,
          // Include all enumerable and non-enumerable properties
          eventDetails: Object.getOwnPropertyNames(event).reduce((acc, key) => {
            try {
              acc[key] = (event as any)[key];
            } catch (e) {
              acc[key] = 'Unable to access property';
            }
            return acc;
          }, {} as Record<string, any>)
        };
        
        console.error('WebSocket client error:', errorDetails);
        
        // Create an enhanced error object with additional details
        const enhancedEvent = Object.assign(event, { 
          details: errorDetails,
          message: 'WebSocket connection error',
          timestamp: new Date().toISOString()
        });
        
        if (this.options.onError) this.options.onError(enhancedEvent);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.status = 'disconnected';
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.stopPingInterval();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.status = 'disconnected';
  }

  /**
   * Send a message to the WebSocket server
   * @param data Message to send
   * @returns Boolean indicating if send was successful
   */
  public send(data: Partial<WebSocketMessage>): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket not connected');
      return false;
    }

    try {
      // Add senderId, clientId, and other required fields if available
      const message: Partial<WebSocketMessage> = {
        ...data,
        senderId: data.senderId || this.userId,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      // Only add clientId if it exists
      if (this.clientId) {
        message.clientId = this.clientId;
      }

      // Default to 'message' type if not specified and it's not a ping
      if (!message.type && message.content) {
        message.type = 'message';
      }

      console.log('WebSocket sending message:', message);
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get client ID (available after successful connection)
   */
  public getClientId(): string | undefined {
    return this.clientId || undefined;
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.status = 'reconnecting';
    this.reconnectAttempts += 1;
    
    const delay = this.options.reconnect?.baseDelay || 2000 * 
      Math.pow(this.options.reconnect?.backoffFactor || 1.5, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.stopPingInterval();
    
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      } else {
        this.stopPingInterval();
      }
    }, this.options.pingInterval || 20000);
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

/**
 * Create a WebSocket client connection
 * @param url WebSocket server URL
 * @param userId User ID for the connection
 * @param options Configuration options
 * @returns WebSocketClient instance
 */
export function createWebSocketClient(
  url: string, 
  userId: string,
  options: Partial<WebSocketClientOptions> = {}
): WebSocketClient {
  const client = new WebSocketClient(url, userId, options);
  client.connect();
  return client;
}