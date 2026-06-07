'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface NotificationEvent {
  type: string;
  title?: string;
  message?: string;
  data?: any;
  timestamp?: string;
}

interface UseSSEReturn {
  isConnected: boolean;
  events: NotificationEvent[];
  unreadCount: number;
  markAllRead: () => void;
}

/**
 * Hook for SSE real-time notifications
 */
export function useSSE(userId?: string): UseSSEReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSource = useRef<EventSource | null>(null);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Create EventSource
    const es = new EventSource('/api/sse');
    eventSource.current = es;

    es.onopen = () => {
      console.log('SSE connected');
      setIsConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'heartbeat') return;
        if (data.type === 'connected') return;

        setEvents(prev => [...prev.slice(-50), data.data]);
        setUnreadCount(prev => prev + 1);

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(data.data.title || '新通知', {
            body: data.data.message || '',
            icon: '/icons/icon-192.png'
          });
        }
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    es.onerror = () => {
      console.log('SSE connection error, reconnecting...');
      setIsConnected(false);
    };

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      es.close();
      eventSource.current = null;
    };
  }, [userId]);

  return {
    isConnected,
    events,
    unreadCount,
    markAllRead
  };
}

export default useSSE;
