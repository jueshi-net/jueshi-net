import { NextRequest } from 'next/server';
import { sseManager } from '@/lib/sse';

export async function GET(req: NextRequest) {
  // In production, verify auth session here
  const userId = req.headers.get('x-user-id') || 'anonymous';
  const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send helper
      const send = (data: string) => {
        const message = `data: ${data}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send connection established
      send(JSON.stringify({
        type: 'connected',
        clientId,
        message: 'SSE connection established'
      }));

      // Register client
      sseManager.addClient({
        id: clientId,
        userId,
        send
      });

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      }, 30000);

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        sseManager.removeClient(clientId);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
