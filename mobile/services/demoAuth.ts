// mobile/services/demoAuth.ts
// Lightweight demo session state for offline testing and reviewer exploration

let isDemoSession = false;
const listeners = new Set<() => void>();

export function getIsDemoUser(): boolean {
  return isDemoSession;
}

export function setDemoUser(val: boolean): void {
  isDemoSession = val;
  listeners.forEach((fn) => fn());
}

export function subscribeDemoUser(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
