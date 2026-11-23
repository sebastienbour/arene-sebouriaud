// La classe Game : une boucle à pas fixe autour des règles pures.
// C'est la seule partie du moteur qui connaît le temps ; elle ne connaît toujours pas le DOM.

import { Emitter } from './emitter.ts'
import { createState, step, withTargets } from './rules.ts'
import type { Direction, GameState, Level, PlayerSetup } from './types.ts'

export type GameEvents = {
  start: GameState
  tick: GameState
  score: { readonly playerId: string; readonly score: number }
  over: GameState
}

export type GameOptions = {
  /** Durée d'un tick en millisecondes. */
  readonly tickMs?: number
  /** Générateur aléatoire injectable (tests, serveur). */
  readonly random?: () => number
  /** Planificateur d'image : `requestAnimationFrame` dans le navigateur, autre chose sur un serveur. */
  readonly schedule?: (callback: (now: number) => void) => number
  readonly cancel?: (handle: number) => void
}

// Le moteur ne dépend pas du DOM : requestAnimationFrame est cherché à l'exécution dans globalThis,
// et un serveur fournit son propre planificateur (ou n'utilise que les règles pures, voir Room).
type AnimationGlobals = {
  readonly requestAnimationFrame?: (callback: (now: number) => void) => number
  readonly cancelAnimationFrame?: (handle: number) => void
}
const animation: AnimationGlobals = globalThis as AnimationGlobals

function browserSchedule(callback: (now: number) => void): number {
  if (animation.requestAnimationFrame === undefined) throw new Error('Game : pas de requestAnimationFrame ici, fournir options.schedule')
  return animation.requestAnimationFrame(callback)
}

function browserCancel(handle: number): void {
  animation.cancelAnimationFrame?.(handle)
}

export class Game {
  readonly events = new Emitter<GameEvents>()

  private state: GameState
  private inputs: Record<string, Direction> = {}
  private readonly tickMs: number
  private readonly random: () => number
  private readonly schedule: (callback: (now: number) => void) => number
  private readonly cancel: (handle: number) => void
  private readonly level: Level
  private readonly setups: readonly PlayerSetup[]
  private handle = 0
  private previous = 0
  private accumulator = 0

  constructor(level: Level, setups: readonly PlayerSetup[], options: GameOptions = {}) {
    this.level = level
    this.setups = setups
    this.tickMs = options.tickMs ?? 120
    this.random = options.random ?? Math.random
    this.schedule = options.schedule ?? browserSchedule
    this.cancel = options.cancel ?? browserCancel
    this.state = createState(level, setups)
  }

  /** L'état courant, en lecture seule. */
  get snapshot(): GameState {
    return this.state
  }

  /** (Re)démarre une partie depuis le début. */
  start(): void {
    this.stop()
    this.state = withTargets({ ...createState(this.level, this.setups), status: 'running' }, this.random)
    this.inputs = {}
    this.previous = 0
    this.accumulator = 0
    this.events.emit('start', this.state)
    this.handle = this.schedule(this.frame)
  }

  stop(): void {
    if (this.handle !== 0) this.cancel(this.handle)
    this.handle = 0
  }

  /** Enregistre la direction demandée par un joueur pour le prochain tick. */
  turn(playerId: string, direction: Direction): void {
    this.inputs[playerId] = direction
  }

  private readonly frame = (now: number): void => {
    if (this.previous === 0) this.previous = now
    this.accumulator += now - this.previous
    this.previous = now

    // Pas fixe : quel que soit le taux de rafraîchissement, un tick dure tickMs.
    while (this.accumulator >= this.tickMs && this.state.status === 'running') {
      this.accumulator -= this.tickMs
      this.advance()
    }

    if (this.state.status === 'running') this.handle = this.schedule(this.frame)
    else this.handle = 0
  }

  private advance(): void {
    const before = this.state
    this.state = step(before, this.inputs, this.random)
    this.inputs = {}
    this.events.emit('tick', this.state)

    this.state.players.forEach((player, i) => {
      if (player.score !== before.players[i].score) {
        this.events.emit('score', { playerId: player.id, score: player.score })
      }
    })

    if (this.state.status === 'over') this.events.emit('over', this.state)
  }
}
