/**
 * Platform Event Contract System
 *
 * Minimal in-process event bus with an event log. Modules publish events
 * and subscribe to event types. For Round 1 this is synchronous in-process;
 * an Outbox can be layered on later without changing the contract.
 *
 * Design rules:
 *   - `publishEvent` never throws on handler errors (fire-and-forget semantics)
 *   - every published event is appended to an in-process log (audit + tests)
 *   - handlers receive the full PlatformEvent, not just the payload
 *
 * Dependency rule: imports nothing from business modules.
 */

export interface PlatformEvent {
  /** Event type (e.g. "inquiry.created"). */
  type: string;
  /** Module that published the event. */
  moduleId: string;
  /** Event payload (must be JSON-serialisable). */
  payload: Record<string, unknown>;
  /** When the event was published. */
  timestamp: Date;
  /** Unique event id (cuid-style). */
  eventId: string;
}

export type EventHandler = (event: PlatformEvent) => Promise<void> | void;

const subscribers = new Map<string, Set<EventHandler>>();
const eventLog: PlatformEvent[] = [];
let eventCounter = 0;

/**
 * Subscribe to an event type.
 * @returns an unsubscribe function.
 */
export function subscribeToEvent(
  eventType: string,
  handler: EventHandler
): () => void {
  let set = subscribers.get(eventType);
  if (!set) {
    set = new Set();
    subscribers.set(eventType, set);
  }
  set.add(handler);
  return () => {
    set!.delete(handler);
  };
}

/**
 * Publish an event. All matching handlers are invoked; handler errors are
 * swallowed (logged but do not fail the publish). The event is always logged.
 */
export async function publishEvent(
  eventType: string,
  moduleId: string,
  payload: Record<string, unknown>
): Promise<PlatformEvent> {
  const event: PlatformEvent = {
    type: eventType,
    moduleId,
    payload,
    timestamp: new Date(),
    eventId: `evt_${Date.now()}_${eventCounter++}`,
  };

  eventLog.push(event);

  const handlers = subscribers.get(eventType);
  if (handlers) {
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch {
        // Handler errors must not break the publish pipeline.
        // In production this would go to a structured logger.
      }
    }
  }

  return event;
}

/** Synchronous variant — for fire-and-forget contexts where await is unwanted. */
export function publishEventSync(
  eventType: string,
  moduleId: string,
  payload: Record<string, unknown>
): PlatformEvent {
  const event: PlatformEvent = {
    type: eventType,
    moduleId,
    payload,
    timestamp: new Date(),
    eventId: `evt_${Date.now()}_${eventCounter++}`,
  };

  eventLog.push(event);

  const handlers = subscribers.get(eventType);
  if (handlers) {
    for (const handler of handlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          // Fire-and-forget; errors swallowed via .catch
          result.catch(() => {});
        }
      } catch {
        // swallow
      }
    }
  }

  return event;
}

/** Get all published events (optionally filtered by type). For audit/tests. */
export function getPublishedEvents(eventType?: string): PlatformEvent[] {
  if (eventType) {
    return eventLog.filter((e) => e.type === eventType);
  }
  return [...eventLog];
}

/** Clear the event log and subscribers. Test-only. */
export function _resetEvents(): void {
  subscribers.clear();
  eventLog.length = 0;
  eventCounter = 0;
}
