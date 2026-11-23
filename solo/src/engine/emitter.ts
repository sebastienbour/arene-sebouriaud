// Un émetteur d'événements typé, minimal.
// `Events` associe un nom d'événement au type de sa donnée.

type Listener<T> = (payload: T) => void

export class Emitter<Events extends Record<string, unknown>> {
  private readonly listeners = new Map<keyof Events, Set<Listener<never>>>()

  on<K extends keyof Events>(name: K, listener: Listener<Events[K]>): () => void {
    const set = this.listeners.get(name) ?? new Set()
    set.add(listener as Listener<never>)
    this.listeners.set(name, set)
    return () => this.off(name, listener)
  }

  off<K extends keyof Events>(name: K, listener: Listener<Events[K]>): void {
    this.listeners.get(name)?.delete(listener as Listener<never>)
  }

  emit<K extends keyof Events>(name: K, payload: Events[K]): void {
    this.listeners.get(name)?.forEach((listener) => (listener as Listener<Events[K]>)(payload))
  }
}
