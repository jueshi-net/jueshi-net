/**
 * Server-Sent Events (SSE) for real-time notifications
 * Lightweight pub/sub system for live updates
 */

type SSEClient = {
  id: string;
  userId: string;
  send: (data: string) => void;
  lastEventId?: string;
};

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private eventQueue: Map<string, any[]> = new Map();

  /**
   * Add a new client
   */
  addClient(client: SSEClient): void {
    this.clients.set(client.id, client);
    
    // Send queued events if any
    const queued = this.eventQueue.get(client.userId) || [];
    queued.forEach(event => client.send(JSON.stringify(event)));
    this.eventQueue.delete(client.userId);
  }

  /**
   * Remove a client
   */
  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Send event to specific user
   */
  sendToUser(userId: string, event: any): void {
    const data = JSON.stringify({
      id: Date.now().toString(),
      event: event.type || 'message',
      data: event,
      timestamp: new Date().toISOString()
    });

    let sent = 0;
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        try {
          client.send(data);
          sent++;
        } catch (error) {
          // Client disconnected, remove it
          this.removeClient(client.id);
        }
      }
    }

    // Queue if no active clients
    if (sent === 0) {
      const queue = this.eventQueue.get(userId) || [];
      queue.push(event);
      // Keep only last 50 events per user
      if (queue.length > 50) queue.shift();
      this.eventQueue.set(userId, queue);
    }
  }

  /**
   * Send event to all connected clients
   */
  broadcast(event: any): void {
    const data = JSON.stringify({
      id: Date.now().toString(),
      event: event.type || 'broadcast',
      data: event,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients.values()) {
      try {
        client.send(data);
      } catch (error) {
        this.removeClient(client.id);
      }
    }
  }

  /**
   * Get active client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get active client count by user
   */
  getUserClientCount(userId: string): number {
    return Array.from(this.clients.values()).filter(c => c.userId === userId).length;
  }
}

// Singleton instance
export const sseManager = new SSEManager();
export default sseManager;
