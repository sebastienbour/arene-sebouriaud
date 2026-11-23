// Clavier → direction. On utilise `event.code` (touche physique) : ZQSD sur un clavier
// français et WASD sur un clavier anglais tombent sur les mêmes codes KeyW / KeyA / KeyS / KeyD.

import type { Game } from './engine/game.ts'
import type { Direction } from './engine/types.ts'

const KEYS: Readonly<Record<string, Direction>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
}

/** Branche le clavier sur un joueur. Renvoie une fonction qui débranche. */
export function bindKeyboard(game: Game, playerId: string): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    const direction = KEYS[event.code]
    if (direction === undefined) return
    event.preventDefault()
    game.turn(playerId, direction)
  }
  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}
