import { useCallback, useSyncExternalStore } from "react";

/**
 * Pinned scene labels.
 *
 * Every floating label inside the WebGL scene is off until the operator asks
 * for it. There are two ways to ask: the Titles layer switch in the console,
 * which turns the whole ambient set on, and clicking an object in the scene.
 * A click pins that one label, which then stays on screen with its own cross
 * so it can be removed again without touching anything else.
 *
 * The pins live in a module-level store rather than in React state because the
 * label components are scattered across both station scenes, the interiors and
 * the wildlife layer. A single store lets any of them answer to one click and
 * lets the console clear the lot from one place.
 */
let pinnedIds: string[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Snapshot for useSyncExternalStore. Identity only changes with the pins. */
export function getPinnedLabelIds(): string[] {
  return pinnedIds;
}

/** True when this object's label was pinned by a click. */
export function isLabelPinned(id: string): boolean {
  return pinnedIds.includes(id);
}

/** Pin one label. Called when an object is clicked. */
export function pinLabel(id: string): void {
  if (pinnedIds.includes(id)) return;
  pinnedIds = [...pinnedIds, id];
  emit();
}

/** Remove one label. Called by the cross drawn on the label itself. */
export function unpinLabel(id: string): void {
  if (!pinnedIds.includes(id)) return;
  pinnedIds = pinnedIds.filter((entry) => entry !== id);
  emit();
}

/** Click behaviour: first click pins, a second click on the same object clears. */
export function toggleLabelPin(id: string): void {
  if (pinnedIds.includes(id)) unpinLabel(id);
  else pinLabel(id);
}

/** Clear every clicked label at once. */
export function clearPinnedLabels(): void {
  if (pinnedIds.length === 0) return;
  pinnedIds = [];
  emit();
}

/**
 * True when this object's label is currently pinned, reactive.
 *
 * The snapshot is a primitive, so React re-renders only the label whose pin
 * actually changed. Every fixture in both interiors subscribes to this, and a
 * boolean snapshot keeps a click from re-rendering the whole deck.
 */
export function useLabelPinned(id: string | undefined): boolean {
  const snapshot = useCallback(() => (id ? isLabelPinned(id) : false), [id]);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Count of pinned labels, reactive, for the console chip. */
export function usePinnedLabelCount(): number {
  const snapshot = useCallback(() => pinnedIds.length, []);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
